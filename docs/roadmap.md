# CloudForge Cards Roadmap

## Current Version: v0.2.5 (Scoring Fairness Release)

The scoring engine is transparent, rule-based, and fair. Six sub-scores total 100 points with guardrails ensuring ideal architectures always score well.

---

## v0.2.6: Player Polish

Focus: Quality-of-life improvements, copy cleanup, and small UX wins.

- [ ] US English copy sweep (memorization, behavior, color, analyze, organize)
- [ ] Unique leaderboard names (reject duplicates)
- [ ] Suggested available names when a player name is already taken
- [ ] Optional audio toggle and classroom-friendly sound effects
- [ ] Service-card tooltips visible on hover/tap during gameplay
- [ ] Move "not core to scenario" feedback from "What You Got Right" into "What to Improve"
- [ ] Shareable result card (image or link format for social sharing)
- [ ] Persist player name to localStorage (no re-entry between sessions)
- [ ] Minor copy improvements based on playtest feedback
- [ ] Accessibility audit (keyboard navigation, screen reader labels)

### Future Account System (not in v0.2.6, documented for planning)

These features are candidates for a later version when AWS-native deployment is active:

- Guest scores expire after 168 hours (DynamoDB TTL can support this in a future AWS version)
- Registered users can save game history
- User profiles can show previous runs
- Cognito can support registered accounts in a future AWS version

---

## v0.3: Learning-Content Expansion

Focus: Transform CloudForge Cards from a game into a learning platform.

- [ ] Obsidian note integration (link game content to study notes)
- [ ] CLF Mode (scenarios scoped to Cloud Practitioner exam objectives)
- [ ] SAA Mode (scenarios scoped to Solutions Architect Associate depth)
- [ ] Add 10+ new service cards (Step Functions, CloudFormation, Config, GuardDuty, etc.)
- [ ] Add 5+ new scenarios covering additional architectural patterns
- [ ] More Professor Flock hints with keyword-based guidance
- [ ] Scenario difficulty levels (Easy, Medium, Hard) with visual indicators
- [ ] Post-round reflection prompts tied to CLF/SAA learning objectives
- [ ] Content pipeline automation (template for adding new scenarios)

---

## v0.4: AWS Deployment

Focus: Deploy to AWS using the same services the game teaches.

- [ ] Amplify or S3 plus CloudFront for frontend hosting
- [ ] API Gateway plus Lambda for backend (FastAPI via Mangum adapter)
- [ ] DynamoDB for leaderboard and game session storage
- [ ] Cognito for user authentication
- [ ] CloudWatch for logging and monitoring
- [ ] AWS Budgets for cost alerting
- [ ] CI/CD pipeline (GitHub Actions deploying to AWS)
- [ ] Custom domain with Route 53
- [ ] Migration guide: MongoDB to DynamoDB schema

---

## v0.5: Bedrock Enhancement

Focus: AI-powered personalization and content generation.

- [ ] AI-generated architecture review (Bedrock Claude or Titan)
- [ ] AI-generated practice scenarios based on player performance patterns
- [ ] Guardrails for safe educational feedback (no hallucinated services, no incorrect advice)
- [ ] Token and cost controls (per-player budget, response caching)
- [ ] Dynamic Professor Flock explanations powered by foundation models
- [ ] A/B testing: rule-based vs. AI commentary effectiveness
- [ ] Fallback to rule-based commentary when budget exceeded or Bedrock unavailable

---

## Future Ideas (Unscheduled)

These are ideas for consideration after v0.5 is stable:

- **Multiplayer mode:** Compete head-to-head on the same scenario
- **Challenge mode:** Pre-set difficult scenarios with community leaderboards
- **Service-card collection:** Unlock cards as you demonstrate mastery
- **Timed rounds:** Add time pressure for advanced players
- **Architecture diagram view:** Visual representation of the selected services and their connections
- **Mobile-optimized layout:** Touch-friendly card selection for phone/tablet
- **Community scenarios:** Allow players to submit and vote on scenarios
- **Integration with AWS Skill Builder:** Link learning paths to game content
- **Instructor dashboard:** Teachers can assign scenarios and track student progress
- **Export to draw.io/Lucidchart:** Convert selections into a shareable architecture diagram

---

## Version History

| Version | Name | Key Change |
|---------|------|-----------|
| v0.2.5 | Scoring Fairness Release | Transparent 6-sub-score engine, guardrails, synergy detection |
| v0.2.0 | Core Gameplay | Deal/score/leaderboard loop, 10 scenarios, 30 cards |
| v0.1.0 | Prototype | Initial game concept, basic scoring |
