"""v0.2.6 backend tests (updated for the v0.2.6.1 save contract):
  - POST /api/leaderboard returns {status, message, entry, suggestions}; entry has 'id'
  - DELETE /api/leaderboard/{id}?owner_token= removes only that entry (owner-scoped)
  - DELETE non-existent id returns 404
  - There is NO delete-all endpoint (DELETE /api/leaderboard -> 404/405)
  - GET entries include 'id', never '_id' / 'owner_token'
  - Scoring unchanged: static_blog ideal still ~90 Well-Architected
"""
import os
import secrets
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"


def _owner():
    """Return a random, clearly non-secret owner token for a throwaway test entry."""
    return secrets.token_urlsafe(12)


def _create(name, score, owner_token, mode="guest"):
    """Create an owned entry and return (json, owner_token). Guest mode avoids upsert/conflict."""
    r = requests.post(f"{API}/leaderboard",
                      json={"name": name, "total_score": score, "rounds": 3,
                            "mode": mode, "owner_token": owner_token})
    assert r.status_code == 200, r.text
    return r.json(), owner_token


def _del(entry_id, owner_token):
    return requests.delete(f"{API}/leaderboard/{entry_id}", params={"owner_token": owner_token})


def test_create_returns_id_field():
    data, owner = _create(f"TEST_v026_create_{secrets.token_hex(3)}", 12.3, _owner())
    entry = data["entry"]
    assert isinstance(entry["id"], str) and len(entry["id"]) > 0
    _del(entry["id"], owner)


def test_list_includes_id_field():
    data, owner = _create(f"TEST_v026_list_{secrets.token_hex(3)}", 11.1, _owner())
    cid = data["entry"]["id"]
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    assert any(e.get("id") == cid for e in lst)
    for e in lst:
        assert "id" in e and "_id" not in e and "owner_token" not in e
    _del(cid, owner)


def test_delete_only_removes_that_entry():
    owner_a, owner_b = _owner(), _owner()
    a, _ = _create(f"TEST_v026_a_{secrets.token_hex(3)}", 50.0, owner_a)
    b, _ = _create(f"TEST_v026_b_{secrets.token_hex(3)}", 51.0, owner_b)
    aid, bid = a["entry"]["id"], b["entry"]["id"]
    r = _del(aid, owner_a)
    assert r.status_code == 200, r.text
    assert r.json() == {"deleted": True, "id": aid}
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    ids = {e["id"] for e in lst}
    assert aid not in ids
    assert bid in ids
    _del(bid, owner_b)


def test_delete_wrong_owner_forbidden():
    owner = _owner()
    data, _ = _create(f"TEST_v026_owner_{secrets.token_hex(3)}", 33.3, owner)
    eid = data["entry"]["id"]
    r = _del(eid, "owner-mismatch-fake")
    assert r.status_code == 403
    _del(eid, owner)  # cleanup with correct owner


def test_delete_nonexistent_returns_404():
    r = requests.delete(f"{API}/leaderboard/does-not-exist-xyz-123")
    assert r.status_code == 404


def test_no_delete_all_endpoint():
    owner_1, owner_2 = _owner(), _owner()
    e1, _ = _create(f"TEST_v026_survive_1_{secrets.token_hex(3)}", 22.2, owner_1)
    e2, _ = _create(f"TEST_v026_survive_2_{secrets.token_hex(3)}", 23.3, owner_2)
    e1id, e2id = e1["entry"]["id"], e2["entry"]["id"]
    for url in (f"{API}/leaderboard", f"{API}/leaderboard/"):
        r = requests.delete(url)
        assert r.status_code in (404, 405), (
            f"DELETE {url} returned {r.status_code}; must NOT exist"
        )
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    ids = {e["id"] for e in lst}
    assert e1id in ids and e2id in ids
    _del(e1id, owner_1)
    _del(e2id, owner_2)


def test_scoring_unchanged_static_blog_ideal():
    r = requests.post(f"{API}/game/score", json={
        "scenario_id": "static_blog", "constraint_ids": [],
        "selected_service_ids": ["s3", "cloudfront", "route53"],
        "explanation": "",
    })
    assert r.status_code == 200
    d = r.json()
    assert 86 <= d["total"] <= 95, f"scoring drifted: {d['total']}"
    assert d["rating"] in {"Well-Architected", "Production Candidate"}
    labels = [b["label"] for b in d["breakdown"]]
    assert labels == [
        "Correct Service Selection",
        "Ideal Architecture Match",
        "Constraint Alignment",
        "Synergy Bonus",
        "Simplicity / Overengineering",
        "Explanation Bonus",
    ]
