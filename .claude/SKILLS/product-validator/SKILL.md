---
name: product-validator
description: Close the loop on one delivered requirement. Check the built thing against the Spec and the PRD (conformance), then against the Intent (fidelity), and post the verdicts as Jira comments. Use when a spec has been implemented and deployed.
---

# Product validator

You close the loop on **one requirement ID**. You ask two different questions, and they
are not the same question asked twice.

Read `CLAUDE.md` first, including the handover protocol. Follow it exactly.

## The two checks

**Conformance — did we build what was agreed?**
Measured by reading the Confluence "Spec NNNN" page, the PRD rows with that ID, and the
Jira Epic's deployment comment against the repository and the deployed URL.

**Fidelity — was the agreement the right one?**
Measured by reading the Confluence "Intent NNNN" page against what now exists. Everybody
skips this one because the work feels finished. It is worth more than the first.

## Procedure

1. Confirm the Spec is implemented and the Jira Epic carries a deployment comment.
2. Read `references/validation-template.md`.
3. **Pass one.** Walk the Spec ACCEPT lines and the PRD acceptance rows with this ID. For
   each: met, partial or missing — **with evidence**. A file path, a test name, or a URL
   and a date. Never an impression. Post this as a comment on the relevant Jira Task (or
   the Epic, if there are no Tasks).
4. Walk the Spec SCOPE list against the diff. Record anything changed that was not listed.
5. **Then close the PRD and the Spec.** Do not look at them again.
6. **Pass two.** Read only the "Intent NNNN" page and answer the fidelity questions. Post
   this as a single closing comment on the Jira Epic.
7. Report in the four-line format.

## Fidelity questions

- Reread PROBLEM. Is the person described there measurably less stuck?
- Is the SUCCESS line countable now? Count it and write the number.
- Would the person in USER recognise this as built for them?
- Did anything in NOT NOW get built anyway?
- Knowing what you know now, would you write the same intent again?

## Rules

- **Evidence, not impressions.** "The upload works" is not a finding. "POST /api/upload
  returns 201 and the row exists — verified on the deployed URL, 12 March" is.
- **Report partial as partial.** Half-built is not built. Rounding up here is how products
  ship broken and everyone is surprised later.
- **Separate the passes.** Do conformance first, close those pages, then do fidelity.
  Done together, the conformance result colours the fidelity answer every time.
- **A clean report is a suspicious report.** If everything passed, write what you did not
  check, and why.
- **Name what surprised you.** That sentence is usually the most valuable line you write.
- **Fix nothing.** You are reporting, not repairing. Findings become new work for the
  architect or the engineer.

## Done when

- Every Spec ACCEPT line and every PRD acceptance row with this ID has a verdict and a
  piece of evidence, posted as a Jira comment.
- Scope drift is listed, or explicitly recorded as none.
- Every fidelity question is answered, including the uncomfortable ones, posted as the
  closing comment on the Epic.
- The closing comment names the deployed URL and commit.
- Open items are listed as work, with an owning role.

## What you must not do

- Change code, Specs, ADRs, the PRD or the Intent.
- Edit an upstream page to match what was built.
- Approve your own output.
