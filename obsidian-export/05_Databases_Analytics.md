# Databases and Analytics

## Summary

AWS offers purpose-built databases for different workload patterns, plus analytics services for querying and visualizing data at scale. The CLF exam tests your ability to choose the right database type for a given use case and understand when to use analytics services.

## Key Concepts

### Database Types on AWS

**Relational Databases (SQL):**
- **RDS:** Managed relational database supporting PostgreSQL, MySQL, MariaDB, Oracle, SQL Server. Handles patching, backups, and failover.
- **Aurora:** AWS-built MySQL/PostgreSQL-compatible engine with up to 5x performance improvement. Available in serverless and provisioned modes.
- **Key use cases:** Transactions, joins, referential integrity, structured data with relationships.

**NoSQL Databases:**
- **DynamoDB:** Serverless key-value and document database. Single-digit millisecond latency at any scale. Pay-per-request or provisioned capacity.
- **Key use cases:** High-throughput, low-latency reads/writes. Session stores, gaming leaderboards, IoT data.

**In-Memory Databases:**
- **ElastiCache:** Managed Redis or Memcached. Sub-millisecond read latency.
- **Key use cases:** Caching database queries, session storage, real-time leaderboards.

**Data Warehouse:**
- **Redshift:** Petabyte-scale columnar data warehouse optimized for analytical (OLAP) queries.
- **Key use cases:** Business intelligence, historical analysis, complex aggregations across billions of rows.

### Analytics Services

- **Athena:** Serverless SQL engine that queries data directly in S3. No infrastructure to manage. Pay per query.
- **Glue:** ETL (Extract, Transform, Load) service and data catalog. Crawls data sources and maintains schema metadata.
- **Kinesis:** Real-time streaming data ingestion and processing. Handles millions of events per second.
- **QuickSight:** Serverless business intelligence and visualization (not in CloudForge Cards yet).

### Choosing the Right Database

| Workload Pattern | Best Fit | Why |
|-----------------|----------|-----|
| Transactions with joins | RDS or Aurora | Relational integrity, ACID compliance |
| High-speed key lookups | DynamoDB | Single-digit ms latency, serverless scale |
| Caching layer | ElastiCache | Sub-ms reads, reduce database load |
| Historical analytics | Redshift | Columnar storage, complex aggregations |
| Ad-hoc queries on S3 | Athena | No infrastructure, pay per query |
| Real-time streaming | Kinesis | Millions of events per second |

## CloudForge Cards Integration Ideas

- The "Fintech Transactions API" scenario rewards RDS/Aurora for relational transaction workloads
- The "Mobile Game Leaderboard" scenario rewards DynamoDB + ElastiCache for low-latency reads
- The "Internal Analytics Dashboard" scenario rewards Redshift + Athena for OLAP queries
- The "IoT Telemetry Pipeline" scenario rewards Kinesis for streaming ingestion

## Related Service Cards

- RDS (Database, cost: 3, serverless: false)
- Aurora Serverless (Database, cost: 3, serverless: true)
- DynamoDB (Database, cost: 2, serverless: true, scalability: 5)
- ElastiCache (Database, cost: 3, serverless: false)
- Redshift (Database, cost: 4, complexity: 4)
- Athena (Analytics, cost: 2, serverless: true)
- Kinesis (Analytics, cost: 3, serverless: false)
- Glue Data Catalog (Analytics, cost: 1, serverless: true)

## Potential Scenario Ideas

- "Multi-Tenant SaaS Platform": Each tenant needs isolated data with shared analytics. Tests understanding of database isolation patterns.
- "Real-Time Fraud Detection": Transaction events streamed through Kinesis, enriched with DynamoDB lookups, flagged in real time.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[04_S3]] (data lake storage layer)
- [[06_Serverless]] (DynamoDB, Athena are serverless)
- [[09_Billing_Pricing]] (on-demand vs. provisioned pricing)
- [[03_EC2]] (self-managed databases on EC2 as antipattern)
