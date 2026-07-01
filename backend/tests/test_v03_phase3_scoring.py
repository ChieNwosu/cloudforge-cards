"""v0.3 Phase 3 focused tests: Simplicity clarity (Part B) + Explanation overflow (Part C)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from game_engine import score_round  # noqa: E402

LONG_EXPL = ("We serve static files from S3 behind CloudFront for global low latency caching "
             "and Route 53 for DNS, near zero cost no servers, highly available across edge "
             "locations worldwide for every visitor.")


def _simplicity(res):
    return next(b for b in res["breakdown"] if b["label"].startswith("Simplicity"))


def test_simplicity_right_sized_is_full_credit():
    res = score_round("static_blog", [], ["s3", "cloudfront", "route53"], "")
    sub = _simplicity(res)
    assert sub["state"] == "right_sized"
    assert sub["score"] == 10.0
    assert sub["lost"] == 0.0


def test_simplicity_overengineered_reports_lost_points():
    res = score_round("static_blog", [],
                      ["s3", "cloudfront", "route53", "ec2", "rds", "lambda"], "")
    sub = _simplicity(res)
    assert sub["state"] == "overengineered"
    assert sub["lost"] > 0
    assert round(sub["score"] + sub["lost"], 1) == 10.0


def test_static_blog_audit_explains_sub_100_score():
    # Perfect ideal match with no active constraints must NOT be forced to 100.
    res = score_round("static_blog", [], ["s3", "cloudfront", "route53"], "")
    assert res["total"] < 100
    assert res["matched_ideal"]["status"] == "full"
    assert res["overflow_bonus"] == 0.0


def test_explanation_overflow_caps_round_and_banks_bonus():
    res = score_round("static_blog", ["scalable"],
                      ["s3", "cloudfront", "route53"], LONG_EXPL)
    assert res["total"] == 100
    assert res["overflow_bonus"] > 0


def test_no_overflow_when_under_100():
    res = score_round("static_blog", [], ["s3", "cloudfront", "route53"], LONG_EXPL)
    assert res["total"] <= 100
    assert res["overflow_bonus"] == 0.0
