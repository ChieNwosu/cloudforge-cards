"""v0.2.6 backend tests:
  - DELETE /api/leaderboard/{id} removes only that entry, returns {deleted:true,id}
  - DELETE non-existent id returns 404
  - There is NO delete-all endpoint (DELETE /api/leaderboard -> 404/405)
  - POST and GET still include 'id' field
  - Scoring unchanged: static_blog ideal still ~90 Well-Architected
"""
import os
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"


def test_create_returns_id_field():
    r = requests.post(f"{API}/leaderboard",
                      json={"name": "TEST_v026_create", "total_score": 12.3, "rounds": 3})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    # cleanup
    requests.delete(f"{API}/leaderboard/{data['id']}")


def test_list_includes_id_field():
    # Seed
    c = requests.post(f"{API}/leaderboard",
                      json={"name": "TEST_v026_list", "total_score": 11.1, "rounds": 3}).json()
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    assert any(e.get("id") == c["id"] for e in lst)
    for e in lst:
        assert "id" in e and "_id" not in e
    # cleanup
    requests.delete(f"{API}/leaderboard/{c['id']}")


def test_delete_only_removes_that_entry():
    a = requests.post(f"{API}/leaderboard",
                      json={"name": "TEST_v026_a", "total_score": 50.0, "rounds": 3}).json()
    b = requests.post(f"{API}/leaderboard",
                      json={"name": "TEST_v026_b", "total_score": 51.0, "rounds": 3}).json()
    # delete a
    r = requests.delete(f"{API}/leaderboard/{a['id']}")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body == {"deleted": True, "id": a["id"]}
    # a gone, b still there
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    ids = {e["id"] for e in lst}
    assert a["id"] not in ids
    assert b["id"] in ids
    # cleanup b
    requests.delete(f"{API}/leaderboard/{b['id']}")


def test_delete_nonexistent_returns_404():
    r = requests.delete(f"{API}/leaderboard/does-not-exist-xyz-123")
    assert r.status_code == 404


def test_no_delete_all_endpoint():
    # Seed a couple entries that must survive a bulk-delete attempt
    e1 = requests.post(f"{API}/leaderboard",
                       json={"name": "TEST_v026_survive_1", "total_score": 22.2, "rounds": 3}).json()
    e2 = requests.post(f"{API}/leaderboard",
                       json={"name": "TEST_v026_survive_2", "total_score": 23.3, "rounds": 3}).json()
    # Try the bulk delete with empty trailing path and bare path
    for url in (f"{API}/leaderboard", f"{API}/leaderboard/"):
        r = requests.delete(url)
        assert r.status_code in (404, 405), (
            f"DELETE {url} returned {r.status_code}; must NOT exist"
        )
    # Confirm both entries still present
    lst = requests.get(f"{API}/leaderboard").json()["entries"]
    ids = {e["id"] for e in lst}
    assert e1["id"] in ids and e2["id"] in ids
    # cleanup
    requests.delete(f"{API}/leaderboard/{e1['id']}")
    requests.delete(f"{API}/leaderboard/{e2['id']}")


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
    # 6 sub-scores in correct order still
    labels = [b["label"] for b in d["breakdown"]]
    assert labels == [
        "Correct Service Selection",
        "Ideal Architecture Match",
        "Constraint Alignment",
        "Synergy Bonus",
        "Simplicity / Overengineering",
        "Explanation Bonus",
    ]
