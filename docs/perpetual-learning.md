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
- Only cards tagged for that track are shown
- Content emphasis shifts to match the selected exam scope
- Progress is tracked per-track in localStorage

**Current tracks:**

| Track | Scope |
|-------|-------|
| CLF/SAA | Cloud Practitioner and Solutions Architect Associate foundations |
| AIF | AI Practitioner: generative AI and AI service fundamentals |
| MLA | ML Associate: data pipelines, model training, and deployment |
| Mixed | All cards from all tracks combined |

CLF/SAA has the strongest coverage. AIF and MLA tags are applied conservatively, only to services genuinely relevant to those exam domains.

---

## Planned: Test Mode (v0.3 Phase 2)

Test Mode will add active recall through multiple-choice and true/false questions.

**Key design decisions:**
- Questions generated from the service-card study content
- Answer keys stored server-side (not shipped to the browser)
- Track-filtered: same exam-track selector applies
- Professor Flock provides explanations for correct and incorrect answers
- Score tracking for test completions (separate from the game leaderboard)

---

## Planned: Match Mode (v0.3 Phase 3)

Match Mode will add pattern-matching exercises for active recall.

**Planned formats:**
- Match service names to descriptions
- Match services to use cases
- Fill-in-the-blank: complete a sentence about a service
- Timed and untimed variants

---

## Planned: Audio and Gamification Polish (v0.3 Phase 5)

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
