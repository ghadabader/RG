---
id: 0007
status: ready-for-review
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0007 — Account settings (`/settings`)

Derived from PRD requirement 0007, rank 7.

PROBLEM:  The privacy commitment (no data selling, full anonymization) needs a concrete
way for a user to act on it, not just a policy statement.
USER:     Any logged-in user managing their account.
OUTCOME:  Change password; delete account; set language preference (pairs with
requirement 0006).
SUCCESS:  A user can change their password, delete their account, and set a language
preference, all from `/settings`.
LIMITS:   "Delete account" needs a defined boundary: personally identifying data (email,
login) is deleted, but anonymized performance benchmarks already retained for internal
model/recommendation improvement are — by definition, since they're anonymized — not tied
back to the deleted account and so aren't purged by this action. This should be stated
plainly to the user at the point of deletion so it isn't a surprise.
NOT NOW:  An explicit "export my data" option.

## Open questions
- Whether an "export my data" option is needed isn't decided.
