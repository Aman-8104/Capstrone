"""
SmartSurplus ML Package

Public surface:
    from app.ml.distance        import haversine_distance
    from app.ml.matching_model  import train_matching_model, predict_suitability
    from app.ml.scoring         import urgency_score, hybrid_priority_score, rank_candidates
"""
from app.ml.distance       import haversine_distance
from app.ml.matching_model import train_matching_model, predict_suitability
from app.ml.scoring        import urgency_score, hybrid_priority_score, rank_candidates

__all__ = [
    "haversine_distance",
    "train_matching_model",
    "predict_suitability",
    "urgency_score",
    "hybrid_priority_score",
    "rank_candidates",
]
