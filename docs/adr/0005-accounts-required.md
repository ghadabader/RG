---
id: 0005
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0001-auth.md]
updated: 2026-09-12
---

# ADR 0005 — User accounts are required

## Context
The product could allow anonymous, one-off assessment use, or require an account tying
results to a persistent profile (requirement 0001).

## Decision
Accounts required. Every attempt, profile, and set of recommendations is scoped to a
logged-in user.

## Rejected options
### Anonymous, one-off sessions
History (requirement 0005) and the compounding recommendation effect across retakes (ADR
0006) both depend on persistent identity — neither would be possible with fully
anonymous, disconnected sessions.

## Consequences
**We accept:** sign-up/login friction before a user reaches the exam.
**We gain:** history across attempts and a compounding recommendation effect as a user
retakes the assessment over time.
**We will know it was wrong if:** sign-up friction measurably suppresses first-time
completion (requirement 0001's under-a-minute target) badly enough to outweigh the
retention benefit.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0001 | Every screen past the landing page requires a logged-in session |
