# CLF Knowledge Integration Plan

This document explains how AWS Cloud Practitioner (CLF-C02) concepts can be integrated into CloudForge Cards and the broader knowledge system.

## Overview

The AWS Cloud Practitioner certification covers foundational cloud concepts, AWS services, security, architecture, and pricing. CloudForge Cards transforms these concepts from passive study material into active, scenario-based learning. Each CLF topic can feed into multiple layers of the game and the supporting Obsidian knowledge graph.

## Integration Channels

### 1. Obsidian Evergreen Notes

Each CLF domain becomes a Map of Content (MOC) note with linked atomic concept notes.

**How it works:**
- One top-level MOC per CLF domain (e.g., `01_Cloud_Concepts.md`)
- Atomic notes for individual services, principles, or patterns
- Wiki-style `[[links]]` between related concepts
- Each note includes a "CloudForge Cards Integration" section connecting the concept to gameplay

**Example:**
A note on S3 would link to notes on durability, storage classes, lifecycle policies, and static website hosting, then note which CloudForge scenarios use S3 and which constraints S3 satisfies.

### 2. Service-Card Tooltips

Each AWS service card in the game has a one-line tooltip. CLF study content informs these tooltips by identifying the primary use case and differentiator for each service.

**Guidelines:**
- One sentence, action-oriented
- Highlight when a student should choose this service
- Avoid feature lists; focus on the "why" not the "what"

**Example:**
- Lambda: "Best for event-driven workloads, short tasks, glue between services."
- DynamoDB: "Low-latency single-digit ms reads, massive scale."

### 3. Professor Flock Hints

Professor Flock is the in-game mentor character who provides contextual hints during gameplay. CLF concepts inform these hints by connecting scenario requirements to service selection reasoning.

**Guidelines:**
- Hints should guide thinking, not give away the answer
- Reference CLF-level concepts (e.g., "Think about which storage type handles object data")
- Include 2 to 3 keywords that point toward relevant services

**Example:**
For the IoT Telemetry Pipeline scenario:
"Millions of small events per second land here. Stream first, then land in a data lake."
Keywords: streaming, data catalog, object storage

### 4. Scenario Constraints

CLF concepts about cost optimization, security best practices, high availability, and operational excellence directly map to the constraint chip system.

**Mapping:**
| CLF Concept | Constraint Chip | Scoring Impact |
|-------------|----------------|----------------|
| Cost Optimization | Low Cost | Rewards pay-per-use, free tier services |
| Reliability | High Availability | Rewards multi-AZ, failover, replicas |
| Operational Excellence | Observability | Rewards monitoring, logging services |
| Security | Secure | Rewards encryption, auth, least privilege |
| Performance Efficiency | Low Latency | Rewards caching, edge, in-memory services |

### 5. Ideal Architecture Combinations

CLF and SAA study content identifies well-architected patterns for common workloads. These become the `ideal_combos` in scenario seed data.

**Process:**
1. Identify a real-world workload pattern from CLF study material
2. Determine the textbook AWS services for that pattern
3. Define 2 to 3 valid ideal combinations (allowing for alternative approaches)
4. Tag core vs. supporting vs. distractor services

**Example:**
Static website hosting (CLF topic) becomes the "Personal Static Blog" scenario with ideal combo: S3 + CloudFront + Route 53.

### 6. Quiz or Reflection Prompts

After each round, the game can surface reflection questions drawn from CLF concepts. These reinforce learning without interrupting gameplay flow.

**Planned prompt types:**
- "Why might [service] be a better fit than [alternative] for this scenario?"
- "Which Well-Architected pillar does the [constraint] chip most closely align with?"
- "What would change in your design if the constraint were [different constraint]?"

These prompts can be stored as metadata in the scenario seed data and displayed in the post-round feedback panel.

### 7. Future CLF Mode and SAA Mode Content

**CLF Mode (planned for v0.3):**
- Scenarios limited to CLF-C02 exam scope
- Simpler architectures (3 to 4 services)
- Hints reference Cloud Practitioner exam objectives
- Scoring emphasizes correct service identification over complex patterns

**SAA Mode (planned for v0.3+):**
- Scenarios cover Solutions Architect Associate depth
- Complex multi-tier architectures (4 to 6 services)
- Emphasis on trade-offs, cost optimization, and resilience patterns
- Scoring rewards nuanced constraint handling and synergy detection

## Content Sourcing Principles

1. **Reference, do not copy.** External CLF study resources inform topic organization and coverage, but all game content uses original language.
2. **Synthesize, then contextualize.** Transform passive study facts into active scenario prompts and design challenges.
3. **Attribute when appropriate.** Credit study resource authors in documentation, not in game UI.
4. **Verify accuracy.** Cross-reference with official AWS documentation before committing content.

## Attribution

Study topic organization was informed by public learning resources, including the [kananinirav AWS Certified Cloud Practitioner Notes](https://github.com/kananinirav/AWS-Certified-Cloud-Practitioner-Notes) repository. All game content, explanations, and scenarios are original work.
