# AWS CloudForge Cards — PRD

## Problem statement (verbatim)
Build a full-stack web app called AWS CloudForge Cards. An educational AWS architecture card
game for students, developers and certification learners. Turn-based card game where players
solve AWS scenarios by selecting service cards, constraint cards and combo cards. React +
backend API + database + auth-ready structure + modular game engine. Core MVP: home page,
solo play, service/scenario/constraint cards, 3–6 card selection, short explanation,
transparent 6-axis scoring, end-of-round feedback, best-of-3, local leaderboard, admin seed
data file. Design: modern cloud-lab aesthetic, AWS-inspired (no AWS branding), original
visuals (no Uno/Balatro clones).

## User personas
1. **Certification learner** – studying for AWS Solutions Architect Associate. Wants to
   internalise trade-offs (cost vs scale vs security).
2. **Bootcamp student / junior dev** – needs hands-on practice picking the right service.
3. **Instructor** – uses the game as a classroom warm-up exercise.

## Architecture (v0.1)
- **Frontend**: React (CRA + craco), TailwindCSS, shadcn primitives, Outfit + JetBrains Mono
  typography, framer-motion not yet used (CSS micro-animations only). Routes: `/`, `/play`,
  `/leaderboard`, `/how-to-play`.
- **Backend**: FastAPI on `:8001`. All routes under `/api`. Modules:
  - `seed_data.py` – 30+ service cards, 10 scenarios, 8 constraints, synergy pairs.
  - `game_engine.py` – pure functions, six explainable sub-scores.
  - `commentary.py` – Claude Sonnet 4.6 via emergentintegrations; falls back to a
    rule-based summary on failure.
- **Database**: MongoDB collections `leaderboard`, `status_checks`.
- **LLM**: EMERGENT_LLM_KEY (Anthropic claude-sonnet-4-6) for end-of-round critique.

## What's been implemented (2026-02)
- Landing page (hero, features grid, CTA, footer)
- Solo Play with best-of-3 session state machine
- 30+ service cards (Compute/Storage/Database/Network/Security/Analytics/Integration/Monitoring)
- 10 scenarios + 8 constraints
- Six-axis transparent scoring engine with per-axis "reasons"
- Hybrid AI commentary (Claude Sonnet 4.6 + deterministic fallback)
- Local MongoDB leaderboard, top-N display
- How to Play page (rules + scoring rubric table)
- Custom dark Swiss / cloud-lab aesthetic, no AWS branding
- Testing: 13/13 backend pytest pass; manual e2e best-of-3 verified

## P0 backlog (next)
- Tooltip popover on service cards (`tooltip` field is dataset-only right now)
- Persist player name across sessions (localStorage)
- Bigger hand size selector / scenario picker

## P1 backlog
- Constraint multi-select before dealing (currently random)
- More scenarios + cards (seed file already supports extension)
- Combo cards (problem statement mentioned them; not implemented yet)
- Pretty share card for social ("I scored 87/100 on CloudForge")
- Dark/light theme toggle

## P2 backlog (auth & multiplayer foundation)
- Cognito / Emergent auth
- Multiplayer turn-based via WebSocket
- Bedrock-based AI judge alternative to Claude
- DynamoDB persistence parity

## Test credentials
N/A — no auth in v0.1.
