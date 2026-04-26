# Graph Report - Capstrone  (2026-04-27)

## Corpus Check
- 49 files · ~23,646 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 239 nodes · 341 edges · 16 communities detected
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `InMemoryDB` - 24 edges
2. `rank_candidates()` - 11 edges
3. `find_best_matches()` - 9 edges
4. `distance_matrix()` - 8 edges
5. `run_match()` - 8 edges
6. `predict_surplus()` - 8 edges
7. `urgency_score()` - 7 edges
8. `compute_system_stats()` - 7 edges
9. `predict_suitability_batch()` - 6 edges
10. `hybrid_priority_score()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `test_haversine()` --calls--> `haversine_distance()`  [INFERRED]
  backend\test_matching.py → backend\app\services\matching_service.py
- `test_urgency()` --calls--> `urgency_score()`  [INFERRED]
  backend\test_matching.py → backend\app\ml\scoring.py
- `test_ml_model()` --calls--> `predict_suitability()`  [INFERRED]
  backend\test_matching.py → backend\app\ml\matching_model.py
- `test_hybrid_priority()` --calls--> `hybrid_priority_score()`  [INFERRED]
  backend\test_matching.py → backend\app\ml\scoring.py
- `test_ranking()` --calls--> `run_match()`  [INFERRED]
  backend\test_matching.py → backend\app\services\matching_service.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (35): Admin routes - system analytics, user management, logs., Authentication routes - register & login., BaseModel, Enum, Map routes - provider/NGO markers, hotspot data for heatmap., Generate waste hotspot data based on prediction history., DBMatchRequest, DistanceMatrixRequest (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (24): distance_matrix(), point_distance(), Simple point-to-point Haversine distance.     No authentication required., Distance + AI scoring matrix — no authentication required.     Ideal for the Di, calculate_urgency(), haversine_distance(), SmartSurplus - AI-Powered NGO Matching Service (v2)  This module is the integr, Legacy urgency helper (0–10 scale) used by dashboard displays.     The new mode (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (11): get_system_stats(), compute_system_stats(), Analytics Service - Computes system-wide statistics for admin dashboard., Compute aggregate system statistics., _extract_features(), predict_surplus(), ML Prediction Service - Surplus prediction using scikit-learn. Uses a RandomFor, Extract numerical features from a food entry for ML model. (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (5): InMemoryDB, In-memory data store with seed data for SmartSurplus demo. All data is stored i, Populate with realistic demo data., accept_match(), confirm_delivery()

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (12): get_hotspots(), get_ngo_markers(), get_provider_markers(), match_with_db(), DB-integrated matching endpoint.     Fetches provider GPS and all registered NG, find_best_matches(), Database-integrated matcher.  Fetches the provider's GPS from DB,     fetches a, get_ngo_matches() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (11): demo_match(), match_raw(), Standalone matching endpoint — no DB required.     Accepts provider + NGO dicts, Demo endpoint — runs a sample match with hard-coded data.     No authentication, Standalone matcher — works with plain Python dicts (no DB required).      Prov, run_match(), _DB, SmartSurplus - NGO Matching Engine: Sample Test Data & Manual Tests Run with: (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (14): _ensure_model(), _generate_synthetic_data(), predict_suitability(), predict_suitability_batch(), SmartSurplus ML - NGO Matching Model Trains a Gradient Boosting (or Random Fore, Lazily initialise the model on first call., Return a suitability score in [0, 1] for a single (provider, NGO) pair.      F, Predict suitability for a batch of rows (shape: [N, 4]).     Columns must be: [ (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (10): create_access_token(), decode_token(), get_current_user(), hash_password(), JWT Authentication & Password Hashing utilities., Dependency factory for role-based access control., require_role(), login() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (3): useAuth(), LoginPage(), RegisterPage()

### Community 9 - "Community 9"
Cohesion: 0.38
Nodes (3): clearToken(), getToken(), request()

### Community 10 - "Community 10"
Cohesion: 0.47
Nodes (4): distColor(), handleAction(), handleConfirm(), loadMatches()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (4): BaseSettings, Config, SmartSurplus Backend - Core Configuration, Settings

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (1): SmartSurplus Backend - FastAPI Main Application

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (3): haversine_distance(), SmartSurplus ML - Distance Calculator Uses the Haversine formula to calculate t, Calculate the distance between two lat/lon points using the Haversine formula.

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): handlePredict(), loadData()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): SmartSurplus ML Package  Public surface:     from app.ml.distance        impo

## Knowledge Gaps
- **42 isolated node(s):** `SmartSurplus - NGO Matching Engine: Sample Test Data & Manual Tests Run with:`, `SmartSurplus Backend - FastAPI Main Application`, `SmartSurplus - AI Matching API Routes  POST /api/matching/match     Full DB-i`, `DB-integrated matching endpoint.     Fetches provider GPS and all registered NG`, `Standalone matching endpoint — no DB required.     Accepts provider + NGO dicts` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (4 nodes): `main.py`, `health()`, `SmartSurplus Backend - FastAPI Main Application`, `root()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `page.tsx`, `page.tsx`, `handlePredict()`, `loadData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `__init__.py`, `SmartSurplus ML Package  Public surface:     from app.ml.distance        impo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `find_best_matches()` connect `Community 4` to `Community 1`, `Community 2`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Why does `rank_candidates()` connect `Community 1` to `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `InMemoryDB` connect `Community 3` to `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `rank_candidates()` (e.g. with `haversine_distance()` and `predict_suitability_batch()`) actually correct?**
  _`rank_candidates()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `find_best_matches()` (e.g. with `match_with_db()` and `.get_user_by_id()`) actually correct?**
  _`find_best_matches()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `distance_matrix()` (e.g. with `haversine_distance()` and `predict_suitability_batch()`) actually correct?**
  _`distance_matrix()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SmartSurplus - NGO Matching Engine: Sample Test Data & Manual Tests Run with:`, `SmartSurplus Backend - FastAPI Main Application`, `SmartSurplus - AI Matching API Routes  POST /api/matching/match     Full DB-i` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._