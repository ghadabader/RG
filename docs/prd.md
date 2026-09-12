---
id: prd
status: ready-for-review
owner: product-manager
inputs: [pitch.txt, CLAUDE.md, .claude/FEATURES.md, ADR.md]
updated: 2026-09-12
---

# PRD — Skills Diagnostic & Job-Matching Platform (name TBD)

Migrated from `.claude/FEATURES.md` and `ADR.md` into the artifact-chain format defined
in `CLAUDE.md` → Artifact chain and handover protocol. Content is carried over faithfully,
not re-decided — review and flip to `approved` if it still reflects intent.

## 1. Problem

Tech learners — students, self-taught career switchers, and early-career devs — don't have
an accurate, honest picture of where they actually stand. They guess at what to study next
from generic roadmaps, and guess at what job titles fit them from job descriptions that all
sound the same. Result: wasted study time on the wrong skills, and applications to roles
they're not ready for, or roles they'd have been great for but never considered.

## 2. Users

### Tech learner (student / self-taught career switcher / early-career dev)
Developing skills through courses and self-study, wants an honest read on where they stand
and a concrete next step. Served from day one — narrowing exam breadth, not audience, is
the intended lever if scope needs to shrink (CLAUDE.md → Product decisions already made).

## 3. Journeys

### First-time assessment
1. Land on `/`, logged out — read the explainer, click "Start Assessment".
2. Sign up (email + password).
3. Take the exam chapter by chapter, pausing and resuming as needed.
4. Land on the report: readiness score, chapter breakdown, learning path, job matches.

End state: the user has one diagnostic profile and a first set of recommendations.

### Returning learner
1. Log in; land on `/` showing the latest attempt's summary.
2. Open `/history` to see all past attempts.
3. Start a new attempt (retake); the question pool rotates so it isn't a replay.
4. Compare the new report's readiness score against prior attempts.

End state: the user can see whether they've actually improved, and recommendations have
sharpened with the additional data point.

### Account and language management
1. Switch language (AR / EN / HE) at any time via global chrome — affects UI chrome, exam
   content, and report output alike.
2. Open `/settings` to change password, set language, or delete the account.

End state: the user can operate the product in their language and control their data,
independent of which other journey they're on.

## 4. Requirements

| ID | Rank | Requirement | Serves journey | Intent |
|------|------|-------------|----------------|--------|
| 0001 | 3 | Auth (sign up / log in / log out) | First-time assessment | docs/intents/0001-auth.md |
| 0002 | 4 | Landing / dashboard (`/`) | First-time assessment, Returning learner | docs/intents/0002-landing-dashboard.md |
| 0003 | 1 | Exam flow (`/exam/[attemptId]`) | First-time assessment, Returning learner | docs/intents/0003-exam-flow.md |
| 0004 | 2 | Report page (`/results/[attemptId]`) | First-time assessment, Returning learner | docs/intents/0004-report-page.md |
| 0005 | 5 | History (`/history`) | Returning learner | docs/intents/0005-history.md |
| 0006 | 6 | Language switcher (AR / EN / HE) | Account and language management | docs/intents/0006-language-switcher.md |
| 0007 | 7 | Account settings (`/settings`) | Account and language management | docs/intents/0007-account-settings.md |

## 5. Acceptance

| ID | Countable criterion |
|------|---------------------|
| 0001 | A new user reaches a logged-in session from the landing page in under a minute, with only email + password |
| 0002 | A logged-out visitor can state what the product does within a few seconds of landing, without reading the full pitch |
| 0003 | A user completes all 6 chapters (active time, excluding pauses) in under 3 hours; a chapter's score reflects the highest difficulty tier sustained, not raw percent-correct |
| 0004 | The report shows an overall readiness score, a per-chapter breakdown, at least 2 relevant modern job-role matches, and a prioritized learning path with course links |
| 0005 | A returning user can see whether their score improved between attempts without opening each report individually |
| 0006 | Switching to Arabic or Hebrew flips layout to `dir="rtl"` correctly across nav, forms, exam flow and report page; exam content (questions, scenarios, answer choices) and report output (job titles, course recommendations, learning path) render in the selected language, with technical terms, tool names and job titles translated first and the original English term following in brackets (e.g. "العودية (Recursion)", "مهندس بيانات (Data Engineer)") — code snippets inside questions are never translated |
| 0007 | A user can change password, delete their account, and set a language preference from `/settings` |

## 6. Out of scope

- Sandboxed live code execution / compilation — chapters use static formats (read-code,
  spot-the-bug, output/complexity prediction, fill-in-the-blank) instead (see ADR-004).
- Enterprise ATS / HR recruitment integrations.
- Native mobile applications.
- Personalized video interview feedback.
- Social login (Google, etc.) for v1 — email/password only, to avoid third-party OAuth
  setup before shipping (requirement 0001).

## 7. Constraints

| Constraint | Source | Note for the architect |
|------------|--------|------------------------|
| Requires active internet connectivity | product | No offline mode to design for |
| Requires a user account — no anonymous/one-off use | user | Every attempt, profile and recommendation set is scoped to a logged-in user (see ADR-005) |
| No data selling, ever; user data fully anonymized; performance benchmarks retained only for internal model/recommendation improvement | user / privacy | Account deletion must define what is and isn't purged — anonymized benchmarks aren't tied back to the account by definition (requirement 0007) |
| Must operate across three language interfaces: Arabic, English, Hebrew; Arabic and Hebrew are RTL | user | RTL is a real layout requirement, not just translated strings; exam content and report output (job titles, course recs) are translated too, not just UI chrome — translated text leads, with the original English technical term/job title in brackets (requirement 0006) |

## 8. Risks

| Risk | Likelihood | What would tell us early |
|------|-----------|--------------------------|
| Question bank too small per (chapter, difficulty tier) — retakes become recognizable/memorizable rather than genuine re-assessment | Medium | User feedback or analytics showing repeat questions within a small number of retakes |
| LLM cost scales per user per exam attempt with no rate-limit or cost-ceiling decided yet | Medium | Per-user LLM spend rising faster than user growth once retakes are common |
| Job-postings/course-catalog sources (e.g. Adzuna, Coursera) may still be English/region-skewed even after report text is translated — translating the display doesn't guarantee the underlying postings/courses are relevant to Arabic/Hebrew-speaking job markets | Low–Medium | Low job-match relevance reported by AR/HE-locale users |

## 9. Open questions

1. Product name not yet chosen.
2. Long-term monetization model (B2C freemium vs. B2B2C selling candidate signal to
   bootcamps/universities/recruiters) — deliberately deferred. Confirmed: no charging
   users for now; revisit only when monetization is explicitly scheduled.
3. Free-tier LLM cost-control strategy — rate limits vs. eating cost as CAC — not decided.
4. Question bank sizing per (chapter, difficulty tier): working assumption is ~8–10
   questions per (chapter, tier) (~150–180 total for v1, authored once in English and
   translated into Arabic/Hebrew), plus a "no immediate-repeat" rule that avoids
   resurfacing a question the user saw in their directly previous attempt. Precise sizing
   still needs validation against real retake-frequency data once the product has usage.
