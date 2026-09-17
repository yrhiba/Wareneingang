import type {
  Cause,
  Confidence,
  CreditNote,
  DeliveryNote,
  Invoice,
  InvoiceLine,
  Order,
  Receipt,
} from "./types";

export type Discrepancy = {
  /** Stable id, so a persisted proposal can be matched back to the gap it came from. */
  key: string;
  /** Plain statement of the gap, in the receiving lead's words. */
  statement: string;
  delta: number;
  /** Best-supported cause, or null when the evidence genuinely cannot rank them. */
  likely: Cause | null;
  confidence: Confidence;
  /** Causes that remain open. The reviewer can pick any of these instead. */
  candidates: Cause[];
  /** Record ids backing the claim, so a reader can trace evidence -> conclusion. */
  evidence: string[];
  /** What the system proposes doing next. A proposal, never an executed action. */
  proposedAction: string;
  /** What would remove the remaining doubt. */
  settledBy: string;
};

export type Reconciliation = {
  ordered: number;
  listed: number;
  received: number;
  damaged: number;
  accepted: number;
  /** Gross, as billed. */
  invoiced: number;
  /** Sum of credit notes against that invoice. */
  credited: number;
  /** What the supplier is actually claiming once credits are counted. */
  invoicedNet: number;
  /** Notes with no receipt yet - what is still waiting at the bay. */
  awaitingReceipt: DeliveryNote[];
  discrepancies: Discrepancy[];
};

export type ReconcileInput = {
  order: Order;
  notes: DeliveryNote[];
  receipts: Receipt[];
  invoice: Invoice | null;
  invoiceLines: InvoiceLine[];
  creditNotes: CreditNote[];
};

/**
 * Reconciles one order across its notes, receipts, invoice and any credit notes.
 *
 * It ranks a leading cause where the evidence supports one, but never asserts a
 * single cause as settled: the case turns on shortage / damage / duplicate scan
 * / second delivery being indistinguishable in the records as captured. So it
 * proposes, shows the alternatives, and leaves the decision to the reviewer.
 */
export function reconcile({
  order,
  notes,
  receipts,
  invoice,
  invoiceLines,
  creditNotes,
}: ReconcileInput): Reconciliation {
  // A note marked as a duplicate scan stops counting, but the row stays visible.
  const live = notes.filter((n) => !n.duplicate_of);
  const received = sum(receipts.map((r) => r.received));
  const damaged = sum(receipts.map((r) => r.damaged));
  const accepted = sum(receipts.map((r) => r.accepted));
  const listed = sum(live.map((n) => n.listed_quantity));
  const invoiced = invoice?.quantity ?? 0;
  const credited = sum(
    creditNotes.filter((c) => c.invoice_id === invoice?.id).map((c) => c.quantity),
  );
  const invoicedNet = invoiced - credited;

  const withReceipt = new Set(receipts.map((r) => r.delivery_note));
  const awaitingReceipt = live.filter((n) => !withReceipt.has(n.id));

  const discrepancies: Discrepancy[] = [];

  // Goods physically short against what the notes listed. Checked first: if the
  // count is short, that outranks anything the invoice says.
  if (receipts.length > 0 && awaitingReceipt.length === 0 && received !== listed) {
    const delta = received - listed;
    discrepancies.push({
      key: `received_vs_listed:${order.id}`,
      statement: `Notes listed ${listed} but ${received} were counted in.`,
      delta,
      likely: "shortage",
      confidence: "likely",
      candidates: ["shortage", "duplicate_scan"],
      evidence: [...live.map((n) => n.id), ...receipts.map((r) => r.id)],
      proposedAction: `Query the supplier about ${Math.abs(delta)} × ${order.part} against ${live
        .map((n) => n.id)
        .join(" and ")}.`,
      settledBy: "A recount against the notes, then the supplier's dispatch record.",
    });
  }

  // The headline gap: billed for more than was accepted into stock.
  if (invoice && invoicedNet !== accepted) {
    const delta = invoicedNet - accepted;
    const damagedReceipts = receipts.filter((r) => r.damaged > 0);
    const linkedNotes = invoiceLines
      .filter((l) => l.invoice_id === invoice.id)
      .map((l) => l.delivery_note);

    // Damage is only the *leading* candidate: it accounts for the gap
    // arithmetically, but nothing here proves the supplier agreed to credit it.
    const damageExplainsIt = damaged === delta && damaged > 0;
    const candidates: Cause[] = damageExplainsIt
      ? ["damage", "shortage"]
      : ["shortage", "damage"];
    if (live.length > 1) candidates.push("duplicate_scan", "second_delivery");

    discrepancies.push({
      key: `invoiced_vs_accepted:${invoice.id}`,
      statement: `${invoice.id} claims ${invoicedNet} but ${accepted} were accepted into stock: a difference of ${delta}.`,
      delta,
      likely: damageExplainsIt ? "damage" : null,
      confidence: damageExplainsIt ? "likely" : "uncertain",
      candidates,
      evidence: [
        invoice.id,
        ...linkedNotes,
        ...damagedReceipts.map((r) => r.id),
        ...creditNotes.filter((c) => c.invoice_id === invoice.id).map((c) => c.id),
      ],
      proposedAction: damageExplainsIt
        ? `Request a credit note for ${delta} × ${order.part} from the supplier, citing ${damagedReceipts
            .map((r) => r.id)
            .join(", ")}.`
        : `Ask the supplier to confirm what was dispatched against ${linkedNotes.join(
            " and ",
          )} before paying ${invoice.id}.`,
      settledBy: damageExplainsIt
        ? `Damage of ${damaged} on ${damagedReceipts
            .map((r) => r.id)
            .join(", ")} matches the gap exactly. A supplier credit note would settle it; these records alone do not.`
        : "No single record accounts for the difference. Needs supplier confirmation.",
    });
  }

  // Several notes on one order: parts of one delivery, or the same scan twice?
  if (live.length > 1 && listed === order.quantity) {
    discrepancies.push({
      key: `split_delivery:${order.id}`,
      statement: `${live.length} delivery notes reference ${order.id}, totalling exactly the ${order.quantity} ordered.`,
      delta: 0,
      likely: "second_delivery",
      confidence: "possible",
      candidates: ["second_delivery", "duplicate_scan"],
      evidence: live.map((n) => n.id),
      proposedAction: "Record both notes as one order delivered in parts. No stock change.",
      settledBy:
        "Quantities reconcile, so this reads as a split delivery. Confirm the notes carry different dates or carriers before treating them as separate deliveries.",
    });
  }

  return {
    ordered: order.quantity,
    listed,
    received,
    damaged,
    accepted,
    invoiced,
    credited,
    invoicedNet,
    awaitingReceipt,
    discrepancies,
  };
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
