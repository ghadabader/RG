# Confluence page template: ADR

Page title: `ADR <NNNN> — <the decision, as a short statement>`
Parent: none — ADRs are a flat sequence in space `RG`, their own numbering (not a
requirement ID)
Label(s): none by default

Page body:
---
**Status:** draft · **Owner:** product-architect · **Updated:** <date>

## Context
<What forces this decision now. Reference the PRD requirement IDs or constraints that
made it unavoidable. Two or three sentences.>

## Decision
<What we are doing. One paragraph, in the present tense.>

## Rejected options
### <option>
<Why not. Be specific — "too slow" is not a reason, "adds a server we have no budget to
run" is.>

### <option>
<Why not.>

## Consequences
**We accept:** <what gets harder or more expensive because of this>
**We gain:** <what gets easier>
**We will know it was wrong if:** <the observable signal that this decision failed>

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
|                |                        |

When this ADR is superseded: create the new ADR page, add a line
`**Superseded by:** <link>` at the end of this page's body, and give this page the
`superseded` label.
