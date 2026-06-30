"""v0.3 Phase 3 end-to-end tests against public REACT_APP_BACKEND_URL.
Covers: /api/game/score overflow + simplicity state, /api/learn/match/session +
/api/learn/match/grade, leaderboard per-mode (Part E), admin delete cleanup.
"""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cloudforge-cards.preview.emergentagent.com").rstrip("/")
ADMIN_TOKEN = "cf-admin-7Qx2Lm9Tv"
LONG_EXPL = ("We serve static files from S3 behind CloudFront for global low latency caching "
             "and Route 53 for DNS, near zero cost no servers, highly available across edge "
             "locations worldwide for every visitor.")


# Track created leaderboard ids for cleanup
CREATED_IDS = []


@pytest.fixture(scope="module", autouse=True)
def cleanup_after_module():
    yield
    # admin cleanup
    for eid in CREATED_IDS:
        try:
            requests.delete(f"{BASE_URL}/api/admin/leaderboard/{eid}",
                            headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=10)
        except Exception:
            pass


# --- /api/game/score backend feature checks ---

class TestGameScore:
    def test_sub_100_no_overflow(self):
        payload = {
            "scenario_id": "static_blog",
            "constraint_ids": [],
            "selected_service_ids": ["s3", "cloudfront", "route53"],
            "explanation": LONG_EXPL,
        }
        r = requests.post(f"{BASE_URL}/api/game/score", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "overflow_bonus" in data
        assert data["total"] <= 100
        assert data["overflow_bonus"] == 0.0

    def test_overflow_banked_when_constraint_pushes_over_100(self):
        payload = {
            "scenario_id": "static_blog",
            "constraint_ids": ["scalable"],
            "selected_service_ids": ["s3", "cloudfront", "route53"],
            "explanation": LONG_EXPL,
        }
        r = requests.post(f"{BASE_URL}/api/game/score", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["total"] == 100
        assert data["overflow_bonus"] > 0

    def test_simplicity_state_right_sized(self):
        payload = {
            "scenario_id": "static_blog",
            "constraint_ids": [],
            "selected_service_ids": ["s3", "cloudfront", "route53"],
            "explanation": "",
        }
        r = requests.post(f"{BASE_URL}/api/game/score", json=payload, timeout=30)
        assert r.status_code == 200
        bd = r.json()["breakdown"]
        simp = next(b for b in bd if b["label"].startswith("Simplicity"))
        assert simp["state"] == "right_sized"
        assert simp["lost"] == 0.0

    def test_simplicity_state_overengineered(self):
        payload = {
            "scenario_id": "static_blog",
            "constraint_ids": [],
            "selected_service_ids": ["s3", "cloudfront", "route53", "ec2", "rds", "lambda"],
            "explanation": "",
        }
        r = requests.post(f"{BASE_URL}/api/game/score", json=payload, timeout=30)
        assert r.status_code == 200
        bd = r.json()["breakdown"]
        simp = next(b for b in bd if b["label"].startswith("Simplicity"))
        assert simp["state"] == "overengineered"
        assert simp["lost"] > 0


# --- /api/learn/match/session + grade ---

class TestMatch:
    def test_session_strips_answer_keys(self):
        r = requests.get(f"{BASE_URL}/api/learn/match/session?track=CLF_SAA", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "exercises" in data
        assert len(data["exercises"]) > 0
        for ex in data["exercises"]:
            for s in ex["slots"]:
                assert "correct" not in s
                assert "slot_id" in s
                assert "label" in s
                assert "hint" in s
            for c in ex["tray"]:
                assert "id" in c and "title" in c and "category" in c

    def test_grade_perfect(self):
        body = {
            "exercise_id": "match_static_site",
            "placements": {"dns": "route53", "cdn": "cloudfront", "storage": "s3"},
        }
        r = requests.post(f"{BASE_URL}/api/learn/match/grade", json=body, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["partial_score"] == 100
        assert all(s["status"] == "correct" for s in data["per_slot"])

    def test_grade_misplaced_wrong_missing(self):
        # right-service wrong-slot
        body = {
            "exercise_id": "match_static_site",
            "placements": {"dns": "s3", "cdn": "cloudfront", "storage": "route53"},
        }
        r = requests.post(f"{BASE_URL}/api/learn/match/grade", json=body, timeout=15)
        assert r.status_code == 200
        statuses = {s["slot_id"]: s["status"] for s in r.json()["per_slot"]}
        assert statuses["dns"] == "misplaced"
        assert statuses["storage"] == "misplaced"
        assert statuses["cdn"] == "correct"

        # distractor + empty
        body2 = {"exercise_id": "match_static_site", "placements": {"dns": "ec2"}}
        r2 = requests.post(f"{BASE_URL}/api/learn/match/grade", json=body2, timeout=15)
        assert r2.status_code == 200
        st2 = {s["slot_id"]: s["status"] for s in r2.json()["per_slot"]}
        assert st2["dns"] == "wrong"
        assert st2["cdn"] == "missing"
        assert st2["storage"] == "missing"

    def test_grade_unknown_exercise_400(self):
        body = {"exercise_id": "no_such_exercise", "placements": {}}
        r = requests.post(f"{BASE_URL}/api/learn/match/grade", json=body, timeout=15)
        assert r.status_code == 400


# --- Leaderboard per-mode (Part E) ---

class TestLeaderboardPerMode:
    def setup_method(self, method):
        self.name = f"TEST_iter6_{uuid.uuid4().hex[:8]}"
        self.token_a = f"owner_a_{uuid.uuid4().hex[:8]}"
        self.token_b = f"owner_b_{uuid.uuid4().hex[:8]}"

    def _post(self, name, token, rounds, total, mode="official"):
        body = {
            "name": name,
            "owner_token": token,
            "rounds": rounds,
            "total_score": total,
            "mode": mode,
            "scenarios": ["static_blog"],
            "round_scores": [total],
        }
        return requests.post(f"{BASE_URL}/api/leaderboard", json=body, timeout=15)

    def test_per_mode_creates_separate_rows(self):
        r3 = self._post(self.name, self.token_a, 3, 240)
        r5 = self._post(self.name, self.token_a, 5, 410)
        assert r3.status_code == 200 and r5.status_code == 200
        d3, d5 = r3.json(), r5.json()
        assert d3["status"] == "created"
        assert d5["status"] == "created"
        assert d3["entry"]["id"] != d5["entry"]["id"]
        assert d3["entry"]["rounds"] == 3
        assert d5["entry"]["rounds"] == 5
        CREATED_IDS.append(d3["entry"]["id"])
        CREATED_IDS.append(d5["entry"]["id"])

    def test_lower_kept_higher_updated_same_mode(self):
        r1 = self._post(self.name, self.token_a, 3, 200)
        assert r1.status_code == 200 and r1.json()["status"] == "created"
        eid = r1.json()["entry"]["id"]
        CREATED_IDS.append(eid)

        # lower score - kept
        r2 = self._post(self.name, self.token_a, 3, 100)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["status"] == "kept"
        # higher score - updated, same id
        r3 = self._post(self.name, self.token_a, 3, 280)
        assert r3.status_code == 200
        d3 = r3.json()
        assert d3["status"] == "updated"
        assert d3["entry"]["id"] == eid
        assert d3["entry"]["total_score"] == 280

    def test_conflict_different_owner_token(self):
        r1 = self._post(self.name, self.token_a, 3, 200)
        assert r1.status_code == 200
        CREATED_IDS.append(r1.json()["entry"]["id"])

        r2 = self._post(self.name, self.token_b, 3, 250)
        assert r2.status_code == 200
        data = r2.json()
        assert data["status"] == "conflict"
        assert data.get("entry") in (None, {}, ) or data["entry"] is None
        assert isinstance(data.get("suggestions"), list)
        assert len(data["suggestions"]) >= 1

    def test_guest_mode_always_fresh_row(self):
        r1 = self._post(self.name, self.token_a, 3, 100, mode="guest")
        r2 = self._post(self.name, self.token_a, 3, 50, mode="guest")
        assert r1.status_code == 200 and r2.status_code == 200
        d1, d2 = r1.json(), r2.json()
        assert d1["entry"]["mode"] == "guest"
        assert d2["entry"]["mode"] == "guest"
        assert d1["entry"]["id"] != d2["entry"]["id"]
        CREATED_IDS.append(d1["entry"]["id"])
        CREATED_IDS.append(d2["entry"]["id"])

    def test_owner_delete_single_mode_only(self):
        r3 = self._post(self.name, self.token_a, 3, 240)
        r5 = self._post(self.name, self.token_a, 5, 410)
        id3 = r3.json()["entry"]["id"]
        id5 = r5.json()["entry"]["id"]
        CREATED_IDS.extend([id3, id5])

        # delete just the 3R row
        d = requests.delete(f"{BASE_URL}/api/leaderboard/{id3}",
                            params={"owner_token": self.token_a}, timeout=15)
        assert d.status_code == 200
        assert d.json().get("deleted") is True
        # 5R row still present
        lb = requests.get(f"{BASE_URL}/api/leaderboard", timeout=15).json()
        ids = {row["id"] for row in lb.get("entries", lb if isinstance(lb, list) else [])}
        # support either {entries:[...]} or [...] shape
        if isinstance(lb, dict) and "entries" in lb:
            ids = {row["id"] for row in lb["entries"]}
        else:
            ids = {row["id"] for row in lb}
        assert id5 in ids
        assert id3 not in ids

    def test_admin_delete(self):
        r = self._post(self.name, self.token_a, 10, 850)
        eid = r.json()["entry"]["id"]
        # no token -> 403
        no_tok = requests.delete(f"{BASE_URL}/api/admin/leaderboard/{eid}", timeout=10)
        assert no_tok.status_code == 403
        # correct -> 200
        ok = requests.delete(f"{BASE_URL}/api/admin/leaderboard/{eid}",
                             headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=10)
        assert ok.status_code == 200
        assert ok.json().get("deleted") is True
