# Perpetual Learning

## Purpose

Perpetual Learning extends CloudForge Cards beyond the 3-round game into a repeat-study experience. Players can review AWS service cards at their own pace, track what they know, and prepare for certification exams without the time pressure of scored rounds.

The goal: make it easy to pick up the app for five minutes of study between classes, during a commute, or before bed, and make incremental progress toward cloud mastery.

---

## Learn Mode Overview

Learn Mode is the first Perpetual Learning experience, launched in v0.3 Phase 1.

**Route:** `/learn/cards`

**What it does:**
- Displays all service cards as flip-style flashcards
- Front shows the service name, category icon, and difficulty indicator
- Back shows a rich study view: description, use cases, common pairings, anti-patterns, study tip, exam tracks, and flashcard Q&A content
- Players mark cards as Known or Review to track their progress
- Search and category filters narrow the card deck
- Exam-track selector filters cards by certification relevance

**Design principle:** The Learn experience does not grade or penalize. It is purely for self-directed review.

---

## Certification Prep as a Filter Layer

Certification Prep is not a separate engine or standalone mode. It is a filter layer that works across all learning modes (Learn, Test, and Match).

When a learner selects a track:
- Only cards and questions tagged for that track are shown
- Content emphasis shifts to match the selected exam scope
- Progress and scores are tracked per-track in localStorage

**Current tracks:**

| Track | Scope |
|-------|-------|
| CLF/SAA | Cloud Practitioner and Solutions Architect Associate foundations |
| AIF | AI Practitioner: generative AI and AI service fundamentals |
| MLA | ML Associate: data pipelines, model training, and deployment |
| Mixed | All cards from all tracks combined |

CLF/SAA has the strongest coverage. AIF and MLA tags are applied conservatively, only to services genuinely relevant to those exam domains.

---

## Test Mode (v0.3 Phase 2, complete)

Test Mode adds active recall through multiple-choice, true/false, and scenario service-selection questions.

**Key design decisions:**
- Questions generated from the service-card study content
- Answer keys stored server-side (not shipped to the browser)
- Track-filtered: same exam-track selector applies
- Review explanations for correct and incorrect answers
- Score tracking for test completions (separate from the game leaderboard)

---

## Test Mode Overview

Test Mode is the second Perpetual Learning experience, launched in v0.3 Phase 2.

**Route:** `/learn/test`

**What it does:**
- Generates a 15-question quiz session from the service-card question bank
- Questions include multiple choice, true/false, and scenario service-selection formats
- Each question is graded server-side (the frontend never receives answer keys)
- After completing all 15 questions, a final score screen shows a count-up animation
- Review explanations are available for every question (both correct and incorrect)
- Recommended review areas highlight weak topics based on missed questions
- A "Reinforce in Flashcards" button links missed topics back to `/learn/cards`
- Local best and latest scores are tracked per track in localStorage

**Design principle:** Test Mode provides active recall with immediate feedback. It grades but does not penalize: learners can retake quizzes freely and track improvement over time.

### Server-Side Grading

Answer keys are never shipped to the browser. The grading flow:

1. Frontend requests a quiz session from `GET /api/learn/test/start?track=CLF_SAA`
2. The server returns 15 questions with answer options but no correct-answer indicators
3. For each answer, the frontend POSTs to `/api/learn/test/grade`
4. The server returns whether the answer was correct, the correct answer, and an explanation

This design ensures players cannot inspect the page source or network traffic to find answers before submitting.

### Score Tracking

- Best and latest scores are stored per track in localStorage
- Scores are displayed on the Test Mode start screen for motivation
- Scores are separate from the game leaderboard (Test Mode does not post to the leaderboard)
- A future account system will enable server-side score persistence

---

## Match Mode (v0.3 Phase 3, complete)

Match Mode is the third Perpetual Learning experience, launched in v0.3 Phase 3.

**Route:** `/learn/match`

**What it does:**
- Presents architecture pipeline exercises where players tap to place services in the correct order
- Each exercise represents a real-world architecture pattern (e.g., "Build a serverless API pipeline")
- Players select services in sequence using tap-to-place interactions
- Server-side grading evaluates submissions with partial credit for partially correct pipelines
- Review feedback explains what was correct, what was missed, and why
- Track-filtered exercises match the selected certification track

**Design principle:** Match Mode bridges the gap between passive learning (flashcards) and full scenario gameplay. It tests service ordering and pipeline thinking without requiring the full complexity of the 3-to-6 card architecture game.

### How Match Complements Learn and Test

| Mode | Skill Practiced | Cognitive Level |
|------|----------------|-----------------|
| Learn Flashcards | Recognition and recall of individual services | Remember |
| Test Mode | Comprehension of service roles and use cases | Understand |
| Match Mode | Application of services in correct pipeline order | Apply |
| Play Mode | Analysis and synthesis of full architectures | Analyze/Create |

The four modes form a progression from passive review to active architecture design. Players can move freely between them based on their confidence level and study goals.

### Server-Side Grading with Partial Credit

Match Mode uses server-side grading similar to Test Mode, but adds partial credit:
- Full credit for a perfectly ordered pipeline
- Partial credit for pipelines with some services in the correct position
- Zero credit only for completely incorrect orderings
- Review feedback always explains the expected pipeline and why each service belongs in its position

---

## Planned: Audio and Gamification Polish (v0.3 Phase 4/5)

- Audio pronunciations for service names (accessibility and multi-modal learning)
- Study streaks tracked locally
- XP or mastery points for session completions
- Visual progress indicators (cards mastered, track completion percentage)
- Spaced repetition scheduling for Review cards

---

## Local-Only Progress Approach

In v0.3, all study progress is stored in the browser's localStorage under the key `cf_learn_progress`.

**Why localStorage:**
- No account system exists yet
- Zero friction for new users (no sign-up required)
- Fast reads and writes with no network latency
- Acceptable trade-off for a portfolio-stage project

**Limitations:**
- Progress does not sync across devices or browsers
- Clearing browser data resets all progress
- No analytics on study patterns

---

## Future: Account System Direction

When the app moves to AWS-native deployment (v0.4), study progress will migrate to server-side storage:
- DynamoDB table for per-user progress records
- Cognito authentication for user identity
- Migration path: export localStorage progress on first login, merge with server state
- Offline-first design: write to localStorage immediately, sync to server in background

---

## Professor Flock's Role

Professor Flock is the in-game learning companion, appearing across both Play and Learn modes.

**Current (v0.3):**
- Static beta avatar displayed on the Learn hub and alongside flashcard content
- Provides pre-authored hints in Play mode scenarios

**Future:**
- AI-generated explanations for Test Mode answers (Bedrock integration in v0.5)
- Dynamic flashcard narration
- Personalized study recommendations based on progress patterns
- Encouraging messages when streaks are maintained

Professor Flock's persona: friendly, knowledgeable, encouraging, never condescending. Speaks like a senior cloud architect mentoring a motivated student.
