import type { Cause, Confidence } from "@/lib/types";

export type Dir = "ltr" | "rtl";

/**
 * English is the source dictionary. `ar.ts` is typed against it, so a key added
 * here that is not translated there fails the typecheck rather than silently
 * falling back to English mid-demo.
 *
 * Arrows live inside the strings because they have to flip under RTL.
 */
export const en = {
  dir: "ltr" as Dir,
  name: "English",
  short: "EN",

  chrome: {
    metaTitle: "Goods receipt — C04",
    metaDescription:
      "What to record at receipt so the next person can resolve the difference.",
    banner:
      "Synthetic exercise data · Trast-style goods receipt · not a real supplier",
    brand: "Goods receipt",
    flow: "Receiving flow",
    briefing: "Briefing",
    briefingNote:
      "The briefing is the presenter's own notes and is kept in English. The prototype itself runs in both languages.",
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
      "Purple marks anything injected or simulated. Nothing in this prototype contacts a supplier or posts to stock.",
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
