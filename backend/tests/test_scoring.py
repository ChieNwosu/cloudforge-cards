"""
Acceptance tests for the v0.2.5 scoring engine.
Run: cd /app/backend && python -m tests.test_scoring   (or pytest)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from game_engine import score_round  # noqa: E402

CASES = [
    {
        "name": "TC1 static_blog full ideal (s3+cloudfront+route53)",
        "scenario": "static_blog",
        "selected": ["s3", "cloudfront", "route53"],
        "min": 86, "max": 95,
        "labels": ["Well-Architected", "Production Candidate"],
    },
    {
        "name": "TC2 static_blog partial (s3+cloudfront)",
        "scenario": "static_blog",
        "selected": ["s3", "cloudfront"],
        "min": 70, "max": 85,
        "labels": None,
    },
    {
        "name": "TC3 internal_dashboard (s3+athena+glue_catalog+iam)",
        "scenario": "internal_dashboard",
        "selected": ["s3", "athena", "glue_catalog", "iam"],
        "min": 85, "max": 95,
        "labels": None,
    },
    {
        "name": "TC4 internal_dashboard mostly-distractor (iam+kinesis)",
        "scenario": "internal_dashboard",
        "selected": ["iam", "kinesis"],
        "min": 25, "max": 45,
        "labels": None,
    },
    {
        "name": "TC5 photo_sharing (s3+cloudfront+lambda+dynamodb)",
        "scenario": "photo_sharing",
        "selected": ["s3", "cloudfront", "lambda", "dynamodb"],
        "min": 75, "max": 90,
        "labels": None,
    },
]


def run():
    passed = 0
    for c in CASES:
        res = score_round(c["scenario"], [], c["selected"], "")
        total = res["total"]
        rating = res["rating"]
        ok = c["min"] <= total <= c["max"]
        if c["labels"]:
            ok = ok and rating in c["labels"]
        status = "PASS" if ok else "FAIL"
        if ok:
            passed += 1
        mi = res["matched_ideal"]
        print(f"[{status}] {c['name']}")
        print(f"        total={total} rating={rating} "
              f"matched_ideal={mi['matched_count']}/{mi['total']} ({mi['status']}) "
              f"expected {c['min']}-{c['max']}")
        breakdown = " | ".join(f"{b['label'].split()[0]}={b['score']}" for b in res["breakdown"])
        print(f"        {breakdown}")
    print(f"\n{passed}/{len(CASES)} cases passed")
    return passed == len(CASES)


if __name__ == "__main__":
    sys.exit(0 if run() else 1)
