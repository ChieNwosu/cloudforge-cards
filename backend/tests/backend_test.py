"""Backend tests for AWS CloudForge Cards (iteration 2)."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"

# --- Root & cards ---
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"

def test_services_count_and_ai_category():
    r = requests.get(f"{API}/cards/services")
    assert r.status_code == 200
    svc = r.json()["services"]
    assert len(svc) == 33, f"expected 33 services, got {len(svc)}"
    ids = {s["id"] for s in svc}
    assert "bedrock" in ids and "sagemaker" in ids
    ai_cards = [s for s in svc if s["category"] == "AI"]
    assert len(ai_cards) == 2

def test_scenarios():
    r = requests.get(f"{API}/cards/scenarios")
    assert r.status_code == 200
    assert len(r.json()["scenarios"]) == 10

def test_constraints():
    r = requests.get(f"{API}/cards/constraints")
    assert r.status_code == 200
    assert len(r.json()["constraints"]) == 8

# --- Deal ---
def test_deal_random():
    r = requests.get(f"{API}/game/deal")
    assert r.status_code == 200
    d = r.json()
    assert "scenario" in d and "constraints" in d and "hand" in d

def test_deal_specific_scenario():
    r = requests.get(f"{API}/game/deal", params={"scenario_id":"photo_sharing"})
    assert r.status_code == 200
    assert r.json()["scenario"]["id"] == "photo_sharing"

# --- Score: new ratings, label rename, ideal_combos ---
def test_score_valid_and_new_label_and_ideal_combos():
    payload = {"scenario_id":"photo_sharing","constraint_ids":["low_cost","scalable"],
               "selected_service_ids":["s3","cloudfront","lambda","dynamodb"]}
    r = requests.post(f"{API}/game/score", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert 0 <= d["total"] <= 100
    assert d["rating"] in {"Broken Architecture","Needs Refactor","Partial Fit","Production Candidate","Well-Architected"}
    assert len(d["breakdown"]) == 6
    labels = {b["label"] for b in d["breakdown"]}
    assert "Overengineering Penalty" in labels
    assert "Overengineering" not in (labels - {"Overengineering Penalty"})
    # ideal_combos
    assert "ideal_combos" in d
    assert isinstance(d["ideal_combos"], list) and len(d["ideal_combos"]) >= 1
    for combo in d["ideal_combos"]:
        assert isinstance(combo, list) and len(combo) > 0
        for svc in combo:
            assert "id" in svc and "title" in svc and "category" in svc
    assert d["total"] > 50

def test_score_rating_well_architected_thresholds():
    # craft a likely high-quality selection
    r = requests.post(f"{API}/game/score", json={
        "scenario_id":"photo_sharing","constraint_ids":["low_cost","scalable"],
        "selected_service_ids":["s3","cloudfront","lambda","dynamodb","api_gateway"]
    }, timeout=60)
    d = r.json()
    assert d["rating"] in {"Partial Fit","Production Candidate","Well-Architected"}

def test_score_broken_architecture_low_score():
    # poor fit choices for photo sharing
    r = requests.post(f"{API}/game/score", json={
        "scenario_id":"photo_sharing","constraint_ids":["low_cost"],
        "selected_service_ids":["redshift","ec2","ebs"]
    }, timeout=60)
    d = r.json()
    assert d["rating"] in {"Broken Architecture","Needs Refactor","Partial Fit"}

def test_score_overengineering_penalty_label_and_bar():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id":"photo_sharing","constraint_ids":[],
        "selected_service_ids":["s3","cloudfront","lambda"]
    }, timeout=60).json()
    pen = [b for b in r["breakdown"] if b["label"] == "Overengineering Penalty"][0]
    # min/max bounds present
    assert pen["max"] == 0 and pen["min"] == -20

def test_score_fewer_than_min():
    r = requests.post(f"{API}/game/score", json={"scenario_id":"photo_sharing","constraint_ids":[],"selected_service_ids":["s3","lambda"]})
    assert r.status_code == 400

def test_score_invalid_scenario():
    r = requests.post(f"{API}/game/score", json={"scenario_id":"nope","constraint_ids":[],"selected_service_ids":["s3","lambda","ec2"]})
    assert r.status_code == 400

def test_score_ml_batch_includes_ai_in_combo():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id":"ml_batch","constraint_ids":[],
        "selected_service_ids":["s3","sagemaker","glacier"]
    }, timeout=60).json()
    # ml_batch has a combo containing sagemaker
    all_combo_ids = {svc["id"] for combo in r["ideal_combos"] for svc in combo}
    assert "sagemaker" in all_combo_ids

# --- Leaderboard ---
def test_leaderboard_create_and_list():
    create = requests.post(f"{API}/leaderboard", json={"name":"TEST_player2","total_score":77.5,"rounds":3})
    assert create.status_code == 200, create.text
    lst = requests.get(f"{API}/leaderboard")
    assert lst.status_code == 200
    entries = lst.json()["entries"]
    scores = [e["total_score"] for e in entries]
    assert scores == sorted(scores, reverse=True)
