---
id: 0003
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0004-report-page.md, docs/intents/0006-language-switcher.md]
updated: 2026-09-12
---

# ADR 0003 — Recommendation engine uses retrieval-augmented generation (RAG), not a static map or an ungrounded LLM

## Context
Job matches and course recommendations need to be generated from a user's diagnostic
profile (requirement 0004). Three approaches were on the table: a hand-curated lookup
table (skill profile → job titles/courses), an LLM reasoning freely with no external
data, or an LLM grounded in real, retrieved data.

## Decision
Retrieval-augmented: fetch real job postings at query time (a source with a workable free
tier, e.g. Adzuna) and reference real course catalogs, then have Claude reason over the
user's profile *against that retrieved data* to produce matches, reasoning, and course
links — verifying links resolve before they're shown.

The same call also produces the report directly in the user's selected UI language
(Arabic, English or Hebrew — requirement 0006), using the bilingual format decided in
intent 0006: the translated term leads, with the original English term following in
brackets (e.g. "مهندس بيانات (Data Engineer)"). This is a prompt-level instruction added
to the existing retrieval + reasoning call, not a second LLM call.

## Rejected options
### Hand-curated static map
Doesn't scale, bakes in one person's judgment, and stales quickly as the job market
moves.

### Ungrounded LLM (no retrieval)
Will happily hallucinate a course that doesn't exist or give a stale read on what the job
market currently wants, since it has no real, current data to reason against.

### Separate translation call after generation
Generate the English report first, then run a dedicated second call to translate it.
Rejected: doubles the LLM calls per report — directly worsens the cost risk this ADR
already accepts — and risks the translated text drifting from the reasoning that produced
the English version, since the two would no longer share one generation context.

## Consequences
**We accept:** an LLM API call (at least one, likely more) per profile generated — a real,
ongoing cost. Producing bilingual, correctly-bracketed output is a prompt-level addition
to that same call, not an added cost.
**We gain:** this is what makes "unified diagnostic, not scattered tools" (CLAUDE.md →
Positioning) a real moat rather than just a convenience claim — a competitor with only a
test or only a course engine can't replicate the compounding-personalization effect
without rebuilding the whole retrieval + reasoning pipeline.
**We will know it was wrong if:** recommendations are cached per profile (ADR 0001) yet
LLM spend still grows faster than is sustainable — see the open LLM cost-control question
in docs/prd.md — or if single-pass bilingual output quality (translation accuracy,
consistent bracket formatting) turns out unreliable enough that a dedicated translation
step becomes necessary after all.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0004 | Job matches and course recs must be generated via retrieval + Claude reasoning,
never a static map or ungrounded generation |
| 0006 | Report output must be produced directly in the user's selected language, in the
bilingual bracket format, by the same retrieval + reasoning call — never a separate
translation pass |
