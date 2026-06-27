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
- Landing page (hero, features grid, CTA, footer with explicit AWS disclaimer)
- Solo Play with best-of-3 session state machine
- 33 service cards across 9 categories incl. AI (Bedrock, SageMaker)
- 10 scenarios + 8 constraints + `ideal_combos` per scenario
- Six-axis transparent scoring engine with per-axis "reasons"
- New grade labels: Broken Architecture / Needs Refactor / Partial Fit / Production Candidate / Well-Architected
- Hybrid AI commentary (Claude Sonnet 4.6 + deterministic fallback)
- Local MongoDB leaderboard, top-N display
- How to Play page (rules + scoring rubric table)
- Custom dark Swiss / cloud-lab aesthetic
- **v0.2 — Mobile UX pass**: full responsive layout, no horizontal overflow,
  hamburger nav drawer, sticky bottom selection tray, category filter chips
  (All/Compute/Storage/Database/Security/Analytics/Networking/Integration/AI),
  dynamic selected-counter tied to `scenario.max_services`, "Got Right /
  To Improve / Ideal Architecture" panels, cleaner penalty bar viz,
  rationalised letter-spacing on body text.

## P0 backlog (next)
- Tooltip popover on service cards (`tooltip` field is dataset-only right now)

## v0.2.6.1 — Leaderboard save hygiene (2026-06-26, DONE)
- Official "personal best" upsert: names normalized (trim, collapse spaces,
  case-insensitive). New name -> create; same name + higher score by the same
  owner -> update; lower/equal -> keep. One canonical public row per name;
  legacy duplicate rows are collapsed (highest kept) on the next save of that name.
  Messages: "New personal best saved for {name}." / "Your saved best for {name} is still {score}."
- Ownership via client `cf_owner_token` (localStorage). Saving an official name owned
  by a different browser returns status "conflict" + 3 name suggestions
  (Name_01, NameCloud, Name_Forge). No silent hijack, no duplicates.
- Temporary guest scores: mode="guest", `expires_at` = now+7d, hidden from the public
  GET via query-time filtering (no TTL index / no migration this release). Guest scores
  never overwrite an official personal best; shown with a subtle "guest" label.
- Save-mode choice on the final summary (official default | guest).
- Safe delete: `DELETE /api/leaderboard/{id}?owner_token=` requires matching owner
  token (legacy unowned rows deletable by id). No delete-all (DELETE collection -> 405).
- Admin moderation: `DELETE /api/admin/leaderboard/{id}` guarded by `ADMIN_TOKEN` env
  (header `X-Admin-Token`, constant-time compare); disabled with 503 if unset. Optional
  Leaderboard "Admin cleanup" panel stores the token in sessionStorage only.
- Preserved: cf_player_name persistence, summary name prefill, Professor Flock greeting.
- Testing iteration_5: backend 8/8 new + 22/22 retained + scoring 5/5; frontend 100%.
- P2 follow-ups (deferred): index on name_key; store expires_at as datetime for a real
  TTL index to auto-purge expired guests.


## v0.2.6 — Mobile + Leaderboard maintenance (2026-06-26, DONE)
- Fixed Play-page mobile portrait overflow (390x844): added `min-w-0` to the
  grid children (`aside`/`main`) and the mentor-hint text block so the
  non-wrapping category-filter row scrolls inside its own `overflow-x-auto`
  container instead of stretching the whole page. No page-level horizontal scroll.
- US English copy sweep: "memorisation"->"memorization" (Landing, How to Play),
  "Prioritise"->"Prioritize" (fintech_api hint). Scoring untouched.
- Safe per-entry leaderboard delete: new `DELETE /api/leaderboard/{entry_id}`
  (delete_one by app uuid, 404 if missing). NO delete-all endpoint. Client stores
  the saved entry id in `localStorage.cf_my_score`; Leaderboard shows a "Your saved
  score" panel + "Delete my score" button + row highlight; confirm dialog; clears
  localStorage on success/404. Other rows have no delete control.
- Local player name: `localStorage.cf_player_name` persists; pre-fills the final
  summary name input and drives a static Professor Flock greeting on /play.
- Testing: iteration_4 = 6/6 new backend + full mobile/desktop/delete/name frontend
  flows, 100% PASS. Scoring engine unchanged (5/5 acceptance still pass).


## v0.2.5 — Scoring engine rewrite (2026-06-21, DONE)
- New transparent 100-pt engine in `game_engine.py`, six sub-scores:
  A. Correct Service Selection (0-30), B. Ideal Architecture Match (0-25),
  C. Constraint Alignment (0-20), D. Synergy Bonus (0-15),
  E. Simplicity/Overengineering (0-10), F. Explanation Bonus (0-5, capped at 100).
- Guardrails: full ideal match (no distractors) >= 85; full match + 1 supporting >= 78.
- Scenarios gained `core_service_ids` / `supporting_service_ids` / `distractor_service_ids`.
- Added `glue_catalog` (Glue Data Catalog, Analytics) card + synergies; new
  internal_dashboard ideal combo [s3, athena, glue_catalog, iam].
- `/api/game/score` returns additive fields: `matched_ideal {combo_ids, matched_count,
  total, status}`, `ideal_combos_status` (per-combo full/partial/miss), `best_match_service_names`.
- `ScoreBreakdown.jsx`: 6 categories, green/yellow/gray match pills, "Matched ideal
  services: X of Y", "Best matching architecture", and a `verdictLine()` that always
  matches the numeric rating (fixes the contradictory Got-Right/To-Improve copy).
- Tests: `backend/tests/test_scoring.py` (5 acceptance cases, 5/5 pass). Testing agent
  iteration_3: 16/16 backend + full 3-round frontend flow PASS.


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
