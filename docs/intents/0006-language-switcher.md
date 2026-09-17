---
id: 0006
status: approved
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0006 — Language switcher (AR / EN / HE)

Derived from PRD requirement 0006, rank 6.

PROBLEM:  The product must work in three languages; Arabic and Hebrew are both RTL, which
is a layout requirement, not just a translation one.
USER:     Any user whose preferred language is Arabic, English or Hebrew.
OUTCOME:  A global control (not a separate route) lets a user switch language at any time;
Arabic/Hebrew flip the layout to RTL correctly (nav, forms, the exam flow itself, the
report page). Exam content (question stems, instructions, answer choices, scenario text)
and report output (job titles, course recommendations, learning path descriptions) are
translated into the selected language. For technical terms, tool names, and job titles,
the translated term leads with the original English term following in brackets — e.g.
"العودية (Recursion)", "مهندس بيانات (Data Engineer)". Code snippets inside exam questions
are never translated.
SUCCESS:  A user can switch language at any time and the affected screens — including exam
questions and the report — render correctly in RTL for Arabic/Hebrew, with translated
content and bracketed English terms, and no layout breakage.
LIMITS:   Applies to display text only — code snippets inside exam questions are never
translated (code is code, regardless of UI language). How translation is produced
(pre-translated question bank vs. LLM-translated report output at request time) is an
architecture decision, not made here.
NOT NOW:  Translating third-party source data itself (raw job postings, raw course catalog
entries) — only the report's presentation layer (job titles, course names/descriptions
shown to the user) is translated; underlying source relevance for AR/HE markets is a
separate risk (see PRD risks).

## Open questions
- None beyond what's in the PRD.
