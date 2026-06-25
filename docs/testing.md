# Testing

## Overview

CloudForge Cards v0.2.5 uses automated acceptance tests for the scoring engine and a manual QA checklist for gameplay validation.

---

## Backend Scoring Acceptance Tests

Location: `backend/tests/test_scoring.py`

### How to Run

```bash
cd backend
python -m tests.test_scoring
```

Or using pytest:

```bash
cd backend
python -m pytest tests/ -v
```

### Current Test Cases (v0.2.5)

| Test Case | Scenario | Selected Services | Expected Score Range | Expected Rating |
|-----------|----------|-------------------|---------------------|-----------------|
| TC1 | Static Blog | s3, cloudfront, route53 (full ideal) | 86-95 | Well-Architected |
| TC2 | Static Blog | s3, cloudfront (partial ideal) | 70-85 | Production Candidate |
| TC3 | Internal Dashboard | s3, athena, glue_catalog, iam (full ideal) | 85-95 | Well-Architected |
| TC4 | Internal Dashboard | iam, kinesis (mostly distractors) | 25-45 | Needs Refactor |
| TC5 | Photo Sharing | s3, cloudfront, lambda, dynamodb (full ideal) | 75-90 | Production Candidate+ |

### What the Tests Validate

- Full ideal combos score in the Well-Architected or high Production Candidate range
- Partial ideal combos score proportionally lower
- Distractor-heavy selections score in the Needs Refactor range
- The guardrail ensures full ideal matches with no distractors always reach at least 85
- Scoring is deterministic (same inputs always produce same outputs)

### Adding New Test Cases

When adding a new scenario to `seed_data.py`, add a corresponding test case:

```python
{
    "name": "TC_new_scenario full ideal",
    "scenario": "new_scenario_id",
    "selected": ["service1", "service2", "service3"],
    "min": 85, "max": 95,
    "labels": ["Well-Architected"],
}
```

---

## Manual 3-Round QA Checklist

Run this checklist after any changes to seed data, scoring logic, or frontend components.

### Pre-Game

- [ ] Backend starts without errors (`uvicorn server:app --port 8000`)
- [ ] Frontend starts without errors (`yarn start`)
- [ ] Landing page loads and displays correctly
- [ ] "Start Game" or equivalent button is functional

### Round 1

- [ ] A scenario is dealt with title, prompt, and constraint chips visible
- [ ] The hand contains the expected number of service cards (6 to 14)
- [ ] At least one ideal combo is present in the hand (verify by checking seed data)
- [ ] Service cards display title, category, and description
- [ ] Selecting 3 to 6 cards is possible; fewer than 3 or more than 6 is rejected
- [ ] The explanation text field is visible and accepts input
- [ ] Submitting produces a score breakdown with all six sub-scores
- [ ] Score total and rating label are displayed
- [ ] Commentary text is visible (rule-based fallback if no LLM key)
- [ ] "What You Got Right" section shows positive feedback
- [ ] "What to Improve" section shows constructive feedback

### Round 2

- [ ] A different scenario is dealt (no repeat from Round 1)
- [ ] Constraint chips may differ from Round 1
- [ ] All Round 1 checks apply to Round 2

### Round 3

- [ ] A third unique scenario is dealt
- [ ] All Round 1 checks apply to Round 3
- [ ] After Round 3, a session summary or leaderboard prompt appears

### Post-Game

- [ ] Total score across 3 rounds is calculated correctly
- [ ] Leaderboard entry can be submitted with a player name
- [ ] Leaderboard displays entries sorted by score (descending)
- [ ] Starting a new game resets the session

### Edge Cases to Test

- [ ] Submit with exactly 3 services (minimum): scoring works
- [ ] Submit with exactly 6 services (maximum): scoring works
- [ ] Submit with no explanation: Explanation Bonus = 0, no crash
- [ ] Submit with a long explanation (50+ words): Explanation Bonus = 5
- [ ] Empty player name on leaderboard: rejected with error message

---

## Known Issues

### Minor: "Not core to the scenario" feedback placement

**Status:** Known, fix planned for v0.2.6

**Description:** When a player selects services that are not distractors but also not in the core/supporting set, the feedback "Not core to the scenario: [service names]" currently appears in the "What You Got Right" section of the Correct Service Selection sub-score. This is misleading because it implies the player did something right when the service is actually a neutral-to-negative choice.

**Expected behavior:** This feedback should appear in the "What to Improve" section instead.

**Workaround:** Players can ignore "Not core to the scenario" messages in the positive feedback section. The scoring correctly penalizes these selections even though the UI placement is confusing.

---

## Known Technical Debt

### Play.jsx and ScoreBreakdown.jsx need future decomposition

**Status:** Known, no immediate fix planned

**Description:** The `Play.jsx` component handles deal logic, card selection, explanation input, score submission, and round transitions in a single file. `ScoreBreakdown.jsx` renders all six sub-scores, the commentary, ideal architecture display, and synergy visualization. Both files have grown beyond comfortable maintainability.

**Future plan:**
- Extract card selection into a `CardHand.jsx` component
- Extract explanation input into an `ExplanationForm.jsx` component
- Extract round state management into a custom hook (`useGameRound`)
- Split ScoreBreakdown into `SubScoreCard.jsx`, `IdealArchDisplay.jsx`, and `SynergyPairs.jsx`

**Impact:** No functional issues. Code works correctly but is harder to modify.

---

## Test Environment Requirements

- Python 3.11+
- MongoDB running locally or connection string configured
- Node.js 18+ and Yarn for frontend tests
- No external API keys required for scoring tests (LLM commentary is optional)

---

## Deployed QA Results (v0.2.5)

Final manual QA performed against the live deployment at [https://cloudforge-cards.emergent.host/](https://cloudforge-cards.emergent.host/).

| Check | Result |
|-------|--------|
| Landing page loads | Pass |
| Solo 3-round game works | Pass |
| Score breakdown displays all six sub-scores | Pass |
| Final summary (session total and rating) works | Pass |
| Leaderboard accepts entries and sorts by score | Pass |
| How to Play page reflects v0.2.5 scoring categories | Pass |

**Notes:**
- All six sub-scores render correctly with reasons text.
- Commentary falls back to rule-based summary when no LLM key is configured.
- Constraint chips display and influence scoring as expected.
- No critical issues observed during deployed QA.
