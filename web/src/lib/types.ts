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

export const CAUSE_LABEL: Record<Cause, string> = {
  shortage: "Shortage",
  damage: "Damage",
  duplicate_scan: "Duplicate scan",
  second_delivery: "Second delivery",
  unknown: "Unknown",
};
