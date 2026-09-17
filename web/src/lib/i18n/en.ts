import type { Cause, Confidence } from "@/lib/types";

export type Dir = "ltr" | "rtl";

/**
 * English is the source dictionary. `ar.ts` and `de.ts` are typed against it, so
 * a key added here that is not translated there fails the typecheck rather than
 * silently falling back to English mid-demo.
 *
 * Arrows live inside the strings because they have to flip under RTL.
 */
export const en = {
  dir: "ltr" as Dir,
  // The BCP 47 tag for Intl, which is not always the locale code:
  // this demo is British-English and Moroccan-Arabic.
  bcp47: "en-GB",
  name: "English",
  short: "EN",

  chrome: {
    metaTitle: "Goods receipt — C04",
    metaDescription:
      "What to record at receipt so the next person can resolve the difference.",
    banner:
      "Synthetic exercise data · Trast-style goods receipt · not a real supplier",
    // Shown next to the banner whenever the numbers differ from initial.json,
    // so nobody presents changed figures believing they are the supplied ones.
    bannerModified: "Numbers changed in Settings",
    brand: "Goods receipt",
    flow: "Receiving flow",
    briefing: "Briefing",
    settings: "Settings",
    steps: {
      receive: "Goods receipt",
      evidence: "Evidence",
      review: "Review",
    },
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    language: "Language",
    languageHint: "Switch language",
  },

  cause: {
    shortage: "Shortage",
    damage: "Damage",
    duplicate_scan: "Duplicate scan",
    second_delivery: "Second delivery",
    unknown: "Unknown",
  } satisfies Record<Cause, string>,

  confidence: {
    likely: "Likely — one record accounts for it exactly",
    possible: "Possible — consistent, but not the only reading",
    uncertain: "Uncertain — the records cannot rank the causes",
  } satisfies Record<Confidence, string>,

  ui: {
    simulated: "Simulated",
    evidence: "Evidence:",
    documentPdf: "Document (PDF)",
  },

  receive: {
    title: "Goods receipt — bay 1",
    intro:
      "Record what physically arrived against each delivery note. Count, damage and what actually goes into stock are three separate numbers — keeping them apart here is what lets someone resolve the invoice later.",
    waiting: (n: number) =>
      `${n} delivery note${n > 1 ? "s" : ""} waiting`,
    emptyTitle: "Nothing waiting at the bay",
    emptyNoNotes: "No delivery notes for this order yet.",
    emptyAllCounted: (n: number, orderId: string) =>
      `All ${n} notes against ${orderId} have been counted in. The evidence is linked and ready for whoever picks up the invoice.`,
    toEvidence: "See the linked evidence →",
    recorded: "Recorded this shift",
    against: "against",
    counted: "counted",
    damaged: "damaged",
    accepted: "accepted",
    invoiceGap: (invoiceId: string, gap: number) => ({
      lead: `${invoiceId} has arrived and does not match what was accepted. A difference of`,
      value: String(gap),
      tail: "is waiting for a decision.",
    }),
    toReview: "Review the difference →",
    legendTag: "How to read this",
    legend:
      "Coral marks anything injected or simulated. Nothing in this prototype contacts a supplier or posts to stock.",
  },

  form: {
    noteFor: (part: string, orderId: string) => `${part} · against ${orderId}`,
    noteLists: "Note lists",
    countedIn: "Counted in",
    countedInHint: "What you physically counted off the pallet",
    damagedLabel: "Damaged",
    damagedHint: "Arrived, but not usable",
    acceptedLabel: "Accepted into stock",
    acceptedHint: "Derived: counted in − damaged. Stored separately from both.",
    shortWarning: (short: number, noteId: string) =>
      `${short} fewer than ${noteId} lists. That will be recorded as a shortage against the note, not written off.`,
    invalid: "Damaged cannot exceed what you counted in.",
    submit: "Record goods receipt",
    submitting: "Recording…",
    footnote: "Records the receipt. No stock or accounting entry is posted.",
  },

  evidence: {
    emptyTitle: "No evidence yet",
    emptyBody: (n: number) =>
      `${n} delivery note${n === 1 ? " is" : "s are"} at the bay but nothing has been counted in. The chain starts with the goods receipt.`,
    toBay: "Go to the bay →",
    title: (orderId: string, part: string) => `Evidence — ${orderId} · ${part}`,
    intro:
      "Every figure below traces to a record. The chain is receipt → delivery note → order → invoice line, so a difference can be resolved to a cause rather than argued about.",
    ordered: "Ordered",
    listed: "Listed",
    countedIn: "Counted in",
    accepted: "Accepted",
    invoiced: "Invoiced",
    invoicedNet: "Invoiced net",
    notesHint: (n: number) => `${n} notes`,
    arrivedHint: "physically arrived",
    damagedHint: (n: number) => `${n} damaged`,
    noneDamaged: "none damaged",
    noInvoiceYet: "no invoice yet",
    netHint: (billed: number, credited: number) =>
      `${billed} billed − ${credited} credited`,
    reconciledLead: "Reconciled.",
    reconciledBody: "What the supplier claims now matches what went into stock.",
    chain: "The chain",
    thRecord: "Record",
    thSupports: "Supports",
    thCounted: "Counted",
    thDamaged: "Damaged",
    thAccepted: "Accepted",
    purchaseOrder: (part: string) => `Purchase order · ${part}`,
    orderedQty: (n: number) => `${n} ordered`,
    duplicateOf: (id: string) => `Duplicate scan of ${id} — excluded`,
    noteLists: (n: number) => `Delivery note · lists ${n}`,
    notCounted: "not counted",
    invoiceBills: (notes: string) => `Supplier invoice · bills ${notes}`,
    invoicedQty: (n: number) => `${n} invoiced`,
    creditNote: (reason: string) => `Credit note · ${reason}`,
    creditedQty: (n: number) => `−${n} credited`,
    mismatch: "What does not line up",
    toReview: "Take it to review →",
  },

  review: {
    title: "Discrepancy review",
    intro:
      "The system raises a proposal with the evidence behind it and the cause it thinks most likely. It does not decide. You approve, correct or reject, and your answer becomes the record.",
    status: {
      approved: "Approved",
      corrected: "Corrected by reviewer",
      rejected: "Rejected",
      pending: "Waiting for a decision",
    },
    unraised: (n: number) =>
      `${n} difference${n > 1 ? "s" : ""} detected, not yet raised`,
    raise: "Raise for review",
    raising: "Raising…",
    unraisedNote:
      "These records were loaded outside the receiving flow, so no proposal was raised automatically.",
    emptyTitle: "Nothing to review",
    emptyNoReceipts:
      "Nothing has been counted in yet, so there is nothing to reconcile.",
    emptyNoInvoice:
      "Goods are counted in and reconcile against the notes. The supplier's invoice has not arrived yet.",
    emptyReconciled:
      "Every figure reconciles. What the supplier claims matches what went into stock.",
    toBay: "Go to the bay →",
    toEvidence: "See the evidence →",
    pending: (n: number) => `${n} proposal${n > 1 ? "s" : ""} waiting`,
    proposedBy: "Proposed by the system",
    causesLead: "Most likely cause, and what else stays open:",
    nextAction: "Proposed next action",
    history: "Decision history",
    recordedAs: (cause: string) => `Recorded as ${cause}`,
    actionRecorded: "Action recorded: ",
    notSent: "Not sent",
    noAction: "No action taken.",
  },

  decide: {
    reviewer: "Reviewer",
    reviewerDefault: "Parts receiving lead",
    correctLead: (cause: string) =>
      `The system proposed ${cause}. Record the cause you judge correct:`,
    notePlaceholder:
      "Why — e.g. supplier confirmed both notes were one dispatch",
    save: "Save correction",
    saving: "Recording correction…",
    cancel: "Cancel",
    approve: "Approve proposal",
    approving: "Recording decision…",
    correct: "Correct it",
    reject: "Reject",
    rejecting: "Recording…",
    footnote:
      "Approving records the decision and the action to take. It does not send anything to the supplier.",
  },

  demo: {
    heading: "Simulated events",
    intro:
      "Nothing below contacts a supplier or an accounting system. These buttons inject a record the facilitator would otherwise hand over mid-exercise.",
    creditUnavailableBefore: "Credit notes are unavailable: run",
    creditUnavailableAfter: "in the Supabase SQL editor to enable that event.",
    invoiceArrives: "◆ Supplier invoice arrives",
    invoiceArriving: "Delivering invoice…",
    creditIssued: "◆ Supplier issues a credit note",
    creditIssuing: "Issuing credit…",
    resetShift: "Reset — start of shift",
    resetInvoice: "Reset — invoice arrived",
    resetting: "Resetting…",
    creditReason: (n: number) =>
      `Supplier credit for ${n} damaged unit(s) reported at receipt.`,

    // The box that stands between a click and a write. It exists because both
    // of these buttons used to change the database on one press, mid-demo,
    // with no statement of what they were about to do.
    confirm: {
      invoiceTitle: "Deliver the supplier's invoice",
      creditTitle: "Issue the supplier's credit note",
      lead: "Nothing leaves this prototype. No supplier is contacted, no stock moves and no accounting entry is made — the event writes the record below and nothing else.",
      writes: "What gets recorded",
      invoiceWrites: (id: string, qty: number, part: string, notes: string) =>
        `${id}, billing ${qty} × ${part} against ${notes}.`,
      creditWrites: (id: string, qty: number, invoiceId: string) =>
        `${id}, crediting ${qty} unit(s) against ${invoiceId}. ${invoiceId} itself is never edited.`,
      thenRaised:
        "Any difference this creates is raised as a proposal for a person to approve or correct. It is not applied.",
      documentHeading: "The document",
      documentNote:
        "A simulated scan of the document that arrives with the event. Quantities only — the exercise dataset carries no prices and none were invented.",
      download: "Download the PDF",
      cancel: "Cancel",
      go: "Record it",
    },
  },

  settings: {
    title: "Case settings",
    tag: "Prototype only",
    intro:
      "The prototype reads every quantity from the database, so none of them are written into the code. This screen edits them, which is the quickest way to show the reconciliation is doing arithmetic on records rather than replaying a script.",
    notAFeature:
      "A shipped system would not have this screen. A purchase order quantity comes from the ERP, a listed quantity comes off the supplier's note, and a receiving clerk may not retype either. It exists so the demo can answer \"does this only work for 10 FILTER-X?\".",
    suppliedSafe:
      "initial.json is never edited. Changes live in a cookie in this browser, the banner says so while one is set, and Restore puts the supplied records back.",

    orderHeading: "Purchase order",
    part: "Part",
    partHint: "Named in every generated sentence",
    ordered: "Ordered",
    orderedHint: "What PO-1 asked the supplier for",

    invoiceHeading: "Supplier invoice",
    invoiced: "Invoiced",
    invoicedHint: "What INV-1 bills for, before any credit note",

    notesHeading: "Delivery notes",
    notesIntro:
      "Listed is what the note claims. Counted in and damaged are what the receipt says - the presets use them, and at the bay the clerk types them instead.",
    listed: "Listed",
    counted: "Counted in",
    damagedLabel: "Damaged",
    acceptedLabel: "Accepted",
    derived: "Derived",

    previewHeading: "What the engine will see",
    previewOrdered: "Ordered",
    previewListed: "Listed",
    previewCounted: "Counted in",
    previewAccepted: "Accepted",
    previewInvoiced: "Invoiced",
    gapNone: "Invoice and accepted stock agree — no difference to raise.",
    gapSome: (n: number) =>
      `Invoiced ${n > 0 ? "exceeds" : "falls short of"} accepted by ${Math.abs(n)}: a difference the reviewer has to settle.`,
    previewNote:
      "Counted in and damaged only apply to the invoice-arrived preset. Start of shift leaves the bay empty so you can count the goods in yourself.",

    invalid: (noteId: string) =>
      `Damaged on ${noteId} cannot exceed what was counted in.`,
    changed: "changed",
    suppliedValue: (v: string | number) => `was ${v}`,

    applyShift: "Apply — start of shift",
    applyInvoice: "Apply — invoice arrived",
    applying: "Rebuilding…",
    applyNote:
      "Applying rebuilds the case from these numbers. Counts and proposals from the old ones are cleared, because they answer a question that no longer exists.",
    restore: "Restore the supplied records",
    restoring: "Restoring…",
    restoreHint: "Back to initial.json, and the banner marker clears.",

    limitsHeading: "What this screen does not do",
    limits: [
      "The note ids are fixed. You can change what DN-1 and DN-2 say, not add a third or drop one — that is a records change, not a setting.",
      "The change is a cookie in this browser. Another browser pointed at the same database sees the same records but resets to the supplied numbers.",
      "Nothing here is validated against a real purchase order. The values are accepted as typed, within the database's own constraints.",
    ],
  },

  // The presenter briefing at /docs. It was English-only on the grounds that it
  // is the operator's own notes; it is translated now, because a reviewer
  // reading the prototype in Arabic should be able to read the claims it makes
  // about itself in Arabic too. Record ids, table names, file paths and shell
  // commands stay Latin: they are identifiers, not prose.
  //
  // Emphasis travels inside the strings - *bold*, _italic_, `mono` - because
  // Arabic re-orders the sentence, so the marked words move with it instead of
  // being wrapped in JSX out here.
  docs: {
    metaTitle: "Presenter briefing — C04",
    metaDescription:
      "How to run the prototype, what it does today, and what is still a hypothesis.",
    title: "Presenter briefing — C04",
    subtitle:
      "How to run it, the demo script, and an honest account of what is real. Five minutes to read.",
    back: "← Back to the prototype",

    sayFirstHeading: "Say this first",
    pitch:
      "Ten filters were ordered, ten arrived, ten were invoiced — but only *nine* went into stock. Today nobody can tell whether the missing one was a shortage, a damaged item, a duplicate scan or a second delivery, so the invoice gets paid or argued about on a hunch. We changed what the receiving lead records at the bay, so the difference resolves to a cause with evidence behind it.",

    demoHeading: "The demo — six beats, about two minutes",
    beats: [
      "*Reset — start of shift.* Two delivery notes are at the bay. Nothing counted in, no invoice. Screen 3 shows _nothing to review_ — that is the empty state, and it is honest.",
      "*Count in DN-1.* Counted in 8, damaged 1. Accepted shows `7` and cannot be typed over — it is derived, and the database refuses a receipt where the three do not balance. _This is the answer to the challenge question._",
      "*Count in DN-2.* 2 and 0. You land on the evidence screen automatically: 10 ordered, 10 listed, 10 counted, 9 accepted. Nothing is wrong yet — the goods reconcile against the notes.",
      "*Press “Supplier invoice arrives”* (coral — a simulation). The invoice bills 10. Two proposals are raised and you are taken to review. One click, no second prompt.",
      "*Read the first proposal aloud.* Leading cause _Damage_, marked _likely_, with Shortage, Duplicate scan and Second delivery still listed as open. Evidence: `INV-1 · DN-1 · DN-2 · RC-1`. Proposed action: request a credit note. Then say the important line: _it proposes, it does not decide._",
      "*Approve it* — or press _Correct it_, pick a different cause and type a reason. Either way the decision, the reviewer and the final cause are recorded, and the history shows which. Then press “Supplier issues a credit note” to watch the gap close to reconciled. The second proposal is the duplicate-scan question — two notes against one order — and it is there to show the system asks rather than assumes.",
    ],
    thirtyLabel: "If you only have 30 seconds",
    thirtyBody:
      "Reset — invoice arrived. That drops you straight into the proposal on screen 3. Read it, approve it, done.",

    runHeading: "Run it",
    runSteps: [
      "`cd web && npm install` — once, if `node_modules` is missing.",
      "`web/.env.local` must hold the Supabase URL, publishable key and secret key. It is gitignored, so after a fresh clone — and only then — copy `web/.env.example` over and fill it in. *If the file already exists, leave it alone:* copying the example over a filled-in file replaces the keys with placeholders and every screen 500s.",
      "Run `npm run dev`, then open `http://localhost:3000`.",
    ],
    resetLabel: "Reset to a known start state",
    resetBody:
      "Use the two reset buttons at the bottom of any screen — they rebuild the database from the supplied records in one click. Pasting `supabase/seed.sql` into the Supabase SQL editor does the same thing. Run `npm run check:seed` to prove the app still reseeds the supplied values unaltered.",

    whoHeading: "Who is in the story",
    roles: {
      receiver: {
        who: "Receiving lead (screen 1)",
        does: "Unloads the delivery and records the goods receipt: counted in, damaged, accepted. Two numbers typed, the third derived.",
        why: "The person the challenge question is about. Everything downstream depends on the thirty seconds they have at the bay.",
      },
      reconciler: {
        who: "Reconciler / reviewer (screen 3)",
        does: "Gets the invoice weeks later, reads the proposal and its evidence, and approves, corrects or rejects it.",
        why: "The victim of the current process, and the only actor who can settle a difference. Their answer becomes the record — not the system's.",
      },
    },
    noLoginLabel: "There is no login",
    noLoginBody:
      "No accounts, no authentication. The reviewer is a name typed into a field. Say this rather than let the demo imply an identity model it does not have.",

    existsHeading: "What exists today",
    features: {
      flow: {
        name: "Three-screen receiving flow",
        body: "Goods receipt, then the linked evidence, then the discrepancy review — with working buttons on every step.",
      },
      quantities: {
        name: "Three quantities kept separate",
        body: "Accepted is derived from counted-in minus damaged and stored separately. A database check constraint makes an unbalanced receipt impossible to write, so the rule holds even if the app is wrong.",
      },
      proposal: {
        name: "Ranked proposal, decision left open",
        body: "The system names the most likely cause with a confidence, keeps the other candidates visible, and states what would settle it. It never closes the gap itself.",
      },
      review: {
        name: "Human review that sets the state",
        body: "Approve, correct or reject. A correction overrides the proposed cause, and the reviewer, the note and the final cause are all recorded.",
      },
      events: {
        name: "Two labelled simulated events",
        body: "The invoice arriving and the supplier issuing a credit note. Each asks first: the box names the exact record it would write, says plainly that nothing leaves the prototype, and offers that document as a PDF. Confirming updates the evidence and the outstanding proposal in one step.",
      },
      states: {
        name: "Empty and uncertain states",
        body: "Nothing at the bay, no evidence yet, nothing to review — each is a designed screen. The uncertain state is the default on screen 3.",
      },
      languages: {
        name: "English, Arabic and German, including the engine",
        body: "The switch in the header changes every screen — this briefing included — and Arabic comes back right-to-left with an Arabic face. The reconciliation engine’s own sentences are translated too: a proposal stores the facts alongside the English text, so a difference raised in one language reads correctly in the others. Record ids, quantities and typed notes are never translated.",
      },
      settings: {
        name: "Case settings, as scaffolding",
        body: "`/settings` edits the ordered, listed, counted, damaged and invoiced quantities and the part name, then rebuilds the case from them. It exists to answer “does this only work for 10 FILTER-X?” — the engine reads those numbers from Postgres, so changing them re-ranks the cause. It is labelled prototype-only on the page, the change lives in a cookie rather than in `initial.json`, and the top banner says so until it is restored. A shipped system takes these from the ERP.",
      },
      rls: {
        name: "No write without review, enforced",
        body: "The browser key can read and nothing else; a write from it fails with Postgres `42501`. Every state change goes through a server action.",
      },
      external: {
        name: "Anything leaving the building",
        body: "No supplier email, no stock posting, no accounting entry. An approved action is recorded and labelled “Not sent”. This is deliberate — the exercise forbids it — but it is the boundary of the demo.",
      },
    },

    pathsHeading: "The three paths",
    paths: {
      ordinary: {
        name: "Ordinary",
        body: "Reset to start of shift, count in both notes. Ten listed, ten counted, the goods reconcile against the notes and there is nothing to review. The boring case — show it for ten seconds so the exception has contrast.",
      },
      changed: {
        name: "Changed information",
        body: "Press “Supplier invoice arrives”, then later “Supplier issues a credit note”. Each is a labelled simulation that injects one record and lets the reconciliation and the proposal update on their own. The credit note is a new record; INV-1 is never edited.",
      },
      failure: {
        name: "Failure / uncertainty",
        body: "The default state of screen 3. Damage is flagged as likely because it matches the gap exactly, but shortage, duplicate scan and second delivery stay on the card, and the proposal says plainly that these records alone do not settle it. Press “Correct it” to show the reviewer overriding the system.",
      },
    },

    decisionHeading: "The one design decision to defend",
    decisionLead:
      "The engine could assert “damage” and close the gap: one unit damaged, one unit of difference, the arithmetic works. It proposes it instead.",
    decisionBody:
      "Damage explaining the gap arithmetically is not the supplier agreeing to credit it, and nothing in these records proves that. A system that quietly picks the convenient cause produces a number somebody later has to defend to a supplier without knowing where it came from — which is the pain the client described. So it ranks, shows the alternatives, says what would settle it, and hands the decision to a person.",
    decisionAside:
      "If someone argues it should just answer: that is a product choice, not a technical limit. Ask them who signs the credit note.",

    realHeading: "Real vs simulated",
    thComponent: "Component",
    thStatus: "Status",
    thEvidence: "Evidence and limitation",
    rows: {
      capture: {
        c: "Receipt capture",
        s: "Real",
        l: "Writes a row through a server action. The DB check constraint rejects an unbalanced receipt.",
      },
      records: {
        c: "Records and persistence",
        s: "Real",
        l: "Live Supabase Postgres, 8 tables. Reseeded from the supplied records; npm run check:seed proves they are unaltered.",
      },
      engine: {
        c: "Reconciliation and proposal",
        s: "Real",
        l: "Pure TypeScript, no model call. Deterministic — the same records always give the same proposal.",
      },
      review: {
        c: "Human review",
        s: "Real",
        l: "Approve / correct / reject writes a review_decisions row. RLS blocks the browser key from writing at all.",
      },
      events: {
        c: "Event trigger",
        s: "Simulated, labelled",
        l: "Two buttons inject the invoice and the credit note. Each confirms first and offers its document as a PDF. Marked coral and tagged Simulated wherever they appear.",
      },
      scans: {
        c: "Scanned documents",
        s: "Simulated",
        l: "No OCR. Notes and invoices are structured rows, as the exercise permits. The PDF a simulated event offers is generated from those rows — a document the prototype wrote, not one it read.",
      },
      external: {
        c: "External action",
        s: "None, by design",
        l: "No supplier message, stock update or accounting entry is executed. Approved actions are recorded and labelled Not sent.",
      },
    },

    limitsHeading: "Limitations, and what you would test next",
    limits: [
      "One order, one part, one invoice. No catalogue, partial invoices or price lines.",
      "Row-level security is demo-open: anyone with the URL can read, and the demo buttons let anyone reset it. Deliberate for the exercise, not a production posture.",
      "No authentication, so “who approved this” is a text field, not an identity.",
      "The four candidate causes are the ones the client named, hand-written. A real receiving bay will have more.",
      "The screens read live from Supabase; without network they will not load.",
    ],
    nextTestLabel: "Next validation test",
    nextTestBody:
      "Take one week of real delivery notes and invoices from one supplier, run them through the reconciliation, and count how many differences resolve to a single cause with evidence versus how many still need a phone call. Success is a fall in those calls, judged by the reconciler — not by us.",
    close:
      "Close on the split: what is *demonstrated* is that the right receipt record makes a difference resolvable with evidence, and that a person stays in the loop. What remains a *hypothesis* is that this reduces reconciliation effort at real volume.",

    status: {
      built: "Built",
      partial: "Partial",
      pending: "Not built",
    },
  },

  error: {
    title: "Something went wrong on this screen",
    body: "The records in Supabase are untouched. Try again, or rebuild the start state and pick the demo back up.",
    retry: "Try again",
    home: "Back to the bay",
    detail: "Technical detail",
  },

  // Sentences the reconciliation engine generates. Keyed by discrepancy kind so
  // a proposal stored in the database can be re-rendered in either language.
  recon: {
    received_vs_listed: {
      statement: (p: { listed: number; received: number }) =>
        `Notes listed ${p.listed} but ${p.received} were counted in.`,
      action: (p: { abs: number; part: string; notes: string[] }) =>
        `Query the supplier about ${p.abs} × ${p.part} against ${p.notes.join(" and ")}.`,
      settledBy: () =>
        "A recount against the notes, then the supplier's dispatch record.",
    },
    invoiced_vs_accepted: {
      statement: (p: {
        invoiceId: string;
        invoicedNet: number;
        accepted: number;
        delta: number;
      }) =>
        `${p.invoiceId} claims ${p.invoicedNet} but ${p.accepted} were accepted into stock: a difference of ${p.delta}.`,
      actionDamage: (p: { delta: number; part: string; receipts: string[] }) =>
        `Request a credit note for ${p.delta} × ${p.part} from the supplier, citing ${p.receipts.join(", ")}.`,
      actionUnclear: (p: { notes: string[]; invoiceId: string }) =>
        `Ask the supplier to confirm what was dispatched against ${p.notes.join(" and ")} before paying ${p.invoiceId}.`,
      settledDamage: (p: { damaged: number; receipts: string[] }) =>
        `Damage of ${p.damaged} on ${p.receipts.join(", ")} matches the gap exactly. A supplier credit note would settle it; these records alone do not.`,
      settledUnclear: () =>
        "No single record accounts for the difference. Needs supplier confirmation.",
    },
    split_delivery: {
      statement: (p: { count: number; orderId: string; ordered: number }) =>
        `${p.count} delivery notes reference ${p.orderId}, totalling exactly the ${p.ordered} ordered.`,
      action: () =>
        "Record both notes as one order delivered in parts. No stock change.",
      settledBy: () =>
        "Quantities reconcile, so this reads as a split delivery. Confirm the notes carry different dates or carriers before treating them as separate deliveries.",
    },
  },
};

export type Dict = typeof en;
