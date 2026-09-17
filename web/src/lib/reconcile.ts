import { en, type Dict } from "@/lib/i18n";
import type {
  Cause,
  Confidence,
  CreditNote,
  DeliveryNote,
  DiscrepancyMessage,
  Invoice,
  InvoiceLine,
  Order,
  Receipt,
} from "./types";

export type { DiscrepancyMessage };

export type RenderedDiscrepancy = {
  statement: string;
  proposedAction: string;
  settledBy: string;
};

/** Turns the facts into sentences in one language. */
export function renderDiscrepancy(
  t: Dict,
  m: DiscrepancyMessage,
): RenderedDiscrepancy {
  switch (m.kind) {
    case "received_vs_listed": {
      const c = t.recon.received_vs_listed;
      return {
        statement: c.statement(m),
        proposedAction: c.action(m),
        settledBy: c.settledBy(),
      };
    }
    case "invoiced_vs_accepted": {
      const c = t.recon.invoiced_vs_accepted;
      const damage = m.variant === "damage";
      return {
        statement: c.statement(m),
        proposedAction: damage ? c.actionDamage(m) : c.actionUnclear(m),
        settledBy: damage ? c.settledDamage(m) : c.settledUnclear(),
      };
    }
    case "split_delivery": {
      const c = t.recon.split_delivery;
      return {
        statement: c.statement(m),
        proposedAction: c.action(),
        settledBy: c.settledBy(),
      };
    }
  }
}

export type Discrepancy = {
  /** Stable id, so a persisted proposal can be matched back to the gap it came from. */
  key: string;
  /** The facts behind the sentences, so either language can render them. */
  msg: DiscrepancyMessage;
  /** Plain statement of the gap, in English. The database keeps this copy. */
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
 *
 * The prose it returns is English; it is what gets persisted with a proposal so
 * the stored record reads on its own. Screens render `msg` through the active
 * dictionary instead.
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
    const msg: DiscrepancyMessage = {
      kind: "received_vs_listed",
      listed,
      received,
      abs: Math.abs(delta),
      part: order.part,
      notes: live.map((n) => n.id),
    };
    discrepancies.push({
      key: `received_vs_listed:${order.id}`,
      msg,
      delta,
      likely: "shortage",
      confidence: "likely",
      candidates: ["shortage", "duplicate_scan"],
      evidence: [...live.map((n) => n.id), ...receipts.map((r) => r.id)],
      ...renderDiscrepancy(en, msg),
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

    const msg: DiscrepancyMessage = {
      kind: "invoiced_vs_accepted",
      variant: damageExplainsIt ? "damage" : "unclear",
      invoiceId: invoice.id,
      invoicedNet,
      accepted,
      delta,
      damaged,
      part: order.part,
      receipts: damagedReceipts.map((r) => r.id),
      notes: linkedNotes,
    };

    discrepancies.push({
      key: `invoiced_vs_accepted:${invoice.id}`,
      msg,
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
      ...renderDiscrepancy(en, msg),
    });
  }

  // Several notes on one order: parts of one delivery, or the same scan twice?
  //
  // Only worth a decision once everything is counted in AND something is being
  // claimed against it. Before the invoice a split delivery is just a delivery;
  // it becomes a question when someone has to decide what the invoice is paying
  // for. Raising it at the bay would put a proposal on every clean receipt.
  if (
    live.length > 1 &&
    listed === order.quantity &&
    receipts.length > 0 &&
    awaitingReceipt.length === 0 &&
    invoice
  ) {
    const msg: DiscrepancyMessage = {
      kind: "split_delivery",
      count: live.length,
      orderId: order.id,
      ordered: order.quantity,
    };
    discrepancies.push({
      key: `split_delivery:${order.id}`,
      msg,
      delta: 0,
      likely: "second_delivery",
      confidence: "possible",
      candidates: ["second_delivery", "duplicate_scan"],
      evidence: live.map((n) => n.id),
      ...renderDiscrepancy(en, msg),
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
