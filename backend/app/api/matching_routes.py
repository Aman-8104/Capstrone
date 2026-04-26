"""
SmartSurplus - AI Matching API Routes

POST /api/matching/match
    Full DB-integrated match: takes a provider_id + food details → returns top-N NGOs.

POST /api/matching/match-raw
    Standalone match: accepts raw provider + NGO dicts → returns ranked results.
    (No DB required — great for testing / external integrations.)

GET  /api/matching/demo
    Returns a pre-run demo match using built-in sample data.
"""

from __future__ import annotations

import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import get_current_user
from app.services.matching_service import run_match, find_best_matches
from app.ml.scoring import MAX_DISTANCE_KM, TOP_N_DEFAULT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/matching", tags=["matching"])


# ──────────────────────────────────────────────────────────────────────────────
# Request / Response Schemas
# ──────────────────────────────────────────────────────────────────────────────

class NGOInput(BaseModel):
    ngo_id: str
    latitude: float
    longitude: float
    capacity: float = Field(..., gt=0, description="Capacity in kg")
    name: Optional[str] = "Unknown NGO"


class ProviderInput(BaseModel):
    provider_id: str
    latitude: float
    longitude: float
    food_quantity: float = Field(..., gt=0, description="Available food in kg")
    expiry_hours: float = Field(..., gt=0, description="Hours until food expires")
    predicted_surplus: Optional[float] = None


class RawMatchRequest(BaseModel):
    provider: ProviderInput
    ngos: List[NGOInput]
    max_distance_km: float = Field(default=MAX_DISTANCE_KM, gt=0)
    top_n: int = Field(default=TOP_N_DEFAULT, ge=1, le=10)


class DBMatchRequest(BaseModel):
    provider_id: str
    food_type: str = "mixed"
    food_quantity: float = Field(..., gt=0)
    expiry_hours: float = Field(default=6.0, gt=0)
    prediction_id: Optional[str] = "manual"
    max_distance_km: float = Field(default=MAX_DISTANCE_KM, gt=0)
    top_n: int = Field(default=TOP_N_DEFAULT, ge=1, le=10)


class MatchResult(BaseModel):
    ngo_id: str
    ngo_name: str
    distance_km: float
    urgency_score: float
    ml_score: float
    priority_score: float
    recommendation: str   # "HIGH" | "MEDIUM" | "LOW"
    auto_accepted: bool
    explanation: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/match", response_model=List[dict])
