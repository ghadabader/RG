---
id: 0006
status: ready-for-review
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0006 — Language switcher (AR / EN / HE)

Derived from PRD requirement 0006, rank 6.

PROBLEM:  The product must work in three languages; Arabic and Hebrew are both RTL, which
is a layout requirement, not just a translation one.
USER:     Any user whose preferred language is Arabic, English or Hebrew.
OUTCOME:  A global control (not a separate route) lets a user switch UI language at any
time; Arabic/Hebrew flip the layout to RTL correctly (nav, forms, the exam flow itself,
the report page).
SUCCESS:  A user can switch language at any time and the affected screens render correctly
in RTL for Arabic/Hebrew, with no layout breakage.
LIMITS:   UI chrome only for v1 — exam questions/scenarios and job/course data stay
English-only regardless of UI language.
NOT NOW:  Translated exam content, translated job postings or course catalogs.

## Open questions
- Does language scope eventually need to extend to exam content and job/course data
  sources, not just UI chrome? Not decided (see PRD open questions).
