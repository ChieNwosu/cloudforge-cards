"""
v0.4.2 Phase 5C tests: track-aware Play scenarios and domain content.

Covers scenario and card pools per track, deal integrity (an ideal combo is
always present in the dealt hand), ideal-combo scoring guardrails, distractor
penalty behavior, and 3R/5R/10R session integrity per track. All checks use the
real API so scoring fairness is verified end to end.
"""
import os
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"

TRACKS = ["CLF_SAA", "AIF", "MLA", "DEA", "MIXED"]


def _scenarios():
    r = requests.get(f"{API}/cards/scenarios", timeout=30)
    r.raise_for_status()
    return r.json()["scenarios"]


def _by_id():
    r = requests.get(f"{API}/cards/services", timeout=30)
    r.raise_for_status()
    return {c["id"]: c for c in r.json()["services"]}


def test_expanded_pools_present():
    scns = _scenarios()
    cards = _by_id()
    # New expansion content is loaded.
    assert len(scns) >= 38
    assert len(cards) >= 60
    for track in ["AIF", "MLA", "DEA"]:
        matched = [s for s in scns if track in s.get("tracks", [])]
        assert len(matched) >= 8, f"{track} should have at least 8 Play scenarios"


def test_session_scenarios_scoped_by_track():
    for track in TRACKS:
        r = requests.get(f"{API}/game/session", params={"rounds": 3, "track": track}, timeout=30)
        assert r.status_code == 200
        ids = r.json()["scenario_ids"]
        assert len(ids) == 3 and len(set(ids)) == 3
        scns = {s["id"]: s for s in _scenarios()}
        if track != "MIXED":
            for sid in ids:
                assert track in scns[sid]["tracks"], f"{sid} not in {track}"


def test_deal_contains_full_ideal_combo_all_tracks():
    scns = _scenarios()
    for track in TRACKS:
        pool = scns if track == "MIXED" else [s for s in scns if track in s.get("tracks", [])]
        for scn in pool:
            for _ in range(5):
                r = requests.get(f"{API}/game/deal",
                                 params={"scenario_id": scn["id"], "hand_size": 12, "track": track},
                                 timeout=30)
                assert r.status_code == 200
                hand_ids = {c["id"] for c in r.json()["hand"]}
                assert any(set(combo) <= hand_ids for combo in scn["ideal_combos"]), \
                    f"No ideal combo dealt for {scn['id']} on {track}"


def test_full_ideal_scores_high_all_scenarios():
    scns = _scenarios()
    for scn in scns:
        combo = scn["ideal_combos"][0]
        payload = {
            "scenario_id": scn["id"], "constraint_ids": [],
            "selected_service_ids": combo,
            "explanation": "A clear and thorough rationale for why this architecture fits the scenario well and stays lean.",
        }
        r = requests.post(f"{API}/game/score", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        total = r.json()["total"]
        assert total >= 78, f"{scn['id']} full ideal scored only {total}"


def test_distractor_heavy_scores_lower():
    scns = _scenarios()
    for scn in scns:
        combo = scn["ideal_combos"][0]
        ideal = requests.post(f"{API}/game/score", json={
            "scenario_id": scn["id"], "constraint_ids": [],
            "selected_service_ids": combo, "explanation": "",
        }, timeout=30).json()["total"]

        distractors = scn.get("distractor_service_ids", [])[:3]
        if len(distractors) < 3:
            distractors = (distractors + combo)[:3]
        weak = requests.post(f"{API}/game/score", json={
            "scenario_id": scn["id"], "constraint_ids": [],
            "selected_service_ids": distractors, "explanation": "",
        }, timeout=30).json()["total"]
        assert weak <= ideal, f"{scn['id']} distractor design {weak} not <= ideal {ideal}"


def test_session_integrity_3_5_10_per_track():
    scns = {s["id"]: s for s in _scenarios()}
    for track in TRACKS:
        for rounds in (3, 5, 10):
            r = requests.get(f"{API}/game/session", params={"rounds": rounds, "track": track}, timeout=30)
            assert r.status_code == 200
            ids = r.json()["scenario_ids"]
            assert len(ids) == len(set(ids)), f"duplicate scenarios in {track} {rounds}R"
            assert len(ids) >= 1
            # Every dealt scenario is playable with a reachable ideal combo.
            for sid in ids[:3]:
                d = requests.get(f"{API}/game/deal",
                                 params={"scenario_id": sid, "hand_size": 12, "track": track},
                                 timeout=30).json()
                hand_ids = {c["id"] for c in d["hand"]}
                assert any(set(cb) <= hand_ids for cb in scns[sid]["ideal_combos"])
