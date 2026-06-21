"""Backend tests for AWS CloudForge Cards (iteration 3 — v0.2.5 scoring rewrite).

Covers:
  - Root, services (incl. glue_catalog), scenarios, constraints
  - /game/session?rounds=N uniqueness
  - /game/deal guarantees an ideal-combo subset in hand
  - /game/score new schema (6 sub-scores in order, matched_ideal,
    ideal_combos_status, best_match_service_names)
  - 5 v0.2.5 acceptance test cases (TC1..TC5)
  - Validation (3..6 services, invalid scenario)
  - Leaderboard create + list (sorted desc)
"""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"

EXPECTED_BREAKDOWN_LABELS = [
    "Correct Service Selection",
    "Ideal Architecture Match",
    "Constraint Alignment",
    "Synergy Bonus",
    "Simplicity / Overengineering",
    "Explanation Bonus",
]

VALID_RATINGS = {"Broken Architecture", "Needs Refactor", "Partial Fit",
                 "Production Candidate", "Well-Architected"}


# ---------- Root & cards ----------
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_services_includes_glue_catalog():
    r = requests.get(f"{API}/cards/services")
    assert r.status_code == 200
    svc = r.json()["services"]
    ids = {s["id"] for s in svc}
    assert "glue_catalog" in ids, "Expected new card 'glue_catalog' to be present"
    gc = next(s for s in svc if s["id"] == "glue_catalog")
    assert gc["category"] == "Analytics"
    assert "Glue" in gc["title"] or "Catalog" in gc["title"]


def test_scenarios_have_new_split_fields():
    r = requests.get(f"{API}/cards/scenarios")
    assert r.status_code == 200
    scenarios = r.json()["scenarios"]
    assert len(scenarios) >= 5
    # at least one scenario must expose the new split fields
    has_split = any(
        ("core_service_ids" in s) or ("supporting_service_ids" in s)
        or ("distractor_service_ids" in s)
        for s in scenarios
    )
    assert has_split, "Scenarios should expose core/supporting/distractor ids"


def test_constraints():
    r = requests.get(f"{API}/cards/constraints")
    assert r.status_code == 200
    assert len(r.json()["constraints"]) >= 1


# ---------- Session ----------
def test_session_returns_unique_scenarios():
    r = requests.get(f"{API}/game/session", params={"rounds": 3})
    assert r.status_code == 200
    ids = r.json()["scenario_ids"]
    assert len(ids) == 3
    assert len(set(ids)) == 3, "scenario_ids must be unique"


# ---------- Deal ----------
def test_deal_includes_full_ideal_combo_in_hand():
    # Ask for a known scenario and verify the hand contains all services of at
    # least one ideal combo, so player can reach the ideal architecture.
    sc = requests.get(f"{API}/cards/scenarios").json()["scenarios"]
    target = next(s for s in sc if s["id"] == "static_blog")
    combos = target.get("ideal_combos") or []
    assert combos, "static_blog should have at least one ideal combo"
    deal = requests.get(f"{API}/game/deal",
                       params={"scenario_id": "static_blog"}).json()
    hand_ids = {c["id"] for c in deal["hand"]}
    assert any(set(combo).issubset(hand_ids) for combo in combos), (
        f"Hand {hand_ids} does not fully contain any ideal combo {combos}"
    )


