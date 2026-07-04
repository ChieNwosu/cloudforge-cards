"""v0.3 Phase 2 - Test Mode endpoint tests."""
import os
import requests

API = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"


def test_session_clf_has_15_and_no_answer_keys():
    d = requests.get(f"{API}/learn/test/session", params={"track": "CLF_SAA"}).json()
    assert d["total"] == 15
    assert not d["beta"]
    for q in d["questions"]:
        assert "correct" not in q, "answer key leaked to client"
        assert q["question_type"] in {"mcq", "truefalse", "scenario_select"}
        assert q["answer_options"]


def test_session_aif_full_pool():
    # v0.4.0 Phase 5A: AIF expanded to 15 questions (was 5/beta)
    d = requests.get(f"{API}/learn/test/session", params={"track": "AIF"}).json()
    assert d["total"] == 15
    assert not d["beta"]


def test_grade_mixed_correct_and_incorrect():
    payload = {"track": "CLF_SAA", "answers": [
        {"question_id": "clf_01", "selected": "a"},            # correct
        {"question_id": "clf_03", "selected": "true"},          # incorrect (answer is false)
        {"question_id": "clf_06", "selected": ["s3", "cloudfront", "route53"]},  # correct set
        {"question_id": "clf_14", "selected": ["api_gateway", "lambda"]},        # incomplete -> incorrect
    ]}
    r = requests.post(f"{API}/learn/test/grade", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["correct_count"] == 2
    assert d["total"] == 4
    assert d["score"] == 50
    by = {p["question_id"]: p["is_correct"] for p in d["per_question"]}
    assert by["clf_01"]
    assert not by["clf_03"]
    assert by["clf_06"]
    assert not by["clf_14"]
    assert "Storage" in d["strengths"]


def test_grade_rejects_empty():
    r = requests.post(f"{API}/learn/test/grade", json={"answers": []})
    assert r.status_code == 400
