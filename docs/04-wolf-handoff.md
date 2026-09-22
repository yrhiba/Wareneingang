# 04 — Wolf handoff

[← README](../README.md) · [← Real vs simulated](03-real-vs-simulated.md)

The template from [`case-pack.md`](../case-pack.md), filled. No invented price
or delivery commitment appears anywhere below.

> Fields marked **`[to assign]`** are organisational, not technical — they need a
> name from the receiving side before this handoff is complete.

---

**Prototype handoff.**

| | |
| --- | --- |
| **Case** | C04 — The delivery arrived. The invoice tells a different story |
| **Candidate / team** | Yahya Rhiba |
| **Prototype location** | Live: <https://dail-c04.vercel.app> · Source: this repository |
| **Assigned exercise client** | trast (<https://trast.de>) — assignment is for the exercise and does not imply the client commissioned or endorsed this |

---

## The problem we validated

**Actor, painful moment and consequence.**
Two actors, weeks apart. The **parts receiving lead** unloads a delivery and has
about thirty seconds to record what arrived. The **reconciler** gets the invoice
later and has to match it to that record. When the numbers differ, the record as
captured today cannot say whether the difference was a shortage, a damaged item,
a duplicate scan or a second delivery — all four look identical. The
consequence: the invoice gets paid on a guess, or it turns into phone calls to
the supplier that nobody can close with evidence.

**Client evidence.**
The supplied client situation (fictional role-play dialogue, reproduced in
`case-pack.md`): *"At the loading bay we need to record what actually arrived.
Later, someone tries to reconcile the invoice. They cannot tell whether a
difference was a shortage, a damaged item, a duplicate scan or a second
delivery."* The supplied `initial.json` reproduces exactly that shape — 10
ordered, 10 listed across two notes, 10 received, **9 accepted**, 10 invoiced.

**What the client changed in our understanding.**
Two things, both mid-exercise.

1. The organiser assigned **trast** as the client and made **client fit a review
   criterion** — how closely the interface, visual language, wording and
   workflow reflect the assigned organisation. That turned styling from a
   finishing touch into a requirement, and it is why the prototype carries
   trast's typeface, palette, lowercase register and German *du*.
2. The organiser asked for a **shareable clickable preview** before further
   feature work. That moved deployment ahead of the remaining features, which is
   why there is a live URL and why the e2e suites can be pointed at it.

**What remains an assumption.**
- That the receiving lead will type **two** numbers instead of one under time
  pressure. The interface is built for thirty seconds and gloves, but this has
  not been observed on a real bay.
- That the four candidate causes cover most real differences. They are the ones
  the client named; a real receiving operation will have more.
- That a reconciler trusts a *ranked, unsettled* proposal more than a confident
  wrong answer. This is the core product bet and it is untested with real users.
- That damage at receipt is the dominant cause of invoice/stock gaps for this
  client. The supplied case says so; one synthetic order is not evidence.

---

## Open and demonstrate it

**Exact run instructions and start state.**

Nothing to install — open <https://dail-c04.vercel.app>. To run locally:

```bash
cd web
npm install                    # first time only
cp -n .env.example .env.local  # ONLY if .env.local is missing
npm run dev                    # http://localhost:3000
```

Start state: press **reset — start of shift** at the bottom of any screen (two
notes at the bay, nothing counted in, no invoice), or **reset — invoice
arrived** to land directly on the proposal. Both rebuild the database from the
supplied records. `supabase/seed.sql` in the Supabase SQL editor does the same.

**Ordinary path.**
Reset to start of shift. Count in `DN-1` (8 counted, 1 damaged → 7 accepted),
then `DN-2` (2 and 0). You land on the evidence screen: 10 ordered, 10 listed,
10 counted, 9 accepted. Nothing is wrong yet — the goods reconcile against the
notes, and there is nothing to review.

**Changed-information path.**
Press **supplier invoice arrives** (coral, a labelled simulation — it confirms
first and names the record). The invoice bills 10 against both notes; the gap
against 9 accepted appears on its own, and two proposals are raised. Later,
press **supplier issues a credit note**: the supplier accepts the damaged unit,
the credit arrives as its **own record**, and the gap closes to reconciled.
`INV-1` is never edited.

**Failure or uncertainty path.**
The default state of the review screen. Damage is ranked *likely* because it
matches the gap exactly — but shortage, duplicate scan and second delivery stay
on the card as open candidates, and the proposal states plainly that these
records alone do not settle it, naming a supplier credit note as what would.
Press **correct it**, pick a different cause and type a reason: the reviewer's
answer overrides the system's and becomes the recorded state.

A second, quieter uncertainty is also on screen: two delivery notes against one
order, raised as a *possible* duplicate scan. The system asks rather than
assumes.

---

## What is real

| Component | Implemented or simulated | Evidence and limitation |
| --- | --- | --- |
| **Input and event trigger** | Receipt capture **implemented**; incoming events **simulated and labelled** | Capture writes through a server action, constrained by the database. The invoice and credit note are injected by two coral buttons that confirm first and name the record. No OCR, no supplier feed — documents are structured rows, as the exercise permits. |
| **Retrieval / reasoning** | **Implemented**, deterministic | Pure TypeScript (`web/src/lib/reconcile.ts`), no model call and no network. Ranks a leading cause with a confidence, lists open candidates, attaches evidence ids and states what would settle it. Limitation: four hand-written candidate causes, one order, one part, one invoice. |
| **Human review** | **Implemented** | Approve / correct / reject writes a `review_decisions` row; a correction overrides the proposed cause and that override is what is stored. Limitation: no authentication — the reviewer is a typed name, not an identity. |
| **External action** | **None, by design** | No supplier message, inventory update or accounting entry is executed. An approved action is recorded and labelled *Not sent*. This is the boundary of the demo, and the exercise requires it. |
| **Persistence and history** | **Implemented** | Live Supabase Postgres, 8 tables, foreign keys preserving receipt → delivery note → order → invoice line. Proposals and decisions are retained as history even after the gap closes. `npm run check:seed` proves the supplied records are unaltered. Limitation: row-level security is demo-open for reads. |

---

## Next client validation

**One real case we would test.**
One week of real delivery notes and invoices from **one** supplier, run through
the reconciliation, with the receiving lead capturing the three quantities at
the bay as the goods actually arrive.

**What counts as success.**
A measurable fall in the number of invoice differences that still require a
phone call to the supplier to close. Secondary: the receiving lead completes the
three-number capture without it slowing the bay down — measured as time per
delivery note, not as an opinion.

**Who evaluates it.**
The reconciler in the back office, who is the person the current process costs.
Not us, and not the receiving lead alone.

---

## Wolf work

**Required integration and permission.**
1. **ERP / purchase orders (read).** Ordered quantity and part must come from
   the ERP, not from a settings screen. Needs read access to purchase orders and
   a stable part identifier.
2. **Supplier delivery notes (read).** Today they are typed rows. Real intake is
   either a supplier feed or scanning with OCR — the second needs a document
   pipeline and a confidence threshold that routes low-confidence scans to a
   person rather than into the ledger.
3. **Stock / accounting write (write, gated).** Currently not connected on
   purpose. When connected, it must stay behind the same review gate: a write
   only ever follows a recorded human decision.
4. **Identity (read).** Single sign-on, so *who approved this* is an identity
   rather than a text field. This is the largest gap between the prototype and
   anything deployable.

**Data boundary and model processing location.**
Today the boundary is simple: **no model is called anywhere in this prototype.**
The reconciliation is deterministic TypeScript running in the application's own
server process, and no record leaves the Supabase project. There is no inference
provider, no third-party processor and no cross-border transfer to describe.

That is a property worth keeping deliberately. If OCR or model-assisted cause
ranking is added later, the boundary question becomes real, and the answer for a
German client should be decided *before* the integration: which processor,
processing in which region, and whether supplier documents — which carry
commercial terms — may leave the client's own infrastructure at all. The
deterministic engine should remain the path of record, with any model output
entering as a *proposal* that a person reviews, exactly as the current
discrepancies do.

**Failure/recovery plan.**
- *Database unreachable.* The screens read live and will not load; the briefing
  at `/docs` is static and still opens. Recovery for the demo is the reset
  buttons or re-running `supabase/seed.sql`. For a deployment, this needs a
  read-through cache and an explicit degraded state at the bay — a receiving
  lead cannot be blocked by an outage, so offline capture with later
  reconciliation is the real requirement.
- *Bad write.* The database check constraint rejects an unbalanced receipt
  (`23514`) rather than storing it. Double submits are absorbed: one receipt per
  note is a unique constraint, and proposals are idempotent per discrepancy key.
- *Wrong proposal.* Recovery is the review step itself — correct it, and the
  correction is recorded with the reviewer and the reason. Every proposal and
  decision is retained, so a wrong call is auditable rather than overwritten.
- *Corrupted or drifted seed data.* `npm run check:seed` fails loudly if what
  the app reseeds no longer matches `initial.json`.

**Monitoring owner.** `[to assign]` — needs a named owner on the receiving side.
What should be monitored is already decided: the count of open (undecided)
proposals older than a threshold, the rate of *corrected* versus *approved*
decisions (a rising correction rate means the ranking is wrong), and failed
writes by Postgres error code.

**Unresolved risk.**
The central one: **a reviewer may approve proposals without reading them.** The
prototype's whole value is that the leading cause is a proposal rather than an
answer — if approval becomes a reflex, the system has simply automated the guess
it was built to prevent, but with an audit trail that makes the guess look
considered. The correction rate is the metric that would expose it, and nothing
in the prototype yet acts on that signal.

Secondary: demo-open row-level security and the absence of authentication are
deliberate exercise shortcuts, and both are blockers for any real data.

**Scope and effort drivers.**
Driven mostly by intake, not by the reconciliation. The engine is small,
deterministic and already handles the case. The effort sits in (a) ERP
integration and part identity, (b) whether delivery notes arrive as a feed or as
scans — OCR roughly doubles the intake work and introduces the only model in the
system, (c) authentication and the permission model for who may approve, and (d)
the offline capture path for the bay. Multi-order, multi-line and partial
invoices each widen the engine beyond the single-order case shown here.

**No invented price or delivery commitment.** None is stated in this handoff,
anywhere in the prototype, or in the generated supplier documents — those carry
quantities only, because `initial.json` contains no prices.

**Next action and owner.**
Run the next validation test above: one supplier, one week, real notes.
Owner: `[to assign]` — needs the receiving lead and the back-office reconciler
named on the client side, plus one engineer for the ERP read integration, which
is the prerequisite for using real purchase order quantities.
