# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Working folder for a one-day exercise (DaiL / Octopus day), case **C04 — "The delivery arrived. The invoice tells a different story."** There is no application code yet; only the two supplied materials:

- `readme.md` — the candidate pack: client situation, working agreement, demo checklist and the Wolf handoff template (all four pages concatenated).
- `initial.json` — the entire synthetic dataset. Everything a prototype reconciles comes from this file.

The deliverable is a working prototype (or clearly labeled clickable demonstration) that answers the starting question — *what should the employee record at receipt so the next person can resolve the difference?* — plus a short README (run instructions, real vs simulated, limitations, next validation test) and a filled Wolf handoff.

## Commands

None yet: no package manager, build, test or lint configuration exists, and this is not a git repository. When a stack is chosen, record its commands here. The pack requires an **exact run instruction and a repeatable start state**, so prefer a single command that resets state from `initial.json` and starts the demo.

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
