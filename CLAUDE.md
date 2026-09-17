# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Working folder for a one-day exercise (DaiL / Octopus day), case **C04 — "The delivery arrived. The invoice tells a different story."**

Supplied materials (do not alter their substance):

- `case-pack.md` — the candidate pack: client situation, working agreement, demo checklist and the Wolf handoff template. Renamed from `readme.md` and reformatted; wording unchanged.
- `initial.json` — the entire synthetic dataset. Everything the prototype reconciles comes from this file.

Received from the organiser during the exercise:

- `ref/client-messages-logs` — the checkpoint emails from Yassine Bekri (DaiL). The third one assigns the client: **trast digital gmbh** (<https://trast.de/>), target users *parts receiving leads and colleagues reconciling delivery and invoice evidence*, and makes **client fit a review criterion** — how closely the UI, visual language, wording and workflow reflect the assigned organisation.
- `ref/image*.png` — screenshots of trast.de kept for that reason: all-lowercase headings and nav, pill-outline buttons, a geometric sans, indigo/electric-blue/coral gradients on light grey, and an informal German voice. Note the collision to resolve before adopting it: **indigo is currently the prototype's "simulated" colour**, and it is trast's brand colour.
- `meme-for-prestantion.jpeg` — for the presentation.

Our own writing:

- `README.md` — the deliverable README: result first, run instructions, real vs simulated, limitations, next validation test.
- `web/src/app/docs/page.tsx` — the presenter briefing, served at `/docs`. Static on purpose: it must still open if Supabase is unreachable. Translated like the rest of the app. Every "Built / Partial / Not built" badge on it is a claim the demo has to be able to back — update it when the feature list changes.

The deliverable is a working prototype (or clearly labeled clickable demonstration) that answers the starting question — *what should the employee record at receipt so the next person can resolve the difference?* — plus a short README (run instructions, real vs simulated, limitations, next validation test) and a filled Wolf handoff.

## Commands

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4) in `web/`, Supabase Postgres as the store.

```bash
cd web && npm run dev      # demo at http://localhost:3000,
                          # presenter briefing at /docs
cd web && npm run build    # production build
cd web && npx tsc --noEmit # typecheck
```

**Reset to the start state:** re-run `supabase/seed.sql` in the Supabase SQL editor. It truncates and reloads the records from `initial.json` verbatim.

`npm run e2e` drives both suites over real HTTP (dev server must be running); step E10 covers Arabic and the message round-trip through the database, E11 the settings screen.

`web/.env.local` holds the three keys (URL, publishable, secret) and is gitignored; `web/.env.example` documents the shape.

## Architecture

Three screens, in the order the work happens: `/` goods receipt → `/evidence` the chain → `/review` the decision. `/docs` and `/settings` sit off the flow.

