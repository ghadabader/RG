# AI assistant, mistake explanations and job-fit check: input brief

**Date:** 2026-09-26
**Kind:** Input brief for `product-manager` (like `pitch.txt`). This is **not** a PRD,
intent or spec. Those are written in Confluence by the roles that own them. Nothing here
is approved until it goes through the chain.

## Why

Two gaps remain after the report page (requirement 0004):

1. A user sees a score but not *why* they got questions wrong, so they can't learn from
   their own mistakes.
2. A user finds a real job posting and can't tell how close they are to it, since the
   report only ranks job titles the system picked.

Both answers must come from the **same stored diagnostic profile** (ADR 0001). This
brief adds no separate scoring or matching system. It adds new ways to read the one
profile.

## Scope

Three connected pieces. The brief suggests PM give each its own requirement ID:

| Piece | Short name |
|---|---|
| Mistake explanations on the report page | `mistake-explanations` |
| Job-fit check against a pasted posting | `job-fit-check` |
| General AI assistant, reachable from both and on its own | `ai-assistant` |

Out of scope for this round: a study plan builder (deferred) and anything already on the
"Not now" list (video interview feedback, live code execution, ATS integrations).

## Decisions made with the user in brainstorming

1. **Nothing is available during an exam.** Explanations and the assistant only apply to
   attempts that have been **submitted**.
2. **Mistake explanations use pre-written text.** Every question in the bank carries a
   short written explanation. The report page shows it next to each wrong answer, with
   the user's answer and the correct one. No LLM call is needed to show it.
3. **"Ask why" opens the assistant** with that question in context, for users who don't
   understand the written explanation.
4. **Retakes never repeat an explained question.** When building a retake, the exam
   skips every question whose explanation that user has seen. This extends the rotation
   rule in ADR 0006 to individual users.
5. **Job-fit input is pasted text only.** No URL fetching, which avoids scraping, login
   walls and server-side request forgery (SSRF).
6. **Job-fit output is a requirement-by-requirement breakdown:**
   - Claude extracts each requirement from the posting and assigns it to one of the
     exam areas, or marks it **not assessed** (for example "5 years experience").
   - Each assigned requirement is compared to the user's stored area score and marked
     **covered**, **partial** or **gap**.
   - Each gap gets course suggestions found by vector search. Links are checked before
     they are shown, as with the report.
   - An overall label sits on top: **Ready / Close / Not yet**.
7. **One general assistant, not per-item chats.** It can use the user's whole profile,
   attempt history and job-fit results, so it also covers the "results coach" idea
   ("why was I matched to X?").
8. **Retrieval uses Supabase Postgres with pgvector, not Vertex AI.** Claude is called
   through the Anthropic API from server-side routes only. No new cloud provider, which
   keeps ADR 0007's single deployable.
9. **Daily message cap per user**, default 30 messages a day, configurable, with the
   remaining count shown in the UI.
10. **What is stored:**
    - Job-fit results are saved and linked to the attempt they were checked against.
    - Chat conversations are saved, and the user can delete them.
    - For internal improvement, only **anonymized aggregate counts** are kept, never raw
      chat text. Examples: "Ask why" count per question, and how often each requirement
      appears in pasted postings.

## How it works

### Retrieval: mostly exact lookups

| Need | Method |
|---|---|
| The user's answers, correct answers, explanations | Exact lookup by attempt and question ID |
| The user's profile | Exact lookup of the stored `diagnostic_profiles` row (ADR 0001) |
| Mapping posting requirements to exam areas | A small skill-to-area list, included in the prompt |
| Courses that close a gap | **Vector similarity search (pgvector)** over course catalog embeddings |

Vector search is only used for the course catalog. Everything else is exact data, which
keeps answers grounded in the user's real records.

### The assistant

- Runs only in Next.js API routes. The API key never reaches the browser.
- Claude works with **tools that only read data**, and calls them as needed instead of
  receiving everything up front:
  - `get_profile`: the stored profile(s)
  - `get_attempt_answers`: answers and explanations for **submitted** attempts only
  - `get_job_fit_results`: saved job-fit checks
  - `search_courses`: pgvector search, returning only links that have been checked
- Every tool queries the database as the signed-in user, so RLS limits it to their own
  rows. An attempt that is still in progress cannot be returned, by rule and by query.
- Entry points pass context: "Ask why" opens with a question ID, and "Ask about this"
  opens with a job-fit result ID.
- It replies in the selected interface language (Arabic, English or Hebrew), with
  English terms in brackets as in ADR 0003.
- It redirects anything outside career and learning topics.

### Data it implies (for product-architect to finalize)

- Question bank: an explanation field on each question, in all three languages.
- Seen explanations: (user, question) pairs, read when building a retake.
- Job-fit checks: pasted text, extracted requirements, per-requirement status, overall
  label, and the attempt checked against.
- Conversations and messages: owned by the user and deletable.
- Daily usage counter per user.
- Course catalog: entries with checked links and an embedding vector.
- Anonymized counters: per question and per requirement term, with no user ID.

## Failure behavior

- **Claude API unavailable or times out:** written explanations still show, since they
  need no LLM. The assistant and job-fit check show a retry message, and the attempt
  does not count against the daily cap.
- **Cap reached:** a clear message with the reset time. Written explanations stay
  available.
- **Posting too short or not a job posting:** asks the user to paste the full
  description. No partial result is saved.
- **Course link fails the check:** the course is left out, never shown broken.

## How to test it

- **Integrity:** no tool or page returns answers or explanations for an attempt that
  hasn't been submitted.
- **Retake rule:** a retake built after seeing explanations contains none of the
  explained questions.
- **Data isolation:** user A's assistant cannot read user B's profile, chats or job-fit
  results (RLS tests).
- **Job-fit accuracy:** fixed sample postings produce a stable breakdown against fixed
  profiles, and experience-type requirements are marked not assessed.
- **Cap:** message 31 in one day is refused, and a failed call doesn't count.
- **Language:** answers come back in the selected language with correct bracket
  formatting, including for Arabic and Hebrew prompts.

## Open questions for the chain

For **product-manager**:
- Confirm the three requirement IDs and their order. Suggested: `mistake-explanations`,
  then `ai-assistant`, then `job-fit-check`.
- Confirm the 30 messages/day default as the answer to the open LLM cost-control
  question, at least for the assistant.
- Who writes the pre-written explanations in three languages, and when? This is
  question-bank authoring work that grows the already-open bank-size question.

For **product-architect** (ADR candidates):
- An ADR for the assistant foundation: server-side tool use, read-only tools, RLS.
- Choosing the **embedding model**. It must handle Arabic and Hebrew. Supabase's
  built-in small model is English-focused, and Anthropic offers no embeddings, so a
  multilingual provider such as Voyage is likely needed.
- How question-bank sizing changes, now that retakes exclude explained questions.
- Whether saving pasted postings needs a retention limit.
