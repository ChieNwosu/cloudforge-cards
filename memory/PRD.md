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

## v0.4.2 Phase 5C: Track-Aware Play and Domain Scenarios (2026-06, DONE)
Adds certification track filtering to Play mode plus original domain content. No scoring
engine rewrite, no leaderboard schema change, no DB schema change, no auth. US English, no
em dashes. Public AWS disclaimer preserved. All content is original and synthesized from broad
public AWS service knowledge and certification objectives (no copied exam wording).

- **Track-aware Play**: new track selector on the Play start screen (CLF/SAA, AIF, MLA, DEA,
  Mixed). `backend/seed_data.py` adds `scenarios_for_track` and `cards_for_track`; every base
  card and scenario is tagged with a `tracks` list (all keep CLF_SAA so existing behavior is
  unchanged). `/api/game/session` and `/api/game/deal` accept a `track` param. The deal still
  guarantees a full ideal combo is in the hand and scopes filler cards to the track pool plus
  the scenario's own cards, so hands stay relevant and every round is playable. Mixed = all.
- **New Play content** (`backend/play_expansion.py`): 8 AIF, 8 MLA, 8 DEA, and 4 refined
  CLF/SAA Play scenarios, plus 26 new service cards (AIF: Titan, Nova, Amazon Q, Lex, Textract,
  Comprehend, Transcribe, Polly, Rekognition, Bedrock Knowledge Bases, Bedrock Guardrails;
  MLA: SageMaker Training/Endpoint/Batch/Pipelines/Model Registry/Feature Store/Model Monitor,
  ECR; DEA: Glue, Glue Crawler, Kinesis Data Firehose, MSK, Lake Formation, Step Functions,
  QuickSight). Vector search is represented via Bedrock Knowledge Bases (no separate vector-DB
  card). New synergy pairs added for fair synergy scoring.
- **Play scenario pool by track**: CLF_SAA 14, AIF 8, MLA 9, DEA 10, Mixed 38 (all). Card pool
  by track: CLF_SAA 34, AIF 21, MLA 23, DEA 22, Mixed 60 (all).
- **Result and share cards** now show the selected track: final summary shows Mode + Track
  badges; the Play share card and copy text include Track and XP earned lines.
- **Learn Hub**: added a small "Practice this track in Play" link that deep-links to
  `/play?track=<track>` and preserves the selection through localStorage.
- **Audio voice profiles** made distinct per request: Professor prefers masculine or
  lower-register English voices (Alex, Daniel, Guy, Microsoft David, etc.), rate 0.88, pitch 0.9;
  Calm prefers warmer/softer voices (Samantha, Ava, Jenny, Aria, etc.), rate 0.78, pitch 1.08;
  Default rate 1, pitch 1. Gender-hint fallback added. Fully browser-native, no external TTS.
- **Leaderboard unchanged**: scores stay grouped by round mode (3R/5R/10R), not by track.
- **Tests**: `backend/tests/test_v042_track_play.py` covers per-track pools, deal integrity
  (ideal combo always dealt), full-ideal scoring guardrail (>= 78), distractor penalty, and
  3R/5R/10R session integrity per track. Verified: backend 88/88 base + 6/6 track tests pass;
  frontend iteration_15 all Phase 5C items pass, no console errors, no mobile overflow.


## v0.4.0 Phase 5A: Certification Prep Expansion (2026-07-04, DONE)
Frontend and additive content release. No scoring, grading, leaderboard, backend schema, or
authentication changes. US English, no em dashes. Public AWS disclaimer preserved. All content
original and synthesized from broad public exam objectives.

- **DEA added as a real Learn track** (Data Engineer Associate, short label DEA, status Expanding)
  across the Learn Hub, Flashcards, Test Mode, and Match / Fill selectors, plus backend
  EXAM_TRACKS. Mixed mode includes the new content.
- **Flashcards expanded** with original concept cards (Learn only, never enter the Play game):
  12 AIF, 12 MLA, 15 DEA. Final track totals: AIF 14, MLA 19, DEA 15, CLF/SAA 34, Mixed 73.
