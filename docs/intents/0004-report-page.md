---
id: 0004
status: ready-for-review
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0004 — Report page (`/results/[attemptId]`)

Derived from PRD requirement 0004, rank 2.

PROBLEM:  A completed exam is only useful if it translates into something actionable — a
clear picture of strengths/weaknesses, what to learn next, and what roles the user is
actually close to being ready for.
USER:     Any tech learner who has just completed (or previously completed) an assessment.
OUTCOME:  Shows overall readiness score, per-chapter score breakdown, a
strengths/weaknesses callout, a prioritized learning path with course links, and a ranked
list of job titles with the reasoning behind each match.
SUCCESS:  An accurate, multi-dimensional skill breakdown, at least 2 relevant modern job
role matches, and prioritized learning steps — directly matching the product's success
criteria in CLAUDE.md.
LIMITS:   Job matches and course recs come from the RAG recommendation engine (see
ADR-003) — grounded in real job postings and real course catalogs, never a hand-curated
static map, never an ungrounded LLM guess. Results are cached per diagnostic profile so
reopening a report doesn't re-trigger a paid LLM call (see ADR-001).
NOT NOW:  Personalized video interview feedback; live coaching or chat with a human.

## Open questions
- None beyond what's in the PRD.
