# Confluence page template: Spec

Page title: `Spec <NNNN> — <feature name>`
Parent: the "Intent <NNNN>" page
Label(s): `id-<NNNN>`

Page body:
---
**Status:** draft · **Owner:** product-architect · **Updated:** <date>

Implements Intent <NNNN>. Bound by ADR <list the numbers, as links>.

APPROACH:   <the shape chosen, in two lines>
            Rejected: <option> (<reason>)
            Rejected: <option> (<reason>)

INTERFACE:  <routes, functions or payloads other code will depend on>

DATA:       <what is stored, in what shape>
            <what is deliberately not stored>

STACK:      <exact frameworks and versions, from CLAUDE.md and the ADRs>

SCOPE:      <explicit list of files to create or change>

OUT:        <what must not be touched or added>

ACCEPT:     <testable criterion>  -> PRD acceptance <NNNN>
            <testable criterion>  -> PRD acceptance <NNNN>

RISKS:      <what you expect to go wrong; the validator checks these first>

## Unmapped acceptance lines
<Any PRD acceptance line with this ID that this spec does not satisfy. Empty is fine.
Silence is not.>
