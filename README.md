# C04 — The delivery arrived. The invoice tells a different story

A working prototype for the DaiL / Octopus day exercise, case **C04**.

**▶ Live: <https://dail-c04.vercel.app>** — open to anyone with the link, no
account needed. Nothing to install to see it work.

> **Starting question:** what should the employee record at receipt so the next
> person can resolve the difference?
>
> **Answer:** three numbers instead of one — *counted in*, *damaged*, *accepted*
> — kept separate all the way down to a database constraint, with the chain
> receipt → delivery note → order → invoice line preserved so a later reader can
> trace any difference back to the records that caused it.

All data is synthetic exercise data. Nothing external is executed: no supplier
message, no inventory update, no accounting entry.

---

## The result, first

`PO-1` orders 10 × `FILTER-X`. Two delivery notes list 8 + 2. Both are received.
The invoice bills 10. But only **9 units are usable** — one arrived damaged.

Today nobody downstream can tell whether that one-unit gap was a **shortage**, a
**damaged item**, a **duplicate scan** or a **second delivery**. In the records
as they are captured now, all four look identical.

The prototype makes the receipt carry the three quantities separately, keeps the
evidence chain intact, and shows the difference with the record ids behind it —
so the next person resolves it with evidence instead of a phone call.

It deliberately **does not pick a cause**. It ranks the leading one, keeps the
alternatives visible, states what would settle the question, and hands the
decision to a person. *Propose, don't decide.*

---

## Try it in 30 seconds

1. Open <https://dail-c04.vercel.app>
2. Scroll to the bottom, press **reset — invoice arrived**
3. You land on the proposal: leading cause *damage*, marked *likely*, with three
   alternatives still open and the evidence ids listed
4. Press **approve** — or **correct it**, pick a different cause, type a reason

The presenter briefing is at [`/docs`](https://dail-c04.vercel.app/docs) and
opens even if the database is unreachable.

## Run it locally

```bash
cd web
npm install                    # first time only
cp -n .env.example .env.local  # ONLY if .env.local is missing; -n never overwrites
npm run dev                    # http://localhost:3000
```

`.env.local` holds the Supabase URL and the secret key, and is
gitignored — so it will not exist after a clone. If it already exists and is
filled in, leave it alone: copying the example over it replaces the keys with
placeholders. The secret key must never take a `NEXT_PUBLIC_` prefix.

A fresh Supabase project needs `supabase/schema.sql` run in the SQL editor.

| Screen | What it is |
| --- | --- |
| `/` | **1. Goods receipt** — count in a delivery note: counted in, damaged, accepted |
| `/evidence` | **2. Evidence** — the chain from order to invoice, with the figures |
| `/review` | **3. Review** — the proposal, its evidence, and approve / correct / reject |
| `/docs` | Presenter briefing — demo script, roles, real vs simulated |
| `/settings` | Case settings — the quantities the demo reconciles. Prototype scaffolding, labelled as such |

---

## Documentation

| Document | What is in it |
| --- | --- |
| [docs/01-what-was-built.md](docs/01-what-was-built.md) | Feature-by-feature account of what exists, and what does not |
| [docs/02-how-it-works.md](docs/02-how-it-works.md) | Data model, the reconciliation engine, and where writes are allowed |
| [docs/03-real-vs-simulated.md](docs/03-real-vs-simulated.md) | The honest split, with the evidence for each claim |
| [docs/04-wolf-handoff.md](docs/04-wolf-handoff.md) | The filled Wolf handoff |
| [docs/05-demo-script.md](docs/05-demo-script.md) | The talk, as delivered |
| [case-pack.md](case-pack.md) | The supplied candidate pack, reproduced as given |
| [initial.json](initial.json) | The supplied synthetic dataset — the source of every record |

---

## What is real, in one table

The full version with evidence for each row is in
[docs/03-real-vs-simulated.md](docs/03-real-vs-simulated.md).

| Component | Status |
| --- | --- |
| Receipt capture, records, persistence | **Real** — live Supabase Postgres, 8 tables |
| Reconciliation and proposal | **Real** — pure TypeScript, deterministic, no model call |
| Evidence view | **Real** — every claim carries the record ids behind it |
| Human review | **Real** — approve / correct / reject writes a decision row |
| "No write without review" | **Real, enforced** — no key reaches the browser; RLS grants select only as the backstop (`42501`) |
| English / Arabic / German | **Real** — every screen, both text directions |
| Event trigger (invoice, credit note) | **Simulated, labelled** — confirms first, names the record, offers the PDF |
| Scanned-document input | **Simulated** — no OCR; structured rows, as the exercise permits |
| External action | **None, by design** — approved actions are recorded and labelled *Not sent* |

Anything simulated is **coral** and tagged with a ◆ in the interface, so the
label survives greyscale.

---

## Limitations

- One order, one part, one invoice. No catalogue, partial invoices or price lines.
- Row-level security is demo-open: anyone with the URL can read. A deliberate
  exercise shortcut, **not a production posture**.
- No authentication, so "who approved this" is a text field, not an identity.
- The reset buttons and `/settings` are available to anyone with the URL.
- `/settings` changes quantities, not structure — it cannot add a third delivery
  note — and it validates against the database, never against a real purchase order.
- The four candidate causes are the ones the client named, hand-written. A real
  receiving bay will have more.
- The screens read live from Supabase; without network they will not load. `/docs`
  is static on purpose and still opens.
- Arabic and German are hand-written dictionaries. An untranslated key fails the
  typecheck, but nothing checks translation *quality*.

## Next validation test

Take one week of real delivery notes and invoices from **one** supplier, run them
through the reconciliation, and count how many differences resolve to a single
cause with evidence versus how many still need a phone call to the supplier.

**Success:** a measurable fall in those phone calls.
**Who evaluates it:** the reconciler in the back office, not us.

---

## Repository layout

```
README.md           this file
LICENSE             MIT
case-pack.md        the supplied candidate pack (situation, working agreement, handoff template)
initial.json        the supplied synthetic dataset — the source of every record
docs/               what was built, how it works, real vs simulated, handoff, demo script
supabase/
  schema.sql        8 tables, constraints and RLS policies. Runs in the SQL editor
  seed.sql          the reset: truncate + reload from initial.json
  migrations/       additive migrations for a database that already has data
web/                Next.js 16 app (App Router, TypeScript, Tailwind v4)
```

**Reset to the start state:** the two buttons at the bottom of every screen, or
re-run `supabase/seed.sql` in the Supabase SQL editor.

## License

[MIT](LICENSE) for the code and documentation in this repository.

Two things are **not** covered by it: the Montserrat font files bundled under
`web/src/lib/pdf/fonts/` are licensed under the SIL Open Font License (see
`OFL.txt` alongside them), and the supplied case material — `case-pack.md` and
`initial.json` — belongs to the exercise organiser and is reproduced as given.

---

Built for **trast** (<https://trast.de>), the client assigned by the organiser
for this exercise — their typeface, palette and register, no logo or wordmark.
The assignment is an exercise and does not imply trast commissioned or endorsed
any of this.
