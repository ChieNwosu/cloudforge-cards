# Billing and Pricing

## Summary

AWS uses a pay-as-you-go model with no upfront costs for most services. Understanding pricing fundamentals, cost management tools, and optimization strategies is essential for both the CLF exam and for making smart choices in CloudForge Cards.

## Key Concepts

### Pricing Fundamentals

- **Pay-as-you-go:** No upfront commitment. Pay only for what you consume.
- **Pay less when you reserve:** Commit to 1 or 3 years for significant discounts.
- **Pay less per unit as you use more:** Volume discounts (tiered pricing).
- **No charge for data IN:** Inbound data transfer is free.
- **Data OUT costs money:** Outbound transfer is metered (first 100 GB/month is discounted).

### Free Tier

Three types of free tier offers:
- **Always Free:** Services with a perpetual free tier (e.g., Lambda 1M requests/month, DynamoDB 25 GB)
- **12 Months Free:** Available for the first year after account creation (e.g., 750 hrs EC2 t2.micro)
- **Trials:** Short-term free trials for specific services

### Cost Management Tools

- **AWS Cost Explorer:** Visualize, understand, and manage costs and usage over time
- **AWS Budgets:** Set custom budgets and receive alerts when costs exceed thresholds
- **Cost and Usage Reports (CUR):** Most detailed billing data, exportable to S3
- **Pricing Calculator:** Estimate costs before deploying (replaced Simple Monthly Calculator)
- **AWS Organizations:** Consolidated billing across multiple accounts with volume discounts

### Pricing Models for Compute

| Model | Discount | Commitment | Best For |
|-------|----------|-----------|----------|
| On-Demand | 0% | None | Unpredictable, short-term workloads |
| Reserved Instances | Up to 72% | 1 or 3 years | Steady-state, predictable workloads |
| Savings Plans | Up to 72% | 1 or 3 years ($/hr) | Flexible across instance types |
| Spot Instances | Up to 90% | None (can be interrupted) | Fault-tolerant, flexible workloads |

### Cost Optimization Strategies

1. Right-size instances (match instance type to actual workload needs)
2. Use Auto Scaling to match capacity to demand
3. Choose serverless where appropriate (pay per request, not per hour)
4. Use S3 lifecycle policies to move data to cheaper storage tiers
5. Reserve capacity for predictable workloads
6. Use Spot Instances for batch processing and fault-tolerant work
7. Set up AWS Budgets alerts to catch unexpected spending early

## CloudForge Cards Integration Ideas

- The "Low Cost" constraint chip rewards services with low cost ratings (Lambda: 1, S3: 1, SNS: 1, SQS: 1)
- The "Personal Static Blog" scenario is designed for a near-free solution
- Serverless services generally have lower cost ratings in the game, reflecting pay-per-use pricing
- A future scenario could focus explicitly on cost optimization trade-offs

## Related Service Cards

- Lambda (cost: 1, pay-per-invocation)
- S3 (cost: 1, pay-per-GB and requests)
- DynamoDB (cost: 2, on-demand mode is pay-per-request)
- EC2 (cost: 4, always-on compute is expensive)
- Redshift (cost: 4, data warehouse provisioned capacity)

## Potential Scenario Ideas

- "Startup on a Budget": Launch a functional web app spending under $50/month. Tests understanding of free tier and serverless.
- "Cost Optimization Audit": Given an existing (expensive) architecture, redesign to cut costs by 60%. Tests understanding of Reserved vs. Spot vs. Serverless trade-offs.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[01_Cloud_Concepts]] (cloud value proposition)
- [[03_EC2]] (instance pricing models)
- [[06_Serverless]] (pay-per-use model)
- [[10_Well_Architected]] (Cost Optimization pillar)
