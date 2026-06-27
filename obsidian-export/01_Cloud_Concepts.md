# Cloud Concepts

## Summary

Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Instead of owning and maintaining physical data centers, you rent access to computing power, storage, and databases from a cloud provider like AWS.

## Key Concepts

### What is Cloud Computing?

Cloud computing replaces upfront capital expense with variable operational expense. You pay only for what you consume, benefit from massive economies of scale, and stop guessing about capacity needs.

### Deployment Models

- **Public Cloud:** Resources owned and operated by a third-party provider, delivered over the internet (e.g., AWS, Azure, GCP)
- **Private Cloud:** Cloud infrastructure operated solely for a single organization, on-premises or hosted
- **Hybrid Cloud:** Combination of public and private clouds, connected by technology that allows data and applications to move between them

### Cloud Computing Models

- **IaaS (Infrastructure as a Service):** Virtual machines, storage, networking. You manage the OS and everything above it. Example: EC2.
- **PaaS (Platform as a Service):** Managed platform where you deploy code without managing infrastructure. Example: Elastic Beanstalk.
- **SaaS (Software as a Service):** Complete applications delivered over the internet. Example: Gmail, Salesforce.

### Six Advantages of Cloud Computing

1. Trade capital expense for variable expense
2. Benefit from massive economies of scale
3. Stop guessing capacity
4. Increase speed and agility
5. Stop spending money running data centers
6. Go global in minutes

### AWS Global Infrastructure

- **Regions:** Geographic areas with multiple isolated data centers
- **Availability Zones (AZs):** One or more discrete data centers within a Region, connected by low-latency links
- **Edge Locations:** Endpoints for caching content closer to users (used by CloudFront)

## CloudForge Cards Integration Ideas

- The "Personal Static Blog" scenario tests whether players understand that simple workloads do not need complex infrastructure
- The "Low Cost" constraint chip directly rewards understanding of pay-per-use and serverless models
- The "Beginner Friendly" constraint chip rewards choosing managed/PaaS services over raw IaaS

## Related Service Cards

- [[04_S3]] (object storage, pay-per-use)
- Lambda (serverless compute, pay-per-invocation)
- Elastic Beanstalk (PaaS, low operational complexity)
- App Runner (PaaS, container-based)

## Potential Scenario Ideas

- "Startup MVP": A founding team needs to launch fast with minimal upfront cost. Rewards understanding of managed services and pay-per-use pricing.
- "Legacy Migration": Moving an on-premises monolith to the cloud. Tests understanding of IaaS vs. PaaS trade-offs.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[09_Billing_Pricing]]
- [[10_Well_Architected]]
- [[06_Serverless]]
