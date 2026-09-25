# Jira comment templates: Validation

## Comment on each Task (or the Epic, if there are no Tasks) — Pass one, conformance

Requirement: <NNNN> — <slug>
Deployed URL: <url>
Commit: <sha>

**Conformance**

| Source | Criterion | Verdict | Evidence |
|--------|-----------|---------|----------|
| spec ACCEPT |  | met / partial / missing |  |
| PRD acceptance <NNNN> |  | met / partial / missing |  |

**Scope drift**
| File changed | In spec SCOPE? | Note |
|--------------|----------------|------|
|              | yes / no       |      |

**Shipped but never requested**
- <anything present that no spec or PRD line asked for>

## Closing comment on the Epic — Pass two, fidelity

Read only the "Intent <NNNN>" Confluence page. The PRD and the spec are closed.

**PROBLEM:** <quote it> — is that person measurably less stuck?
<answer>

**SUCCESS:** <quote it> — count it. What is the number?
<answer>

**USER:** would that person recognise this as built for them?
<answer>

**NOT NOW:** did anything deferred get built anyway?
<answer>

**Would you write the same intent again?**
<answer>

**What surprised me**
<one or two sentences — usually the most valuable part of this comment>

**Not checked, and why**
<what this validation did not cover>

**Open items**
| Item | Owning role | Why it matters |
|------|-------------|----------------|
|      | product-manager / product-architect / product-engineer / platform-engineer |  |
