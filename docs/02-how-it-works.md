# 02 — How it works

[← README](../README.md) · [← What was built](01-what-was-built.md)

Stack: **Next.js 16** (App Router, TypeScript, Tailwind v4) on **Supabase
Postgres**, deployed on Vercel.

---

## The data model

Eight tables in `supabase/schema.sql`. Two of them carry rules the case turns
on, and those rules live in the database rather than in convention:

```sql
-- the three quantities cannot be collapsed into one net number
constraint receipts_quantities_balance check (accepted = received - damaged)

-- a second physical delivery brings its own note; a second receipt
-- against the same one is a double submit
constraint receipts_one_per_note unique (delivery_note)
```

A bad write returns Postgres `23514` — verified, not assumed.

| Table | Why it exists |
| --- | --- |
| `orders` | The purchase order. `PO-1`, 10 × `FILTER-X` |
| `delivery_notes` | What the supplier says is in the shipment. `duplicate_of` makes a merged scan an **explicit, reviewable row** — deduplication is never silent |
| `receipts` | What was actually counted. The three quantities, separate, constrained |
| `invoices` | What is being billed |
| `invoice_lines` | An invoice may bill against several notes — `INV-1` covers `DN-1` and `DN-2` |
| `credit_notes` | A supplier correction arrives as its **own record**, never as an edit to `INV-1` |
| `proposals` | What the system proposes, with its evidence ids and confidence. Never auto-applied |
| `review_decisions` | The reviewed outcome. This is what becomes the state |

The chain **receipt → delivery note → order → invoice line** is preserved by
foreign keys, which is what lets a later reader follow one unit all the way
back.

---

## The reconciliation engine

`web/src/lib/reconcile.ts`. **Pure TypeScript, no database, no model call.** The
same records always produce the same proposal — it is arithmetic over rows, not
a generated answer.

It raises three kinds of difference:

| Kind | When | Leading cause | Confidence |
| --- | --- | --- | --- |
| `received_vs_listed` | Counted-in does not match what the notes listed | `shortage` | likely |
| `invoiced_vs_accepted` | Billed for more than was accepted into stock | `damage` if damage matches the gap exactly, otherwise **none** | likely / uncertain |
| `split_delivery` | Several notes against one order, once everything is counted in *and* something is being claimed | `second_delivery` | possible |

Four candidate causes, the ones the client named: **shortage**, **damage**,
**duplicate scan**, **second delivery**. Confidence is `likely`, `possible` or
`uncertain` — **never "certain"**.

Each difference carries:

- `likely` — the best-supported cause, or `null` when the evidence genuinely
  cannot rank them
- `candidates` — every cause the evidence cannot rule out
- `evidence` — the record ids backing the claim
- `proposedAction` — what it proposes doing next. A proposal, never an execution
- `settledBy` — what would remove the remaining doubt
- `msg` — the **facts** behind the sentence, so the same gap can be re-worded in
  either language

### Why the facts travel separately from the words

A proposal sits in the database until someone reviews it, possibly weeks later
and possibly in a different language than the one it was raised in. So the
engine stores the facts as data alongside the English prose, and
`renderDiscrepancy(dict, msg)` applies the wording at render time. A difference
raised in German reads correctly in Arabic.

### The split-delivery timing

A split delivery is raised only once everything is counted in *and* an invoice
exists. Before the invoice, a split delivery is just a delivery; it becomes a
question when someone has to decide what the invoice is paying for. Raising it
at the bay would put a proposal on every clean receipt.

---

## Where writes are allowed

**`web/src/app/actions.ts` is every write in the application.** Nothing else can
change state.

This is structural, not a convention:

- **`server.ts` is the only Supabase client**, it holds the secret key, and it
  is marked `server-only` — so it cannot be bundled into a browser chunk. Both
  `queries.ts` (reads) and `actions.ts` (writes) go through it.
- **No Supabase key reaches the browser at all.** Verified by pulling the
  deployed JavaScript bundle: neither a key nor a project URL appears in it.
  There is deliberately no browser client.
- **Row-level security grants select only**, as the backstop behind that: if a
  browser client were ever added, a write from it would be refused with
  Postgres `42501`.

Together that makes *no stock or accounting write without review* a property of
the system rather than a promise in a README.

