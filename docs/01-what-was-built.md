# 01 — What was built

[← README](../README.md) · **Live: <https://dail-c04.vercel.app>**

A three-screen receiving flow on a live Postgres database, plus two labelled
simulated events and a human review step that sets the state.

---

## The assignment

| | |
| --- | --- |
| **Case** | C04 — *The delivery arrived. The invoice tells a different story* |
| **Starting question** | What should the employee record at receipt so the next person can resolve the difference? |
| **Assigned client** | trast (<https://trast.de>), assigned by the organiser mid-exercise |
| **Target users** | Parts receiving leads, and colleagues reconciling delivery and invoice evidence |
| **Client fit** | A stated review criterion — how closely the UI, visual language, wording and workflow reflect the assigned organisation |

---

## The flow, in the order the work happens

### 1. Goods receipt — `/`

The receiving lead picks a delivery note and types two numbers: **counted in**
and **damaged**. **Accepted** is derived and cannot be typed over.

That is the answer to the starting question. Three numbers, never one. The
database refuses a receipt where they do not balance, so the rule holds even if
the application is wrong.

Two fields and one button, because the person using it has thirty seconds and
gloves on.

### 2. Evidence — `/evidence`

The chain from order to invoice, with the figures at each link: what was
ordered, what the notes listed, what was counted in, what was accepted, what
was invoiced. Every claim carries the record ids behind it, so a reader can
trace evidence → conclusion rather than trusting a total.

### 3. Review — `/review`

The proposal, its evidence, and the decision. The system names a leading cause
with a confidence, keeps the other candidates visible, and states what would
settle the question. The reviewer **approves**, **corrects** (pick a different
cause, type a reason) or **rejects**. The reviewed outcome becomes the state.

### Off the flow

- **`/docs`** — presenter briefing. Static on purpose: it still opens if
  Supabase is unreachable mid-presentation.
- **`/settings`** — the case quantities, as prototype scaffolding. Labelled as
  such on the page, in the briefing and in a banner while a change is set.

---

## Feature by feature

| Feature | Status | What it means |
| --- | --- | --- |
| Three-screen receiving flow | **Built** | Goods receipt → linked evidence → discrepancy review, with working buttons at every step |
| Three quantities kept separate | **Built** | Accepted derived from counted-in minus damaged, stored separately, guarded by a database check constraint |
| Ranked proposal, decision left open | **Built** | Names the most likely cause with a confidence, keeps alternatives visible, states what would settle it, never closes the gap itself |
| Human review that sets the state | **Built** | Approve / correct / reject. A correction overrides the proposed cause; reviewer, note and final cause are recorded |
| Two labelled simulated events | **Built** | Invoice arrives, supplier issues a credit note. Each confirms first, names the record it would write, and offers that document as a PDF |
| Empty and uncertain states | **Built** | Nothing at the bay, no evidence yet, nothing to review — each is a designed screen. The uncertain state is the default on screen 3 |
| English, Arabic and German | **Built** | Every screen including the briefing; Arabic right-to-left. The engine's own sentences are translated too |
| Case settings | **Built, scaffolding** | Change the quantities and the part name, rebuild the case from them. Proves the engine does arithmetic on records, not a script |
| No write without review | **Built, enforced** | Every read and write is server-side; no Supabase key reaches the browser. RLS grants select only as the backstop (`42501`) |
| Generated supplier documents | **Built** | The simulated invoice and credit note render as real PDFs, from the same facts the confirmation box states |
| Anything leaving the building | **Not built, by design** | No supplier email, no stock posting, no accounting entry. An approved action is recorded and labelled *Not sent* |

---

## The three paths the handoff template asks for

| Path | How to show it |
| --- | --- |
| **Ordinary** | Reset to start of shift, count in both notes. Ten listed, ten counted, the goods reconcile against the notes, nothing to review. Show it for ten seconds so the exception has contrast. |
| **Changed information** | Press *supplier invoice arrives*, then later *supplier issues a credit note*. Each injects one record and lets the reconciliation update on its own. The credit note is a **new record** — `INV-1` is never edited. |
| **Failure / uncertainty** | The default state of screen 3. Damage is flagged *likely* because it matches the gap exactly, but shortage, duplicate scan and second delivery stay on the card, and the proposal says plainly that these records alone do not settle it. Press *correct it* to show the reviewer overriding the system. |

---

## Client fit — what trast actually changed

The organiser made client fit a review criterion, so the visual language is read
off the client's own site rather than invented.

- **Montserrat** for headlines *and* body, because trast.de sets it for both.
- **Their palette** — indigo `#4520d1`, coral, greys — read off the site's own
  CSS custom properties.
- **Containers square, controls round**, which is how their page blocks and
  their pill nav are built.
- **Lowercase chrome** — headings and buttons — because that is the loudest
  single thing about how they write. Applied as CSS, so the dictionaries keep
  correct German capitalisation and record ids stay untouched.
- **German that says *du***, their register. A warehouse that expects *Sie*
  would want that changed — it is one place in the code, not a rewrite.
- **No logo, mark or wordmark.** The exercise assigns the client; it does not
  imply endorsement. The styling is borrowed, the identity is not.

One colour had to move for it: indigo was this prototype's *simulated* colour
and is also trast's brand colour, so the brand took indigo and **simulated
became coral** — still their palette, and as far from indigo as it gets. The
word and a ◆ carry the label too, so it survives greyscale.

---

## Why three languages

- **German** — the assigned client is a German company.
- **Arabic** — the receiving bay in the case is a Moroccan one, and it brings
  right-to-left with it.
- **English** — the working language of the exercise.

The locale is a cookie read on the server, so the correct language and text
direction are in the *first* response: no flash, and the switch still works with
JavaScript off. Record ids, quantities and typed notes are never translated —
they are identifiers, not prose.
