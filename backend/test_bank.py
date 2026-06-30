"""
v0.3 Phase 2 - Test Mode question bank and SERVER-SIDE grading.

Answer keys (`correct`) never leave this module: session responses are sanitized to
strip `correct`, and grading happens here. No user quiz history is stored.

Question shape:
  question_id, prompt, question_type ("mcq" | "truefalse" | "scenario_select"),
  answer_options [{id, text}], correct [option ids], explanation, exam_tracks[],
  domains[], related_services[], difficulty (1-3), professor_flock_hint
"""
import random
from typing import List, Dict, Any

SESSION_SIZE = 15

_TF = [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}]


def _svc(*pairs):
    return [{"id": i, "text": t} for i, t in pairs]


QUESTIONS: List[Dict[str, Any]] = [
    # ---------------- CLF / SAA ----------------
    {"question_id": "clf_01", "prompt": "Which AWS service provides durable object storage for files, media, and data lakes?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Amazon S3"}, {"id": "b", "text": "Amazon EBS"}, {"id": "c", "text": "Amazon RDS"}, {"id": "d", "text": "Amazon Redshift"}],
     "correct": ["a"], "explanation": "S3 is object storage and the backbone of most architectures and data lakes.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Storage"], "related_services": ["s3"], "difficulty": 1,
     "professor_flock_hint": "Think buckets and objects, not disks or tables."},
    {"question_id": "clf_02", "prompt": "Which service caches content at edge locations to deliver it with low latency worldwide?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Route 53"}, {"id": "b", "text": "CloudFront"}, {"id": "c", "text": "API Gateway"}, {"id": "d", "text": "ALB"}],
     "correct": ["b"], "explanation": "CloudFront is the CDN that caches at the edge close to users.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Networking"], "related_services": ["cloudfront"], "difficulty": 1,
     "professor_flock_hint": "Edge locations are the giveaway."},
    {"question_id": "clf_03", "prompt": "Lambda is the best choice for long-running, always-on compute workloads.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["false"],
     "explanation": "Lambda suits short, event-driven work. Long-running or always-on jobs fit containers or EC2.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Compute"], "related_services": ["lambda", "ec2", "ecs_fargate"], "difficulty": 1,
     "professor_flock_hint": "Lambda functions are short-lived by design."},
    {"question_id": "clf_04", "prompt": "Which service is a managed relational SQL database with joins and transactions?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "DynamoDB"}, {"id": "b", "text": "ElastiCache"}, {"id": "c", "text": "Amazon RDS"}, {"id": "d", "text": "Amazon S3"}],
     "correct": ["c"], "explanation": "RDS is managed relational SQL. DynamoDB is NoSQL.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Databases"], "related_services": ["rds"], "difficulty": 1,
     "professor_flock_hint": "Joins and transactions mean relational."},
    {"question_id": "clf_05", "prompt": "Which service is serverless NoSQL with single-digit millisecond reads at any scale?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Amazon RDS"}, {"id": "b", "text": "DynamoDB"}, {"id": "c", "text": "Redshift"}, {"id": "d", "text": "Athena"}],
     "correct": ["b"], "explanation": "DynamoDB is serverless NoSQL built for massive scale and low latency.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Databases"], "related_services": ["dynamodb"], "difficulty": 1,
     "professor_flock_hint": "Key-value at web scale."},
    {"question_id": "clf_06", "prompt": "Pick the services for the cheapest, simplest static website with a custom domain.",
     "question_type": "scenario_select",
     "answer_options": _svc(("s3", "Amazon S3"), ("cloudfront", "CloudFront"), ("route53", "Route 53"), ("ec2", "Amazon EC2"), ("rds", "Amazon RDS")),
     "correct": ["s3", "cloudfront", "route53"], "explanation": "Static files in S3, cached by CloudFront, with Route 53 DNS. No servers needed.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Storage", "Networking"], "related_services": ["s3", "cloudfront", "route53"], "difficulty": 2,
     "professor_flock_hint": "No servers for static content. Object storage plus CDN plus DNS."},
    {"question_id": "clf_07", "prompt": "Route 53 is the AWS Domain Name System (DNS) service.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["true"],
     "explanation": "Route 53 provides DNS, health checks, and routing policies.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Networking"], "related_services": ["route53"], "difficulty": 1,
     "professor_flock_hint": "The number 53 is the DNS port."},
    {"question_id": "clf_08", "prompt": "Which service is a durable queue used to decouple producers from consumers?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "SNS"}, {"id": "b", "text": "SQS"}, {"id": "c", "text": "Kinesis"}, {"id": "d", "text": "EventBridge"}],
     "correct": ["b"], "explanation": "SQS is a durable queue. SNS is pub/sub fan-out.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Integration"], "related_services": ["sqs"], "difficulty": 2,
     "professor_flock_hint": "Queue means buffer and decouple."},
    {"question_id": "clf_09", "prompt": "Which service is pub/sub messaging that fans one message out to many subscribers?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "SQS"}, {"id": "b", "text": "SNS"}, {"id": "c", "text": "RDS"}, {"id": "d", "text": "S3"}],
     "correct": ["b"], "explanation": "SNS fans out one message to many subscribers. SQS is a queue.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Integration"], "related_services": ["sns"], "difficulty": 2,
     "professor_flock_hint": "Fan-out is the clue."},
    {"question_id": "clf_10", "prompt": "Which service provides an in-memory cache to speed up read-heavy workloads?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "ElastiCache"}, {"id": "b", "text": "Glacier"}, {"id": "c", "text": "Athena"}, {"id": "d", "text": "EBS"}],
     "correct": ["a"], "explanation": "ElastiCache (Redis or Memcached) is an in-memory cache.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Databases"], "related_services": ["elasticache"], "difficulty": 2,
     "professor_flock_hint": "In-memory and fast."},
    {"question_id": "clf_11", "prompt": "IAM is the right service for end-user application sign-in and sign-up.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["false"],
     "explanation": "IAM controls AWS resource permissions. End-user sign-in uses Cognito.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Security"], "related_services": ["iam", "cognito"], "difficulty": 2,
     "professor_flock_hint": "IAM is for AWS access, not app users."},
    {"question_id": "clf_12", "prompt": "Which service securely stores and rotates database credentials and API keys?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "KMS"}, {"id": "b", "text": "Secrets Manager"}, {"id": "c", "text": "WAF"}, {"id": "d", "text": "IAM"}],
     "correct": ["b"], "explanation": "Secrets Manager stores and rotates secrets. KMS manages encryption keys.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Security"], "related_services": ["secrets_manager"], "difficulty": 2,
     "professor_flock_hint": "Secrets, not encryption keys themselves."},
    {"question_id": "clf_13", "prompt": "Which service is a columnar data warehouse for analytics over large datasets?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "DynamoDB"}, {"id": "b", "text": "Redshift"}, {"id": "c", "text": "RDS"}, {"id": "d", "text": "ElastiCache"}],
     "correct": ["b"], "explanation": "Redshift is a columnar data warehouse for analytical queries.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Analytics"], "related_services": ["redshift"], "difficulty": 2,
     "professor_flock_hint": "Warehouse means analytics at scale."},
    {"question_id": "clf_14", "prompt": "Pick the services for a serverless REST API with a NoSQL backend.",
     "question_type": "scenario_select",
     "answer_options": _svc(("api_gateway", "API Gateway"), ("lambda", "Lambda"), ("dynamodb", "DynamoDB"), ("ec2", "Amazon EC2"), ("rds", "Amazon RDS")),
     "correct": ["api_gateway", "lambda", "dynamodb"], "explanation": "API Gateway fronts Lambda functions that read and write DynamoDB. Fully serverless.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Compute", "Integration"], "related_services": ["api_gateway", "lambda", "dynamodb"], "difficulty": 2,
     "professor_flock_hint": "Serverless front door, serverless compute, serverless NoSQL."},
    {"question_id": "clf_15", "prompt": "Which service provides block storage volumes attached to a single EC2 instance?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Amazon S3"}, {"id": "b", "text": "Amazon EFS"}, {"id": "c", "text": "Amazon EBS"}, {"id": "d", "text": "Glacier"}],
     "correct": ["c"], "explanation": "EBS is block storage for one instance. EFS is shared file storage. S3 is object storage.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Storage"], "related_services": ["ebs"], "difficulty": 2,
     "professor_flock_hint": "Think of the VM's disk."},
    {"question_id": "clf_16", "prompt": "CloudWatch provides metrics, logs, and alarms for observability.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["true"],
     "explanation": "CloudWatch is the observability hub for metrics, logs, and alarms.",
     "exam_tracks": ["CLF_SAA"], "domains": ["Monitoring"], "related_services": ["cloudwatch"], "difficulty": 1,
     "professor_flock_hint": "Watch your metrics and logs."},

    # ---------------- AIF (AI Practitioner) ----------------
    {"question_id": "aif_01", "prompt": "Which service gives API access to foundation models without managing infrastructure?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "SageMaker"}, {"id": "b", "text": "Bedrock"}, {"id": "c", "text": "Athena"}, {"id": "d", "text": "Redshift"}],
     "correct": ["b"], "explanation": "Bedrock provides foundation models through an API with no infrastructure to manage.",
     "exam_tracks": ["AIF"], "domains": ["Generative AI"], "related_services": ["bedrock"], "difficulty": 1,
     "professor_flock_hint": "Foundation models, no servers."},
    {"question_id": "aif_02", "prompt": "Amazon Bedrock lets you use foundation models without provisioning servers.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["true"],
     "explanation": "Bedrock is fully managed access to foundation models.",
     "exam_tracks": ["AIF"], "domains": ["Generative AI"], "related_services": ["bedrock"], "difficulty": 1,
     "professor_flock_hint": "Managed means no servers for you."},
    {"question_id": "aif_03", "prompt": "Retrieval augmented generation (RAG) improves answers by combining a foundation model with what?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "A larger GPU cluster"}, {"id": "b", "text": "Your own data retrieved at query time"}, {"id": "c", "text": "More training epochs"}, {"id": "d", "text": "A relational database index"}],
     "correct": ["b"], "explanation": "RAG retrieves relevant context from your own data and feeds it to the model at query time.",
     "exam_tracks": ["AIF"], "domains": ["Generative AI"], "related_services": ["bedrock"], "difficulty": 2,
     "professor_flock_hint": "Retrieval means pulling in your own context."},
    {"question_id": "aif_04", "prompt": "Prompt engineering has no effect on the quality of foundation model output.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["false"],
     "explanation": "Clear prompts strongly influence output quality. Prompt engineering matters.",
     "exam_tracks": ["AIF"], "domains": ["AI/ML Fundamentals"], "related_services": ["bedrock"], "difficulty": 1,
     "professor_flock_hint": "How you ask changes what you get."},
    {"question_id": "aif_05", "prompt": "Which choice best describes a foundation model?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "A small rules engine"}, {"id": "b", "text": "A large pretrained model adaptable to many tasks"}, {"id": "c", "text": "A relational database schema"}, {"id": "d", "text": "A network load balancer"}],
     "correct": ["b"], "explanation": "Foundation models are large, pretrained, and adaptable to many downstream tasks.",
     "exam_tracks": ["AIF"], "domains": ["AI/ML Fundamentals"], "related_services": ["bedrock"], "difficulty": 1,
     "professor_flock_hint": "Pretrained and general purpose."},

    # ---------------- MLA (ML Associate) ----------------
    {"question_id": "mla_01", "prompt": "Which service builds, trains, and deploys custom machine learning models end to end?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Bedrock"}, {"id": "b", "text": "SageMaker"}, {"id": "c", "text": "Athena"}, {"id": "d", "text": "CloudWatch"}],
     "correct": ["b"], "explanation": "SageMaker covers the full custom ML lifecycle. Bedrock is for foundation models.",
     "exam_tracks": ["MLA"], "domains": ["ML Engineering"], "related_services": ["sagemaker"], "difficulty": 1,
     "professor_flock_hint": "Custom training end to end."},
    {"question_id": "mla_02", "prompt": "SageMaker is mainly for prompt-only generative tasks, not custom model training.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["false"],
     "explanation": "SageMaker is for building and training custom models. Prompt-only tasks fit Bedrock.",
     "exam_tracks": ["MLA"], "domains": ["ML Engineering"], "related_services": ["sagemaker", "bedrock"], "difficulty": 2,
     "professor_flock_hint": "Custom training is SageMaker's job."},
    {"question_id": "mla_03", "prompt": "Pick the services to prepare and query ML training data sitting in an S3 data lake.",
     "question_type": "scenario_select",
     "answer_options": _svc(("s3", "Amazon S3"), ("glue_catalog", "Glue Data Catalog"), ("athena", "Athena"), ("rds", "Amazon RDS"), ("cloudfront", "CloudFront")),
     "correct": ["s3", "glue_catalog", "athena"], "explanation": "S3 holds the data, Glue catalogs the schema, and Athena runs serverless SQL for exploration.",
     "exam_tracks": ["MLA"], "domains": ["Data Preparation"], "related_services": ["s3", "glue_catalog", "athena"], "difficulty": 2,
     "professor_flock_hint": "Storage, catalog, and serverless SQL over the lake."},
    {"question_id": "mla_04", "prompt": "Which service runs serverless SQL directly over data in S3, with no cluster to manage?",
     "question_type": "mcq",
     "answer_options": [{"id": "a", "text": "Redshift"}, {"id": "b", "text": "Athena"}, {"id": "c", "text": "RDS"}, {"id": "d", "text": "DynamoDB"}],
     "correct": ["b"], "explanation": "Athena queries S3 data with serverless SQL. Redshift needs a cluster.",
     "exam_tracks": ["MLA"], "domains": ["Data Preparation"], "related_services": ["athena"], "difficulty": 2,
     "professor_flock_hint": "Serverless SQL over the data lake."},
    {"question_id": "mla_05", "prompt": "A data catalog such as Glue stores schema and metadata that power serverless SQL queries.",
     "question_type": "truefalse", "answer_options": _TF, "correct": ["true"],
     "explanation": "Glue Data Catalog holds table definitions and metadata used by Athena and Redshift.",
     "exam_tracks": ["MLA"], "domains": ["Data Preparation"], "related_services": ["glue_catalog"], "difficulty": 1,
     "professor_flock_hint": "Catalog equals schema and metadata."},
]

