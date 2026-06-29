# CloudForge Cards Roadmap

## Current Version: v0.3 (Perpetual Learning, Learn Flashcards)

The app now includes the original 3-round AWS architecture game plus a Perpetual Learning hub with flashcard study mode and exam-track filtering.

---

## Completed Versions

### v0.2.5: Scoring Fairness Release (complete)

Transparent, rule-based scoring engine with six sub-scores totaling 100 points. Guardrails ensure ideal architectures always score well.

### v0.2.6: Mobile and Leaderboard Maintenance (complete)

Responsive mobile layout improvements, leaderboard maintenance, and player experience polish.

### v0.3 Phase 1: Learn Flashcards (complete)

- [x] Added `/learn` Perpetual Learning hub
- [x] Added `/learn/cards` Learn Flashcards mode
- [x] Added exam-track selector (CLF/SAA, AIF, MLA, Mixed)
- [x] Added service-card study metadata (use cases, pairings, anti-patterns, tips)
- [x] Added Professor Flock beta avatar
- [x] Added Known/Review local progress tracking
- [x] Made Certification Prep a filter layer across learning modes
- [x] Kept Test and Match as coming soon
- [x] Preserved existing game, scoring, and leaderboard

---

## v0.3 Phase 2: Test Mode (next)

Focus: Multiple-choice and true/false quiz mode with server-side grading.

- [ ] Question bank drawn from service-card study content
- [ ] Server-side answer validation (keys not shipped to browser)
- [ ] Track-filtered test sessions (CLF/SAA, AIF, MLA, Mixed)
- [ ] Score tracking for test completions
- [ ] Professor Flock explanations for correct/incorrect answers
- [ ] Review mode: resurface missed questions

---

## v0.3 Phase 3: Match / Fill in the Blank

Focus: Active recall through matching and typing exercises.

- [ ] Match mode: pair service names with descriptions or use cases
- [ ] Fill-in-the-blank mode: complete service descriptions from memory
- [ ] Timed and untimed variants
- [ ] Local progress integration with Learn progress

---

## v0.3 Phase 4: Certification Prep Expansion

Focus: Deepen AIF and MLA track coverage.

- [ ] Expand AIF-tagged content across relevant services
- [ ] Expand MLA-tagged content across data and model services
- [ ] Add track-specific scenario hints in Play mode
- [ ] Consider adding DEA (Data Engineer Associate) track

Note: Certification Prep is a filter layer across Learn, Test, and Match, not a standalone engine.

---

## v0.3 Phase 5: Audio and Gamification Polish

Focus: Multi-modal learning and engagement features.

- [ ] Audio pronunciations for service names
- [ ] Study streaks tracked in localStorage
- [ ] XP or mastery points for completing study sessions
- [ ] Visual progress indicators (cards mastered, track completion)
- [ ] Spaced repetition scheduling for Review cards

---

## v0.4: AWS Deployment

Focus: Deploy to AWS using the same services the game teaches.

- [ ] Amplify or S3 plus CloudFront for frontend hosting
- [ ] API Gateway plus Lambda for backend (FastAPI via Mangum adapter)
- [ ] DynamoDB for leaderboard, game sessions, and study progress
- [ ] Cognito for user authentication
- [ ] CloudWatch for logging and monitoring
- [ ] AWS Budgets for cost alerting
- [ ] CI/CD pipeline (GitHub Actions deploying to AWS)
- [ ] Custom domain with Route 53
- [ ] Migration guide: MongoDB to DynamoDB schema
- [ ] Server-side progress sync (replace localStorage approach)

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
- **Community scenarios:** Allow players to submit and vote on scenarios
- **Integration with AWS Skill Builder:** Link learning paths to game content
- **Instructor dashboard:** Teachers can assign scenarios and track student progress
- **Export to draw.io/Lucidchart:** Convert selections into a shareable architecture diagram

---

## Version History

| Version | Name | Key Change |
|---------|------|-----------|
| v0.3 | Perpetual Learning, Learn Flashcards | Learn hub, flashcards, exam tracks, Professor Flock avatar |
| v0.2.6 | Mobile and Leaderboard Maintenance | Responsive layout, leaderboard polish |
| v0.2.5 | Scoring Fairness Release | Transparent 6-sub-score engine, guardrails, synergy detection |
| v0.2.0 | Core Gameplay | Deal/score/leaderboard loop, 10 scenarios, 30 cards |
| v0.1.0 | Prototype | Initial game concept, basic scoring |
