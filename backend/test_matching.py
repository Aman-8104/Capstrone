"""
SmartSurplus - NGO Matching Engine: Sample Test Data & Manual Tests
Run with:   python test_matching.py   (from the backend/ directory)
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

# ── patch db import so tests run without the real DB ──────────────────────────
import types

fake_db = types.ModuleType("app.core.database")
class _DB:
    def get_user_by_id(self, *a): return None
    def get_users_by_role(self, *a): return []
    def get_matches_by_ngo(self, *a): return []
    def add_match(self, d): return d

fake_db.db = _DB()
sys.modules["app.core.database"] = fake_db

# ─────────────────────────────────────────────────────────────────────────────
from app.ml.distance       import haversine_distance
from app.ml.matching_model import predict_suitability, _rule_based_score
from app.ml.scoring        import urgency_score, hybrid_priority_score, rank_candidates
from app.services.matching_service import run_match

# ══════════════════════════════════════════════════════════════════════════════
# Sample Data
# ══════════════════════════════════════════════════════════════════════════════

PROVIDER = {
    "provider_id":     "P-HOTEL-01",
    "latitude":        19.0760,   # Central Mumbai
    "longitude":       72.8777,
    "food_quantity":   60.0,      # kg
    "expiry_hours":    4.0,
    "predicted_surplus": 55.0,
}

NGOS = [
    {
        "ngo_id":    "NGO-001",
        "name":      "Annapurna Foundation",
        "latitude":  19.0896,    # ~1.5 km
        "longitude": 72.8656,
        "capacity":  100.0,
    },
    {
        "ngo_id":    "NGO-002",
        "name":      "Roti Bank Mumbai",
        "latitude":  19.0544,    # ~4 km
        "longitude": 72.8322,
        "capacity":  200.0,
    },
    {
        "ngo_id":    "NGO-003",
        "name":      "Robin Hood Army",
        "latitude":  19.1136,    # ~4.5 km
        "longitude": 72.8697,
        "capacity":  40.0,       # below food_quantity → should be filtered out
    },
    {
        "ngo_id":    "NGO-004",
        "name":      "Feeding India",
        "latitude":  19.2183,    # >20 km → should be filtered out
        "longitude": 72.9781,
        "capacity":  500.0,
    },
    {
        "ngo_id":    "NGO-005",
        "name":      "No Waste Mumbai",
        "latitude":  19.0633,    # ~3 km
        "longitude": 72.8621,
        "capacity":  150.0,
    },
]

# ══════════════════════════════════════════════════════════════════════════════
# Test A: Haversine Distance
# ══════════════════════════════════════════════════════════════════════════════

def test_haversine():
    print("\n── A. Haversine Distance Tests ──────────────────────────")
    # Known: Mumbai Central ↔ Bandra ≈ 5.5 km
    d = haversine_distance(19.0760, 72.8777, 19.0544, 72.8322)
    print(f"  Mumbai Central → Roti Bank: {d:.2f} km  (expected ~4-5 km)")
    assert 3.0 < d < 7.0, f"Unexpected distance: {d}"

    # Same point → 0 km
    d0 = haversine_distance(0, 0, 0, 0)
    assert d0 == 0.0, "Same-point distance must be 0"
    print("  Same-point distance: 0.0 km ✓")

    # Two antipodal points ≈ 20015 km
    d_anti = haversine_distance(0, 0, 0, 180)
    print(f"  Antipodal distance: {d_anti:.0f} km  (expected ~20015 km)")
    assert 19000 < d_anti < 21000
    print("  All haversine tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test B: Urgency Score
# ══════════════════════════════════════════════════════════════════════════════

def test_urgency():
    print("\n── B. Urgency Score Tests ───────────────────────────────")
    cases = [
        (0.0,  1.0000),
        (1.0,  0.5000),
        (4.0,  0.2000),
        (9.0,  0.1000),
        (23.0, 0.0417),
        (99.0, 0.0099),
    ]
    for hours, expected in cases:
        got = urgency_score(hours)
        print(f"  expiry={hours:5.1f}h  →  urgency={got:.4f}  (expected ~{expected:.4f})")
        assert abs(got - expected) < 0.002, f"Mismatch at expiry={hours}"
    print("  All urgency tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test C: ML Model
# ══════════════════════════════════════════════════════════════════════════════

def test_ml_model():
    print("\n── C. ML Model Prediction Tests ─────────────────────────")
    # Close NGO, low expiry, good capacity → should score high
    s_good = predict_suitability(1.5, 3.0, 50.0, 200.0)
    # Far NGO, high expiry, barely enough capacity → should score lower
    s_poor = predict_suitability(18.0, 48.0, 50.0, 55.0)

    print(f"  Close + urgent match:   ml_score = {s_good:.4f}")
    print(f"  Far + non-urgent match: ml_score = {s_poor:.4f}")
    assert 0.0 <= s_good <= 1.0, "Score out of [0,1]"
    assert 0.0 <= s_poor <= 1.0, "Score out of [0,1]"
    assert s_good > s_poor, "Expected high-priority to outscore low-priority"
    print("  ML model tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test D: Hybrid Priority Score
# ══════════════════════════════════════════════════════════════════════════════

def test_hybrid_priority():
    print("\n── D. Hybrid Priority Score Tests ───────────────────────")
    # High ML score, urgent, large quantity, very close
    p1 = hybrid_priority_score(ml_score=0.9, expiry_hours=1.0, food_quantity=100.0, distance_km=1.0)
    # Low ML score, far, low quantity, lots of time
    p2 = hybrid_priority_score(ml_score=0.2, expiry_hours=48.0, food_quantity=5.0, distance_km=19.0)

    print(f"  High-value scenario:  priority = {p1:.4f}")
    print(f"  Low-value scenario:   priority = {p2:.4f}")
    assert 0.0 <= p1 <= 1.0
    assert 0.0 <= p2 <= 1.0
    assert p1 > p2, "High-value scenario should outrank low-value"
    print("  Hybrid priority tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test E & F: Full Ranking Pipeline
# ══════════════════════════════════════════════════════════════════════════════

def test_ranking():
    print("\n── E/F. Full Ranking Pipeline ───────────────────────────")
    results = run_match(
        provider=PROVIDER,
        ngos=NGOS,
        max_distance_km=20.0,
        top_n=3,
    )

    assert isinstance(results, list), "Expected a list"
    assert len(results) <= 3, "Should return at most 3 matches"
    assert len(results) > 0, "Expected at least one result"

    # Verify NGO-003 (capacity=40 < 60kg) and NGO-004 (>20km) are excluded
    ngo_ids = [r["ngo_id"] for r in results]
    assert "NGO-003" not in ngo_ids, "NGO-003 should be filtered (capacity < quantity)"
    assert "NGO-004" not in ngo_ids, "NGO-004 should be filtered (distance > 20km)"

    # Verify descending priority order
    scores = [r["priority_score"] for r in results]
    assert scores == sorted(scores, reverse=True), "Results must be sorted by priority_score desc"

    print(f"\n  ✅ Top {len(results)} NGO Matches:")
    header = f"  {'NGO':<30} {'Dist':>7} {'Urgency':>8} {'ML':>7} {'Priority':>9} {'Rec':>7} {'Auto':>5}"
    print(header)
    print("  " + "─" * 80)
    for r in results:
        print(
            f"  {r['ngo_name']:<30} "
            f"{r['distance_km']:>6.2f}km "
            f"{r['urgency_score']:>8.4f} "
            f"{r['ml_score']:>7.4f} "
            f"{r['priority_score']:>9.4f} "
            f"{r['recommendation']:>7} "
            f"{'Yes' if r['auto_accepted'] else 'No':>5}"
        )
        print(f"     💬 {r['explanation']}")

    print("\n  All ranking tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test G: Output Format
# ══════════════════════════════════════════════════════════════════════════════

def test_output_format():
    print("\n── G. Output Format Validation ──────────────────────────")
    required_keys = {
        "ngo_id", "distance_km", "urgency_score",
        "ml_score", "priority_score", "recommendation",
        "auto_accepted", "explanation",
    }
    results = run_match(provider=PROVIDER, ngos=NGOS, max_distance_km=20.0, top_n=3)
    for r in results:
        missing = required_keys - r.keys()
        assert not missing, f"Missing keys in result: {missing}"
        assert r["recommendation"] in ("HIGH", "MEDIUM", "LOW")
        assert 0.0 <= r["priority_score"] <= 1.0
        assert isinstance(r["auto_accepted"], bool)
    print("  Output format validated ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Test H: Edge Cases
# ══════════════════════════════════════════════════════════════════════════════

def test_edge_cases():
    print("\n── H. Edge Cases ─────────────────────────────────────────")

    # No NGOs → empty result
    res = run_match(provider=PROVIDER, ngos=[], max_distance_km=20.0, top_n=3)
    assert res == [], "Empty NGO list should return []"
    print("  Empty NGO list → [] ✓")

    # All NGOs filtered (capacity too small)
    tiny_ngos = [{"ngo_id": "N1", "name": "Tiny", "latitude": 19.08,
                   "longitude": 72.87, "capacity": 5.0}]
    res2 = run_match(provider=PROVIDER, ngos=tiny_ngos, max_distance_km=20.0, top_n=3)
    assert res2 == [], "All-filtered NGOs should return []"
    print("  All-filtered NGOs → [] ✓")

    # top_n=1 → only 1 result
    res3 = run_match(provider=PROVIDER, ngos=NGOS, max_distance_km=20.0, top_n=1)
    assert len(res3) == 1, f"Expected 1 result, got {len(res3)}"
    print("  top_n=1 → exactly 1 result ✓")

    print("  All edge-case tests passed ✓")


# ══════════════════════════════════════════════════════════════════════════════
# Runner
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("  SmartSurplus NGO Matching Engine — Test Suite")
    print("=" * 60)

    test_haversine()
    test_urgency()
    test_ml_model()
    test_hybrid_priority()
    test_ranking()
    test_output_format()
    test_edge_cases()

    print("\n" + "=" * 60)
    print("  ✅ All tests passed!")
    print("=" * 60)
