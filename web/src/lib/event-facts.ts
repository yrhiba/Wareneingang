import { buildRecords } from "./case-config";
import { getCaseConfig } from "./case-config/server";
import { loadCase, type CaseData } from "./queries";
import type { EventFacts } from "./types";

/**
 * The credit note's id.
 *
 * Fixed rather than generated, so the document offered before the event and the
 * row written by it carry the same number, and so the reviewer reads CN-1 next
 * to PO-1, DN-1, RC-1 and INV-1 rather than a timestamp. Only ever one credit
 * note exists per case - `simulateEvent` refuses a second - so there is nothing
 * for a counter to disambiguate.
 */
export const CREDIT_NOTE_ID = "CN-1";

/**
 * Resolves what the two simulated events would write.
 *
 * Live records win where they exist; the active case config fills in the rest.
 * That is what lets the confirmation box name INV-1 and its quantity before any
 * invoice row exists, and it keeps those numbers following the settings screen
 * instead of a literal.
 */
export async function eventFacts(data?: CaseData): Promise<EventFacts> {
  const state = data ?? (await loadCase());
  const planned = buildRecords(await getCaseConfig());
  const gap = state.invoice
    ? state.reconciliation.invoicedNet - state.reconciliation.accepted
    : 0;
  const credit = state.creditNotes[0] ?? null;

  return {
    orderId: state.order.id,
    part: state.order.part,
    invoiceId: state.invoice?.id ?? planned.invoice.id,
    invoiceQty: state.invoice?.quantity ?? planned.invoice.quantity,
    noteIds: (state.invoice ? state.invoiceLines : planned.invoiceLines).map(
      (l) => l.delivery_note,
    ),
    creditId: credit?.id ?? CREDIT_NOTE_ID,
    creditQty: credit?.quantity ?? gap,
    invoiceArrived: state.invoice !== null,
    creditIssued: credit !== null,
  };
}
