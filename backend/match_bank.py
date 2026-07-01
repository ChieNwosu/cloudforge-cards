"""
v0.3 Phase 3 - Match / Fill in the Blank mode content and SERVER-SIDE grading.

The player assembles an AWS architecture pipeline by placing service cards from a
tray into labeled slots. Answer keys (`correct` on each slot) never leave this module:
session exercises are sanitized before they reach the client, and grading happens here.
No user progress is stored server-side.

Exercise shape:
  exercise_id, title, prompt, slots [{slot_id, label, hint, correct (service id)}],
  tray [service ids: the correct services plus distractors], exam_tracks[], domains[],
  explanation, professor_flock_hint, difficulty (1-3)
"""
import random
from typing import List, Dict, Any

from seed_data import SERVICE_CARDS

SESSION_SIZE = 5

_SVC_BY_ID = {s["id"]: s for s in SERVICE_CARDS}


def _slot(slot_id, label, correct, hint=""):
    return {"slot_id": slot_id, "label": label, "correct": correct, "hint": hint}


EXERCISES: List[Dict[str, Any]] = [
    # ---------------- CLF / SAA ----------------
    {"exercise_id": "match_static_site", "title": "Static Website Pipeline",
     "prompt": "Assemble the cheapest, serverless pipeline to serve a static website on a custom domain.",
     "slots": [
         _slot("dns", "DNS / Custom Domain", "route53", "Resolves your domain name."),
         _slot("cdn", "Content Delivery (CDN)", "cloudfront", "Caches content at edge locations."),
         _slot("storage", "Static File Storage", "s3", "Holds the HTML, CSS, and images."),
     ],
     "tray": ["route53", "cloudfront", "s3", "ec2", "rds", "lambda"],
     "exam_tracks": ["CLF_SAA"], "domains": ["Storage", "Networking"], "difficulty": 1,
     "explanation": "Route 53 resolves the domain, CloudFront caches files at the edge, and S3 stores the static assets. No servers required.",
     "professor_flock_hint": "No servers for static content. Think DNS, then CDN, then object storage."},

    {"exercise_id": "match_serverless_api", "title": "Serverless REST API",
     "prompt": "Build a fully serverless REST API backed by a NoSQL store.",
     "slots": [
         _slot("entry", "API Front Door", "api_gateway", "Receives and routes HTTP requests."),
         _slot("compute", "Serverless Compute", "lambda", "Runs business logic on demand."),
         _slot("data", "NoSQL Data Store", "dynamodb", "Single-digit millisecond key-value store."),
     ],
     "tray": ["api_gateway", "lambda", "dynamodb", "ec2", "rds", "s3"],
     "exam_tracks": ["CLF_SAA"], "domains": ["Compute", "Integration", "Databases"], "difficulty": 2,
     "explanation": "API Gateway fronts Lambda functions that read and write DynamoDB. Every tier is serverless and scales automatically.",
     "professor_flock_hint": "Serverless front door, serverless compute, serverless NoSQL."},

    {"exercise_id": "match_3tier_web", "title": "Highly Available Web App",
     "prompt": "Stand up a classic highly available three-tier web application.",
     "slots": [
         _slot("balancer", "Traffic Distribution", "alb", "Spreads traffic across instances."),
         _slot("compute", "Application Compute", "ec2", "Runs the application servers."),
         _slot("database", "Relational Database", "rds", "Stores transactional data with joins."),
     ],
     "tray": ["alb", "ec2", "rds", "dynamodb", "s3", "lambda"],
     "exam_tracks": ["CLF_SAA"], "domains": ["Compute", "Networking", "Databases"], "difficulty": 2,
     "explanation": "An Application Load Balancer spreads traffic across EC2 instances in multiple Availability Zones, with RDS as the relational backend.",
     "professor_flock_hint": "Balance the traffic, run on instances, persist to a relational database."},

    {"exercise_id": "match_decoupled", "title": "Decoupled Order Processing",
     "prompt": "Decouple a web frontend from background workers so spikes do not drop orders.",
     "slots": [
         _slot("buffer", "Durable Message Buffer", "sqs", "Holds work until consumers are ready."),
         _slot("worker", "Worker Compute", "lambda", "Processes each message."),
         _slot("notify", "Fan-out Notifications", "sns", "Pushes updates to many subscribers."),
     ],
     "tray": ["sqs", "lambda", "sns", "rds", "cloudfront", "ec2"],
     "exam_tracks": ["CLF_SAA"], "domains": ["Integration", "Compute"], "difficulty": 3,
     "explanation": "SQS buffers incoming orders, Lambda workers process them, and SNS fans out status notifications. The queue absorbs traffic spikes.",
     "professor_flock_hint": "Queue to absorb spikes, compute to process, pub/sub to notify."},

    {"exercise_id": "match_secure_data", "title": "Secure Credential Handling",
     "prompt": "Protect an application's secrets and control who can reach AWS resources.",
     "slots": [
         _slot("permissions", "AWS Access Control", "iam", "Grants least-privilege permissions."),
         _slot("secrets", "Secret Storage & Rotation", "secrets_manager", "Stores and rotates credentials."),
         _slot("edge", "Web Application Firewall", "waf", "Filters malicious web traffic."),
     ],
     "tray": ["iam", "secrets_manager", "waf", "cognito", "kms", "cloudwatch"],
     "exam_tracks": ["CLF_SAA"], "domains": ["Security"], "difficulty": 3,
     "explanation": "IAM controls access to AWS resources, Secrets Manager stores and rotates credentials, and WAF filters malicious requests at the edge.",
     "professor_flock_hint": "Permissions for AWS, a vault for secrets, a firewall for the web."},

    # ---------------- MLA (ML Associate) ----------------
    {"exercise_id": "match_data_lake_query", "title": "Query a Data Lake",
     "prompt": "Prepare and query machine learning training data sitting in a data lake.",
     "slots": [
         _slot("lake", "Data Lake Storage", "s3", "Holds raw and processed data."),
         _slot("catalog", "Schema & Metadata Catalog", "glue_catalog", "Describes table schemas."),
         _slot("query", "Serverless SQL Engine", "athena", "Runs SQL directly over the lake."),
     ],
     "tray": ["s3", "glue_catalog", "athena", "rds", "redshift", "dynamodb"],
     "exam_tracks": ["MLA"], "domains": ["Data Preparation", "Analytics"], "difficulty": 2,
     "explanation": "S3 holds the data lake, the Glue Data Catalog describes the schema, and Athena runs serverless SQL over it with no cluster to manage.",
     "professor_flock_hint": "Storage for the lake, a catalog for schema, serverless SQL to query."},
]

