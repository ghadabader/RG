---
id: 0002
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0003-exam-flow.md]
updated: 2026-09-12
---

# ADR 0002 — Chapter score = highest difficulty tier sustained, not percent-correct

## Context
Chapters use adaptive difficulty (easy → hard, ending after 3 wrong in a row). A scoring
formula was needed that turns that into a 0–100 chapter score (requirement 0003).

## Decision
Score reflects the highest difficulty tier the user sustained before the fail-streak
ended the chapter. Percent-correct is still recorded per attempt, but only as supporting
data — it does not drive the score.

## Rejected options
### Plain percent-correct across whatever questions were shown
Two users who stall at very different difficulty levels (e.g. tier 2 vs. tier 5) could
land on similar percent-correct scores by chance, which would understate the actual skill
gap between them — and that gap is exactly what job-matching and course-prioritization
depend on being accurate.

## Consequences
**We accept:** the question bank must carry a real, meaningful difficulty gradient per
chapter — question authoring/calibration matters more here than under simple
percent-correct.
**We gain:** a score that reflects actual sustained skill level, not a percentage that can
be identical across very different skill levels.
**We will know it was wrong if:** tiers turn out not to be reliably ordered by actual
difficulty, making the sustained-tier signal noisier than percent-correct would have been.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0003 | Chapter scoring must be tier-reached, not percent-correct; question bank needs a
verified difficulty gradient per chapter |
