# AWS Deployment Options

This document compares deployment paths for CloudForge Cards, from the fastest near-term option to the strongest AWS portfolio deployment.

## Important Clarifications

- **Amazon Bedrock is not the primary hosting platform for this app.** Bedrock is an AI/ML service for accessing foundation models. It should be used later for AI feedback, card generation, or Professor Flock explanations, not for hosting the application itself.
- **The fastest near-term deployment path is Emergent deployment when credits are available.** This requires no architectural changes.
- **The strongest AWS portfolio path is a later AWS-native deployment** using API Gateway, Lambda, DynamoDB, and related services. This demonstrates real cloud architecture skills.

---

## Option A: Emergent Deployment (Near-Term)

**Description:** Deploy via the Emergent platform when credits are available. The app is already structured for Emergent deployment (FastAPI backend, React frontend, MongoDB).

**Pros:**
- Zero architectural changes needed
- Fastest time to live demo
- Already tested locally with this stack
- Free tier credits cover initial hosting

**Cons:**
- Not an AWS-native deployment (less portfolio signal)
- Tied to Emergent platform availability and credit balance
- Does not demonstrate AWS deployment skills

**When to choose:** When you need a live demo link quickly for portfolio reviews or job applications.

**Status:** Blocked on credit availability. No code changes needed.

---

## Option B: GitHub Repo Plus Local Demo Instructions

**Description:** Public GitHub repository with clear README instructions for running locally. No hosted deployment.

**Pros:**
- Already done (this repo)
- Zero cost
- Full source code visible to reviewers
- Instructions in README.md

**Cons:**
- No live demo link to share
- Requires reviewers to clone and run locally
- Less impressive for non-technical audiences

**When to choose:** As the permanent fallback while waiting for deployment credits. Always maintain this option regardless of other deployments.

**Status:** Active. README includes local setup instructions.

---

## Option C: AWS Amplify Hosting (React Frontend Only)

**Description:** Deploy the React frontend to AWS Amplify Hosting (static site + CDN). Backend remains separate or is mocked with static data.

**Pros:**
- Simple setup (connect GitHub repo, auto-deploy on push)
- Free tier covers low traffic
- Demonstrates basic AWS deployment knowledge
- HTTPS and custom domain included
- CI/CD built in (deploy on merge to main)

**Cons:**
- Frontend only; needs a separate backend solution
- Limited portfolio signal (static hosting is straightforward)
- Would need to mock or proxy the backend API

**When to choose:** As a stepping stone toward full AWS deployment. Good for showing a live frontend while the backend deployment is in progress.

**Estimated cost:** Free tier for 12 months (1000 build minutes/month, 5 GB storage, 15 GB transfer).

---

## Option D: AWS-Native Full-Stack Deployment

**Description:** Full serverless deployment using AWS services that mirror the game's own content (demonstrating the services that players learn about).

**Architecture:**

```
CloudFront (CDN)
    |
    +--> S3 (React static assets)
    |
    +--> API Gateway (REST API)
            |
            v
         Lambda (Python, FastAPI via Mangum adapter)
            |
            v
         DynamoDB (leaderboard, game sessions)
            |
         Cognito (optional auth)
            |
         CloudWatch (logging, metrics)
```

**Components:**
| Service | Role | Monthly Cost Estimate |
|---------|------|----------------------|
| S3 | Static frontend hosting | < $1 |
| CloudFront | CDN for global delivery | < $1 (low traffic) |
| API Gateway | REST API front door | Free tier: 1M calls/month |
| Lambda | Backend compute | Free tier: 1M requests/month |
| DynamoDB | Leaderboard and game state | Free tier: 25 GB, 25 RCU/WCU |
| Cognito | User authentication | Free tier: 50,000 MAU |
| CloudWatch | Logging and monitoring | Free tier covers basics |
| AWS Budgets | Cost alerts | Free (first 2 budgets) |

**Pros:**
- Strongest portfolio signal (you built with the services you teach)
- Demonstrates real AWS architecture skills
- Extremely low cost within free tier
- Serverless: no infrastructure to manage
- Auto-scaling built in

**Cons:**
- More complex initial setup
- Requires migrating from MongoDB to DynamoDB (schema redesign)
- Cold start latency on Lambda (mitigatable with provisioned concurrency)
- Takes time to set up properly

**Migration notes:**
- Replace Motor/MongoDB with boto3 DynamoDB calls
- Wrap FastAPI with Mangum for Lambda compatibility
- Use S3 + CloudFront instead of a Node server for frontend
- Set up IAM roles for least-privilege access

**When to choose:** When you have time to invest in a portfolio-grade deployment that demonstrates the same services the game teaches.

---

## Option E: Bedrock-Enhanced Feedback (Future Add-on)

**Description:** Add Amazon Bedrock as an AI layer for enhanced game feedback. This is an add-on to Option D, not a standalone deployment option.

**Use cases for Bedrock in CloudForge Cards:**
- AI-generated architecture review (replace or supplement current Claude commentary)
- AI-generated practice scenarios based on player weaknesses
- Professor Flock explanations powered by a foundation model
- Dynamic hint generation based on player selections
- Card description generation for new services

**Architecture addition:**

```
Lambda (game scoring)
    |
    v
Bedrock (Claude or Titan model)
    |
    v
Response with AI-generated feedback
    |
Guardrails (content filtering, token limits)
```

**Important constraints:**
- Bedrock adds per-token cost; implement strict token budgets
- Use Bedrock Guardrails for safe educational content
- Cache common responses to reduce API calls
- Implement fallback to rule-based commentary if Bedrock fails or budget is exceeded
- This is an enhancement layer, not a core requirement for the game to function

**When to choose:** After Option D is stable and you want to add AI-powered personalization.

**Estimated cost:** Depends on traffic. At 100 games/day with ~500 tokens per response: approximately $2 to $5/month with Claude Haiku.

---

## Deployment Priority Order

1. **Now:** Option B (GitHub repo with local demo instructions) - already active
2. **When credits available:** Option A (Emergent deployment for quick live demo)
3. **Portfolio investment:** Option C (Amplify for frontend) as a stepping stone
4. **Full portfolio deployment:** Option D (AWS-native serverless full stack)
5. **Enhancement layer:** Option E (Bedrock feedback after Option D is stable)

---

## Cost Guardrails

Regardless of deployment option:
- Set up AWS Budgets with a $10/month alert threshold
- Enable Cost Explorer for visibility
- Use only free-tier-eligible services until the app has consistent traffic
- Never enable provisioned concurrency or reserved capacity without explicit cost analysis
