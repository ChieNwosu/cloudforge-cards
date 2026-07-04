"""v0.4.0 Phase 5A - Certification Prep Expansion tests (DEA + AIF/MLA/DEA content).

Verifies:
- /api/learn/tracks includes DEA
- /api/learn/cards total count 73 and per-track counts (AIF=14, MLA=19, DEA=15, CLF/SAA=34, MIXED=73)
- Test Mode /api/learn/test/session returns pools for DEA/AIF/MLA and strips 'correct' keys
- Test Mode grading end-to-end works for DEA/AIF/MLA
- Match Mode /api/learn/match/session returns exercises for DEA/AIF/MLA and strips 'correct' from slots
- Match Mode grading gives 100 with correct placements for every DEA/AIF/MLA exercise
- All slot correct service ids resolve to real service cards
"""
import os
import sys
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"

# Also import the banks directly to inspect answer keys server-side for verification.
sys.path.insert(0, "/app/backend")
from match_bank import EXERCISES as MATCH_EXERCISES, grade_match  # noqa: E402
from test_bank import QUESTIONS as TEST_QUESTIONS  # noqa: E402
from seed_data import SERVICE_CARDS  # noqa: E402


# ---------------- Tracks ----------------
def test_learn_tracks_includes_dea():
    r = requests.get(f"{API}/learn/tracks")
    assert r.status_code == 200
    ids = {t["id"] for t in r.json()["tracks"]}
    assert ids == {"CLF_SAA", "AIF", "MLA", "DEA"}


# ---------------- Cards ----------------
def test_learn_cards_total_is_73():
    r = requests.get(f"{API}/learn/cards")
    assert r.status_code == 200
    cards = r.json()["cards"]
    assert len(cards) == 73, f"Expected 73 cards, got {len(cards)}"


def test_learn_cards_per_track_counts():
    r = requests.get(f"{API}/learn/cards")
    cards = r.json()["cards"]
    def count(tid):
        return sum(1 for c in cards if tid in (c.get("exam_tracks") or []))
    assert count("DEA") == 15, f"DEA: {count('DEA')}"
    assert count("AIF") == 14, f"AIF: {count('AIF')}"
    assert count("MLA") == 19, f"MLA: {count('MLA')}"
    assert count("CLF_SAA") == 34, f"CLF_SAA: {count('CLF_SAA')}"


def test_learn_cards_no_mongo_id():
    r = requests.get(f"{API}/learn/cards")
    for c in r.json()["cards"]:
        assert "_id" not in c


# ---------------- Test Mode: session ----------------
def _test_session(track):
    r = requests.get(f"{API}/learn/test/session", params={"track": track})
    assert r.status_code == 200
    return r.json()


def test_test_session_dea_returns_dea_questions_no_answer_keys():
    d = _test_session("DEA")
    qs = d["questions"]
    assert len(qs) > 0
    for q in qs:
        assert "correct" not in q, "Answer keys must NOT be in session payload"
        assert "DEA" in q.get("exam_tracks", [])


def test_test_session_aif_15_questions_not_beta():
    d = _test_session("AIF")
    # Pool must be at least 15 so session returns 15 and beta=False
    assert len(d["questions"]) == 15
    for q in d["questions"]:
        assert "correct" not in q
    assert d.get("beta") is False, "AIF should no longer be beta (pool>=15)"


def test_test_session_mla_15_questions_not_beta():
    d = _test_session("MLA")
    assert len(d["questions"]) == 15
    for q in d["questions"]:
        assert "correct" not in q
    assert d.get("beta") is False, "MLA should no longer be beta (pool>=15)"


def test_test_session_dea_pool_size_13():
    # Count DEA questions in the bank directly
    dea_count = sum(1 for q in TEST_QUESTIONS if "DEA" in q.get("exam_tracks", []))
    assert dea_count == 13, f"DEA question pool should be 13, got {dea_count}"


# ---------------- Test Mode: grading end-to-end ----------------
def _grade_all_correct(track):
    d = _test_session(track)
    qs = d["questions"]
    # We need answer keys locally to submit correct answers.
    keys_by_id = {q["question_id"]: q["correct"] for q in TEST_QUESTIONS}
    answers = [{"question_id": q["question_id"], "selected": keys_by_id[q["question_id"]]} for q in qs]
    r = requests.post(f"{API}/learn/test/grade", json={"track": track, "answers": answers})
    assert r.status_code == 200, r.text
    body = r.json()
    return body, qs


