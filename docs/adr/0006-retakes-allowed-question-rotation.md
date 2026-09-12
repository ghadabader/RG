---
id: 0006
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0003-exam-flow.md, docs/intents/0005-history.md]
updated: 2026-09-12
---

# ADR 0006 — Retakes are allowed; question bank must rotate per (chapter, difficulty tier)

## Context
Whether a user could retake the full assessment was debated twice: first decided as
one-time-only for v1 simplicity, then reversed once its conflict with the product's core
bet became clear (requirements 0003, 0005).

## Decision
Retakes are allowed. Each (chapter, difficulty tier) needs multiple candidate questions to
draw from at random per attempt, not a single fixed ladder.

## Rejected options
### One-time-only (the original decision)
Retakes are what actually let "recommendations sharpen with more engagement" (CLAUDE.md →
Positioning) play out for a real user, rather than being a claim that's only ever true in
theory.

## Consequences
**We accept:** question bank sizing becomes a real constraint before seed data can be
written — not yet estimated (see docs/prd.md → Open questions).
**We gain:** a real retention/history feature (requirement 0005) and recommendations that
demonstrably improve with engagement.
**We will know it was wrong if:** without enough questions per tier, a second attempt is
recognizable/memorizable rather than a genuine re-assessment, quietly undermining the
"accurate" diagnostic the whole product depends on.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0003 | Question bank needs multiple questions per (chapter, tier), not a fixed ladder |
| 0005 | History must be able to show multiple attempts per user over time |