_BY_ID = {q["question_id"]: q for q in QUESTIONS}


def _sanitize(q: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in q.items() if k != "correct"}


def session_questions(track: str, n: int = SESSION_SIZE):
    pool = [q for q in QUESTIONS if track == "MIXED" or track in q.get("exam_tracks", [])]
    random.shuffle(pool)
    chosen = pool[:n]
    return [_sanitize(q) for q in chosen], len(pool) < n, len(pool)


def grade_answers(submitted: List[Dict[str, Any]]):
    correct_count = 0
    per_question = []
    domain_total, domain_correct = {}, {}
    for ans in submitted:
        q = _BY_ID.get(ans.get("question_id"))
        if not q:
            continue
        sel = ans.get("selected")
        sel_set = set(sel) if isinstance(sel, list) else ({sel} if sel else set())
        correct_set = set(q["correct"])
        is_correct = sel_set == correct_set
        if is_correct:
            correct_count += 1
        for d in q.get("domains", []):
            domain_total[d] = domain_total.get(d, 0) + 1
            if is_correct:
                domain_correct[d] = domain_correct.get(d, 0) + 1
        per_question.append({
            "question_id": q["question_id"], "prompt": q["prompt"],
            "question_type": q["question_type"], "answer_options": q["answer_options"],
            "selected": sorted(sel_set), "correct": q["correct"], "is_correct": is_correct,
            "explanation": q["explanation"], "related_services": q.get("related_services", []),
            "domains": q.get("domains", []), "professor_flock_hint": q.get("professor_flock_hint", ""),
        })
    total = len(per_question)
    score = round((correct_count / total) * 100) if total else 0
    strengths = sorted(d for d in domain_total if domain_correct.get(d, 0) == domain_total[d])
    review_areas = sorted(d for d in domain_total if domain_correct.get(d, 0) < domain_total[d])
    return {
        "score": score, "correct_count": correct_count, "total": total,
        "per_question": per_question, "strengths": strengths, "review_areas": review_areas,
    }
