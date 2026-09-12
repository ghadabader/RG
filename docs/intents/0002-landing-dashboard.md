---
id: 0002
status: ready-for-review
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0002 — Landing / dashboard (`/`)

Derived from PRD requirement 0002, rank 4.

PROBLEM:  A first-time visitor doesn't yet know what this product does or why it's
different; a returning user wants their result, not a pitch.
USER:     Both: logged-out visitors and logged-in returning users share the same route,
with different content.
OUTCOME:  Logged out: a short explainer (the problem this solves, the two outputs —
learning path + job matches) with a "Start Assessment" CTA leading to sign-up. Logged in:
the latest attempt's summary (readiness score + link to full report), or a prompt to start
an assessment if none exists yet.
SUCCESS:  A logged-out visitor understands what the product does within a few seconds of
landing, without needing to read the full pitch.
LIMITS:   Must work for both logged-out and logged-in states on the same route.
NOT NOW:  A separate marketing microsite or blog — the explainer lives inline on `/`.

## Open questions
- None beyond what's in the PRD.
