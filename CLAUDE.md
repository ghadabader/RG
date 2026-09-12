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

## Conventions

(Empty — none exist yet. Add build/lint/test commands and code style notes
here as soon as the first package.json and folder structure exist, rather
than leaving this section stale.)
