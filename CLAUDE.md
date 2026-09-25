# CLAUDE.md

Guidance for Claude Code when working on this project. There is no code yet —
this file captures the decisions already made so implementation starts from a
consistent baseline instead of re-deciding things each session. Update it as
real decisions supersede these.

Full product context/pitch: see `pitch.txt` in this same directory.

## Intent

**Problem.** People in tech — especially students and self-learners — don't
know which jobs their current skills qualify them for, or which specific
skills they need to develop to get hired for a given role.

**Who this is for.** People in tech, especially students and self-learners
who are developing their skills through courses and want to keep growing.

**What "done" looks like for a user.** A user should come away knowing
specifically what their next step must be — what their current skills
already qualify them to do, and what to develop next.

**Success criteria.** A user completes the assessment in under 3 hours and
receives:
- An accurate, multi-dimensional breakdown of their skills
- At least 2 relevant, modern job role matches
- Prioritized learning steps

**Constraints.**
- Requires active internet connectivity
- Requires a user account (results are tied to a persistent profile, not
  anonymous/one-off use)
- Privacy: no data selling to third parties, ever. User data is fully
  anonymized; performance benchmarks are retained strictly for internal
  model and recommendation improvements — not resold, not shared externally
- Must operate across three language interfaces: Arabic, English, and
  Hebrew

**Not now (explicitly out of scope).**
- Sandboxed live code execution/compilation
- Enterprise ATS/HR recruitment integrations
- Native mobile applications
- Personalized video interview feedback

## Problem

Tech learners — students, self-taught career switchers, and early-career
devs alike — don't have an accurate, honest picture of where they actually
stand. They guess at what to study next from generic roadmaps, and guess at
what job titles fit them from job descriptions that all sound the same.
Result: wasted study time on the wrong skills, and applications to roles
they're not ready for (or roles they'd have been great for but never
considered).

## What this project is

A web app that gives tech learners (students, self-taught career switchers,
early-career devs — all served from day one) an honest diagnostic of their
skills via a chaptered exam, then turns that single diagnostic profile into:
1. A prioritized "what to learn next" list with course recommendations
2. A ranked list of job titles they're closest to being ready for, with why

The core bet: recommendations and job matches are both derived from the same
diagnostic profile (not separately-built systems), so they get sharper as a
user engages more. Protect that — don't let the two outputs drift into
independent, disconnected systems.

## Positioning — why this beats existing tools

Competing with LeetCode/HackerRank, Pluralsight Skill IQ, roadmap.sh, and
LinkedIn Skill Assessments. The moat is NOT "we combined existing tools for
convenience" — that's copyable in a weekend. The real bet is the compounding
diagnostic profile described above: a competitor with only a test, or only a
course engine, can't replicate the sharpening effect without rebuilding the
whole pipeline. This only holds if the diagnostic data model stays unified
under the hood as the product grows — treat that as the thing to protect
above UI polish or chapter count.

Build-order implication: get the diagnostic data model right before
expanding UI or adding chapters — it's the asset the whole moat depends on.

## Tech stack

- Frontend: Next.js + React + TypeScript
- Backend: Next.js API routes (Node/TypeScript) — same language as frontend
- Database: PostgreSQL (Supabase free tier is the default choice — also
  provides auth for free)
- Auth: user accounts are required (confirmed) — results are tied to a
  persistent profile, not anonymous/one-off use. Supabase auth is the
  default choice given the DB pick above.
- LLM calls: Claude API, called only from backend/API routes, never from the
  browser (API key must never be exposed client-side)

## Exam structure (working v1 hypothesis — expect this to change)

The chapter count is not a fixed product requirement — it's a content-design decision
driven by how many distinct skill areas are worth diagnosing. All users take the same
unified set of chapters (no per-user adaptive subset — that would break profile
comparability across users, which the whole recommendation/job-matching model depends
on). The list below is the current v1 working example, not a hardcoded "6":

