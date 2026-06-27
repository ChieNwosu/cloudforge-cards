# Serverless

## Summary

Serverless computing lets you build and run applications without managing servers. AWS handles provisioning, scaling, patching, and capacity planning automatically. You pay only for the compute time and resources you actually consume, with no charge when your code is not running.

## Key Concepts

### What "Serverless" Means

Serverless does not mean "no servers." It means the cloud provider manages the servers entirely, and you focus only on your application code and configuration. Key characteristics:
- No server provisioning or management
- Automatic scaling (including to zero)
- Pay-per-use pricing (per request, per ms of execution, per GB processed)
- Built-in high availability and fault tolerance

### Core Serverless Services

**AWS Lambda:**
- Run code in response to events (HTTP requests, S3 uploads, DynamoDB changes, schedules)
- Supports Python, Node.js, Java, Go, .NET, Ruby, and custom runtimes
- Maximum execution time: 15 minutes per invocation
- Memory: 128 MB to 10 GB (CPU scales proportionally)
- Pay per request ($0.20 per million) and per GB-second of compute

**API Gateway:**
- Managed front door for REST, HTTP, and WebSocket APIs
- Handles throttling, caching, authentication, and request/response transformation
- Integrates directly with Lambda, DynamoDB, S3, and other AWS services
- Pay per API call and data transfer

**AWS Fargate:**
- Serverless compute engine for containers (ECS and EKS)
- No EC2 instances to manage; specify CPU and memory per task
- Good for longer-running containerized workloads that exceed Lambda's 15-minute limit

**DynamoDB (serverless mode):**
- On-demand capacity mode: pay per read/write request
- No capacity planning needed; scales automatically

**S3:**
- Object storage is inherently serverless (no infrastructure to manage)
- Scales automatically, pay only for storage and requests

### Event-Driven Architecture

Serverless services connect through events:
1. User uploads a file to S3
2. S3 sends an event notification to Lambda
3. Lambda processes the file and writes results to DynamoDB
4. DynamoDB Streams triggers another Lambda for downstream processing

This pattern eliminates polling, reduces cost, and scales with demand.

### When Serverless is Not the Best Fit

- Long-running processes over 15 minutes (use Fargate or EC2)
- Workloads with predictable, steady-state high utilization (Reserved EC2 may be cheaper)
- Applications requiring OS-level access or custom system libraries
- Real-time applications requiring consistent sub-10ms cold start latency

## CloudForge Cards Integration Ideas

- The "Serverless" constraint chip rewards architectures built primarily from serverless services
- Lambda appears in 8 out of 10 scenarios as a core or supporting service
- The game marks each service card with a `serverless: true/false` flag used in constraint scoring
- Serverless services tend to have low cost ratings and high scalability ratings in the game

## Related Service Cards

- Lambda (Compute, cost: 1, serverless: true, scalability: 5)
- API Gateway (Network, cost: 2, serverless: true)
- ECS on Fargate (Compute, cost: 3, serverless: true)
- App Runner (Compute, cost: 3, serverless: true)
- DynamoDB (Database, cost: 2, serverless: true)
- S3 (Storage, cost: 1, serverless: true)
- EventBridge (Integration, cost: 1, serverless: true)
- SNS (Integration, cost: 1, serverless: true)
- SQS (Integration, cost: 1, serverless: true)

## Potential Scenario Ideas

- "Webhook Processor": Receive third-party webhooks, validate, transform, and store them. Tests understanding of API Gateway + Lambda + DynamoDB pattern.
- "Scheduled Report Generator": Run a nightly job that queries data and emails a report. Tests understanding of EventBridge scheduled rules + Lambda.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[01_Cloud_Concepts]] (cloud computing models)
- [[03_EC2]] (contrast with server-based compute)
- [[05_Databases_Analytics]] (DynamoDB serverless mode)
- [[07_Networking_VPC]] (API Gateway as front door)
- [[09_Billing_Pricing]] (pay-per-use model)
