# Atlassian-backed artifact chain — design

## Context

The project's artifact chain (`CLAUDE.md`, "Artifact chain and handover protocol") is
currently a local, file-based pipeline: `pitch.txt` → `docs/prd.md` + `docs/intents/` →
`docs/adr/` + `docs/specs/` → source code → `deployment.md` → `docs/validation/`. Every
role (`product-manager`, `product-architect`, `product-engineer`, `platform-engineer`,
`product-validator`) reads/writes these files directly, gated by a `status:` frontmatter
field and a fixed set of handover rules.

An Atlassian MCP server (Jira + Confluence, Cloud) is now connected for this project.
The user wants PM and Architect to work through Confluence, and Engineer/Platform/
Validator to work through Jira, replacing the local-file chain for those roles' own
artifacts. This doc records the design agreed in brainstorming; the follow-up plan
(written by `writing-plans`) turns it into an ordered set of edits and migration steps.

## Goals

- PM and Architect's own artifacts (PRD, intents, ADRs, specs) live in Confluence, not
  in `docs/`.
- Engineer, Platform, and Validator's own artifacts (task tracking, deployment records,
  validation verdicts) live in Jira, not in `docs/`.
- The existing handover discipline (approval gate, no self-approval, blocked-on
  questions, supersession, traceable IDs, the four-line end-of-run report) survives the
  move unchanged in spirit, translated onto labels/comments instead of YAML frontmatter.
- Existing local content (`docs/prd.md`, 7 intents, 7 ADRs) is migrated into Confluence
  once, then frozen locally as a historical snapshot.

## Non-goals

- No change to what each role is allowed to do (the "stay in your lane" rules, the
  narrow-context rule for `product-engineer`, etc.) — only where the artifacts live.
- No Confluence/Jira workflow-scheme administration (custom Jira statuses, permission
  schemes). The existing default Kanban workflow (To Do / In Progress / Done) and
  default space/project permissions are used as-is.
- No migration of anything under `docs/specs/` or `docs/validation/` — neither exists
  yet, so there is nothing to migrate for those two artifact types.
- `pitch.txt` is unaffected — it is the seed input to the chain, not a chain artifact.

## Confirmed account state (read via the `atlassian` MCP server)

- Jira project: key `KAN`, name "RG" — already exists, default Kanban workflow, issue
  types available: Epic, Task, Subtask, Story, Feature, Bug.
- Confluence space: key `RG` — exists, currently empty.
- Confluence also has a personal space ("Ghada") and the default "OOP" (Other or
  Personal) catch-all space — neither is used by this design.

## Ownership model

| System | Owner | Access for other roles |
|---|---|---|
| Confluence space `RG` | PM (PRD, Intents) and Architect (ADRs, Specs) | Engineer, Platform, Validator: **read-only** |
| Jira project `KAN` | Engineer, Platform, Validator (execution, deployment, validation) | PM: **create-only** (turns an approved intent into Epic + Tasks); Architect: none |

No role calls another role — the Confluence page or Jira issue is still the interface,
exactly as the current "artifact is the interface" rule states. Only the artifact's
storage location changes.

## Confluence structure (space `RG`)

- **Home page: "PRD"** — the single ranked-requirements document, replacing
  `docs/prd.md`. Confluence's built-in page history replaces git history for this
  document; there is no numbered PRD "version," just the current page and its history.
- **Child page per requirement: "Intent NNNN — <slug>"** — replaces
  `docs/intents/NNNN-<slug>.md`, same four-digit ID space, same six-field intent
  structure from `references/intent-template.md`.
- **Child page per architecture decision: "ADR NNNN — <slug>"** — replaces
  `docs/adr/NNNN-<slug>.md`. This is its **own** independent numbering sequence (not
  the requirement ID), continuing from `0008` since `0001`–`0007` already exist
  locally and get migrated in as `0001`–`0007`.
- **Child page per spec: "Spec NNNN — <slug>"** — replaces `docs/specs/NNNN-<slug>.md`,
  written only when the user names an intent to be made ready for development, sharing
  that intent's ID.

Every page above carries exactly one status label (see "Status gate" below) and, where
it carries a requirement ID, a label `id-NNNN`.

## Jira structure (project `KAN`)

- **One Epic per requirement**, created by PM once that requirement's spec is
  `status-approved`: "Requirement NNNN — <slug>", labeled `id-NNNN`.
- **Tasks/Subtasks** under that Epic for the actual engineering, deployment, and
  validation work. Every issue belonging to requirement NNNN is labeled `id-NNNN`, so
  `label = id-NNNN` finds the complete thread for that requirement across Epic and
  Tasks.
