---
id: 0005
status: approved
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0005 — History (`/history`)

Derived from PRD requirement 0005, rank 5.

PROBLEM:  Since retakes are allowed, a user needs to see how they've changed across
attempts, not just their most recent result.
USER:     Any returning learner who has completed more than one attempt.
OUTCOME:  A list of every past attempt for the account (date, readiness score), each
linking to its full report, plus two comparison charts across all past attempts: an
overall readiness-score trend, and a per-chapter score breakdown so a user can see which
specific chapters improved vs. stagnated, not just the overall number.
SUCCESS:  A returning user can see whether their score improved — overall and per chapter
— between attempts at a glance, without opening each report individually.
LIMITS:   Scoped strictly to the logged-in account's own attempts (see ADR-005). With only
one attempt on record, there's nothing to trend or compare yet — the list still shows that
one attempt, but both charts are omitted rather than shown empty or misleading.
NOT NOW:  Cross-user comparison or leaderboards; exporting history as a file.

## Open questions
- None beyond what's in the PRD.
