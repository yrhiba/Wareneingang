# 05 — Demo script

[← README](../README.md) · [← Wolf handoff](04-wolf-handoff.md) · **Live: <https://dail-c04.vercel.app>**

The talk, as delivered. Roughly five minutes. The presenter briefing inside the
app — [`/docs`](https://dail-c04.vercel.app/docs) — has the beat-by-beat version
with the exact buttons to press, and stays open even if the database is down.

---

## My client, the problem, and why I picked it

My client is trast. The people I built this for are their parts receiving
leads — the person standing at the loading bay when the truck arrives — and the
colleague who has to match that delivery to the invoice, weeks later.

The problem sits between those two people. Goods arrive, someone counts them
fast and signs. Later the invoice comes in, and nothing in the records explains
why the numbers are different. So it turns into phone calls, or someone just
pays it.

I picked this case because I deal with deliveries a lot myself, and I want
receiving to be clean and simple: what arrived, what was damaged, what we
actually keep. If that is written down properly in thirty seconds at the bay,
nobody has to argue about it a month later.

## The result

Ten filters ordered. Ten arrived. Ten invoiced. Nine went into stock.

That one unit is the whole case. The person who gets the invoice cannot tell
what happened to it. Was it a shortage? Was it damaged? Was the same note
scanned twice? Was there a second delivery? In the records today, all four look
the same. So the invoice gets paid, or argued about, on a guess.

## What the receiving lead records

So we changed what gets written down at the bay. Counted in, damaged, accepted.
Three numbers, never one. You type the first two, the app works out the third,
and the database will not save a receipt where they do not add up. The rule sits
in the database, not in a training manual.

## The chain, and the invoice

Every record points to the next one. The receipt points to the delivery note,
the note points to the order, the order points to the invoice line. So you can
follow that one unit all the way back.

Now the invoice arrives. I press this button. It is a simulation — no real
supplier mail comes in here — so it asks me first, and shows me the invoice it
is about to write. Everything simulated is coral.

Nobody edits a number. The invoice says ten. The bay says nine. The gap shows up
on its own.

## The proposal

The most likely cause is damage. The app says likely, not certain. Shortage,
duplicate scan and second delivery stay on the card. Every line shows the
records it came from. And it says what would close the question: a credit note
from the supplier.

It proposes. It does not decide.

The numbers add up — one damaged, one missing. But damage explaining the gap is
not the supplier agreeing to pay for it. If the app picks the easy answer by
itself, someone has to defend that number months later, and they will not know
where it came from. So a person approves it, or corrects it, and their answer
becomes the record.

## Built for trast

It looks like trast: their font, their colours, lowercase, and German that says
du. And the bay screen is two fields and one button, because the person using it
has thirty seconds and gloves on.

## Real, simulated, and what I cannot prove yet

Real: the records, the numbers, the engine and the review. No write without
review, and the database enforces that. It is not just a promise from me.

Simulated, and labelled: the two events, and the scanned document.

Not proven yet: that this cuts the phone calls to the supplier. That is the next
test. One supplier, one week of real deliveries.

It is live at this link. It resets in one click. And the handoff says what the
next person needs.
