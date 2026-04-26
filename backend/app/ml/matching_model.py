"""
SmartSurplus ML - NGO Matching Model
Trains a Gradient Boosting (or Random Forest) regressor to predict a
suitability_score [0, 1] for a (provider, NGO) pair given:
  - distance_km
  - expiry_hours
  - food_quantity  (kg)
  - ngo_capacity   (kg)

Synthetic training data is generated if no real dataset is available.
A rule-based fallback is provided in case the model fails at runtime.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Module-level singletons (lazy-loaded once per process)
# ──────────────────────────────────────────────────────────────────────────────
_model: Optional[GradientBoostingRegressor] = None
_scaler: Optional[MinMaxScaler] = None


# ──────────────────────────────────────────────────────────────────────────────
# Synthetic Data Generation
# ──────────────────────────────────────────────────────────────────────────────

def _generate_synthetic_data(n_samples: int = 2000) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate realistic synthetic training data for the matching model.

    Feature columns:
        0 – distance_km   : uniform [0.1, 25.0]
        1 – expiry_hours  : uniform [1.0, 72.0]
        2 – food_quantity : uniform [1.0, 200.0]
        3 – ngo_capacity  : uniform [10.0, 500.0]

    Target – suitability_score [0, 1]:
        Derived from domain logic so the model learns a meaningful mapping.
    """
    rng = np.random.default_rng(seed=42)

    distance     = rng.uniform(0.1, 25.0, n_samples)
    expiry       = rng.uniform(1.0, 72.0, n_samples)
    quantity     = rng.uniform(1.0, 200.0, n_samples)
    capacity     = rng.uniform(10.0, 500.0, n_samples)

    X = np.column_stack([distance, expiry, quantity, capacity])

    # ---------- deterministic label construction ----------
    # Proximity reward: inversely proportional to distance (max contribution at 0 km)
    proximity    = np.clip(1.0 - distance / 25.0, 0.0, 1.0)

    # Urgency reward: higher when food is about to expire
    urgency      = 1.0 / (expiry + 1.0)                         # range (0, 0.5]
    urgency_norm = urgency / urgency.max()                        # normalise to [0,1]

    # Capacity feasibility: penalise if NGO can barely handle the food
    cap_ratio    = np.clip(capacity / np.maximum(quantity, 1.0), 0.0, 10.0)
    cap_score    = np.clip(cap_ratio / 10.0, 0.0, 1.0)

    # Quantity reward: larger loads are worth the trip for the NGO
    qty_norm     = np.clip(quantity / 200.0, 0.0, 1.0)

    score = (
        0.40 * proximity
        + 0.30 * urgency_norm
        + 0.20 * cap_score
        + 0.10 * qty_norm
    )

    # Add light Gaussian noise (σ = 0.03) to avoid perfectly smooth labels
    noise = rng.normal(0.0, 0.03, n_samples)
    score = np.clip(score + noise, 0.0, 1.0)

    return X, score.astype(np.float32)


# ──────────────────────────────────────────────────────────────────────────────
# Model Training
# ──────────────────────────────────────────────────────────────────────────────

def train_matching_model() -> None:
    """
    Train the Gradient Boosting suitability model and store it in module globals.
    Called once at startup (or lazily on first use).
    """
    global _model, _scaler

    logger.info("[MatchingModel] Generating synthetic training data …")
    X, y = _generate_synthetic_data(n_samples=2000)

    _scaler = MinMaxScaler()
    X_scaled = _scaler.fit_transform(X)

    _model = GradientBoostingRegressor(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        random_state=42,
    )
    _model.fit(X_scaled, y)
    logger.info("[MatchingModel] Model trained successfully (n_estimators=150).")


def _ensure_model() -> None:
    """Lazily initialise the model on first call."""
    if _model is None or _scaler is None:
        train_matching_model()


# ──────────────────────────────────────────────────────────────────────────────
# Prediction
# ──────────────────────────────────────────────────────────────────────────────

def predict_suitability(
    distance_km: float,
    expiry_hours: float,
    food_quantity: float,
    ngo_capacity: float,
) -> float:
    """
    Return a suitability score in [0, 1] for a single (provider, NGO) pair.

    Falls back to rule-based scoring if the model is unavailable.
    """
    try:
        _ensure_model()
        X = np.array([[distance_km, expiry_hours, food_quantity, ngo_capacity]])
        X_scaled = _scaler.transform(X)
        score = float(_model.predict(X_scaled)[0])
        return round(float(np.clip(score, 0.0, 1.0)), 4)
    except Exception as exc:
        logger.warning("[MatchingModel] ML prediction failed, using fallback. Error: %s", exc)
        return _rule_based_score(distance_km, expiry_hours, food_quantity, ngo_capacity)


def predict_suitability_batch(feature_matrix: np.ndarray) -> np.ndarray:
    """
    Predict suitability for a batch of rows (shape: [N, 4]).
    Columns must be: [distance_km, expiry_hours, food_quantity, ngo_capacity].

    Falls back to per-row rule-based scoring if the model fails.
    """
    try:
        _ensure_model()
        X_scaled = _scaler.transform(feature_matrix)
        scores = _model.predict(X_scaled)
        return np.clip(scores, 0.0, 1.0).astype(np.float32)
    except Exception as exc:
        logger.warning("[MatchingModel] Batch prediction failed, using fallback. Error: %s", exc)
        return np.array(
            [
                _rule_based_score(row[0], row[1], row[2], row[3])
                for row in feature_matrix
            ],
            dtype=np.float32,
        )


# ──────────────────────────────────────────────────────────────────────────────
# Rule-Based Fallback
# ──────────────────────────────────────────────────────────────────────────────

def _rule_based_score(
    distance_km: float,
    expiry_hours: float,
    food_quantity: float,
    ngo_capacity: float,
) -> float:
    """
    Deterministic weighted scoring — mirrors the synthetic label formula.
    Used as a fallback when the ML model is unavailable.
    """
    MAX_DIST = 25.0

    proximity    = max(0.0, 1.0 - distance_km / MAX_DIST)
    urgency_raw  = 1.0 / (expiry_hours + 1.0)
    urgency_norm = min(urgency_raw / 0.5, 1.0)          # normalise (max is 1/(1+1)=0.5)
    cap_ratio    = min(ngo_capacity / max(food_quantity, 1.0), 10.0)
    cap_score    = cap_ratio / 10.0
    qty_norm     = min(food_quantity / 200.0, 1.0)

    score = (
        0.40 * proximity
        + 0.30 * urgency_norm
        + 0.20 * cap_score
        + 0.10 * qty_norm
    )
    return round(float(np.clip(score, 0.0, 1.0)), 4)
