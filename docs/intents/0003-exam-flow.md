---
id: 0003
status: ready-for-review
owner: product-manager
inputs: [docs/prd.md]
updated: 2026-09-12
---

# Intent 0003 — Exam flow (`/exam/[attemptId]`)

Derived from PRD requirement 0003, rank 1.

PROBLEM:  This is the core mechanism the whole product depends on — an honest, adaptive
skill diagnostic across 6 chapters. Without an accurate diagnostic, neither downstream
output (learning path, job matches) can be trusted.
USER:     Any tech learner taking their first assessment or a retake.
OUTCOME:  Per chapter, questions start easy and escalate in difficulty, drawn at random
from each tier's question pool (needed for retake rotation). The chapter ends after 3
wrong answers in a row. The user can pause after any fully-answered question and resume
later exactly where they left off (never mid-question) — in-progress state (tier,
wrong-streak) persists. Once all 6 chapters are done, the attempt is scored and a
diagnostic profile is produced.
SUCCESS:  A user can complete the full assessment (active time, excluding pauses) in under
3 hours, and the scoring reflects the highest difficulty tier sustained per chapter, not
raw percent-correct (see ADR-002).
LIMITS:   No live code execution (see ADR-004) — all chapters use static formats:
read-code/spot-the-bug, output/complexity prediction, fill-in-the-blank, scenario
questions. Retakes are allowed, so each (chapter, tier) needs multiple questions to draw
from, not a single ladder (see ADR-006).
NOT NOW:  Sandboxed live code execution/compilation; a fixed, non-rotating question ladder.

## Open questions
- Exact question-bank size per (chapter, tier) needed to make retakes not feel
  repetitive — not yet estimated.
