---
id: 0007
status: ready-for-review
owner: product-architect
inputs: [docs/prd.md]
updated: 2026-09-12
---

# ADR 0007 — Single Next.js deployable (API routes), not a separate backend service

## Context
The backend could be a separate service (e.g. FastAPI) or Next.js API routes in the same
project as the frontend. This is a product-wide decision, not tied to a single
requirement.

## Decision
Next.js API routes. One language (TypeScript) across the whole stack, one deployable.

## Rejected options
### A separate backend service (e.g. FastAPI, Express as its own service)
Adds a second language/runtime and a second deployable for no concrete benefit yet
identified; slower solo-build iteration and doesn't fit the free-tier hosting plan as
directly.

## Consequences
**We accept:** if a workload ever genuinely can't run in Next.js API routes, a later
migration would be needed.
**We gain:** fastest solo-build iteration; fits the free-tier hosting plan (Vercel +
Supabase) directly.
**We will know it was wrong if:** a concrete workload emerges that Next.js API routes
genuinely can't handle — not treated as a default expected outcome.

## Binds
| Requirement ID | How this constrains it |
|----------------|------------------------|
| — | Product-wide — binds all requirements' implementation to a single Next.js deployable rather than a per-requirement constraint |