- **Test Mode expanded** with original questions (server-graded, keys stay server-side):
  AIF now 15, MLA now 15, DEA 13 (10, 10, and 13 added). All include explanations and fair
  distractors.
- **Match / Fill expanded** with original prompts: 4 AIF, 4 MLA, 5 DEA (plus existing CLF/SAA and
  one MLA). All slots use real service cards so trays resolve and grade correctly.
- **Learn Hub repositioned** as the main certification prep center: track cards with descriptions
  and status labels (Strongest, Expanding, Mixed), clear CTAs (Study Flashcards, Take Test Mode,
  Practice Match Mode), and two notes clarifying that CloudForge Cards is an unofficial
  student-built tool and content is for practice and review, not official AWS exam material.


## v0.4.1 Phase 5B Pass A: Study Progress, XP Lite, Mastery, Spaced Review (2026-06, DONE)
Frontend-only, localStorage-only release. No backend, DB schema, leaderboard, auth, or
track-aware Play changes (Pass B deferred). US English, no em dashes. AWS disclaimer preserved.

- **`src/utils/studyProgress.js`** (single localStorage object `cloudforge_learning_progress`):
  XP, current/longest streak, level (250 XP per level), per-card mastery (new/review/known/
  mastered), spaced-review due dates (review 1d, known 3d, mastered 7d), sessionsCompleted.
  XP: play3=30, play5=50, play10=100, test=40, match=35, known=5, review=3, due bonus=8.
  Anti-farming via an `awarded` map: known/review XP granted only the first time a card reaches
  that state; due bonus once per card per calendar day. `recordCardMark` promotes known->mastered
  on a second Known click (promotion checked before the toggle-off short-circuit).
  `migrateLegacyProgress()` does a one-time, non-destructive import of old `cf_learn_progress`
  Known/Review marks (no retroactive XP; legacy key left in place; `migratedFromCfLearnProgress`
  flag guards re-runs; graceful fallback on failure).
- **LearnHub**: Study Progress panel (Streak, XP, Level, Mastered with Known/Review sub-counts,
  Due Today, Sessions) + Reset progress button with confirm. Live-updates via `cf-progress-change`.
- **LearnCards**: migrated to studyProgress; mastery filter row (All, Due Today, New, Review,
  Known, Mastered); recordCardMark integration with XP toasts; due badge; mastered state/badge;
  Reset progress in the summary.
- **Play / LearnTest / LearnMatch**: award session XP on completion via recordSession and show a
  `+N XP earned` badge on the result screens (play-xp-earned, test-xp-earned, match-xp-earned).
- **speech.js**: Professor (brisk, higher pitch, firmer voice prefs) and Calm (slower, lower,
  softer, warmer voice prefs) profiles made distinct; pickVoice is now style-aware.
- **Landing footer**: version updated to "v0.4.1 Study Progress, XP Lite, Mastery, and Spaced Review".
- Verified: iteration_13 frontend pass (95%); Known->Mastered promotion fixed and re-verified.



Frontend-only release. No scoring, grading, leaderboard, backend, schema, or
certification-content changes. US English, no em dashes. Public AWS disclaimer preserved.

- **Shareable result cards** on Play final summary, Test Mode results, and Match / Fill results.
  New `src/components/ShareResultCard.jsx` + `src/utils/shareResults.js`. Styled in-app visual
  card (CloudForge Cards header, Professor Flock, result lines, short message, live app link),
  a Copy result button (Clipboard API with hidden-textarea fallback), an optional native Share
  button via `navigator.share` when available, and an accessible aria-live status message using
  an icon plus text (not color alone). Uses only result data already in the browser; missing
  values are omitted cleanly. No downloads, no new dependencies, no stored data.
- **How to Play refresh** (`HowToPlay.jsx`): title "The rules in 60 seconds", intro and steps
  updated for 3R, 5R, and 10R sessions and explanation overflow, plus a new accessibility note
  about the Audio and Voice read-aloud controls. Scoring table already matches the six sub-score
  model (+0 to +30, +25, +20, +15, +10, +5).



