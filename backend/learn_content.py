"""
v0.3 Phase 0 - additive Learn-mode content enrichment.

The 3-round game reads SERVICE_CARDS directly and never sees these fields, so the
game is unaffected. The Learn endpoints serve ENRICHED copies of the cards with
extra study fields. Defaults are honest: most cards are CLF_SAA only; AIF/MLA tags
are applied only where a service is genuinely relevant.

Future Test/Match question banks will live in sibling JSON/modules. Grading for
those modes is planned to be SERVER-SIDE (answer keys not shipped to the browser).
Not implemented in this phase.
"""
from seed_data import SERVICE_CARDS, SYNERGIES

EXAM_TRACKS = [
    {"id": "CLF_SAA", "name": "CLF / SAA", "description": "Cloud Practitioner and Solutions Architect Associate foundations."},
    {"id": "AIF", "name": "AI Practitioner", "description": "AWS AI and generative AI fundamentals."},
    {"id": "MLA", "name": "ML Associate", "description": "Machine Learning Engineer Associate data and model workflows."},
]

# Per-service curated study content. Anything omitted falls back to safe defaults.
# exam_tracks defaults to ["CLF_SAA"] when not specified here.
_OVERRIDES = {
    "lambda": {"study_tip": "Reach for Lambda first for short, event-driven work. No servers to manage.",
               "use_cases": ["Event-driven APIs", "File processing on upload", "Lightweight cron jobs"],
               "anti_patterns": ["Long-running or heavy-compute jobs", "Steady high-throughput workloads better on containers"]},
    "ec2": {"study_tip": "EC2 gives full control of the OS. Pick it when you need custom runtimes or long-lived servers.",
            "use_cases": ["Legacy or stateful apps", "Custom OS or GPU workloads"],
            "anti_patterns": ["Simple static sites", "Spiky, infrequent traffic better on serverless"]},
    "ecs_fargate": {"study_tip": "Fargate runs containers without managing servers. Good middle ground between Lambda and EC2.",
                    "use_cases": ["Containerized web services", "Steady microservices"],
                    "anti_patterns": ["Tiny one-off tasks better on Lambda"]},
    "ecs_ec2": {"study_tip": "Use ECS on EC2 when you need control over the underlying instances or special hardware.",
                "use_cases": ["Cost tuning at scale", "GPU or specialized instances"],
                "anti_patterns": ["Teams that do not want to manage servers"]},
    "app_runner": {"study_tip": "App Runner deploys a container or repo to a managed URL fast. Great for simple services.",
                   "use_cases": ["Quick container deploys", "Small web APIs"],
                   "anti_patterns": ["Complex networking or fine-grained scaling needs"]},
    "beanstalk": {"study_tip": "Elastic Beanstalk handles provisioning for you. Handy for classic web apps.",
                  "use_cases": ["Traditional web apps", "Quick managed deploys"],
                  "anti_patterns": ["Modern serverless or container-native designs"]},
    "s3": {"study_tip": "S3 is durable object storage and the backbone of most architectures and data lakes.",
           "use_cases": ["Static assets and media", "Data lake storage", "Backups and archives"],
           "anti_patterns": ["Low-latency transactional reads better on a database"],
           "exam_tracks": ["CLF_SAA", "MLA"]},
    "ebs": {"study_tip": "EBS is block storage attached to one EC2 instance. Think of it as the VM's disk.",
            "use_cases": ["Boot volumes", "Databases on EC2"],
            "anti_patterns": ["Shared access across many instances, use EFS"]},
    "efs": {"study_tip": "EFS is a shared file system many instances can mount at once.",
            "use_cases": ["Shared content across instances", "Lift-and-shift file workloads"],
            "anti_patterns": ["Object storage needs better served by S3"]},
    "glacier": {"study_tip": "S3 Glacier is cheap, cold, long-term archive storage. Retrieval is slow.",
                "use_cases": ["Compliance archives", "Rarely accessed backups"],
                "anti_patterns": ["Anything needing fast or frequent access"]},
    "dynamodb": {"study_tip": "DynamoDB is serverless NoSQL with single-digit millisecond reads at any scale.",
                 "use_cases": ["High-scale key-value lookups", "Session and leaderboard data"],
                 "anti_patterns": ["Complex relational joins better on RDS"]},
    "rds": {"study_tip": "RDS is managed relational SQL. Reach for it when you need joins and transactions.",
            "use_cases": ["Transactional apps", "Relational reporting"],
            "anti_patterns": ["Massive web-scale key-value traffic better on DynamoDB"]},
    "aurora_serverless": {"study_tip": "Aurora Serverless scales relational capacity up and down automatically.",
                          "use_cases": ["Variable relational workloads", "Cost-efficient dev and test"],
                          "anti_patterns": ["Predictable steady load may be cheaper on provisioned RDS"]},
    "elasticache": {"study_tip": "ElastiCache (Redis or Memcached) puts a fast cache in front of slower stores.",
                    "use_cases": ["Session caching", "Leaderboards", "Read-heavy hot keys"],
                    "anti_patterns": ["System of record, caches are not durable storage"]},
    "redshift": {"study_tip": "Redshift is a columnar data warehouse for analytics over large datasets.",
                 "use_cases": ["BI dashboards", "Large analytical queries"],
                 "anti_patterns": ["High-frequency transactional writes"],
                 "exam_tracks": ["CLF_SAA", "MLA"]},
    "cloudfront": {"study_tip": "CloudFront is the CDN that caches content at edge locations for low latency.",
                   "use_cases": ["Global static delivery", "Caching in front of S3 or an API"],
                   "anti_patterns": ["Dynamic, uncacheable, per-user data with no edge benefit"]},
    "route53": {"study_tip": "Route 53 is DNS plus health checks and routing policies.",
                "use_cases": ["Domain routing", "Failover and latency-based routing"],
                "anti_patterns": ["Content delivery, that is CloudFront's job"]},
    "api_gateway": {"study_tip": "API Gateway is the managed front door for REST and HTTP APIs.",
                    "use_cases": ["Serverless API entry point", "Throttling and auth at the edge"],
                    "anti_patterns": ["Simple static hosting"]},
    "vpc": {"study_tip": "A VPC is your private network boundary in AWS. Subnets, routing, and isolation live here.",
            "use_cases": ["Network isolation", "Private subnets for databases"],
            "anti_patterns": ["Not a compute or storage service on its own"]},
    "alb": {"study_tip": "ALB load-balances HTTP traffic across targets with path and host routing.",
            "use_cases": ["Container and EC2 web traffic", "Path-based microservice routing"],
            "anti_patterns": ["Pure serverless APIs often use API Gateway instead"]},
    "iam": {"study_tip": "IAM controls who can do what. Least privilege is the rule, not the exception.",
            "use_cases": ["Roles and policies", "Service-to-service permissions"],
            "anti_patterns": ["End-user sign-in, use Cognito for that"]},
    "kms": {"study_tip": "KMS manages encryption keys for data at rest across AWS services.",
            "use_cases": ["Encrypting S3, EBS, RDS", "Key rotation and audit"],
            "anti_patterns": ["Application secrets storage, prefer Secrets Manager"]},
    "waf": {"study_tip": "WAF filters malicious web traffic before it reaches your app.",
            "use_cases": ["Blocking common web exploits", "Rate-based rules"],
            "anti_patterns": ["Internal-only services with no public exposure"]},
    "cognito": {"study_tip": "Cognito handles end-user sign-up and sign-in with user pools.",
                "use_cases": ["App user authentication", "Social and federated login"],
                "anti_patterns": ["AWS resource permissions, that is IAM"]},
    "secrets_manager": {"study_tip": "Secrets Manager stores and rotates credentials and API keys safely.",
                        "use_cases": ["Database credentials", "Third-party API keys"],
                        "anti_patterns": ["Encryption keys themselves, that is KMS"]},
    "kinesis": {"study_tip": "Kinesis ingests high-volume streaming data in real time.",
                "use_cases": ["Clickstream and IoT ingestion", "Real-time pipelines"],
                "anti_patterns": ["Simple decoupled queues better on SQS"],
                "exam_tracks": ["CLF_SAA", "MLA"]},
    "athena": {"study_tip": "Athena runs serverless SQL directly over data in S3. No cluster needed.",
               "use_cases": ["Ad hoc data-lake queries", "Log analysis"],
               "anti_patterns": ["High-concurrency BI better on Redshift"],
               "exam_tracks": ["CLF_SAA", "MLA"]},
    "glue_catalog": {"study_tip": "Glue Data Catalog holds the schema and metadata that power Athena and Redshift.",
                     "use_cases": ["Data-lake metadata", "Schema for serverless SQL"],
                     "anti_patterns": ["Not a query engine by itself"],
                     "exam_tracks": ["CLF_SAA", "MLA"]},
    "sns": {"study_tip": "SNS is pub/sub fan-out messaging. One message, many subscribers.",
            "use_cases": ["Notifications", "Fan-out to multiple consumers"],
            "anti_patterns": ["Durable work queues better on SQS"]},
    "sqs": {"study_tip": "SQS is a durable queue that decouples producers from consumers.",
            "use_cases": ["Buffering bursty work", "Decoupling microservices"],
            "anti_patterns": ["Real-time fan-out better on SNS"]},
    "eventbridge": {"study_tip": "EventBridge routes events between services with rules and schedules.",
                    "use_cases": ["Event-driven workflows", "Scheduled triggers"],
                    "anti_patterns": ["Simple point-to-point queues better on SQS"]},
    "cloudwatch": {"study_tip": "CloudWatch is metrics, logs, and alarms. Your observability hub.",
                   "use_cases": ["Dashboards and alarms", "Centralized logs"],
                   "anti_patterns": ["Not a security threat detector, see GuardDuty"]},
    "bedrock": {"study_tip": "Bedrock gives API access to foundation models for generative AI without managing infrastructure.",
                "use_cases": ["Chatbots and summarization", "Retrieval augmented generation"],
                "anti_patterns": ["Training custom models from scratch, use SageMaker"],
                "exam_tracks": ["CLF_SAA", "AIF", "MLA"]},
    "sagemaker": {"study_tip": "SageMaker builds, trains, and deploys custom machine learning models end to end.",
                  "use_cases": ["Custom model training", "Managed model hosting"],
                  "anti_patterns": ["Simple prompt-only generative tasks fit Bedrock"],
                  "exam_tracks": ["CLF_SAA", "AIF", "MLA"]},
}

