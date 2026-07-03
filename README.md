# CloudForge Cards

**Forge Your Cloud Mastery**

CloudForge Cards is a gamified AWS architecture trainer and study tool where learners practice AWS service selection, cloud architecture reasoning, and certification-aligned review through card gameplay and flashcards.

---

## Live Demo

**Try it now:** [https://cloudforge-cards.emergent.host/](https://cloudforge-cards.emergent.host/)

No login required. Play a 3R, 5R, or 10R session, study with flashcards, take a quiz, try Match Mode, and land on the leaderboard.

---

## Current Release

**CloudForge Cards v0.3.1: Phase 4A Audio Polish Patch**

The latest stable release adds browser-native Professor Flock read-aloud across all learning and gameplay modes. No external TTS APIs, no generated audio files, no backend audio routes.

### What is new in v0.3.1

- Browser-native Professor Flock read-aloud using Web Speech API
- Audio: On / Audio: Muted toggle with persistent mute preference
- Voice style toggle: Professor, Calm, and Default
- Persistent voice and mute preferences via localStorage
- Improved English voice selection with async voiceschanged handling
- Spoken-only text cleanup for exam codes, slash-heavy phrases, and markdown symbols
- Read-aloud wired into: Play scenario prompts, architect commentary, Test Mode questions and review explanations, Match prompts and result explanations, and Learn Flashcards (front and back)
- Safe warning-based error handling (no crashes if speech synthesis is unavailable)
- No scoring, grading, leaderboard, schema, or certification-content changes

### What is new in v0.3

**Phase 3 (latest):**

- Added `/learn/match` Match Mode with tap-to-place pipeline interactions
- Added server-side grading for Match exercises with partial credit
- Added review feedback and explanations for Match results
- Added scoring transparency for Simplicity / Overengineering sub-score
- Added explanation overflow bonus behavior (long explanations always earn full 5 points)
- Added 3R, 5R, and 10R Play modes (choose session length before starting)
- Added per-mode leaderboard columns for 3R, 5R, and 10R sessions
- Added transparent Professor Flock avatar (PNG with transparency) across the app
- Updated landing page with Play, Learn, Test, and Match positioning
- Removed outdated "Best-of-3 sessions" language from landing page

**Phase 2:**

- Added `/learn/test` Test Mode with 15-question quiz sessions
- Added server-side grading (answer keys never shipped to the browser)
- Added multiple choice, true/false, and scenario service-selection questions
- Added track-filtered quiz sessions (CLF/SAA, AIF, MLA, Mixed)
- Added final score screen with count-up animation
- Added review explanations and recommended review areas
- Added local best/latest score tracking per track
- Added "Reinforce in Flashcards" button linking missed topics back to Learn
- Updated landing page with v0.3 positioning and Learn/Test CTAs

**Phase 1:**

- Added `/learn` Perpetual Learning hub
- Added `/learn/cards` Learn Flashcards (Quizlet-style flip cards)
- Added exam-track selector for CLF/SAA, AIF, MLA, and Mixed
- Added service-card study metadata (use cases, common pairings, anti-patterns, study tips)
- Added Professor Flock beta avatar
- Added Known and Review local progress tracking
- Made Certification Prep a filter layer across learning content
- Preserved the original 3-round game, v0.2.5 scoring engine, final summary, and leaderboard

### Perpetual Learning

The Perpetual Learning mode is designed for repeat study outside the main game loop.

**Current modes:**

- **Learn Flashcards:** live (self-directed review with flip cards)
- **Test Mode:** live (15-question quizzes with server-side grading)
- **Match Mode:** live (tap-to-place pipeline exercises with partial credit)
- **Certification Prep:** active as a track filter across all learning modes (not a separate engine)

### Certification Tracks

The Learn experience currently supports these study filters:

| Track | Coverage |
|-------|----------|
| CLF/SAA | Strongest coverage. Core foundation services. |
| AIF | Early beta. AI and generative AI services tagged where relevant. |
| MLA | Early beta. ML workflow services tagged where relevant. |
| Mixed | All cards from all tracks combined. |

CLF/SAA coverage is strongest. AIF and MLA coverage are early beta and will expand in later releases.

### Routes

| Route | Description |
|-------|-------------|
| `/play` | AWS architecture card game (3R, 5R, or 10R sessions) |
| `/learn` | Perpetual Learning hub |
| `/learn/cards` | Learn Flashcards |
| `/learn/test` | Test Mode (15-question quizzes) |
| `/learn/match` | Match Mode (tap-to-place pipeline exercises) |
| `/leaderboard` | Per-mode leaderboard (3R, 5R, 10R columns) |
| `/how-to-play` | Rules and scoring reference |

### Release Notes

See [`docs/release-notes/v0.3.md`](docs/release-notes/v0.3.md) for the full v0.3 changelog.

## Screenshots

Screenshots are stored in [`docs/screenshots`](docs/screenshots/README.md).

Current screenshot sets:

* [`v0.2.5 deployed game screenshots`](docs/screenshots/v0.2.5/)
* [`v0.3 Learn Flashcards screenshots`](docs/screenshots/v0.3/README.md)

The v0.3 screenshot folder currently contains placeholders for Learn hub and Learn Flashcards captures. Add live app screenshots after capturing them from the deployed build.

## Features

* 33 AWS service cards across 9 categories: Compute, Storage, Database, Network, Security, Analytics, Integration, Monitoring, AI
* 10 real-world cloud architecture scenarios with varying difficulty
* 8 constraint chips that shape design decisions: Low Cost, High Availability, Serverless, Secure, Scalable, Beginner Friendly, Low Latency, Observability
* Transparent rule-based scoring engine with six explainable sub-scores
* Synergy detection for well-known AWS service pairings
* Ideal architecture matching with guardrails for fairness
* Perpetual Learning hub with Learn Flashcards, Test Mode, and Match Mode
* Test Mode: 15-question quizzes with server-side grading and review explanations
* Match Mode: tap-to-place pipeline exercises with partial credit and review feedback
* 3R, 5R, and 10R Play session modes with per-mode leaderboard
* Exam-track filtering: CLF/SAA, AIF, MLA, Mixed
* Professor Flock transparent avatar for guided learning
* Browser-native Professor Flock read-aloud with voice style selection
* Optional LLM-powered commentary through Claude for personalized feedback
* Leaderboard with persistent high scores
* Dark theme Cloud Lab UI with tactile card interactions


## Gameplay Overview

1. **Choose Mode:** Select a session length: 3 rounds (3R), 5 rounds (5R), or 10 rounds (10R).
2. **Deal Phase:** Each round, you receive a scenario prompt, constraint chips, and a hand of service cards. The hand always contains at least one ideal architecture combination.
3. **Build Phase:** Select 3 to 6 service cards to build your architecture. Consider the scenario requirements and active constraints.
4. **Explain Phase:** Optionally write a short rationale for your design choices (up to +5 bonus points).
5. **Score Phase:** The engine evaluates your selection across six dimensions and provides a detailed breakdown plus commentary.
6. **Session:** Your total score across all rounds lands on the per-mode leaderboard (3R, 5R, or 10R column).

## Screenshots

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

---

## Scoring Overview

The scoring engine (v0.2.5) evaluates each round on a 100-point scale across six sub-scores:

| Sub-Score | Max Points | What It Measures |
|-----------|-----------|-----------------|
| Correct Service Selection | 30 | Are the chosen services appropriate for the scenario? |
| Ideal Architecture Match | 25 | How close to a known textbook architecture? |
| Constraint Alignment | 20 | How well does the design satisfy active constraints? |
| Synergy Bonus | 15 | Bonus for well-known AWS service pairings |
| Simplicity / Overengineering | 10 | Right number of services, no bloat |
| Explanation Bonus | 5 | Clear written design rationale |

**Rating tiers:**
- 86+: Well-Architected
- 71-85: Production Candidate
- 51-70: Partial Fit
- 31-50: Needs Refactor
- 0-30: Broken Architecture

**Fairness guardrails:** A full ideal match with no distractors scores at least 85. A full ideal match with one reasonable extra service scores at least 78.

## Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- MongoDB (via Motor async driver)
- Pydantic v2 for data validation
- Optional: emergentintegrations + Claude Sonnet for LLM commentary

**Frontend:**
- React 19
- Tailwind CSS 3.4
- Radix UI primitives (via shadcn/ui)
- Framer Motion for animations
- Axios + TanStack React Query for data fetching
- CRACO build configuration

## Local Setup Instructions

### Prerequisites

- Python 3.11 or later
- Node.js 18+ and Yarn
- MongoDB instance (local or cloud)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with required variables
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=cloudforge_cards
CORS_ORIGINS=http://localhost:3000
# Optional: EMERGENT_LLM_KEY=your_key_here
EOF

# Start the server
uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

The frontend runs on `http://localhost:3000` and proxies API requests to the backend on port 8000.

## Testing Instructions

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
# Or run the scoring acceptance tests directly:
python -m tests.test_scoring
```

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
