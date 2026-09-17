import { createServerClient } from "./supabase/server";
import { reconcile } from "./reconcile";
import type {
  CreditNote,
  DeliveryNote,
  Invoice,
  InvoiceLine,
  Order,
  Proposal,
  Receipt,
  ReviewDecision,
} from "./types";

export type CaseData = Awaited<ReturnType<typeof loadCase>>;

/** Loads one order and everything that references it, then reconciles. */
export async function loadCase(orderId = "PO-1") {
  const db = createServerClient();

  const [orders, notes, receipts, invoices, lines, credits, proposals, decisions] =
    await Promise.all([
      db.from("orders").select("*").eq("id", orderId).single(),
      db.from("delivery_notes").select("*").eq("order_id", orderId).order("id"),
      db.from("receipts").select("*").order("id"),
      db.from("invoices").select("*").order("id"),
      db.from("invoice_lines").select("*"),
      db.from("credit_notes").select("*").order("created_at"),
      db.from("proposals").select("*").order("created_at"),
      db.from("review_decisions").select("*").order("decided_at"),
    ]);

  // credit_notes is the one table added after the first schema ran. If the
  // migration has not been applied yet, degrade instead of 500-ing the whole
  // app: everything except the credit-note event still works, and the UI
  // disables that button rather than pretending it is there.
  const creditNotesAvailable = credits.error?.code !== "PGRST205";
  if (!creditNotesAvailable) {
    console.warn(
      "[c04] credit_notes table missing - run supabase/migrations/001_credit_notes.sql",
    );
  }

  const firstError =
    orders.error ??
    notes.error ??
    receipts.error ??
    invoices.error ??
    lines.error ??
    (creditNotesAvailable ? credits.error : null) ??
    proposals.error ??
    decisions.error;
  if (firstError) throw new Error(firstError.message);

  const order = orders.data as Order;
  const noteRows = (notes.data ?? []) as DeliveryNote[];
  const noteIds = new Set(noteRows.map((n) => n.id));

  const receiptRows = ((receipts.data ?? []) as Receipt[]).filter((r) =>
    noteIds.has(r.delivery_note),
  );
  const lineRows = ((lines.data ?? []) as InvoiceLine[]).filter((l) =>
    noteIds.has(l.delivery_note),
  );
  const invoice =
    ((invoices.data ?? []) as Invoice[]).find((i) =>
      lineRows.some((l) => l.invoice_id === i.id),
    ) ?? null;
  const creditRows = ((credits.data ?? []) as CreditNote[]).filter(
    (c) => c.invoice_id === invoice?.id,
  );

  return {
    creditNotesAvailable,
    order,
    notes: noteRows,
    receipts: receiptRows,
    invoice,
    invoiceLines: lineRows,
    creditNotes: creditRows,
    proposals: (proposals.data ?? []) as Proposal[],
    decisions: (decisions.data ?? []) as ReviewDecision[],
    reconciliation: reconcile({
      order,
      notes: noteRows,
      receipts: receiptRows,
      invoice,
      invoiceLines: lineRows,
      creditNotes: creditRows,
    }),
  };
}
