# Well-Architected Framework

## Summary

The AWS Well-Architected Framework provides best practices for building secure, high-performing, resilient, and efficient cloud architectures. It consists of six pillars, each representing a dimension of architectural quality. CloudForge Cards scoring aligns closely with these pillars.

## Key Concepts

### The Six Pillars

**1. Operational Excellence**
- Run and monitor systems to deliver business value
- Continuously improve processes and procedures
- Key practices: infrastructure as code, frequent small changes, anticipate failure
- AWS services: CloudWatch, CloudFormation, Config

**2. Security**
- Protect information, systems, and assets
- Risk assessment and mitigation strategies
- Key practices: least privilege, encryption everywhere, automate security, traceability
- AWS services: IAM, KMS, WAF, Shield, GuardDuty, CloudTrail

**3. Reliability**
- Ensure a workload performs its intended function correctly and consistently
- Recover from failures and meet demand
- Key practices: auto-recover, scale horizontally, stop guessing capacity, manage change
- AWS services: Route 53, ELB, Auto Scaling, S3, RDS Multi-AZ

**4. Performance Efficiency**
- Use computing resources efficiently as demand changes
- Maintain efficiency as technologies evolve
- Key practices: use serverless, experiment easily, consider mechanical sympathy
- AWS services: Lambda, CloudFront, ElastiCache, Auto Scaling

**5. Cost Optimization**
- Avoid unnecessary costs
- Understand where money is being spent
- Key practices: adopt consumption model, measure efficiency, stop spending on undifferentiated heavy lifting
- AWS services: Cost Explorer, Budgets, Reserved Instances, Spot, S3 lifecycle

**6. Sustainability**
- Minimize environmental impact of cloud workloads
- Key practices: right-size resources, use managed services, reduce downstream data movement
- AWS services: Graviton processors, serverless, efficient instance types

### Design Principles (Common Across Pillars)

- Stop guessing capacity needs
- Test systems at production scale
- Automate to make experimentation easier
- Allow for evolutionary architectures
- Drive architectures using data
- Improve through game days (simulate failures)

### Well-Architected Tool

AWS provides a free tool in the console to review your architecture against the framework. It generates a set of improvement recommendations prioritized by risk.

## CloudForge Cards Integration Ideas

- The game's rating system maps to Well-Architected quality: "Well-Architected" (86+) means the architecture meets best practices across most pillars
- Constraint chips map to pillars: Low Cost = Cost Optimization, Secure = Security, High Availability = Reliability, Scalable = Performance Efficiency, Observability = Operational Excellence
- Professor Flock can reference specific pillars in feedback: "Your design is strong on security but weak on cost optimization."
- Future "Well-Architected Review" mode could score each pillar independently

## Related Service Cards

Every service card relates to at least one pillar. Key examples:
- CloudWatch (Operational Excellence)
- IAM, KMS, WAF (Security)
- Route 53, ALB (Reliability)
- Lambda, CloudFront, ElastiCache (Performance Efficiency)
- S3 Glacier, Lambda (Cost Optimization)

## Potential Scenario Ideas

- "Well-Architected Review": Given a pre-built (flawed) architecture, identify which pillar is weakest and suggest improvements.
- "Pillar Trade-offs": A scenario where optimizing for one pillar (cost) conflicts with another (reliability). Tests understanding of design trade-offs.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[01_Cloud_Concepts]] (cloud design principles)
- [[08_Security_Compliance]] (Security pillar)
- [[09_Billing_Pricing]] (Cost Optimization pillar)
- [[06_Serverless]] (Performance Efficiency)
- [[07_Networking_VPC]] (Reliability through redundancy)
