---
id: 0004
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md, docs/intents/0003-exam-flow.md]
updated: 2026-09-12
---

# ADR 0004 — No live code execution in v1

## Context
Chapters 1–4 (Coding/Syntax, Problem Solving, Frontend, Backend) could plausibly run real
user-submitted code against test cases for the most credible signal, or use static
assessment formats (read-code, spot-the-bug, output prediction, fill-in-the-blank)
(requirement 0003).

## Decision
No live execution for v1, static formats only, scored by deterministic answer-key
matching.

## Rejected options
### A hosted code-execution API (e.g. Judge0, Piston) rather than a custom-built sandbox
Reads the same way as the other three "Not now" items (no native mobile, no ATS
integration, no video feedback) — a feature-scope boundary, not just an
implementation-detail preference. Live execution also introduces a real security surface
(arbitrary code, timeouts, abuse potential) unrelated to whether the diagnostic model
itself is sound, and the stated build-order priority is getting the diagnostic data model
right before adding complexity elsewhere.

## Consequences
**We accept:** a somewhat less direct signal for coding ability than running real code
would give.
**We gain:** simpler v1 build — no sandbox, no code-runner integration, no
execution-grading logic.
**We will know it was wrong if:** static formats prove insufficient to differentiate
skill levels credibly once real users go through the exam.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| 0003 | Chapters 1–4 must use static, deterministically-graded formats — no sandboxed
execution |