_BY_ID = {e["exercise_id"]: e for e in EXERCISES}


def _tray_cards(service_ids: List[str]) -> List[Dict[str, Any]]:
    cards = []
    for sid in service_ids:
        s = _SVC_BY_ID.get(sid)
        if s:
            cards.append({"id": s["id"], "title": s["title"], "category": s["category"]})
    return cards


def _sanitize(e: Dict[str, Any]) -> Dict[str, Any]:
    tray = list(e["tray"])
    random.shuffle(tray)
    return {
        "exercise_id": e["exercise_id"],
        "title": e["title"],
        "prompt": e["prompt"],
        "slots": [{"slot_id": s["slot_id"], "label": s["label"], "hint": s["hint"]} for s in e["slots"]],
        "tray": _tray_cards(tray),
        "exam_tracks": e["exam_tracks"],
        "domains": e["domains"],
        "difficulty": e["difficulty"],
        "professor_flock_hint": e["professor_flock_hint"],
    }


def session_exercises(track: str, n: int = SESSION_SIZE):
    track = (track or "").upper()
    pool = [e for e in EXERCISES if track == "MIXED" or track in e.get("exam_tracks", [])]
    random.shuffle(pool)
    chosen = pool[:n]
    return [_sanitize(e) for e in chosen], len(pool) < n, len(pool)


def grade_match(exercise_id: str, placements: Dict[str, str]) -> Dict[str, Any]:
    e = _BY_ID.get(exercise_id)
    if not e:
        raise ValueError(f"Unknown exercise: {exercise_id}")

    placements = placements or {}
    correct_by_slot = {s["slot_id"]: s["correct"] for s in e["slots"]}
    correct_service_ids = set(correct_by_slot.values())

    per_slot = []
    correct_count = 0
    for s in e["slots"]:
        sid = s["slot_id"]
        placed = placements.get(sid)
        expected = s["correct"]
        if placed is None or placed == "":
            status = "missing"
        elif placed == expected:
            status = "correct"
            correct_count += 1
        elif placed in correct_service_ids:
            status = "misplaced"  # right service, wrong slot
        else:
            status = "wrong"      # distractor or not part of the ideal pipeline
        per_slot.append({
            "slot_id": sid, "label": s["label"],
            "placed": placed, "correct": expected, "status": status,
            "correct_title": _SVC_BY_ID.get(expected, {}).get("title", expected),
            "placed_title": _SVC_BY_ID.get(placed, {}).get("title", placed) if placed else None,
        })

    total = len(e["slots"])
    partial_score = round((correct_count / total) * 100) if total else 0
    return {
        "exercise_id": exercise_id, "title": e["title"],
        "partial_score": partial_score, "correct_count": correct_count, "total": total,
        "per_slot": per_slot, "explanation": e["explanation"],
        "professor_flock_hint": e["professor_flock_hint"], "domains": e.get("domains", []),
    }
