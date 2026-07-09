# CloudForge Cards Roadmap

## Current Version: v0.4.2 (Track-Aware AWS Learning Platform)

The app now includes track-aware Play (CLF/SAA, AIF, MLA, DEA, Mixed), 60 service cards, 38 scenarios, 3R/5R/10R sessions, the full Perpetual Learning suite, shareable results, XP/streaks/mastery/spaced review, Professor Flock read-aloud, and per-mode leaderboard. Submitted to the Emergent Builder's Contest.

---

## Completed Versions

### v0.2.5: Scoring Fairness Release (complete)

Transparent, rule-based scoring engine with six sub-scores totaling 100 points. Guardrails ensure ideal architectures always score well.

### v0.2.6: Mobile and Leaderboard Maintenance (complete)

Responsive mobile layout improvements, leaderboard maintenance, and player experience polish.

Completed highlights:

* Mobile Play page responsiveness
* US English copy sweep
* Unique official leaderboard save behavior
* Suggested available names when a player name is already taken
* Safe local score deletion
* Professor Flock greeting
* Mobile filter scroll affordance
* Play page text wrapping fixes
* Player name persistence through localStorage

### v0.3 Phase 1: Learn Flashcards (complete)

* [x] Added `/learn` Perpetual Learning hub
* [x] Added `/learn/cards` Learn Flashcards mode
* [x] Added exam-track selector (CLF/SAA, AIF, MLA, Mixed)
* [x] Added service-card study metadata (use cases, pairings, anti-patterns, tips)
* [x] Added Professor Flock beta avatar
* [x] Added Known/Review local progress tracking
* [x] Made Certification Prep a filter layer across learning modes
* [x] Kept Test and Match as coming soon
* [x] Preserved existing game, scoring, and leaderboard

### v0.3 Phase 2: Test Mode (complete)

- [x] Added `/learn/test` with 15-question quiz sessions
- [x] Server-side grading (answer keys never shipped to browser)
- [x] Three question types: multiple choice, true/false, scenario service-selection
- [x] Track-filtered test sessions (CLF/SAA, AIF, MLA, Mixed)
- [x] Final score screen with count-up animation
- [x] Review explanations and recommended review areas
- [x] Local best/latest score tracking per track
- [x] "Reinforce in Flashcards" button linking missed topics to Learn
- [x] Updated landing page with v0.3 positioning and Learn/Test CTAs

### v0.3 Phase 3: Match Mode, Round Modes, Scoring Transparency (complete)

- [x] Added `/learn/match` Match Mode with tap-to-place pipeline interactions
- [x] Server-side grading for Match exercises with partial credit
- [x] Review feedback and explanations for Match results
- [x] Added 3R, 5R, and 10R Play session modes
- [x] Per-mode leaderboard columns for 3R, 5R, and 10R
- [x] Scoring transparency for Simplicity / Overengineering sub-score
- [x] Explanation overflow bonus behavior (long explanations earn full 5 points)
- [x] Transparent Professor Flock avatar (PNG) across the app
- [x] Updated landing page: Play, Learn, Test, Match positioning
- [x] Removed outdated "Best-of-3 sessions" language

### v0.3.1 Phase 4A: Audio Polish Patch (complete)

- [x] Browser-native Professor Flock read-aloud using Web Speech API
- [x] Audio: On / Audio: Muted toggle in nav (desktop and mobile)
- [x] Persistent mute preference (localStorage key: cloudforge_audio_muted)
- [x] Voice style toggle: Professor, Calm, and Default
- [x] Persistent voice style preference (localStorage key: cloudforge_voice_style)
- [x] Improved English voice selection with async voiceschanged handling
- [x] Spoken-only text cleanup for exam codes, slashes, markdown, whitespace, label pauses
- [x] Read-aloud wired into: Play scenarios, commentary, Test questions, Test review, Match prompts, Match explanations, Learn Flashcards (front and back)
- [x] Safe warning-based error handling (no crashes if speech unavailable)
- [x] No external TTS APIs, no generated audio files, no backend audio routes
- [x] No scoring, grading, leaderboard, schema, or certification-content changes

### v0.3.2 Phase 4B: Shareable Result Cards (complete)

- [x] Shareable result cards for Play, Test Mode, and Match / Fill Mode
- [x] Copyable result summaries
- [x] Optional native share support when supported by the browser
- [x] Refreshed How to Play page with 3R, 5R, 10R language and accessibility note