Frontend-only voice quality patch on top of the read-aloud MVP. No backend, scoring, grading,
leaderboard, schema, or certification-content changes. US English, no em dashes.

- **Smoother Professor Flock tuning:** utterances now set lang en-US and use style profiles
  (Professor rate 0.9 pitch 0.98, Calm rate 0.86 pitch 1.0, Default rate 1 pitch 1, volume 1).
- **Best available English voice selection** in `src/utils/speech.js` via
  `speechSynthesis.getVoices()`, with async loading handled through the `voiceschanged` event.
  Preference order: any English Natural or Neural voice, then a preferred-name list
  (Google US English, Microsoft Aria or Jenny, Samantha, Alex, Ava, and others), then an en-US
  local service voice, then the first en-US voice, then the first English voice, then the browser
  default.
- **Voice style preference:** new `useVoiceStyle` hook, localStorage key `cloudforge_voice_style`,
  default Professor, valid values Professor, Calm, Default. New `VoiceStyleToggle` control in the
  nav (desktop and mobile) that cycles the three styles. Persists across refresh.
- **Spoken-text cleanup (spoken only, visible text unchanged):** collapses whitespace, strips
  markdown symbols and heading markers, converts slash-heavy phrases to readable words
  (CLF/SAA becomes CLF, SAA), reads exam codes clearly (AIF-C01 becomes A I F C zero one), and
  adds light pauses after labels like Scenario and Question.
- **Better error handling:** no empty catch blocks; speech and localStorage failures use single
  safe console.warn messages; expected interrupted or canceled speech events are not logged;
  the app never crashes if speech fails.
- **Preserved:** existing Audio: On / Audio: Muted toggle and mute persistence
  (`cloudforge_audio_muted`), stop-before-speak, and mute stops current speech immediately.



Frontend-only accessibility and polish release. No backend, scoring, grading, leaderboard,
schema, or certification-content changes. US English, no em dashes.

- **Browser-native text to speech** via `window.speechSynthesis` + `SpeechSynthesisUtterance`.
  No external TTS APIs, no stored audio files, no backend audio routes, no microphone, no
  speech recognition.
- **New files:** `src/utils/speech.js` (support detection, speak, stop-before-speak, cancel,
  ignores empty/whitespace text, never throws, tiny pub/sub so only one button shows Stop),
  `src/hooks/useAudioPreference.js` (localStorage key `cloudforge_audio_muted`, default false,
  syncs across components via a window event and the storage event),
  `src/components/ReadAloudButton.jsx` (reusable, accessible aria-labels, keyboard friendly,
  compact and labeled variants), `src/components/AudioToggle.jsx` (global Audio: On / Audio:
  Muted control in the nav).
- **Audio: On / Audio: Muted** global toggle in the nav (desktop and mobile). Preference
  persists across refresh. When muted, read-aloud buttons show a disabled Audio muted state and
  do not play. When speech synthesis is unavailable, buttons show a disabled Audio unavailable
  state and the global toggle hides itself. No crashes in any state.
- **Read-aloud wired into:** Play scenario (title + prompt), Play round architect commentary,
  Test Mode question, Test Mode review explanations (per question), Match / Fill prompt (title +
  prompt), Match result explanation, and Learn Flashcards via a single side-aware control that
  reads the front when showing the front and the back when flipped (avoids nested buttons).
- **Behavior:** starting a new read-aloud stops the previous speech; muting stops any current
  speech immediately. Long text does not break layout (compact icon buttons, shrink-0 placement,
  reserved padding on flashcards).
- **Limitations:** available voices, quality, and language depend on the user's browser and OS;
  some browsers require a user gesture before speaking (the button click satisfies this);
  headless test environments have no audio device so playback audio cannot be asserted, only
  button state, mute behavior, and absence of crashes/regressions.



Tested end-to-end (testing iteration_6: backend 14/14 e2e + 11/11 phase3 local + 5/5 scoring
regression; frontend 100% on all acceptance criteria; zero console errors). All US English,
no em dashes.