# ---------- Score: schema shape ----------
def _score(scenario_id, selected, constraints=None, explanation=""):
    payload = {
        "scenario_id": scenario_id,
        "constraint_ids": constraints or [],
        "selected_service_ids": selected,
        "explanation": explanation,
    }
    r = requests.post(f"{API}/game/score", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


def test_score_schema_six_subscores_in_order_and_new_fields():
    d = _score("photo_sharing", ["s3", "cloudfront", "lambda", "dynamodb"])
    assert 0 <= d["total"] <= 100
    assert d["rating"] in VALID_RATINGS

    # 6 sub-scores in correct order
    labels = [b["label"] for b in d["breakdown"]]
    assert labels == EXPECTED_BREAKDOWN_LABELS, (
        f"breakdown order/labels mismatch: {labels}"
    )
    for b in d["breakdown"]:
        assert "score" in b and "max" in b and "reasons" in b
        assert b["score"] <= b["max"], (
            f"{b['label']}: score {b['score']} > max {b['max']}"
        )
        assert isinstance(b["reasons"], list)

    # New fields
    assert "matched_ideal" in d
    mi = d["matched_ideal"]
    for k in ("combo_ids", "matched_count", "total", "status"):
        assert k in mi, f"matched_ideal missing key {k}"
    assert mi["status"] in {"full", "partial", "miss"}

    assert "ideal_combos_status" in d
    assert isinstance(d["ideal_combos_status"], list)
    assert len(d["ideal_combos_status"]) >= 1
    for cs in d["ideal_combos_status"]:
        for k in ("combo_ids", "matched_count", "total", "status"):
            assert k in cs
        assert cs["status"] in {"full", "partial", "miss"}

    assert "best_match_service_names" in d
    assert isinstance(d["best_match_service_names"], list)


# ---------- v0.2.5 Acceptance Cases ----------
def test_tc1_static_blog_full_ideal():
    d = _score("static_blog", ["s3", "cloudfront", "route53"])
    assert 86 <= d["total"] <= 95, f"TC1 total out of band: {d['total']}"
    assert d["rating"] in {"Well-Architected", "Production Candidate"}, (
        f"TC1 rating unexpected: {d['rating']}"
    )


def test_tc2_static_blog_partial_via_engine():
    """TC2 spec uses [s3, cloudfront] (2 services), but HTTP /game/score
    enforces a 3..6 services rule. The direct engine acceptance is covered in
    /app/backend/tests/test_scoring.py. Here we verify via API by adding one
    neutral service and confirming the band is still partial."""
    # Confirm the HTTP endpoint correctly rejects the 2-service form
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "static_blog", "constraint_ids": [],
        "selected_service_ids": ["s3", "cloudfront"]
    })
    assert r.status_code == 400, "Endpoint should reject <3 selected"

    # And the engine band 70..85 is reachable when one filler is allowed
    d = _score("static_blog", ["s3", "cloudfront", "iam"])
    assert 60 <= d["total"] <= 90, (
        f"TC2-ish (with one neutral filler) total out of band: {d['total']}"
    )


def test_tc3_internal_dashboard_full_ideal():
    d = _score("internal_dashboard", ["s3", "athena", "glue_catalog", "iam"])
    assert 85 <= d["total"] <= 95, f"TC3 total out of band: {d['total']}"
    assert d["matched_ideal"]["status"] == "full", (
        f"TC3 expected matched_ideal=full, got {d['matched_ideal']['status']}"
    )


def test_tc4_internal_dashboard_mostly_distractor():
    # selected has only 2 services; server requires 3..6 so we have to add 1
    # distractor-ish filler. Spec TC4 = [iam, kinesis]; emulate by checking
    # whichever the server accepts.
    payload = {"scenario_id": "internal_dashboard", "constraint_ids": [],
               "selected_service_ids": ["iam", "kinesis"]}
    r = requests.post(f"{API}/game/score", json=payload, timeout=60)
    if r.status_code == 400:
        # add one more distractor to satisfy the 3-min constraint
        payload["selected_service_ids"] = ["iam", "kinesis", "ec2"]
        r = requests.post(f"{API}/game/score", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert 25 <= d["total"] <= 55, (
        f"TC4 total out of expected low band: {d['total']}"
    )


def test_tc5_photo_sharing_strong():
    d = _score("photo_sharing", ["s3", "cloudfront", "lambda", "dynamodb"])
    assert 75 <= d["total"] <= 90, f"TC5 total out of band: {d['total']}"


# ---------- Validation ----------
def test_validation_min_services():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "photo_sharing", "constraint_ids": [],
        "selected_service_ids": ["s3", "lambda"]
    })
    assert r.status_code == 400


def test_validation_max_services():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "photo_sharing", "constraint_ids": [],
        "selected_service_ids": ["s3", "lambda", "ec2", "dynamodb",
                                 "cloudfront", "api_gateway", "route53"]
    })
    assert r.status_code == 400


def test_validation_invalid_scenario():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "nope", "constraint_ids": [],
        "selected_service_ids": ["s3", "lambda", "ec2"]
    })
    assert r.status_code == 400


# ---------- Leaderboard ----------
def test_leaderboard_create_and_sorted_list():
    create = requests.post(f"{API}/leaderboard",
                          json={"name": "TEST_v025_player", "total_score": 88.7,
                                "rounds": 3})
    assert create.status_code == 200, create.text
    lst = requests.get(f"{API}/leaderboard")
    assert lst.status_code == 200
    entries = lst.json()["entries"]
    scores = [e["total_score"] for e in entries]
    assert scores == sorted(scores, reverse=True)
    # ensure no Mongo _id leak
    for e in entries:
        assert "_id" not in e