- **Deployment record** — replaces `deployment.md`. Platform Engineer posts a
  structured comment on the Epic: deployed URL, one-command deploy instructions (or a
  pointer to where they live in the repo, if they're real scripts), date, and the
  ACCEPT-line-by-ACCEPT-line verification results. If real deployment scripts/configs
  exist, they still live in the repository as code — only the human-readable record
  moves to Jira.
- **Validation verdicts** — replaces `docs/validation/NNNN-<slug>.md`. Validator posts
  conformance findings (evidence per ACCEPT line) as a comment on each relevant Task,
  and posts the fidelity pass as a single closing comment on the Epic.

## Status gate (replaces the `status:` frontmatter field)

Every Confluence page and Jira issue in this flow carries exactly one label at a time:

- `status-draft`
- `status-ready-for-review`
- `status-approved`
- `status-blocked`

Jira's native status field (To Do / In Progress / Done) is left alone and keeps
tracking execution progress — it is a separate concern from the approval gate.

Handover rules, restated for this substrate:

1. **A role may only start when every input it needs carries `status-approved`.** If an
   input page/issue carries any other status label, stop and say which one and its
   current label — same as today's "which file and what state."
2. **A role may never set its own output to `status-approved`.** It sets
   `status-ready-for-review` and stops. A human changes the label to `status-approved`.
3. **Hand over only when ready.** Same "Done when" self-check as today before applying
   `status-ready-for-review`.
4. **Unanswered questions block the chain.** Set `status-blocked` and write the
   questions into the page body (Confluence) or as an issue comment (Jira). Never guess
   and continue.
5. **Stay in your lane.** Unchanged — a role reports a fault in an upstream page/issue
   rather than editing it.
6. **Traceability is mandatory.** Every page/issue names the requirement ID it serves
   via the `id-NNNN` label (ADRs are the one exception, per their own numbering).
7. **Superseding, never overwriting.** For Confluence, page history already preserves
   every prior version; superseding an ADR still means: create the new ADR page, and
   add a "Superseded by: <link>" note plus a `superseded` label on the old page (mirrors
   today's `superseded-by:` frontmatter field). Jira issues are not superseded under
   this model — a Task that turns out wrong is closed/re-scoped, not replaced.

The four-line end-of-run report format is unchanged, except `ARTIFACT` becomes a
Confluence page URL or a Jira issue key instead of a file path:

```
ARTIFACT:  <Confluence URL or Jira issue key>
STATUS:    ready-for-review | blocked
DONE-WHEN: <each item, met or not met>
NEXT:      <the role that should run next, and what it needs from the human first>
```

## Migration of existing local content

`docs/prd.md`, the 7 files in `docs/intents/`, and the 7 files in `docs/adr/` are
migrated into Confluence space `RG` once, preserving each file's current `status:`
value as its new label. After migration:

- Each local file gets a one-line banner prepended:
  `> Moved to Confluence: <page URL>. This file is frozen as a historical snapshot and
  is no longer updated.`
- The files are otherwise left in place, untouched, as a frozen historical snapshot —
  not deleted, not further edited by any role from this point on.
- `docs/specs/` and `docs/validation/` are not touched by migration — neither has any
  content yet.

## Files this affects (for the implementation plan)

- `CLAUDE.md` — rewrite the "Artifact chain and handover protocol" section to describe
  the Confluence/Jira chain, labels, and the mapping above, replacing the file-path-based
  version. Keep everything else in `CLAUDE.md` unchanged.
- `.claude/SKILLS/product-manager/SKILL.md` — owns Confluence "PRD" + "Intent" pages
  instead of `docs/prd.md` / `docs/intents/`; gains a step to create the Jira Epic (+
  Tasks, if it breaks work down that far) once an intent's spec is approved.
- `.claude/SKILLS/product-architect/SKILL.md` — owns Confluence "ADR" + "Spec" pages
  instead of `docs/adr/` / `docs/specs/`.
- `.claude/SKILLS/product-engineer/SKILL.md` — reads the named Jira Epic/Task (not a
  spec file) for SCOPE/ACCEPT, still reads the Confluence Spec page it points to plus
  any ADRs it names (read-only), still writes code exactly as today.
- `.claude/SKILLS/platform-engineer/SKILL.md` — posts the deployment record as a Jira
  comment on the Epic instead of writing `deployment.md`.
- `.claude/SKILLS/product-validator/SKILL.md` — posts conformance/fidelity findings as
  Jira comments instead of writing `docs/validation/NNNN-<slug>.md`.
- `.claude/SKILLS/product-manager/references/prd-template.md`,
  `.../intent-template.md`, `product-architect/references/adr-template.md`,
  `.../spec-template.md`, `product-validator/references/validation-template.md` —
  reworked from frontmatter+markdown file templates into Confluence page body /
  Jira comment body templates (no more `status:`/`inputs:`/`owner:` YAML header; a
  label list instead).
- The 15 existing files under `docs/prd.md`, `docs/intents/`, `docs/adr/` — banner
  prepended, otherwise untouched.

## Error handling / edge cases

- **Label collision** (a page/issue somehow carries two `status-*` labels): treat as
  `status-blocked` until a human resolves it — never guess which one is authoritative.
- **Confluence page has no `id-NNNN` label** (e.g., an ADR, which is intentionally
  unlabeled by requirement ID): expected, not an error — only requirement-scoped pages
  (Intent, Spec) and their Jira issues carry `id-NNNN`.
- **Jira issue created without a matching Confluence Spec approved first**: this
  violates handover rule 1 — PM must not create the Epic until the Spec page is
  `status-approved`.
- **MCP server unavailable** (connection timeout, auth expired): a role cannot verify
  input status or write output — stop and report the connection failure rather than
  falling back to guessing or writing to the local `docs/` files instead.

## Verification / definition of done

- All 15 existing local files have a migrated Confluence counterpart with a matching
  status label, and carry the frozen-snapshot banner.
- `CLAUDE.md` and all five role `SKILL.md` files reference Confluence/Jira, not
  `docs/prd.md` / `docs/intents/` / `docs/adr/` / `docs/specs/` / `docs/validation/` /
  `deployment.md`, for their own artifacts.
- A dry run of one role (e.g., `product-manager` amending an existing intent) can be
  performed entirely through the `atlassian` MCP tools, with no local file write for
  its own artifact.

## Open items carried into the plan (not blocking, but worth flagging)

- Confluence space `RG` and Jira project `KAN` currently have default/no explicit
  permission scheme reviewed — out of scope here, but worth a look before inviting any
  other collaborator into either.
