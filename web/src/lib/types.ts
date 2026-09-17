export type Order = { id: string; part: string; quantity: number };

export type DeliveryNote = {
  id: string;
  order_id: string;
  part: string;
  listed_quantity: number;
  duplicate_of: string | null;
};

export type Receipt = {
  id: string;
  delivery_note: string;
  received: number;
  damaged: number;
  accepted: number;
  created_at?: string;
};

export type Invoice = { id: string; part: string; quantity: number };
export type InvoiceLine = { invoice_id: string; delivery_note: string };

/** A supplier-side correction. Arrives as its own record; never edits the invoice. */
export type CreditNote = {
  id: string;
  invoice_id: string;
  quantity: number;
  reason: string;
  is_simulated: boolean;
  created_at?: string;
};

/**
 * Everything a generated sentence needs, without the sentence.
 *
 * The prose the engine produces has to appear in two languages and outlive the
 * request that produced it: a proposal sits in the database until someone
 * reviews it, possibly in the other language. So the facts travel as data and
 * the wording is applied at render time, from the dictionary.
 */
export type DiscrepancyMessage =
  | {
      kind: "received_vs_listed";
      listed: number;
      received: number;
      abs: number;
      part: string;
      notes: string[];
    }
  | {
      kind: "invoiced_vs_accepted";
      /** Whether damage accounts for the gap exactly. Picks the wording. */
      variant: "damage" | "unclear";
      invoiceId: string;
      invoicedNet: number;
      accepted: number;
      delta: number;
      damaged: number;
      part: string;
      receipts: string[];
      notes: string[];
    }
  | { kind: "split_delivery"; count: number; orderId: string; ordered: number };

/** The four candidate causes a difference can resolve to. */
export type Cause =
  | "shortage"
  | "damage"
  | "duplicate_scan"
  | "second_delivery"
  | "unknown";

/** How strongly the records back the leading cause. Never "certain". */
export type Confidence = "likely" | "possible" | "uncertain";

export type ProposalStatus = "pending" | "approved" | "corrected" | "rejected";

export type Proposal = {
  id: string;
  kind: string;
  summary: string;
  cause: Cause;
  confidence: Confidence;
  evidence: string[];
  /** Snapshot of what the system proposed, kept so history reads on its own. */
  proposed_state: {
    action?: string;
    delta?: number;
    part?: string;
    settled_by?: string;
    alternatives?: Cause[];
    /**
     * The facts behind the generated sentences. Stored alongside the English
     * prose so the review screen can re-render a proposal in whichever
     * language the reviewer picked, long after it was raised. Optional: rows
     * written before this existed fall back to the stored text.
     */
    msg?: DiscrepancyMessage;
  } | null;
  status: ProposalStatus;
  is_simulated: boolean;
  created_at: string;
};

export type ReviewDecision = {
  id: string;
  proposal_id: string;
  decision: "approved" | "corrected" | "rejected";
  reviewer: string;
  note: string | null;
  final_state: { cause?: Cause; action?: string } | null;
  decided_at: string;
};
