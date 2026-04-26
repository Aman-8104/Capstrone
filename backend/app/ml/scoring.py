"""
SmartSurplus ML - Scoring & Ranking Engine

Provides:
  - urgency_score()         : Expiry-based urgency  [0, 1]
  - hybrid_priority_score() : ML + rule-based hybrid priority
  - apply_constraints()     : Hard constraint filtering on NGO candidates
  - rank_candidates()       : Full pipeline → sorted top-N matches with explainability
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np

from app.ml.distance import haversine_distance
from app.ml.matching_model import predict_suitability_batch, _rule_based_score

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Constants (configurable)
# ──────────────────────────────────────────────────────────────────────────────
MAX_DISTANCE_KM: float = 20.0      # Hard cut-off: ignore NGOs beyond this
AUTO_ACCEPT_THRESHOLD: float = 0.8 # Priority score above which match is auto-accepted
TOP_N_DEFAULT: int = 3


# ──────────────────────────────────────────────────────────────────────────────
# A. Urgency Score
# ──────────────────────────────────────────────────────────────────────────────

def urgency_score(expiry_hours: float) -> float:
    """
    Compute urgency based on remaining expiry time.

    Formula:  urgency = 1 / (expiry_hours + 1)
    Range:    (0, 1]   — lower expiry → higher urgency (closer to 1)

    Examples:
        expiry_hours=0  → urgency = 1.00  (expired / imminent)
        expiry_hours=1  → urgency = 0.50
        expiry_hours=5  → urgency = 0.17
        expiry_hours=23 → urgency = 0.04
    """
    return round(1.0 / (max(expiry_hours, 0.0) + 1.0), 4)


# ──────────────────────────────────────────────────────────────────────────────
# D. Hybrid Priority Score
# ──────────────────────────────────────────────────────────────────────────────

def hybrid_priority_score(
    ml_score: float,
    expiry_hours: float,
    food_quantity: float,
    distance_km: float,
) -> float:
    """
    Combine ML suitability score with rule-based urgency-driven priority.

    Formula:
        urgency = 1 / (expiry_hours + 1)
        rule_component = (urgency * food_quantity) / max(distance_km, 0.5)
        priority = (ml_score * 0.6) + (rule_component_normalised * 0.4)

    The rule component is normalised to [0, 1] using a generous upper bound
    (urgency=1, quantity=200, distance=0.5 → raw_max ≈ 400) so that both
    components contribute equally at max values.

    Returns a score in [0, 1].
    """
    urgency = urgency_score(expiry_hours)
    rule_raw = (urgency * food_quantity) / max(distance_km, 0.5)

    # Normalise rule component: practical maximum ≈ (1.0 * 200) / 0.5 = 400
    RULE_MAX = 400.0
    rule_norm = min(rule_raw / RULE_MAX, 1.0)

    priority = (ml_score * 0.6) + (rule_norm * 0.4)
    return round(float(np.clip(priority, 0.0, 1.0)), 4)


# ──────────────────────────────────────────────────────────────────────────────
# E. Constraint Filtering
# ──────────────────────────────────────────────────────────────────────────────

def apply_constraints(
    candidates: list[dict[str, Any]],
    food_quantity: float,
    max_distance_km: float = MAX_DISTANCE_KM,
) -> list[dict[str, Any]]:
    """
    Filter out NGO candidates that violate hard constraints:
        1. NGO capacity < food_quantity
        2. Distance > max_distance_km

    Args:
        candidates: List of dicts, each containing 'distance_km' and 'ngo_capacity'.
        food_quantity: Required food volume (kg).
        max_distance_km: Maximum allowed distance (default: 20 km).

    Returns:
        Filtered list of eligible candidates.
    """
    eligible = []
    for c in candidates:
        dist   = c.get("distance_km", 0.0)
        cap    = c.get("ngo_capacity", 0.0)

        if cap < food_quantity:
            logger.debug("[Constraints] NGO %s excluded: capacity %.1f < quantity %.1f",
                         c.get("ngo_id"), cap, food_quantity)
            continue
        if dist > max_distance_km:
            logger.debug("[Constraints] NGO %s excluded: distance %.1f km > %.1f km limit",
                         c.get("ngo_id"), dist, max_distance_km)
            continue

        eligible.append(c)

    return eligible


# ──────────────────────────────────────────────────────────────────────────────
# F & G. Full Ranking Pipeline
# ──────────────────────────────────────────────────────────────────────────────

def _recommendation_label(priority: float) -> str:
    """Map a priority score to a human-readable recommendation tier."""
    if priority >= 0.70:
        return "HIGH"
    if priority >= 0.40:
        return "MEDIUM"
    return "LOW"


def _build_explanation(
    ngo_id: str,
    distance_km: float,
    urgency: float,
    ml_score: float,
    priority: float,
    food_quantity: float,
    ngo_capacity: float,
    auto_accepted: bool,
) -> str:
    """Generate a human-readable explanation of why this NGO was selected."""
    reasons = []

    if distance_km <= 5.0:
        reasons.append(f"very close at {distance_km:.1f} km")
    elif distance_km <= 10.0:
        reasons.append(f"within comfortable range ({distance_km:.1f} km)")
    else:
        reasons.append(f"acceptable distance ({distance_km:.1f} km)")

    if urgency >= 0.5:
        reasons.append("food is critically close to expiry (high urgency)")
    elif urgency >= 0.2:
        reasons.append("moderate urgency due to expiry window")

    cap_ratio = ngo_capacity / max(food_quantity, 1.0)
    if cap_ratio >= 3.0:
        reasons.append(f"NGO has ample capacity ({ngo_capacity:.0f} kg vs {food_quantity:.0f} kg needed)")
    elif cap_ratio >= 1.5:
        reasons.append("NGO has sufficient capacity with headroom")
    else:
        reasons.append("NGO capacity just covers the food quantity")

    if ml_score >= 0.75:
        reasons.append("ML model predicts high suitability")
    elif ml_score >= 0.50:
        reasons.append("ML model predicts moderate suitability")

    explanation = "Selected because: " + "; ".join(reasons) + "."
    if auto_accepted:
        explanation += " ✅ Auto-accepted (priority score > 0.8)."

    return explanation


def rank_candidates(
    provider_lat: float,
    provider_lon: float,
    food_quantity: float,
    expiry_hours: float,
    ngos: list[dict[str, Any]],
    max_distance_km: float = MAX_DISTANCE_KM,
    top_n: int = TOP_N_DEFAULT,
) -> list[dict[str, Any]]:
    """
    Full pipeline: distance → constraints → ML scoring → hybrid priority → rank → top-N.

    Args:
        provider_lat/lon : Provider GPS coordinates.
        food_quantity    : Food available (kg).
        expiry_hours     : Hours until food expires.
        ngos             : List of NGO dicts with keys:
                             ngo_id, latitude, longitude, capacity
        max_distance_km  : Hard distance cut-off (default 20 km).
        top_n            : Number of top matches to return.

    Returns:
        List of ranked match dicts (max `top_n` items), shaped as per Output Format G.
    """
    if not ngos:
        logger.warning("[Ranking] No NGOs provided.")
        return []

    # ── Step 1: Calculate distances ──────────────────────────────────────────
    candidates: list[dict[str, Any]] = []
    for ngo in ngos:
        ngo_lat = ngo.get("latitude")
        ngo_lon = ngo.get("longitude")
        if ngo_lat is None or ngo_lon is None:
            continue

        dist = haversine_distance(provider_lat, provider_lon, ngo_lat, ngo_lon)
        candidates.append({
            "ngo_id":       ngo.get("ngo_id") or ngo.get("id"),
            "ngo_name":     ngo.get("name", "Unknown NGO"),
            "latitude":     ngo_lat,
            "longitude":    ngo_lon,
            "ngo_capacity": float(ngo.get("capacity", 0)),
            "distance_km":  dist,
            "contact_email": ngo.get("email") or ngo.get("contact_email"),
            "contact_phone": ngo.get("phone") or ngo.get("contact_phone"),
        })

    # ── Step 2: Apply hard constraints ───────────────────────────────────────
    eligible = apply_constraints(candidates, food_quantity, max_distance_km)
    if not eligible:
        logger.warning("[Ranking] No NGOs passed the constraint filter.")
        return []

    # ── Step 3: Batch ML prediction ───────────────────────────────────────────
    feature_matrix = np.array(
        [
            [c["distance_km"], expiry_hours, food_quantity, c["ngo_capacity"]]
            for c in eligible
        ],
        dtype=np.float64,
    )

    ml_scores = predict_suitability_batch(feature_matrix)   # shape [N]

    # ── Step 4: Compute urgency + hybrid priority ─────────────────────────────
    urgency = urgency_score(expiry_hours)
    results: list[dict[str, Any]] = []

    for i, c in enumerate(eligible):
        ml_s     = float(ml_scores[i])
        priority = hybrid_priority_score(ml_s, expiry_hours, food_quantity, c["distance_km"])
        auto_ok  = priority >= AUTO_ACCEPT_THRESHOLD

        explanation = _build_explanation(
            ngo_id=c["ngo_id"],
            distance_km=c["distance_km"],
            urgency=urgency,
            ml_score=ml_s,
            priority=priority,
            food_quantity=food_quantity,
            ngo_capacity=c["ngo_capacity"],
            auto_accepted=auto_ok,
        )

        results.append({
            "ngo_id":          c["ngo_id"],
            "ngo_name":        c["ngo_name"],
            "distance_km":     c["distance_km"],
            "urgency_score":   urgency,
            "ml_score":        round(ml_s, 4),
            "priority_score":  priority,
            "recommendation":  _recommendation_label(priority),
            "auto_accepted":   auto_ok,
            "explanation":     explanation,
            "contact_email":   c.get("contact_email"),
            "contact_phone":   c.get("contact_phone"),
        })

    # ── Step 5: Sort descending by priority_score ─────────────────────────────
    results.sort(key=lambda r: r["priority_score"], reverse=True)

    return results[:top_n]