### v0.4.1 Phase 5B Pass A: Study Progress, XP, Mastery, Spaced Review (complete)

- [x] Local-only XP, daily streaks, levels, card mastery, and spaced review
- [x] Due Today, New, Review, Known, and Mastered flashcard filters
- [x] Visual progress indicators on Learn Hub
- [x] No backend, DB schema, leaderboard, or auth changes

### v0.4.2 Phase 5C: Track-Aware Play and Domain Scenarios (complete)

- [x] Track-aware Play mode: CLF/SAA, AIF, MLA, DEA, and Mixed
- [x] 60 service cards (expanded from 33) across 11 categories
- [x] 38 Play scenarios (expanded from 10) with domain-specific content
- [x] DEA (Data Engineer Associate) track support across all modes
- [x] AIF, MLA, and DEA flashcard, Test, and Match content expansion
- [x] Learn Flashcards deck isolated from Play expansion cards
- [x] Game card pool expanded for Play only
- [x] No scoring engine, leaderboard schema, or database schema changes
- [x] Submitted to the Emergent Builder's Contest

---

## Post-Contest Forward Roadmap

### Landing Stats and Screenshot Refresh (immediate)

* [ ] Update landing page hero stats to show 60 service cards and 38 scenarios
* [ ] Capture fresh screenshots reflecting v0.4.2 state
* [ ] Replace stale landing screenshot in README

### Per-Track Readiness Analytics

* [ ] Dashboard or summary showing content coverage per track
* [ ] Identify gaps in AIF, MLA, and DEA question/scenario coverage
* [ ] Guide future content authoring priorities

### Optional Downloadable Share Card Image

* [ ] Generate a PNG share card (canvas or server-side rendering)
* [ ] Include score, rating, track, round count, and date
* [ ] Download button alongside the existing copy/share flow

### Code Quality and Technical Debt

* [ ] Refactor Play.jsx (extract hooks, card selection, round management)
* [ ] Refactor LearnCards.jsx (extract filters, progress, deck logic)
* [ ] Hook dependency audit and cleanup
* [ ] Dockerized local development environment
* [ ] Architecture diagram and code tour documentation

### Optional AWS-Native Deployment

* [ ] Amplify or S3 plus CloudFront for frontend
* [ ] API Gateway plus Lambda for backend
* [ ] DynamoDB for leaderboard and progress
* [ ] Cognito for authentication
* [ ] CloudWatch logging
* [ ] AWS Budgets alerting

### Optional Authentication (Future)

* [ ] Guest mode with localStorage scores
* [ ] Registered profiles with server-side progress sync
* [ ] Cognito or third-party auth integration
* [ ] Score history and progress over time

### Optional Kiro-Assisted Architecture Documentation

* [ ] System context diagram
* [ ] Component relationship map
* [ ] Data flow diagram for scoring, grading, and progress
* [ ] API contract documentation

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
| v0.4.2 | Track-Aware AWS Learning Platform | Track-aware Play, 60 cards, 38 scenarios, DEA track, contest submission |
| v0.4.1 | Study Progress, XP, Mastery, Spaced Review | Local XP, streaks, levels, mastery, Due Today filters |
| v0.3.2 | Shareable Result Cards | Play/Test/Match share cards, How to Play refresh |
| v0.3.1 | Phase 4A Audio Polish Patch | Browser-native Professor Flock read-aloud, voice style toggle, mute persistence |
| v0.3 P3 | Match Mode, Round Modes, Scoring Transparency | Match mode, 3R/5R/10R play, per-mode leaderboard, transparent Flock |
| v0.3 P2 | Perpetual Learning: Test Mode | 15-question quizzes, server-side grading, review explanations |
| v0.3 P1 | Perpetual Learning: Learn Flashcards | Learn hub, flashcards, exam tracks, Professor Flock avatar |
| v0.2.6 | Mobile and Leaderboard Maintenance | Responsive layout, leaderboard polish |
| v0.2.5 | Scoring Fairness Release | Transparent 6-sub-score engine, guardrails, synergy detection |
| v0.2.0 | Core Gameplay | Deal/score/leaderboard loop, 10 scenarios, 30 cards |
| v0.1.0 | Prototype | Initial game concept, basic scoring |
