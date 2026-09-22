# 03 — Real vs simulated

[← README](../README.md) · [← How it works](02-how-it-works.md)

The exercise asks for an honest split. This is it, with the evidence for each
claim rather than an assertion.

**In the interface**, anything simulated is **coral** and tagged with a ◆ and
the word *simulated*, so the label survives greyscale. That convention is
written down in nine dictionary strings, in the README and in `/docs` — they
move together, or the briefing starts lying.

---

## The table

| Component | Status | Evidence and limitation |
| --- | --- | --- |
| **Receipt capture** | Real | Writes through a server action. The database rejects a receipt where `accepted ≠ received − damaged` with Postgres `23514` — verified. |
| **Records and persistence** | Real | Live Supabase Postgres, 8 tables. Rows are the supplied records, unaltered; `npm run check:seed` proves it field for field. |
| **Reconciliation and proposal** | Real | Pure TypeScript in `web/src/lib/reconcile.ts`. No model call, no network. Deterministic — the same records always give the same proposal. |
| **Evidence view** | Real | Every claim carries the record ids behind it, read from the foreign-key chain rather than recomputed. |
| **Human review** | Real | Approve / correct / reject writes a `review_decisions` row. A correction overrides the proposed cause, and the override is what is recorded. |
| **"No write without review"** | Real, **enforced** | Every read and write runs server-side; **no Supabase key reaches the browser at all** — verified by pulling the deployed JS bundle. The secret-key client is `server-only`, so it cannot be bundled into a browser chunk, and RLS grants select only as the backstop (a browser write is refused with `42501`). |
| **English / Arabic / German** | Real | Every screen, both text directions, the briefing included. A proposal stores the facts behind its sentence, so one raised in one language reads correctly in the others. Record ids, quantities and typed notes are never translated. |
| **Generated supplier documents** | Real output, simulated content | The PDF is genuinely written by the app (`web/src/lib/pdf/`), with Montserrat embedded. It is a document the prototype **wrote**, not one it read. Carries quantities only — no prices, because `initial.json` has none and none were invented. |
| **Case settings** | Real, scaffolding | `/settings` writes real rows through the same server action path. Labelled prototype-only on the page; the change is a cookie, not an edit to `initial.json`, and a banner marks it while it is set. |
| **Event trigger** | **Simulated, labelled** | Two buttons inject the invoice and the credit note. Each confirms first, naming the record it would write, and offers that document. Marked coral and tagged *simulated* everywhere they appear. |
| **Scanned-document input** | **Simulated** | No OCR. Delivery notes and invoices are structured rows, as the exercise explicitly permits. |
| **External action** | **None, by design** | No supplier message, stock update or accounting entry is executed. An approved action is recorded and labelled *Not sent*. |
| **Authentication / identity** | **Not built** | No accounts. The reviewer is a name typed into a field. |

---

## What "simulated" does *not* mean here

The exercise warns that *a scripted animation is not evidence that an agent
performed an action*. Two things are worth being precise about:

- **The reconciliation is not simulated.** It is arithmetic over rows in a live
  database. Change the numbers in `/settings` and the leading cause re-ranks —
  that is the quickest way to show it is not replaying a script.
- **The review is not simulated.** The decision writes a row, and the row is
  what the screens read back. Nothing re-runs a recorded outcome.

What *is* simulated is strictly the **arrival** of outside information: the
invoice turning up, and the supplier agreeing to credit the damaged unit. The
simulation controls *when* those records appear, not what they say — both are
built from the active case configuration, the same source the reset uses.

---

## The one design decision to defend

The engine **could** assert "damage" and close the gap. One unit damaged, one
unit of difference, the arithmetic works. It proposes it instead.

Damage accounting for the gap arithmetically is not the same as the supplier
agreeing to credit it, and nothing in these records proves that. A system that
quietly picks the convenient cause produces a number somebody later has to
defend to a supplier without knowing where it came from — which is exactly the
pain the client described.

So it ranks the leading cause with a confidence, keeps the alternatives on the
card, states what would settle it (here: a supplier credit note), and hands the
decision to a person.

**This is a product choice, not a technical limit.** If someone argues it should
just answer — ask them who signs the credit note.

---

## What remains a hypothesis

Demonstrated: that the three quantities and the preserved chain let a difference
be traced to candidate causes with evidence attached, and that a person can
settle it on the record.

**Not demonstrated:** that this actually reduces the phone calls to the
supplier. No real delivery data has been through it. That is the
[next validation test](../README.md#next-validation-test), and it needs one
supplier and one week of real notes to answer.
