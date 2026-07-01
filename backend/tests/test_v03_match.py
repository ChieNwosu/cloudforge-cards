"""v0.3 Phase 3 - Match mode grading tests (Part A)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from match_bank import session_exercises, grade_match, EXERCISES  # noqa: E402


def test_session_strips_answer_keys():
    ex, _, _ = session_exercises("CLF_SAA")
    assert ex, "expected at least one exercise"
    for e in ex:
        for s in e["slots"]:
            assert "correct" not in s
        assert all("title" in c and "id" in c for c in e["tray"])


def test_perfect_pipeline_scores_100():
    r = grade_match("match_static_site",
                    {"dns": "route53", "cdn": "cloudfront", "storage": "s3"})
    assert r["partial_score"] == 100
    assert all(s["status"] == "correct" for s in r["per_slot"])


def test_misplaced_right_service_wrong_slot():
    r = grade_match("match_static_site",
                    {"dns": "s3", "cdn": "cloudfront", "storage": "route53"})
    statuses = {s["slot_id"]: s["status"] for s in r["per_slot"]}
    assert statuses["dns"] == "misplaced"      # s3 belongs to storage
    assert statuses["storage"] == "misplaced"  # route53 belongs to dns
    assert statuses["cdn"] == "correct"
    assert r["partial_score"] == 33


def test_distractor_is_wrong_and_empty_is_missing():
    r = grade_match("match_static_site", {"dns": "ec2"})  # ec2 is a distractor, others empty
    statuses = {s["slot_id"]: s["status"] for s in r["per_slot"]}
    assert statuses["dns"] == "wrong"
    assert statuses["cdn"] == "missing"
    assert statuses["storage"] == "missing"
    assert r["partial_score"] == 0


def test_unknown_exercise_raises():
    try:
        grade_match("does_not_exist", {})
        assert False, "expected ValueError"
    except ValueError:
        pass


def test_all_exercises_gradeable_with_keys():
    for e in EXERCISES:
        keys = {s["slot_id"]: s["correct"] for s in e["slots"]}
        r = grade_match(e["exercise_id"], keys)
        assert r["partial_score"] == 100
