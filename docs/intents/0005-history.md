---
id: 0005
status: ready-for-review
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
linking to its full report.
SUCCESS:  A returning user can see whether their score improved between attempts at a
glance, without opening each report individually.
LIMITS:   Scoped strictly to the logged-in account's own attempts (see ADR-005).
NOT NOW:  Cross-user comparison or leaderboards; exporting history as a file.

## Open questions
- None beyond what's in the PRD.
