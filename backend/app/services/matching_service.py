"""
SmartSurplus - AI-Powered NGO Matching Service (v2)

This module is the integration layer between the database, the ML engine,
and the FastAPI routes.  It:
  1. Fetches live provider + NGO records from the database.
  2. Passes them through the ML scoring pipeline (ml/scoring.py).
  3. Persists resulting matches to the database.
  4. Also exposes a standalone `run_match` function that accepts raw
     provider/NGO dicts directly (useful for testing without the DB).
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.core.database import db
from app.ml.scoring import rank_candidates, MAX_DISTANCE_KM, TOP_N_DEFAULT
from app.ml.matching_model import train_matching_model

logger = logging.getLogger(__name__)

# Pre-warm the ML model at import time so the first request is fast.
try:
    train_matching_model()
except Exception as exc:
    logger.error("[MatchingService] Model pre-warm failed: %s", exc)


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def run_match(
    provider: dict[str, Any],
    ngos: list[dict[str, Any]],
    max_distance_km: float = MAX_DISTANCE_KM,
    top_n: int = TOP_N_DEFAULT,
) -> list[dict[str, Any]]:
    """
    Standalone matcher — works with plain Python dicts (no DB required).

    Provider dict keys:
        provider_id, latitude, longitude, food_quantity, expiry_hours,
        predicted_surplus (optional)

    NGO dict keys:
        ngo_id (or id), latitude, longitude, capacity, name (optional)

    Returns:
        List of ranked match dicts (see scoring.rank_candidates for schema).
    """
    lat  = provider.get("latitude")
    lon  = provider.get("longitude")
    qty  = float(provider.get("food_quantity", 0))
    exp  = float(provider.get("expiry_hours", 6))

    if lat is None or lon is None:
        logger.error("[MatchingService] Provider is missing GPS coordinates.")
        return []

    if qty <= 0:
        logger.error("[MatchingService] food_quantity must be > 0.")
        return []

    return rank_candidates(
        provider_lat=lat,
        provider_lon=lon,
        food_quantity=qty,
        expiry_hours=exp,
        ngos=ngos,
        max_distance_km=max_distance_km,
        top_n=top_n,
    )


def find_best_matches(
    prediction_id: str,
    provider_id: str,
    food_type: str,
    quantity_kg: float,
    expiry_hours: float = 6.0,
    is_perishable: bool = True,        # kept for backward-compat, not used in score
    top_n: int = TOP_N_DEFAULT,
    max_distance_km: float = MAX_DISTANCE_KM,
) -> list[dict[str, Any]]:
    """
    Database-integrated matcher.  Fetches the provider's GPS from DB,
    fetches all registered NGOs, runs the ML pipeline, and persists matches.

    Returns:
        List of DB-persisted match dicts (with 'id', 'status', timestamps, etc.).
    """
    provider = db.get_user_by_id(provider_id)
    if not provider:
        provider = db.get_user_by_username(provider_id)
        
    if not provider or provider.get("latitude") is None:
        logger.warning("[MatchingService] Provider %s not found or missing coordinates.", provider_id)
        return []

    provider_input = {
        "provider_id":  provider["id"], # Ensure we use the actual DB ID internally
        "latitude":     provider["latitude"],
        "longitude":    provider["longitude"],
        "food_quantity": quantity_kg,
        "expiry_hours": expiry_hours,
    }

    # Fetch NGOs with remaining capacity (subtract active match loads)
    raw_ngos = db.get_users_by_role("ngo")
    ngos_with_capacity: list[dict[str, Any]] = []

    for ngo in raw_ngos:
        if not ngo.get("latitude"):
            continue

        active_matches = [
            m for m in db.get_matches_by_ngo(ngo["id"])
            if m.get("status") in ("pending", "accepted", "picked_up")
        ]
        active_qty = sum(m.get("quantity_kg", 0) for m in active_matches)
        remaining_capacity = max(0.0, float(ngo.get("capacity", 0)) - active_qty)

        ngos_with_capacity.append({
            "ngo_id":   ngo["id"],
            "id":       ngo["id"],
            "name":     ngo.get("name", "Unknown NGO"),
            "latitude":  ngo["latitude"],
            "longitude": ngo["longitude"],
            "capacity":  remaining_capacity,
            "email":     ngo.get("email"),
            "phone":     ngo.get("phone"),
        })

    # Run the ML pipeline
    ranked = rank_candidates(
        provider_lat=provider_input["latitude"],
        provider_lon=provider_input["longitude"],
        food_quantity=quantity_kg,
        expiry_hours=expiry_hours,
        ngos=ngos_with_capacity,
        max_distance_km=max_distance_km,
        top_n=top_n,
    )

    if not ranked:
        logger.warning("[MatchingService] No suitable NGOs found for provider %s.", provider_id)
        return []

    # Persist matches to the database
    persisted: list[dict[str, Any]] = []
    for match_data in ranked:
        record = {
            "prediction_id":  prediction_id,
            "provider_id":    provider["id"],
            "provider_name":  provider.get("name", ""),
            "ngo_id":         match_data["ngo_id"],
            "ngo_name":       match_data["ngo_name"],
            "food_type":      food_type,
            "quantity_kg":    quantity_kg,
            "distance_km":    match_data["distance_km"],
            "urgency_score":  match_data["urgency_score"],
            "priority_score": match_data["priority_score"],
            # Store extra AI fields in a 'meta' sub-dict (non-breaking)
            "ml_score":       match_data["ml_score"],
            "recommendation": match_data["recommendation"],
            "auto_accepted":  match_data["auto_accepted"],
            "explanation":    match_data["explanation"],
        }
        saved = db.add_match(record)
        # Merge ranking fields into the saved record for the response
        saved.update({
            "ml_score":       match_data["ml_score"],
            "recommendation": match_data["recommendation"],
            "auto_accepted":  match_data["auto_accepted"],
            "explanation":    match_data["explanation"],
            "contact_email":  match_data.get("contact_email"),
            "contact_phone":  match_data.get("contact_phone"),
        })
        persisted.append(saved)

    return persisted


# ──────────────────────────────────────────────────────────────────────────────
# Legacy helper kept for backward compatibility
# ──────────────────────────────────────────────────────────────────────────────

def calculate_urgency(expiry_hours: float, is_perishable: bool = True) -> float:
    """
    Legacy urgency helper (0–10 scale) used by dashboard displays.
    The new model uses urgency on a 0–1 scale internally.
    """
    from app.ml.scoring import urgency_score
    u01 = urgency_score(expiry_hours)
    # Scale to 0-10 and apply perishable multiplier for backward compat
    base = u01 * 10.0
    if is_perishable:
        base = min(10.0, base * 1.3)
    return round(base, 1)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Thin re-export for backward compatibility with code that imports from here."""
    from app.ml.distance import haversine_distance as _hd
    return _hd(lat1, lon1, lat2, lon2)