async def match_with_db(
    req: DBMatchRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    DB-integrated matching endpoint.
    Fetches provider GPS and all registered NGOs from the database,
    runs the AI pipeline, and persists the top matches.
    """
    matches = find_best_matches(
        prediction_id=req.prediction_id or "manual",
        provider_id=req.provider_id,
        food_type=req.food_type,
        quantity_kg=req.food_quantity,
        expiry_hours=req.expiry_hours,
        top_n=req.top_n,
        max_distance_km=req.max_distance_km,
    )
    if not matches:
        raise HTTPException(
            status_code=404,
            detail=(
                "No suitable NGOs found. Possible reasons: "
                "no NGOs within distance limit, or all NGOs are at capacity."
            ),
        )
    return matches


@router.post("/match-raw", response_model=List[MatchResult])
async def match_raw(req: RawMatchRequest):
    """
    Standalone matching endpoint — no DB required.
    Accepts provider + NGO dicts directly and returns ranked match results.
    Perfect for external integrations and testing.
    """
    provider_dict = req.provider.model_dump()
    ngo_dicts     = [n.model_dump() for n in req.ngos]

    results = run_match(
        provider=provider_dict,
        ngos=ngo_dicts,
        max_distance_km=req.max_distance_km,
        top_n=req.top_n,
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail=(
                "No eligible NGOs matched. Check capacity, distance constraints, "
                "and that NGOs have valid coordinates."
            ),
        )
    return results


@router.get("/distance")
async def point_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
):
    """
    Simple point-to-point Haversine distance.
    No authentication required.

    Query params: lat1, lon1, lat2, lon2 (decimal degrees)
    Returns: distance_km
    """
    from app.ml.distance import haversine_distance
    dist = haversine_distance(lat1, lon1, lat2, lon2)
    return {
        "distance_km": dist,
        "from": {"latitude": lat1, "longitude": lon1},
        "to":   {"latitude": lat2, "longitude": lon2},
    }


class DistanceMatrixRequest(BaseModel):
    provider: ProviderInput
    ngos: List[NGOInput]
    max_distance_km: float = Field(default=MAX_DISTANCE_KM, gt=0)
    top_n: int = Field(default=TOP_N_DEFAULT, ge=1, le=10)


@router.post("/distance-matrix", response_model=List[MatchResult])
async def distance_matrix(req: DistanceMatrixRequest):
    """
    Distance + AI scoring matrix — no authentication required.
    Ideal for the Distance Calculator UI: pass a provider and a list of NGOs,
    get back full distances, ML scores, urgency and priority for each NGO.
    Unlike /match-raw, capacity is NOT a hard constraint here so you always
    see all distances even if an NGO is over capacity.
    """
    from app.ml.distance import haversine_distance
    from app.ml.scoring import urgency_score, hybrid_priority_score, _recommendation_label, _build_explanation
    from app.ml.matching_model import predict_suitability_batch
    import numpy as np

    provider_dict = req.provider.model_dump()
    p_lat = provider_dict["latitude"]
    p_lon = provider_dict["longitude"]
    food_qty = provider_dict["food_quantity"]
    expiry_h = provider_dict["expiry_hours"]

    candidates = []
    for ngo in req.ngos:
        n = ngo.model_dump()
        dist = haversine_distance(p_lat, p_lon, n["latitude"], n["longitude"])
        candidates.append({
            "ngo_id":       n["ngo_id"],
            "ngo_name":     n.get("name", "Unknown NGO"),
            "ngo_capacity": float(n["capacity"]),
            "distance_km":  dist,
        })

    if not candidates:
        raise HTTPException(status_code=404, detail="No NGOs provided.")

    feature_matrix = np.array(
        [[c["distance_km"], expiry_h, food_qty, c["ngo_capacity"]] for c in candidates],
        dtype=np.float64,
    )
    ml_scores = predict_suitability_batch(feature_matrix)
    urgency = urgency_score(expiry_h)

    results = []
    for i, c in enumerate(candidates):
        ml_s     = float(ml_scores[i])
        priority = hybrid_priority_score(ml_s, expiry_h, food_qty, c["distance_km"])
        auto_ok  = priority >= 0.8
        within   = c["distance_km"] <= req.max_distance_km

        explanation = _build_explanation(
            ngo_id=c["ngo_id"],
            distance_km=c["distance_km"],
            urgency=urgency,
            ml_score=ml_s,
            priority=priority,
            food_quantity=food_qty,
            ngo_capacity=c["ngo_capacity"],
            auto_accepted=auto_ok,
        )
        if not within:
            explanation = f"⚠️ Outside {req.max_distance_km} km limit. " + explanation

        results.append({
            "ngo_id":         c["ngo_id"],
            "ngo_name":       c["ngo_name"],
            "distance_km":    c["distance_km"],
            "urgency_score":  urgency,
            "ml_score":       round(ml_s, 4),
            "priority_score": priority,
            "recommendation": _recommendation_label(priority) if within else "OUT_OF_RANGE",
            "auto_accepted":  auto_ok and within,
            "explanation":    explanation,
        })

    results.sort(key=lambda r: r["distance_km"])
    return results[:req.top_n] if req.top_n < len(results) else results


@router.get("/demo", response_model=List[MatchResult])
async def demo_match():
    """
    Demo endpoint — runs a sample match with hard-coded data.
    No authentication required. Great for a quick sanity-check.
    """
    # Sample provider in central Mumbai
    sample_provider: dict[str, Any] = {
        "provider_id":    "demo-provider-01",
        "latitude":       19.0760,
        "longitude":      72.8777,
        "food_quantity":  45.0,   # kg
        "expiry_hours":   3.5,
    }

    # Five sample NGOs scattered around Mumbai
    sample_ngos: list[dict[str, Any]] = [
        {
            "ngo_id":    "NGO-001",
            "name":      "Annapurna Foundation",
            "latitude":  19.0896,
            "longitude": 72.8656,
            "capacity":  100.0,
        },
        {
            "ngo_id":    "NGO-002",
            "name":      "Roti Bank Mumbai",
            "latitude":  19.0544,
            "longitude": 72.8322,
            "capacity":  200.0,
        },
        {
            "ngo_id":    "NGO-003",
            "name":      "Robin Hood Army",
            "latitude":  19.1136,
            "longitude": 72.8697,
            "capacity":  30.0,   # below food_quantity → filtered out
        },
        {
            "ngo_id":    "NGO-004",
            "name":      "Feeding India",
            "latitude":  19.2183,
            "longitude": 72.9781,
            "capacity":  500.0,  # 25+ km away → filtered out
        },
        {
            "ngo_id":    "NGO-005",
            "name":      "No Waste Mumbai",
            "latitude":  19.0633,
            "longitude": 72.8621,
            "capacity":  150.0,
        },
    ]

    results = run_match(
        provider=sample_provider,
        ngos=sample_ngos,
        max_distance_km=20.0,
        top_n=3,
    )

    if not results:
        raise HTTPException(status_code=404, detail="Demo match returned no results.")

    return results
