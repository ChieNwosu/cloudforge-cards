"""v0.3 Phase 0/1 Learn-mode endpoint tests."""
import os
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"


# ---------- /api/learn/tracks ----------
def test_learn_tracks_returns_three_tracks():
    r = requests.get(f"{API}/learn/tracks")
    assert r.status_code == 200
    data = r.json()
    assert "tracks" in data
    ids = {t["id"] for t in data["tracks"]}
    assert ids == {"CLF_SAA", "AIF", "MLA"}
    for t in data["tracks"]:
        assert t["name"]
        assert t["description"]


# ---------- /api/learn/cards ----------
def test_learn_cards_returns_34_cards_and_tracks():
    r = requests.get(f"{API}/learn/cards")
    assert r.status_code == 200
    data = r.json()
    assert "cards" in data and "tracks" in data
    assert len(data["cards"]) == 34, f"Expected 34 cards, got {len(data['cards'])}"
    track_ids = {t["id"] for t in data["tracks"]}
    assert track_ids == {"CLF_SAA", "AIF", "MLA"}


def test_learn_cards_have_required_study_fields():
    r = requests.get(f"{API}/learn/cards")
    cards = r.json()["cards"]
    required_keys = ["exam_tracks", "use_cases", "common_pairings",
                     "anti_patterns", "study_tip",
                     "flashcard_front", "flashcard_back"]
    for c in cards:
        for k in required_keys:
            assert k in c, f"card {c.get('id')} missing {k}"
        assert isinstance(c["exam_tracks"], list) and c["exam_tracks"]
        # common_pairings: list of {id, title}
        for p in c["common_pairings"]:
            assert "id" in p and "title" in p


def test_learn_cards_ai_tracks_for_bedrock_sagemaker():
    r = requests.get(f"{API}/learn/cards")
    cards = {c["id"]: c for c in r.json()["cards"]}
    for sid in ("bedrock", "sagemaker"):
        assert sid in cards, f"missing card {sid}"
        tracks = set(cards[sid]["exam_tracks"])
        assert "AIF" in tracks, f"{sid} should include AIF"
        assert "MLA" in tracks, f"{sid} should include MLA"


def test_learn_cards_most_are_clf_saa_only():
    r = requests.get(f"{API}/learn/cards")
    cards = r.json()["cards"]
    only_clf = [c for c in cards if c["exam_tracks"] == ["CLF_SAA"]]
    # majority of the 34 cards should be CLF_SAA only
    assert len(only_clf) >= 20, f"Expected most cards CLF_SAA-only, got {len(only_clf)}"


def test_learn_cards_lambda_pairings_are_dicts_with_real_titles():
    r = requests.get(f"{API}/learn/cards")
    cards = {c["id"]: c for c in r.json()["cards"]}
    lam = cards["lambda"]
    assert lam["common_pairings"], "lambda should have synergy pairings"
    for p in lam["common_pairings"]:
        assert isinstance(p["id"], str) and isinstance(p["title"], str)
        assert p["title"] != p["id"], (
            f"pairing title not resolved for {p['id']}"
        )


# ---------- Game/Leaderboard regression (no game change in v0.3) ----------
def test_services_still_34_for_game():
    r = requests.get(f"{API}/cards/services")
    assert r.status_code == 200
    services = r.json()["services"]
    assert len(services) == 34
    # Ensure NO learn-only fields leaked into the game cards payload
    leaked = [s for s in services if "flashcard_front" in s or "study_tip" in s]
    assert not leaked, "Game services should not carry Learn enrichment"


def test_score_static_blog_ideal_still_around_90():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "static_blog",
        "constraint_ids": [],
        "selected_service_ids": ["s3", "cloudfront", "route53"],
        "explanation": "",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    labels = [b["label"] for b in d["breakdown"]]
    assert labels == [
        "Correct Service Selection", "Ideal Architecture Match",
        "Constraint Alignment", "Synergy Bonus",
        "Simplicity / Overengineering", "Explanation Bonus"
    ]
    assert 86 <= d["total"] <= 95
    assert d["rating"] in {"Well-Architected", "Production Candidate"}
