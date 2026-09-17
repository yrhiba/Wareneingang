# C04 — The delivery arrived. The invoice tells a different story

A prototype for the DaiL / Octopus day exercise, case **C04**.

> **Starting question:** what should the employee record at receipt so the next
> person can resolve the difference?

**Live:** https://dail-c04.vercel.app — open to anyone with the link, no
account needed. The three screens are `/`, `/evidence` and `/review`; the
presenter briefing is at `/docs`.

**All data here is synthetic exercise data.** It is not a real client, supplier,
country or participant. Nothing external is executed: no supplier message, no
inventory update, no accounting entry.

---

## The result, first

`PO-1` orders 10 × `FILTER-X`. Two delivery notes list 8 + 2. Both are received.
The invoice bills 10. But only **9 units are usable** — one arrived damaged.

Today nobody downstream can tell whether that one-unit gap was a **shortage**, a
**damaged item**, a **duplicate scan** or a **second delivery**. The four look
identical in the records as they are captured now.

The prototype makes the receipt carry `received`, `damaged` and `accepted` as
three separate numbers, keeps the chain receipt → delivery note → order → invoice
line intact, and then shows the difference with the record ids behind it — so the
next person resolves it with evidence instead of a phone call.

It deliberately **does not pick a cause**. See *One design decision* below.

---

## Run it

```bash
cd web
npm install                    # first time only
cp -n .env.example .env.local  # ONLY if .env.local is missing; -n never overwrites
npm run dev                    # http://localhost:3000
```

| Page | What it is |
| --- | --- |
| `/` | **1. Goods receipt** — count in a delivery note: counted in, damaged, accepted |
| `/evidence` | **2. Evidence** — the chain from order to invoice, with the figures |
| `/review` | **3. Review** — the proposal, its evidence, and approve / correct / reject |
| `/docs` | Presenter briefing — demo script, roles, real vs simulated |
| `/settings` | Case settings — the quantities the demo reconciles. Prototype scaffolding, labelled as such |

**Language:** the header switches the whole prototype between **English**,
**العربية** and **Deutsch** — German because the assigned client is a German
company, Arabic because the receiving bay in the case is a Moroccan one, and
right-to-left included. The choice is a cookie the server reads, so the correct
language and text direction are in the first response — no flash, and the switch
still works with JavaScript off. Everything follows it, including the `/docs`
briefing — a reviewer reading the prototype in German can read the claims it
makes about itself in German too. Record ids, file paths and shell commands stay
Latin: they are identifiers, not prose.

**How it looks:** the visual language is the assigned client's. trast.de sets
**Montserrat** for both its headlines and its body text, so the prototype does
too; the palette is their own indigo `#4520d1`, coral and grey, read off the
site's CSS custom properties and cross-checked against the screenshots in
`ref/`. Two structural rules come with it — **containers are square, controls
are round**, which is how their page blocks and their pill nav are built — and
the chrome, headings and buttons are lowercase, because that is the loudest
single thing about how they write. Body prose keeps proper German
capitalisation: this is a screen someone scans on a loading bay, and the
lowercase is applied as CSS, so the dictionaries still hold correct German.
**No trast logo, mark or wordmark is used** — the exercise assigns the client,
it does not imply they endorsed any of this, so the styling is borrowed and the
identity is not.

One colour had to move for it. Indigo was this prototype's "simulated" colour
and is also trast's brand colour, so the brand took indigo and **simulated
became coral** — still their palette, and as far from indigo as it gets.

**Changing the numbers:** nothing in the app hardcodes *10 × FILTER-X*. Every
quantity is a row the engine reads, so `/settings` can change the ordered,
listed, counted, damaged and invoiced figures and the part name, and rebuild the
case from them — which is the quickest way to show the reconciliation is doing
arithmetic on records rather than replaying a script. It is prototype
scaffolding, not a feature: a shipped system takes a purchase order quantity
from the ERP and a listed quantity off the supplier's note, and a receiving clerk
may retype neither. `initial.json` is never edited; a change lives in a cookie,
the top banner says so while one is set, and **Restore** puts the supplied
records back.

**Repeatable start state:** two reset buttons at the bottom of every screen
rebuild the database from the supplied records in one click — *start of shift*
(notes at the bay, nothing counted in, no invoice) and *invoice arrived* (the
full supplied state). Pasting `supabase/seed.sql` into the Supabase SQL editor
does the same thing.

`npm run check:seed` asserts that what the app reseeds still matches
`initial.json` field for field, so the supplied records cannot drift.

**Verifying a deployment:** `C04_BASE=https://dail-c04.vercel.app npm run e2e`
points both suites at the deployed app instead of localhost. It drives the same
database, so run it when nobody is mid-demo; it leaves the state at start of
shift.

**Database setup:** a fresh Supabase project needs `supabase/schema.sql`. A
database created before the credit-note work needs the additive
`supabase/migrations/001_credit_notes.sql`, which drops nothing. Until it is
applied the app still runs — it disables the credit-note event and says so.

`web/.env.local` holds the Supabase URL, publishable key and secret key. It is
gitignored, so it will not exist after a clone — that is the only time you need
to create it. If it is already there and filled in, leave it alone: copying the
example over it replaces the keys with placeholders and the demo will fail to
load. The secret key must never take a `NEXT_PUBLIC_` prefix.

---

## What is real and what is simulated

