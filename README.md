# CloudForge Cards

**Forge Your Cloud Mastery**

CloudForge Cards is a gamified AWS architecture trainer and study tool where learners practice AWS service selection, cloud architecture reasoning, and certification-aligned review through card gameplay, quizzes, flashcards, match exercises, read-aloud support, and shareable results.

## Live Demo

**Try it now:** [https://cloudforge-cards.emergent.host/](https://cloudforge-cards.emergent.host/)

No login required. Play a 3R, 5R, or 10R session, study with flashcards, take a quiz, try Match Mode, copy a shareable result, and land on the leaderboard.

## Repository

[https://github.com/ChieNwosu/cloudforge-cards](https://github.com/ChieNwosu/cloudforge-cards)

## Current Release

**CloudForge Cards v0.3.2: Phase 4B Shareable Result Cards and How to Play Refresh**

The latest stable release adds shareable result cards for Play, Test Mode, and Match / Fill Mode. It also refreshes the How to Play page for 3R, 5R, and 10R sessions, adds clearer accessibility guidance, and preserves the browser-native Professor Flock read-aloud system.

No scoring, grading, leaderboard, backend, schema, or certification-content changes were made in this release.

### What is new in v0.3.2

- Shareable result cards for Play, Test Mode, and Match / Fill Mode
- Copyable result summaries
- Optional native share support when supported by the browser
- Graceful fallback when clipboard or native share features are unavailable
- Refreshed How to Play page with 3R, 5R, and 10R session language
- Audio and Voice accessibility note added to How to Play
- README updated with live app link, project context, features, tech stack, and disclaimer
- Final contest-readiness polish completed

### What is new in v0.3.1

- Browser-native Professor Flock read-aloud using the Web Speech API
- Audio: On / Audio: Muted toggle with persistent mute preference
- Voice style toggle: Professor, Calm, and Default
- Persistent voice and mute preferences via localStorage
- Improved English voice selection with async voiceschanged handling
- Spoken-only text cleanup for exam codes, slash-heavy phrases, and markdown symbols
- Read-aloud wired into Play scenario prompts, architect commentary, Test Mode questions and review explanations, Match prompts and result explanations, and Learn Flashcards
- Safe warning-based error handling
- No scoring, grading, leaderboard, schema, or certification-content changes

### What is new in v0.3

**Phase 3:**

- Added `/learn/match` Match Mode with tap-to-place pipeline interactions
- Added server-side grading for Match exercises with partial credit
- Added review feedback and explanations for Match results
- Added scoring transparency for Simplicity / Overengineering sub-score
- Added explanation overflow bonus behavior
- Added 3R, 5R, and 10R Play modes
- Added per-mode leaderboard columns for 3R, 5R, and 10R sessions
- Added transparent Professor Flock avatar across the app
- Updated landing page with Play, Learn, Test, and Match positioning
- Removed outdated Best-of-3 session language

**Phase 2:**

- Added `/learn/test` Test Mode with 15-question quiz sessions
- Added server-side grading
- Added multiple choice, true/false, and scenario service-selection questions
- Added track-filtered quiz sessions for CLF/SAA, AIF, MLA, and Mixed
- Added final score screen with count-up animation
- Added review explanations and recommended review areas
- Added local best/latest score tracking per track
- Added Reinforce in Flashcards button linking missed topics back to Learn
- Updated landing page with v0.3 positioning and Learn/Test CTAs

**Phase 1:**

- Added `/learn` Perpetual Learning hub
- Added `/learn/cards` Learn Flashcards
- Added exam-track selector for CLF/SAA, AIF, MLA, and Mixed
- Added service-card study metadata
- Added Professor Flock beta avatar
- Added Known and Review local progress tracking
- Made Certification Prep a filter layer across learning content
- Preserved the original game, v0.2.5 scoring engine, final summary, and leaderboard

## Perpetual Learning

The Perpetual Learning mode is designed for repeat study outside the main game loop.

**Current modes:**

- **Learn Flashcards:** self-directed review with flip cards
- **Test Mode:** 15-question quizzes with server-side grading
- **Match Mode:** tap-to-place pipeline exercises with partial credit
- **Certification Prep:** active as a track filter across learning modes

## Certification Tracks

The Learn experience currently supports these study filters:

| Track | Coverage |
|-------|----------|
| CLF/SAA | Strongest coverage. Core foundation services. |
| AIF | Early beta. AI and generative AI services tagged where relevant. |
| MLA | Early beta. ML workflow services tagged where relevant. |
| Mixed | All cards from all tracks combined. |

CLF/SAA coverage is strongest. AIF and MLA coverage are early beta and will expand in later releases.

## Routes

| Route | Description |
|-------|-------------|
| `/play` | AWS architecture card game with 3R, 5R, or 10R sessions |
| `/learn` | Perpetual Learning hub |
| `/learn/cards` | Learn Flashcards |
| `/learn/test` | Test Mode with 15-question quizzes |
| `/learn/match` | Match Mode with tap-to-place pipeline exercises |
| `/leaderboard` | Per-mode leaderboard for 3R, 5R, and 10R scores |
| `/how-to-play` | Rules, scoring reference, and accessibility note |

## Features

- 33 AWS service cards across Compute, Storage, Database, Network, Security, Analytics, Integration, Monitoring, and AI
- 10 cloud architecture scenarios with varying difficulty
- 8 constraint chips that shape design decisions: Low Cost, High Availability, Serverless, Secure, Scalable, Beginner Friendly, Low Latency, and Observability
- Transparent rule-based scoring engine with six explainable sub-scores
- Explanation bonus with an overflow rule that banks extra points into the session total
- Synergy detection for common AWS service pairings
- Ideal architecture matching with fairness guardrails
- Perpetual Learning hub with Learn Flashcards, Test Mode, and Match Mode
- Expanded Certification Prep for CLF/SAA, AIF, MLA, DEA, and Mixed tracks
- DEA track support across Learn Hub, Flashcards, Test Mode, and Match Mode
- AIF, MLA, and DEA flashcard expansion with original concept cards
- AIF, MLA, and DEA Test Mode question expansion with server-side grading
- AIF, MLA, and DEA Match Mode prompt expansion with partial credit and review feedback
- Test Mode with server-side grading and review explanations
- Match Mode with tap-to-place pipeline exercises, partial credit, and review feedback
- 3R, 5R, and 10R Play session modes with per-mode leaderboard
- Exam-track filtering for CLF/SAA, AIF, MLA, DEA, and Mixed
- Professor Flock transparent avatar for guided learning
- Browser-native Professor Flock read-aloud with voice style selection
- Shareable result cards with copyable summaries
- Optional native share support when available
- Optional LLM-powered commentary through Claude for personalized feedback
- Leaderboard with persistent high scores
- Dark theme Cloud Lab UI with tactile card interactions
- Mobile-friendly experience

## Gameplay Overview

1. **Choose Mode:** Select a session length: 3 rounds, 5 rounds, or 10 rounds.
2. **Deal Phase:** Each round gives you a scenario prompt, constraint chips, and a hand of service cards. The hand always contains at least one ideal architecture combination.
3. **Build Phase:** Select 3 to 6 service cards to build your architecture. Consider the scenario requirements and active constraints.
4. **Explain Phase:** Optionally write a short rationale for your design choices for up to 5 bonus points.
5. **Score Phase:** The engine evaluates your selection across six dimensions and provides a detailed breakdown plus commentary.
6. **Session Summary:** Your total score across all rounds can be saved to the per-mode leaderboard.
7. **Share Result:** Copy or share a result summary after Play, Test Mode, or Match Mode.

## Scoring Overview

The scoring engine evaluates each round on a 100-point scale across six sub-scores:

| Sub-Score | Max Points | What It Measures |
|-----------|------------|------------------|
| Correct Service Selection | 30 | Are the chosen services appropriate for the scenario? |
| Ideal Architecture Match | 25 | How close is the design to a known ideal architecture? |
| Constraint Alignment | 20 | How well does the design satisfy active constraints? |
| Synergy Bonus | 15 | Does the design use strong AWS service pairings? |
| Simplicity / Overengineering | 10 | Is the design right-sized without unnecessary bloat? |
| Explanation Bonus | 5 | Does the learner provide a relevant written rationale? |

**Rating tiers:**

- 86+: Well-Architected
- 71-85: Production Candidate
- 51-70: Partial Fit
- 31-50: Needs Refactor
- 0-30: Broken Architecture

**Fairness guardrails:**

- A full ideal match with no distractors scores at least 85.
- A full ideal match with one reasonable extra service scores at least 78.
- Round scores are capped at 100.
- Explanation bonus points beyond 100 are banked as overflow bonus and added to the final session total.

## Screenshots

Screenshots are stored in [`docs/screenshots`](docs/screenshots/README.md).

Current screenshot sets:

- [`v0.2.5 deployed game screenshots`](docs/screenshots/v0.2.5/)
- [`v0.3 Learn Flashcards screenshots`](docs/screenshots/v0.3/README.md)

### Landing Page

![Landing Page](docs/screenshots/v0.2.5/landing-page.png)

### Round 1: Play Screen

![Round 1 Play Screen](docs/screenshots/v0.2.5/round-1-play-screen.png)

### Score Breakdown

![Round 1 Score Breakdown](docs/screenshots/v0.2.5/round-1-score-breakdown.png)

### Final Game Summary

![Final Game Summary](docs/screenshots/v0.2.5/final-game-summary.png)

### Leaderboard

![Leaderboard](docs/screenshots/v0.2.5/leaderboard.png)

These screenshots show a manual QA solo run used to verify gameplay, scoring behavior, final summary, and leaderboard flow. The different scores are test examples across scenarios and should not be interpreted as a formal assessment of the creator's AWS knowledge.

See the [full screenshot set in docs/screenshots](docs/screenshots).

## Tech Stack

**Backend:**

- Python 3.11+
- FastAPI
- MongoDB via Motor async driver
- Pydantic v2 for data validation
- Optional emergentintegrations and Claude Sonnet for LLM commentary

**Frontend:**

- React 19
- Tailwind CSS 3.4
- Radix UI primitives through shadcn/ui
- Framer Motion for animations
- Axios and TanStack React Query for data fetching
- CRACO build configuration
- Web Speech API for browser-native read-aloud
- Clipboard API and navigator.share for result sharing where supported

## Local Setup Instructions

### Prerequisites

- Python 3.11 or later
- Node.js 18+ and Yarn
- MongoDB instance, local or cloud

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=cloudforge_cards
CORS_ORIGINS=http://localhost:3000
# Optional: EMERGENT_LLM_KEY=your_key_here
EOF

uvicorn server:app --reload --port 8000

See [docs/testing.md](docs/testing.md) for the full QA checklist and known issues.

### Frontend

```bash
cd frontend
yarn test
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full version plan.


## Project Structure

```
cloudforge-cards/
  backend/
    server.py          # FastAPI application and routes
    game_engine.py     # v0.2.5 scoring engine (6 sub-scores)
    learn_content.py   # v0.3 Learn mode content and study metadata
    seed_data.py       # Service cards, scenarios, constraints, synergies
    commentary.py      # LLM commentary layer (Claude Sonnet)
    tests/             # Backend test suite
  frontend/
    src/
      App.js           # Main application router
      components/      # React components (ServiceCard, ScoreBreakdown, FlockAvatar, Nav, etc.)
      pages/           # Page components (Play, LearnHub, LearnCards, Leaderboard, etc.)
    public/            # Static assets (including Professor Flock avatar)
  docs/                # Documentation
  obsidian-export/     # Starter Obsidian notes for AWS CLF study
```

## Documentation

- [Style Guide](docs/style-guide.md)
- [Roadmap](docs/roadmap.md)
- [Testing](docs/testing.md)
- [Perpetual Learning](docs/perpetual-learning.md)
- [v0.3.1 Release Notes](docs/release-notes/v0.3.1.md)
- [v0.3 Release Notes](docs/release-notes/v0.3.md)
- [AWS Deployment Options](docs/aws-deployment-options.md)
- [CLF Knowledge Integration](docs/clf-knowledge-integration.md)
- [Content Pipeline](docs/content-pipeline.md)
- [Release Notes: v0.2.5](docs/release-notes/v0.2.5.md)
- [Screenshots](docs/screenshots/README.md)

## Disclaimer

Student-built educational AWS learning project.

Unofficial educational project. Not affiliated with Amazon Web Services.

## Attribution

Some AWS Cloud Practitioner study organization was informed by public learning resources, including the [kananinirav AWS Certified Cloud Practitioner Notes](https://github.com/kananinirav/AWS-Certified-Cloud-Practitioner-Notes) repository, but CloudForge Cards uses original synthesized explanations, scenarios, and game content.

## License

This project is for educational and portfolio purposes.