# Map of service id -> set of paired service ids, derived from the game's SYNERGIES.
_PAIRINGS = {}
for _a, _b in SYNERGIES:
    _PAIRINGS.setdefault(_a, set()).add(_b)
    _PAIRINGS.setdefault(_b, set()).add(_a)

_TITLE_BY_ID = {c["id"]: c["title"] for c in SERVICE_CARDS}


def enrich_cards():
    """Return service cards with additive Learn fields. Game data is left untouched."""
    enriched = []
    for card in SERVICE_CARDS:
        ov = _OVERRIDES.get(card["id"], {})
        pairings = sorted(_PAIRINGS.get(card["id"], set()))
        enriched.append({
            **card,
            "exam_tracks": ov.get("exam_tracks", ["CLF_SAA"]),
            "domains": ov.get("domains", []),
            "use_cases": ov.get("use_cases", []),
            "common_pairings": [{"id": p, "title": _TITLE_BY_ID.get(p, p)} for p in pairings],
            "anti_patterns": ov.get("anti_patterns", []),
            "study_tip": ov.get("study_tip", f"{card['title']} sits in the {card['category']} category. Learn where it fits in an architecture."),
            "flashcard_front": ov.get("flashcard_front", card["title"]),
            "flashcard_back": ov.get("flashcard_back", card["description"]),
        })
    return enriched
