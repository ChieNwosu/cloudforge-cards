# CloudForge Cards Roadmap

## Current Version: v0.3.1 Phase 4A (Audio Polish Patch)

The app now includes the original AWS architecture game with 3R/5R/10R session modes, the full Perpetual Learning suite (Learn Flashcards, Test Mode, Match Mode), per-mode leaderboard, and browser-native Professor Flock read-aloud with voice style selection.

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

---

## Forward Roadmap

### v0.3.2 or v0.4.0: Shareable Result Cards (next)

Focus: Social sharing and portfolio visibility.

* [ ] Generate shareable result card after Play session (image or link format)
* [ ] Include session score, rating, round count, and date
* [ ] Copy-to-clipboard and download options
* [ ] Optional Professor Flock commentary on the card
* [ ] Open Graph meta tags for link previews

### Phase 5A: Study Streaks and XP Lite

Focus: Lightweight gamification to encourage daily practice.

* [ ] Daily study streak counter tracked in localStorage
* [ ] XP points awarded for completing Learn, Test, and Match sessions
* [ ] Visual streak indicator on the Learn hub
* [ ] Streak-break warning and recovery grace period
* [ ] No server-side account required (localStorage only for now)

### Phase 5B: Mastery and Spaced Repetition

Focus: Intelligent review scheduling based on performance.

* [ ] Spaced repetition scheduling for flashcard Review queue
* [ ] Mastery percentage per service card (based on Test and Match performance)
* [ ] Visual progress indicators (cards mastered, track completion)
* [ ] "Weak areas" surfacing based on repeated incorrect answers
* [ ] Integration with Test Mode to prioritize weak-area questions

### Later: AIF, MLA, and Possible DEA Content Expansion

Focus: Deepen non-CLF certification track coverage.

* [ ] Expand AIF-tagged content across AI and generative AI services
* [ ] Expand MLA-tagged content across data pipeline and model services
* [ ] Consider adding DEA (Data Engineer Associate) track
* [ ] Add track-specific scenario hints and questions
* [ ] Community feedback on which tracks to prioritize

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
| v0.3.1 | Phase 4A Audio Polish Patch | Browser-native Professor Flock read-aloud, voice style toggle, mute persistence |
| v0.3 P3 | Match Mode, Round Modes, Scoring Transparency | Match mode, 3R/5R/10R play, per-mode leaderboard, transparent Flock |
| v0.3 P2 | Perpetual Learning: Test Mode | 15-question quizzes, server-side grading, review explanations |
| v0.3 P1 | Perpetual Learning: Learn Flashcards | Learn hub, flashcards, exam tracks, Professor Flock avatar |
| v0.2.6 | Mobile and Leaderboard Maintenance | Responsive layout, leaderboard polish |
| v0.2.5 | Scoring Fairness Release | Transparent 6-sub-score engine, guardrails, synergy detection |
| v0.2.0 | Core Gameplay | Deal/score/leaderboard loop, 10 scenarios, 30 cards |
| v0.1.0 | Prototype | Initial game concept, basic scoring |
