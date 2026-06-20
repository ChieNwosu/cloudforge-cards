"""Backend tests for AWS CloudForge Cards."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://service-card-arena.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"

# --- Root & cards ---
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"

def test_services():
    r = requests.get(f"{API}/cards/services")
    assert r.status_code == 200
    svc = r.json()["services"]
    assert len(svc) >= 30
    req_fields = {"id","title","category","description","tooltip","difficulty","tags","cost","security","scalability","complexity","serverless"}
    assert req_fields.issubset(svc[0].keys())

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
    assert len(d["hand"]) >= 6

def test_deal_specific_scenario():
    r = requests.get(f"{API}/game/deal", params={"scenario_id":"photo_sharing"})
    assert r.status_code == 200
    assert r.json()["scenario"]["id"] == "photo_sharing"

# --- Score ---
def test_score_valid_photo_sharing():
    payload = {"scenario_id":"photo_sharing","constraint_ids":["low_cost","scalable"],
               "selected_service_ids":["s3","cloudfront","lambda","dynamodb"]}
    r = requests.post(f"{API}/game/score", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert 0 <= d["total"] <= 100
    assert "rating" in d
    assert len(d["breakdown"]) == 6
    labels = {b["label"] for b in d["breakdown"]}
    assert {"Service Fit","Cost Alignment","Security Alignment","Scalability Alignment","Synergy Bonus","Overengineering"} == labels
    for b in d["breakdown"]:
        assert "label" in b and "score" in b and "reasons" in b
    assert isinstance(d["commentary"], str) and len(d["commentary"]) > 0
    assert d["scenario"]["id"] == "photo_sharing"
    assert len(d["selected_services"]) == 4
    assert d["total"] > 50, f"expected good score for sensible selection, got {d['total']}"

def test_score_fewer_than_3():
    r = requests.post(f"{API}/game/score", json={"scenario_id":"photo_sharing","constraint_ids":[],"selected_service_ids":["s3","lambda"]})
    assert r.status_code == 400

def test_score_more_than_6():
    r = requests.post(f"{API}/game/score", json={"scenario_id":"photo_sharing","constraint_ids":[],"selected_service_ids":["s3","lambda","ec2","rds","dynamodb","cloudfront","waf"]})
    assert r.status_code == 400

def test_score_invalid_scenario():
    r = requests.post(f"{API}/game/score", json={"scenario_id":"nope","constraint_ids":[],"selected_service_ids":["s3","lambda","ec2"]})
    assert r.status_code == 400

def test_score_overengineering_penalty():
    good = requests.post(f"{API}/game/score", json={"scenario_id":"photo_sharing","constraint_ids":["low_cost","scalable"],"selected_service_ids":["s3","cloudfront","lambda","dynamodb"]}, timeout=60).json()
    heavy = requests.post(f"{API}/game/score", json={"scenario_id":"photo_sharing","constraint_ids":["low_cost","scalable"],"selected_service_ids":["redshift","ec2","ebs","ecs_ec2","vpc","kinesis"]}, timeout=60).json()
    assert heavy["total"] < good["total"]

# --- Leaderboard ---
def test_leaderboard_create_and_list():
    create = requests.post(f"{API}/leaderboard", json={"name":"TEST_player","total_score":77.5,"rounds":3})
    assert create.status_code == 200, create.text
    d = create.json()
    assert d["name"] == "TEST_player" and d["total_score"] == 77.5
    lst = requests.get(f"{API}/leaderboard")
    assert lst.status_code == 200
    entries = lst.json()["entries"]
    scores = [e["total_score"] for e in entries]
    assert scores == sorted(scores, reverse=True)
    assert any(e["name"]=="TEST_player" for e in entries)

def test_leaderboard_empty_name():
    r = requests.post(f"{API}/leaderboard", json={"name":"","total_score":10})
    assert r.status_code == 400