- `supabase/schema.sql` — 8 tables. `receipts` carries a check constraint `accepted = received - damaged` so the three quantities cannot be collapsed at the DB level (verified: a bad write returns `23514`). `delivery_notes.duplicate_of` makes a merged scan an explicit, reviewable row. `credit_notes` lets a supplier correction arrive as its own record rather than as an edit to `INV-1`. Additive migrations live in `supabase/migrations/`.
- `src/lib/reconcile.ts` — pure domain logic, no database. Ranks a leading cause with a confidence but never settles one: it emits `likely`, the open `candidates`, the `evidence` ids, a `proposedAction` and what would settle it. **Propose, don't decide.** Each discrepancy also carries `msg`, the facts behind its sentence, so the same gap can be re-worded in either language; `renderDiscrepancy(dict, msg)` does that. The English prose it returns is what gets persisted with a proposal.
- `src/app/globals.css` — the design system, and it is the assigned client's. Montserrat because trast.de sets it for headlines *and* body; the palette (`--brand: #4520d1`, the coral, the greys) read off their own CSS custom properties and cross-checked by sampling `ref/`. Two rules carry the look: **containers square, controls round** (their blocks and their pill nav), and lowercase chrome via `text-transform` on `h1`/`h2`/`.lc` — done in CSS, never in the dictionaries, so `de.ts` keeps correct German and the e2e suites keep matching raw HTML. `[class~="font-mono"]` opts record ids out. Never use trast's logo, mark or wordmark: the assignment is an exercise and does not imply endorsement.
- `src/components/button-styles.ts` — the pill classes, in a plain module with **no `"use client"`**. They used to live in `ui.tsx`; a Server Component importing from a client module gets a client reference, so `btn.primary` came back `undefined` and three pages shipped unstyled links. Classes are data, not components — keep them out of client modules.
- `src/lib/i18n/` — `en.ts` is the source dictionary; `ar.ts` and `de.ts` are typed `Dict` against it, so an untranslated key fails the typecheck. German is there because the assigned client is a German company, and it addresses the reader as *du* to match their register; the Intl tag for times lives in the dictionary too (`bcp47`), so no screen branches on the locale code. The locale is a cookie (`c04-lang`) read on the server by `i18n/server.ts`, which is what lets `<html lang dir>` be correct in the first response and keeps the switch working without JavaScript. Client components read it through `LocaleProvider` / `useT()`. Every screen follows the switch, `/docs` included: its prose lives in the dictionaries under `docs`, while the feature list and its Built / Not built badges stay in the page, because a badge is a claim about the build and not a piece of language. Emphasis inside a briefing sentence is written as `*bold*`, `_italic_` and `` `mono` `` and rendered by a small `rich()` helper, so it moves with the words when Arabic re-orders them.
- `src/lib/case-config/` — the case parameters `/settings` exposes (part, ordered, listed, counted, damaged, invoiced) and `buildRecords()`, which turns them back into rows. Ids and structure are fixed; only quantities and the part name move. Prototype scaffolding and labelled as such on the page, in `/docs` and in the top banner. The config lives in a cookie (`c04-case`) read by `case-config/server.ts`, so it needs no migration and the cookie-less e2e suites always run against `initial.json`. Applying rebuilds the case, because proposals raised against the old numbers answer a question that no longer exists.
- `src/lib/seed-data.ts` — the supplied records the app reseeds from. `npm run check:seed` asserts it still matches `initial.json` field for field; run it before touching anything near the data.
- `src/app/actions.ts` — **every write in the app.** Nothing else can change state.
- `src/lib/supabase/client.ts` (browser, publishable key) and `server.ts` (secret key, `server-only`).
- RLS grants select only. The browser key is **verified unable to write** (`42501`), so every state change must go through a server action behind review.
- Two simulated events (invoice arrives, credit note issued). Anything simulated is **coral** (`--sim`) and tagged; keep it that way. It was violet until the trast restyle made the client's indigo the brand colour - the two are the same hue family, so simulated moved to the client's coral rather than sitting next to ordinary chrome. The word and the ◆ carry the label too, so it survives greyscale. The convention is written down in nine dictionary strings (three each in `en.ts`, `de.ts`, `ar.ts`), the README table and here; move all of them together or `/docs` starts lying.

## The domain problem (why the numbers look inconsistent)

`PO-1` orders 10 × `FILTER-X`. Two delivery notes reference it (`DN-1` listed 8, `DN-2` listed 2). Receipts record `RC-1` = 8 received / 1 damaged / 7 accepted and `RC-2` = 2 received / 0 damaged / 2 accepted. `INV-1` bills 10 against both notes.

Totals: 10 listed, 10 received, **9 accepted**, 10 invoiced. The one-unit gap is a damaged unit, not a shortage — and the two notes are one order delivered in parts, not two deliveries. That is the whole point of the case: a difference has at least four candidate causes (shortage, damage, duplicate scan, second delivery) and the records as captured today cannot tell them apart. Any data model must keep the three quantities distinct per receipt and preserve the chain receipt → delivery note → order → invoice line, so a later reader can resolve a difference to a cause with evidence.

## Rules that constrain any implementation

From `initial.json.rules` and the pack's working agreement — treat as non-negotiable:

- Keep `received`, `damaged` and `accepted` separate at every layer; never collapse them into one net quantity.
- One scan is not necessarily one new delivery. Deduplication or merging of scans must be explicit and reviewable, never silent.
- No stock or accounting write without review. Every proposed change goes to a person who can approve or correct it, and the reviewed outcome becomes the state.
- Nothing external is actually executed: no supplier message, inventory update or accounting entry. Scanned-document input may be simulated and must be labeled.
- Do not alter the supplied records to make the prototype appear correct. Additional synthetic records go in separate files and are labeled as generated.
- If a service is unavailable, use a labeled local simulation and disclose hard-coded or generated output. A scripted animation is not evidence that an agent performed an action.
- New information arrives mid-exercise (a facilitator injects it), so the design must absorb a changed fact — e.g. a corrected invoice or a late delivery note. A button that explicitly simulates an incoming event is acceptable if it is called a simulation.

## What the demonstration must contain

- The loop: trigger → evidence-backed proposal → a person who can approve or correct it → the resulting state.
- An evidence view: which record supports which claim.
- At least one uncertain or failure case.
- Three paths: ordinary, changed-information, and failure/uncertainty (the handoff template asks for each by name).
- Wolf handoff: next integration and permissions, data boundary and model processing location, failure/recovery plan, monitoring owner, unresolved risk, next action and owner. No invented price or delivery commitment.
- Result first in the presentation, and an explicit split between what is demonstrated and what remains a hypothesis.