- **Part A — Match / Fill in the Blank** (`backend/match_bank.py`, new endpoints
  `GET /api/learn/match/session?track=` and `POST /api/learn/match/grade`, page
  `frontend/src/pages/LearnMatch.jsx`, route `/learn/match`). Server-side grading; answer
  keys (`correct` per slot) are stripped before reaching the client. Tap-to-select a tray
  service then tap a slot to place; partial credit with per-slot status
  correct/misplaced/wrong/missing; Flock explanation; per-pipeline + count-up average result
  screen (reuses CSS-only confetti, no new dependency). 6 pipelines across CLF_SAA + MLA.
  Hub Match card enabled (was Coming Soon). Local progress: `cf_match_progress`.
- **Part B — Scoring transparency** (`game_engine._simplicity`, `ScoreBreakdown.jsx`,
  `HowToPlay.jsx`). Simplicity sub-score now returns `state` (right_sized | overengineered |
  too_thin) and `lost`. UI shows an explicit tag: green "Simplicity Score: +X / 10" or red
  "Overengineering penalty: -X (kept +Y / 10)". How to Play rubric rewritten with +0 to +N
  ranges and an explanation of why a perfect ideal match can still score under 100 (e.g. no
  active constraint caps Constraint Alignment at 10/20). Ideal architectures are NOT force-set
  to 100; transparency over artificial perfection (user decision).
- **Part C — Explanation overflow** (`game_engine.score_round`, `Play.jsx`,
  `ScoreBreakdown.jsx`). Raw total is computed (guardrail floors applied first), the visible
  round score is capped at 100, and any explanation points above 100 are returned as
  `overflow_bonus`. Round card shows an overflow note; session total adds banked overflow and
  the final summary explains it (base from capped rounds + overflow bonus). Per-round history
  carries `overflow`.
- **Part D — Round modes 3R / 5R / 10R** (`Play.jsx`, `Landing.jsx`). New round-mode picker
  on /play (data-testid round-mode-select, options round-mode-3/5/10); `rounds` state replaces
  the old fixed best-of-3; `?rounds=N` deep link auto-starts (Landing hero quick-start chips).
  Session denominator is rounds*100; round-progress chips wrap. 10 scenarios total so 10R uses
  all of them. Backend `GET /api/game/session?rounds=` already supported N.
- **Part E — Per-mode leaderboard** (`server.py` add_leaderboard, `Leaderboard.jsx`). Official
  best is keyed by (name_key, rounds): a player keeps one best per mode. Saving a mode updates
  only that mode; lower score is kept, higher updates; different owner_token for a name still
  conflicts with suggestions. Desktop table Player | 3R Best | 5R Best | 10R Best (responsive,
  contained horizontal scroll on mobile). Guest scores listed separately with a guest label.
  "Your saved scores" panel lists each saved mode with a per-mode delete button; deleting one
  mode removes only that entry; no remaining entries removes the row. GET limit raised to 300
  for client aggregation. Client stores `cf_my_scores` (per-mode map) plus legacy `cf_my_score`.
- **Part F — Professor Flock transparent avatar** (`FlockAvatar.jsx`,
  `frontend/public/professor-flock.png`). Generated a transparent-background bust from the
  concept art (Gemini Nano Banana); FlockAvatar now uses the PNG in a circular dark frame
  (object-top), emoji fallback retained. Applies everywhere via the shared component (Learn hub,
  Flashcards, Test, Match, Play hints).

- Tests added: `backend/tests/test_v03_phase3_scoring.py` (5), `backend/tests/test_v03_match.py`
  (6), `backend/tests/test_v03_phase3_e2e.py` (testing-agent authored, 14).
- Known minor (not fixed, not user-facing): `ScoreRequest` uses field `constraint_ids`; a client
  posting `constraints` would be silently ignored by Pydantic. The real frontend posts the
  correct key, so no app impact. Could add `extra='forbid'` or an alias later.



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