The actions, in full: set language, reset the case, apply/restore case config,
capture a receipt, sync proposals, decide a proposal, simulate an event.

### Proposals are idempotent

`syncProposals()` writes one proposal per discrepancy key, ever. Pressing a
button twice does not raise the same question twice, and decided proposals stay
as history even once the gap they describe is closed.

---

## The simulated events

Two buttons: **invoice arrives** and **supplier issues a credit note**.

Each one is behind a confirmation box that names the exact record it would
write, says plainly that nothing leaves the prototype, and offers that document
as a PDF — *before* anything is written. The demo controls should not be the one
place this prototype writes without asking.

The trigger is a real submit button with the dialog layered on top by
JavaScript, so the no-script path the end-to-end suites use still fires the
event.

### The generated documents

`web/src/lib/pdf/` writes a real PDF by hand — `truetype.ts` reads the cmap and
the glyph widths, `writer.ts` emits the objects and the xref — and embeds
Montserrat, because a document set in Helvetica would read as a different
product.

Two absences are deliberate:

- **No prices.** `initial.json` has none, and the working agreement forbids
  inventing one.
- **No client identity.** No logo, no named bill-to.

Montserrat has no Arabic glyphs, so the document is issued in English or German
and the confirmation box says so in all three languages.

---

## Case configuration

`/settings` exposes the case parameters — part, ordered, listed, counted,
damaged, invoiced — and `buildRecords()` turns them back into rows. Ids and
structure are fixed; only quantities and the part name move.

It exists to answer *"does this only work for 10 FILTER-X?"* The engine reads
those numbers from Postgres like any other record, so changing them re-ranks the
cause across every screen and both text directions.

`initial.json` is never edited. The change lives in a cookie (`c04-case`), so it
needs no migration and cannot leave a shared database in a state a later demo
inherits by surprise. Applying rebuilds the case, because proposals raised
against the old numbers answer a question that no longer exists.

`npm run check:seed` asserts that what the app reseeds still matches
`initial.json` field for field, so the supplied records cannot drift.

---

## Repeatable start state

Two reset modes, available from the bottom of every screen:

| Mode | State |
| --- | --- |
| `start_of_shift` | Notes at the bay, nothing counted in, no invoice |
| `invoice_arrived` | The full supplied state — drops you straight into the proposal |

Pasting `supabase/seed.sql` into the Supabase SQL editor does the same thing.

---

## Verification

```bash
cd web
npm run build       # production build
npx tsc --noEmit    # typecheck — this is what catches an untranslated key
npm run lint        # ESLint
npm run check:seed  # supplied records have not drifted from initial.json
npm run e2e         # two suites over real HTTP (dev server must be running)
```

`npm run e2e` drives the app over real HTTP against the live database, using the
no-JavaScript path:

- **`e2e.py`** — six steps: reset, count in both notes, the simulated invoice,
  a reviewer correction, the simulated credit note.
- **`e2e_edge.py`** — thirteen steps (E1–E13): double-pressed resets, double
  submits, approve vs. correct vs. reject, counting in zero, invalid input
  posted directly past the disabled button, Arabic and German round-tripping
  through the database, the settings screen, and the PDF download. E13 leaves
  the database ready for the demo.

To verify the deployment instead of localhost:

```bash
C04_BASE=https://dail-c04.vercel.app npm run e2e
```

It drives the same database, so run it when nobody is mid-demo. It leaves the
state at start of shift.

---

## A few implementation notes worth keeping

- **`src/components/button-styles.ts` has no `"use client"`.** Classes are data,
  not components. A Server Component importing from a client module gets a
  client reference, which once made `btn.primary` come back `undefined` and
  shipped three pages unstyled.
- **`src/lib/i18n/en.ts` is the source dictionary**; `ar.ts` and `de.ts` are
  typed against it, so an untranslated key fails the typecheck rather than
  appearing in the wrong language.
- **The lowercase chrome is CSS**, applied via `text-transform` on `h1`/`h2`/
  `.lc`, never baked into the dictionaries — so German stays correctly
  capitalised and the e2e suites keep matching raw HTML. `[class~="font-mono"]`
  opts record ids out.
- **`next.config.ts` traces the font files** because the PDF writer reads them
  off disk and nothing imports them; without it a deployed build ships the route
  without its fonts and 500s on the first download.
