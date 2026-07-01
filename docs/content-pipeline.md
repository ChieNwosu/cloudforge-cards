# Content Pipeline

This document describes the safe pipeline for transforming external study references into original CloudForge Cards game content.

## Overview

The content pipeline ensures that all game content (tooltips, hints, scenarios, seed data) is original, accurate, and properly attributed. No external content enters the game verbatim. Every piece passes through human review and synthesis before becoming playable content.

## Pipeline Stages

### Stage 1: External Study Reference

**Input:** Public learning resources, official AWS documentation, certification study guides.

**What happens:**
- Identify a topic, service, or architectural pattern relevant to CloudForge Cards
- Note the source for attribution purposes
- Extract the core concept (not the wording)

**Rules:**
- Never copy text verbatim from any source
- Record the source URL and title for attribution
- Focus on "what concept is being taught" not "how the source explains it"

**Example:**
Source: A public CLF study guide section on S3 storage classes.
Extracted concept: S3 has multiple tiers optimized for different access frequency patterns.

---

### Stage 2: Human Review

**Input:** Raw concept notes from Stage 1.

**What happens:**
- Verify the concept is factually accurate against official AWS documentation
- Confirm it falls within CLF-C02 or SAA-C03 exam scope
- Decide which game element it should become (tooltip, hint, scenario, constraint)
- Flag any concepts that need simplification for beginner audiences

**Rules:**
- Cross-reference with at least one official AWS source
- Reject concepts that are outdated, in preview, or inaccurate
- Document the intended game integration target

---

### Stage 3: Synthesized Evergreen Obsidian Note

**Input:** Reviewed and verified concept.

**What happens:**
- Write an original explanation in student-friendly language
- Connect the concept to related notes using wiki links
- Add a "CloudForge Cards Integration Ideas" section
- Follow the style guide (no em dashes, beginner-friendly, technically accurate)

**Output:** A markdown note in `obsidian-export/` that serves as the canonical reference.

**Rules:**
- All language must be original
- Include links to related concepts
- Keep the explanation at CLF level unless marked as SAA content

---

### Stage 4: Service-Card Tooltip

**Input:** Verified concept from the Obsidian note.

**What happens:**
- Distill the concept into a single action-oriented sentence
- Focus on "when to choose this service" rather than feature lists
- Test that the tooltip helps a player make a decision during gameplay

**Output:** A `tooltip` string in the service card definition in `seed_data.py`.

**Rules:**
- One sentence maximum
- Must answer the question: "When should I pick this card?"
- No jargon without context
- No em dashes

**Example:**
"Best for event-driven workloads, short tasks, glue between services."

---

### Stage 5: Scenario Hint (Professor Flock)

**Input:** Verified concept connected to a specific scenario.

**What happens:**
- Write a 1 to 2 sentence hint that guides thinking without giving away the answer
- Include 2 to 3 keywords that point toward relevant services
- Test that the hint is helpful for a struggling player but not a spoiler

**Output:** A `hint` object in the scenario definition in `seed_data.py`.

**Rules:**
- Guide reasoning, do not reveal the answer
- Reference architectural patterns, not specific service names
- Include keywords for discoverability

**Example:**
"Millions of small events per second land here. Stream first, then land in a data lake."
Keywords: streaming, data catalog, object storage

---

### Stage 6: Game Scenario

**Input:** Architectural pattern from the Obsidian note, validated against real-world use cases.

**What happens:**
- Design a scenario prompt (2 to 3 sentences describing a workload challenge)
- Define core, supporting, and distractor service IDs
- Define 2 to 3 ideal combinations
- Set min/max service counts and difficulty rating
- Write the Professor Flock hint

**Output:** A complete scenario object in `seed_data.py`.

**Rules:**
- Scenario must be solvable with the cards in the game
- At least one ideal combo must be achievable
- Distractors should be plausible but suboptimal
- Difficulty should reflect architectural complexity, not obscurity

---

### Stage 7: Backend Seed Data

**Input:** Finalized scenario, service card, or constraint from Stage 6.

**What happens:**
- Add the new data to `backend/seed_data.py`
- Ensure all required fields are populated (id, title, description, tooltip, ratings, tags, etc.)
- Run the scoring engine tests to verify no regressions
- Validate that synergy pairs are accurate

**Output:** Updated `seed_data.py` with new content.

**Rules:**
- All IDs must be unique and use snake_case
- Ratings (cost, security, scalability, complexity) must be 1 to 5
- Tags must align with existing scoring logic
- New synergy pairs must represent genuine AWS best-practice pairings

---

### Stage 8: QA Test

**Input:** Updated seed data with new content.

**What happens:**
- Run `python -m tests.test_scoring` to verify existing acceptance cases still pass
- Add a new acceptance test case for any new scenario
- Play through the scenario manually using the deal endpoint
- Verify that the ideal combo scores in the "Well-Architected" range (86+)
- Verify that pure distractors score in the "Needs Refactor" range (31-50) or below
- Check that Professor Flock hints are visible and helpful

**Output:** Passing test suite and manual QA confirmation.

**Rules:**
- No content ships without passing automated tests
- No content ships without at least one manual playthrough
- Document any edge cases or known limitations

---

## Pipeline Diagram

```
External Study Reference
        |
        v
   Human Review (verify accuracy, choose integration target)
        |
        v
   Synthesized Obsidian Note (original language, wiki links)
        |
        +--> Service-Card Tooltip (one sentence, action-oriented)
        |
        +--> Scenario Hint / Professor Flock (guide thinking)
        |
        +--> Game Scenario (prompt, combos, distractors)
                |
                v
         Backend Seed Data (seed_data.py)
                |
                v
           QA Test (automated + manual)
```

## Attribution Requirements

- Document the original study resource in the Obsidian note's metadata
- Include a general attribution in the project README
- Never attribute in-game UI text (tooltips, hints) to external sources
- Maintain a reference list in `docs/clf-knowledge-integration.md`