def test_test_grading_dea_all_correct_100():
    body, qs = _grade_all_correct("DEA")
    assert body["score"] == 100, f"Expected 100, got {body}"
    assert body["correct_count"] == len(qs)


def test_test_grading_aif_all_correct_100():
    body, qs = _grade_all_correct("AIF")
    assert body["score"] == 100


def test_test_grading_mla_all_correct_100():
    body, qs = _grade_all_correct("MLA")
    assert body["score"] == 100


# ---------------- Match Mode: session ----------------
def _match_session(track):
    r = requests.get(f"{API}/learn/match/session", params={"track": track})
    assert r.status_code == 200
    return r.json()


def test_match_session_dea_no_answer_keys():
    d = _match_session("DEA")
    assert len(d["exercises"]) > 0
    for ex in d["exercises"]:
        for slot in ex["slots"]:
            assert "correct" not in slot, "Slot 'correct' must NOT leak to client"
        assert "DEA" in ex["exam_tracks"]


def test_match_session_aif_present():
    d = _match_session("AIF")
    assert len(d["exercises"]) >= 1


def test_match_session_mla_present():
    d = _match_session("MLA")
    assert len(d["exercises"]) >= 1


# ---------------- Match Mode: perfect grading ----------------
def _perfect_placements(exercise):
    return {s["slot_id"]: s["correct"] for s in exercise["slots"]}


def test_match_all_dea_aif_mla_exercises_grade_100_and_slots_resolve():
    svc_ids = {s["id"] for s in SERVICE_CARDS}
    for tid in ("DEA", "AIF", "MLA"):
        subset = [e for e in MATCH_EXERCISES if tid in e.get("exam_tracks", [])]
        assert subset, f"No exercises for {tid}"
        for ex in subset:
            # All correct service ids must resolve to a real service card
            for s in ex["slots"]:
                assert s["correct"] in svc_ids, f"{ex['exercise_id']} slot {s['slot_id']} -> unknown service {s['correct']}"
            # Grade via API for a real end-to-end pass
            placements = _perfect_placements(ex)
            r = requests.post(
                f"{API}/learn/match/grade",
                json={"exercise_id": ex["exercise_id"], "placements": placements},
            )
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["partial_score"] == 100, (
                f"{ex['exercise_id']} did not grade 100: {body}"
            )
            assert body["correct_count"] == body["total"]


def test_match_exercise_counts_per_track():
    aif = [e for e in MATCH_EXERCISES if "AIF" in e.get("exam_tracks", [])]
    mla = [e for e in MATCH_EXERCISES if "MLA" in e.get("exam_tracks", [])]
    dea = [e for e in MATCH_EXERCISES if "DEA" in e.get("exam_tracks", [])]
    assert len(aif) == 4, f"AIF exercises: {len(aif)}"
    assert len(mla) == 5, f"MLA exercises: {len(mla)}"
    assert len(dea) == 5, f"DEA exercises: {len(dea)}"


# ---------------- Regression: CLF/SAA still works ----------------
def test_regression_clf_saa_test_mode_still_works():
    d = _test_session("CLF_SAA")
    assert len(d["questions"]) > 0
    body, _ = _grade_all_correct("CLF_SAA")
    assert body["score"] == 100


def test_regression_clf_saa_match_mode_still_works():
    d = _match_session("CLF_SAA")
    assert len(d["exercises"]) > 0


# ---------------- Mixed mode ----------------
def test_mixed_test_session_has_pooled_questions():
    d = _test_session("MIXED")
    assert len(d["questions"]) == 15
    # Should draw from various tracks; check that at least one non-CLF appears across enough runs
    # We accept any set for a single draw. Confirm no 'correct' leaks.
    for q in d["questions"]:
        assert "correct" not in q


def test_mixed_match_session_has_pooled_exercises():
    d = _match_session("MIXED")
    assert len(d["exercises"]) >= 1
    for ex in d["exercises"]:
        for slot in ex["slots"]:
            assert "correct" not in slot