Chapters, each scored independently, rolling up into one diagnostic profile:
1. Coding / Syntax — real code, run against test cases
2. Problem Solving — algorithmic puzzles, real code + test cases
3. Frontend — small real component-building task
4. Backend — small real endpoint/API task
5. Systems / DevOps — scenario questions
6. Code Quality / Best Practices — "spot the issue" in a snippet

Real code execution needs a sandboxed runner for chapters 1–4. Don't build a
custom sandbox from scratch — use an existing hosted code-execution service
unless a strong reason emerges not to.

## Recommendation engine

Retrieval-augmented, not a hand-curated static mapping and not an
ungrounded LLM call:
- Job matching: fetch real job postings at query time (e.g. Adzuna API free
  tier, or scraping a handful of public listings), feed them + the user's
  diagnostic profile to Claude, let it reason out fit and produce the "why".
- Course recs: for each weak chapter, have Claude reference real course
  catalogs (Coursera/Udemy/freeCodeCamp) and verify links resolve before
  showing them to the user — never surface a hallucinated or dead link.

This means cost scales per user per exam (one or more LLM calls each). No
cost-control strategy is decided yet (rate limits vs. eating it as CAC) —
flag this if usage-scale work comes up before it's resolved.

## Product decisions already made — don't relitigate without new information

- Serve all user segments from day one; narrow *exam breadth*, not audience,
  if scope needs to shrink.
- Monetization is deliberately deferred (free for v1). Don't add
  paywalls/billing without an explicit ask.
- Product has no name yet.

## Open questions — not yet decided

- Sandboxed live code execution vs. "Not now" scope: the Exam Structure
  section currently has chapters 1–4 running real code against test cases,
  which needs a sandboxed runner — but Intent's "Not now" list explicitly
  excludes sandboxed live code execution/compilation. Contradiction,
  unresolved — needs a decision before chapters 1–4's assessment format can
  actually be built.
- Language scope: does the Arabic/English/Hebrew requirement mean UI chrome
  only, or does exam content (questions/scenarios/feedback) and the
  underlying job-posting/course-catalog sources also need per-language
  coverage? Affects whether a source like Adzuna (job postings) has
  meaningful reach for the intended market.
- Final chapter list (current list in Exam Structure is a working hypothesis)
- Free-tier LLM cost-control strategy (rate limits vs. eating cost as CAC)
- Long-term monetization model (candidates: B2C freemium, or B2B2C selling
  candidate signal to bootcamps/universities/recruiters — nothing chosen)
- Product name

## Artifact chain and handover protocol

This project is built by a chain of roles. Each role reads Confluence pages and/or Jira
issues, writes its own, and stops. **No role calls another role.** The Confluence page or
Jira issue is the interface.

### Where each artifact lives

- Confluence space `RG` — owned by `product-manager` (PRD, Intents) and
  `product-architect` (ADRs, Specs). Other roles read it; only PM and Architect write to
  it.
- Jira project `KAN` — owned by `product-engineer`, `platform-engineer` and
  `product-validator` (execution tasks, deployment records, validation verdicts).
  `product-manager` may create issues here (an Epic + Tasks, once a requirement's spec is
  approved) but writes nothing else in Jira. `product-architect` has no access to Jira.

### The chain

```
pitch.txt
   └─ product-manager   → Confluence "PRD" (home page, space RG)
                        → Confluence "Intent NNNN — <slug>" (one per requirement)
      └─ product-architect → Confluence "ADR NNNN — <slug>" (decisions, product-wide,
                              own numbering sequence)
                           → Confluence "Spec NNNN — <slug>" (one per intent, on request)
         └─ product-manager  → Jira Epic "Requirement NNNN — <slug>" + Tasks, once the
                                spec carries `status-approved`
            └─ product-engineer   → source code and tests, reading the named Jira issue
               └─ platform-engineer → deployment record (comment on the Epic), live URL
                  └─ product-validator → conformance/fidelity findings (Jira comments)
```