| Component | Status | Evidence and limitation |
| --- | --- | --- |
| Receipt capture | **Real** | Writes through a server action. The DB rejects a receipt where `accepted ≠ received − damaged` (`23514`) — verified. |
| Records and persistence | **Real** | Live Supabase Postgres, eight tables. Rows are the supplied records, unaltered. |
| Reconciliation and proposal | **Real** | Pure TypeScript in `web/src/lib/reconcile.ts`. No model call; deterministic. |
| Evidence view | **Real** | Every claim carries the record ids behind it. |
| English / Arabic / German | **Real** | Every screen, both text directions, the presenter briefing included. A proposal stores the facts behind its sentence, so one raised in one language reads correctly in the others. Record ids, quantities and typed notes are never translated. |
| Human review | **Real** | Approve / correct / reject writes a `review_decisions` row; a correction overrides the proposed cause. |
| "No write without review" | **Real, enforced** | RLS grants the browser key select only. A write from it fails with `42501` — verified, not assumed. |
| Event trigger | **Simulated, labelled** | Two buttons inject the invoice and the credit note. Each confirms first, naming the record it would write, and offers that document as a PDF. Marked coral and tagged *Simulated* everywhere they appear — coral, because the client's brand indigo now carries the interface. |
| Case settings | **Real, scaffolding** | `/settings` writes real rows through the same server action path. Labelled prototype-only on the page; the change is a cookie, not an edit to `initial.json`, and the banner marks it. |
| Scanned-document input | **Simulated** | No OCR. Delivery notes and invoices are structured rows, as the exercise permits. The PDF a simulated event offers is generated from those rows — a document the prototype wrote, not one it read. It carries quantities only: `initial.json` has no prices and none were invented. |
| External action | **None, by design** | No supplier message, stock update or accounting entry. Approved actions are recorded and labelled *Not sent*. |

---

## One design decision

The engine could assert "damage" and close the gap: one unit damaged, one unit of
difference, the arithmetic works. It proposes it instead.

Damage accounting for the gap arithmetically is not the same as the supplier
agreeing to credit it, and nothing in these records proves that. A system that
quietly picks the convenient cause produces a number somebody later has to defend
to a supplier without knowing where it came from — which is the pain the client
described. So it lists every cause the evidence cannot rule out, states what
would settle it (here: a supplier credit note), and hands the decision to a
person.

So it ranks the leading cause with a confidence, keeps the alternatives on the
card, states what would settle it, and hands the decision to a person. *Propose,
don't decide.*

This is a product choice, not a technical limit.

---

## Limitations

- One order, one part, one invoice. No catalogue, partial invoices or price lines.
- Row-level security is demo-open: anyone with the URL can read. Deliberate
  shortcut for the exercise, **not a production posture**.
- No authentication, so "who approved this" is a text field, not an identity.
- The demo reset buttons and `/settings` are available to anyone with the URL.
- `/settings` changes quantities, not structure: `DN-1` and `DN-2` are the notes
  the case ships with, and it cannot add a third or drop one. It validates
  against the database's constraints, never against a real purchase order.
- The candidate causes are the four the client named, hand-written. A real
  receiving bay will have more.
- The demo page reads live from Supabase; without network it will not load.
- The lowercase chrome and the informal *du* are trast's register, read off
  their public site. A warehouse that expects *Sie* and sentence case would want
  both changed — each is one place in the code, not a rewrite.
- Arabic and German are hand-written dictionaries, not a translation service: a
  string added to `en.ts` and not to `ar.ts` or `de.ts` fails the typecheck
  rather than appearing in the wrong language, but nothing checks the *quality*
  of either translation. The German addresses the reader as *du*, which is the
  register the assigned client uses; a warehouse that expects *Sie* would want
  that changed.

---

## Next validation test

Take one week of real delivery notes and invoices from **one** supplier, run them
through the reconciliation, and count how many differences resolve to a single
cause with evidence versus how many still need a phone call to the supplier.

**Success:** a measurable fall in those phone calls. **Who evaluates it:** the
reconciler in the back office, not us.

---

## Repository layout

```
case-pack.md        the supplied candidate pack (situation, working agreement, handoff template)
initial.json        the supplied synthetic dataset — the source of every record
supabase/
  schema.sql        7 tables, constraints and RLS policies. Source of truth, runs in the SQL editor
  seed.sql          the reset button: truncate + reload from initial.json
  migrations/       additive migrations for a database that already has data
web/                Next.js 16 app (App Router, TypeScript, Tailwind v4)
  src/app/globals.css    the design tokens — the client's palette, the lowercase rules and the gradient
  src/components/button-styles.ts  the pill classes; a plain module, so Server Components can import them
  src/lib/i18n/          en.ts, ar.ts and de.ts — each translation is typed against en, so none can fall behind
  src/lib/case-config/   the tunable case parameters and how they turn back into records
  src/lib/reconcile.ts   pure domain logic, no database
  src/lib/queries.ts     loads an order and everything referencing it
  src/lib/seed-data.ts   the supplied records, guarded by npm run check:seed
  src/lib/supabase/      browser client (publishable key) and server client (secret key)
  src/app/actions.ts     every write in the app; nothing else can change state
  src/app/page.tsx       1. goods receipt
  src/app/evidence/      2. the chain
  src/app/review/        3. proposal and decision
  src/app/docs/          the presenter briefing
  src/app/settings/      the case parameters, off the numbered flow
```

Two constraints live in the database rather than in convention, because they are
the rules the case turns on:

- `receipts` carries `check (accepted = received - damaged)` — the three
  quantities cannot be collapsed into one net number.
- `delivery_notes.duplicate_of` makes a merged scan an explicit, reviewable row —
  deduplication is never silent.
