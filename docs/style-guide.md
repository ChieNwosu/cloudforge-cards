# CloudForge Cards Style Guide

This style guide applies to all documentation, in-game text, tooltips, scenario prompts, and AI-assisted content generation for the CloudForge Cards project.

## Punctuation

- **Avoid em dashes in all final deliverables.** Use commas, colons, semicolons, parentheses, or shorter sentences instead.
- Use serial (Oxford) commas for clarity in lists.
- Prefer periods over semicolons when the sentence is getting long.

## Tone and Language

- Prefer clear, student-friendly language.
- Keep explanations beginner-friendly but technically accurate.
- Write as if explaining to a motivated learner preparing for the AWS Cloud Practitioner exam.
- Avoid jargon without context. If a technical term is necessary, provide a brief inline explanation on first use.

## Affiliation and Claims

- Never overclaim affiliation with Amazon Web Services, AWS, Amazon, NCCU, or any other organization.
- Do not imply endorsement, certification, or partnership where none exists.
- Use the disclaimer: "Unofficial educational project. Not affiliated with Amazon Web Services or North Carolina Central University."

## External Content

- Never copy external notes verbatim.
- Use original examples and explanations in all game content, tooltips, and documentation.
- When referencing external learning resources, provide proper attribution with a link to the source.
- Synthesize concepts into original language that fits the CloudForge Cards context.

## Game Content Writing

- Service-card tooltips should be one sentence, action-oriented, and highlight when to use the service.
- Scenario prompts should be two to three sentences that paint a clear picture of the architecture challenge.
- Professor Flock hints should point the player toward the right thinking without giving away the answer directly.
- Constraint descriptions should be concise and explain what the constraint rewards.

## Technical Accuracy

- All AWS service descriptions must be factually accurate as of the latest generally available features.
- Do not describe preview or beta features as generally available.
- When in doubt, verify against the official AWS documentation.
- Keep explanations aligned with AWS Cloud Practitioner (CLF-C02) exam scope unless the content is explicitly for Solutions Architect level.

## Formatting Conventions

- Use Markdown for all documentation.
- Use headings hierarchically (H1 for title, H2 for major sections, H3 for subsections).
- Use code blocks with language identifiers for any code or CLI examples.
- Use tables for structured comparisons.
- Use bullet lists for feature lists and short items.
- Use numbered lists for sequential steps or processes.

## File Naming

- Documentation files: lowercase with hyphens (e.g., `style-guide.md`, `content-pipeline.md`).
- Obsidian notes: numbered prefix with underscores (e.g., `01_Cloud_Concepts.md`).
- Component files: PascalCase for React components (e.g., `ServiceCard.jsx`).
- Python files: lowercase with underscores (e.g., `game_engine.py`).