`docs/prd.md`, the files in `docs/intents/` and `docs/adr/` are a frozen historical
snapshot of this chain from before the Confluence/Jira move — each carries a banner
pointing at its Confluence replacement and is never edited again. The PRD, every intent,
ADR and spec written from now on lives in Confluence; every Task belonging to a
requirement, in Jira.

Every requirement gets a four-digit ID, starting at `0001`. That ID travels: PRD
requirement `0003` becomes Intent `0003`, Spec `0003`, Epic/Tasks labeled `id-0003`.
ADRs are numbered independently (their own sequence, continuing from `0008` since
`0001`–`0007` already exist as the migrated snapshot) because one ADR can bind many
requirements. Anything without a traceable ID does not belong in this chain.

### Every artifact carries exactly one status label

Every Confluence page and Jira issue in this flow carries exactly one of these labels:

- `status-draft`
- `status-ready-for-review`
- `status-approved`
- `status-blocked`

A page or issue that carries a requirement ID also carries a label `id-NNNN` (ADRs are the
exception — they are numbered on their own). Jira's native status field (To Do / In
Progress / Done) is separate and keeps tracking execution progress; it is not the approval
gate.

Where a tool cannot set an actual Confluence label, encode the status as the first line of
the page body instead: `**Status:** <status> · **Owner:** <role> · **Updated:** <date>`.

If a page or issue somehow carries two status signals that disagree, treat it as
`status-blocked` until a human resolves it — never guess which one is authoritative.

### The handover rules

1. **A role may only start when every input it needs carries `status-approved`.**
   If an input page or issue carries any other status, stop and say which one and what
   status it carries. Do not proceed on an unapproved input.

2. **A role may never set its own output to `status-approved`.**
   When you finish, set `status-ready-for-review` and stop. Approval is a human act.
   This is the gate. Marking your own work approved removes it.

3. **Hand over only when the task is ready.**
   Before setting `status-ready-for-review`, verify your own skill's "Done when" list and
   state the result item by item. If any item fails, set `status-blocked`, write why in
   the page body under a "Blocked on" heading (Confluence) or as an issue comment (Jira),
   and stop.

4. **Unanswered questions block the chain.**
   If you cannot complete the artifact without a decision that is not yours to make, set
   `status-blocked` and write the questions into the page body or issue comment. Never
   guess and continue.

5. **Stay in your lane.**
   Write only the artifacts your role owns. If you find a fault in an upstream page or
   issue, report it — do not edit it. Corrections go back to the role that owns it.

6. **Traceability is mandatory.**
   Every requirement-scoped page and issue carries the `id-NNNN` label of the requirement
   it serves. A page or issue whose ID appears nowhere upstream is scope drift, and gets
   reported.

7. **Superseding, never overwriting.**
   Confluence's page history already preserves every prior version. Superseding an ADR
   still means: create the new ADR page, add a "Superseded by: <link>" line to the old
   page's body, and give the old page a `superseded` label. Jira issues are not superseded
   under this model — a Task that turns out wrong is closed or re-scoped, not replaced.

8. **A connection failure blocks, it never falls back.**
   If Confluence or Jira cannot be reached, you cannot verify input status or write your
   output — stop and report the connection failure. Never guess a status, and never fall
   back to reading or writing the local `docs/` snapshot instead.

### What to say at the end of every run

Finish every run with exactly these four lines:

```
ARTIFACT:  <Confluence page URL or Jira issue key>
STATUS:    ready-for-review | blocked
DONE-WHEN: <each item, met or not met>
NEXT:      <the role that should run next, and what it needs from the human first>
```

## Conventions

- Scaffolded with `create-next-app`: App Router (`app/`), TypeScript, ESLint,
  no Tailwind (not a decided dependency yet), no `src/` dir, import alias `@/*`.
- Commands: `npm run dev` (local dev server), `npm run build` (production
  build — also what CI runs), `npm run lint`, `npm start` (serve a build).
- No test runner configured yet — add one (and this note) when the first
  test is written.
