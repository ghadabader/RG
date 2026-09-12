---
id: 0001
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0003-exam-flow.md, docs/intents/0004-report-page.md]
updated: 2026-09-12
---

# ADR 0001 — Diagnostic profile is a stored artifact per attempt, not recomputed on demand

## Context
Job matching and course recommendations both need to read "the user's current skill
state" (requirements 0003, 0004). That state could be recomputed from raw responses each
time it's needed, or computed once and stored.

## Decision
Store one `diagnostic_profiles` row per completed attempt. Every downstream consumer
(report page, recommendation engine) reads this row — never a re-derived copy computed
independently.

## Rejected options
### Recompute the profile from `responses` on every read
The whole competitive moat (CLAUDE.md → Positioning) depends on job matches and course
recs being driven by *the same* profile — if two code paths could each derive their own
version of "the profile," they could silently drift apart, and the moat's central claim
stops being true.

## Consequences
**We accept:** any change to chapter scoring logic only affects *future* profiles, not
past ones.
**We gain:** historical reports stay stable even if scoring rules change later; a stable
profile ID to key the recommendations cache on (ADR 0003).
**We will know it was wrong if:** job matches or course recs for the same attempt ever
differ between two reads without a new attempt or an explicit reprocessing step.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0003 | Exam flow must produce and persist one profile row per completed attempt |
| 0004 | Report page must read the stored profile, never recompute it |
