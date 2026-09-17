# C04 — The delivery arrived. The invoice tells a different story

A prototype for the DaiL / Octopus day exercise, case **C04**.

> **Starting question:** what should the employee record at receipt so the next
> person can resolve the difference?

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

**Repeatable start state:** two reset buttons at the bottom of every screen
rebuild the database from the supplied records in one click — *start of shift*
(notes at the bay, nothing counted in, no invoice) and *invoice arrived* (the
full supplied state). Pasting `supabase/seed.sql` into the Supabase SQL editor
does the same thing.

`npm run check:seed` asserts that what the app reseeds still matches
`initial.json` field for field, so the supplied records cannot drift.

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
| Human review | **Real** | Approve / correct / reject writes a `review_decisions` row; a correction overrides the proposed cause. |
| "No write without review" | **Real, enforced** | RLS grants the browser key select only. A write from it fails with `42501` — verified, not assumed. |
| Event trigger | **Simulated, labelled** | Two buttons inject the invoice and the credit note. Marked purple and tagged *Simulated* everywhere they appear. |
| Scanned-document input | **Simulated** | No OCR. Delivery notes and invoices are structured rows, as the exercise permits. |
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
- The demo reset buttons are available to anyone with the URL.
- The candidate causes are the four the client named, hand-written. A real
  receiving bay will have more.
- The demo page reads live from Supabase; without network it will not load.

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
  src/lib/reconcile.ts   pure domain logic, no database
  src/lib/queries.ts     loads an order and everything referencing it
  src/lib/seed-data.ts   the supplied records, guarded by npm run check:seed
  src/lib/supabase/      browser client (publishable key) and server client (secret key)
  src/app/actions.ts     every write in the app; nothing else can change state
  src/app/page.tsx       1. goods receipt
  src/app/evidence/      2. the chain
  src/app/review/        3. proposal and decision
  src/app/docs/          the presenter briefing
```

Two constraints live in the database rather than in convention, because they are
the rules the case turns on:

- `receipts` carries `check (accepted = received - damaged)` — the three
  quantities cannot be collapsed into one net number.
- `delivery_notes.duplicate_of` makes a merged scan an explicit, reviewable row —
  deduplication is never silent.
