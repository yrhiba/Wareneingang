/**
 * The supplied records, copied verbatim from ../../initial.json.
 * Do NOT change these values - the exercise forbids altering the supplied
 * records to make the prototype look correct. Run `npm run check:seed` to
 * confirm this file still matches initial.json.
 */
export const INITIAL = {
  order: { id: "PO-1", part: "FILTER-X", quantity: 10 },
  notes: [
    { id: "DN-1", order_id: "PO-1", part: "FILTER-X", listed_quantity: 8 },
    { id: "DN-2", order_id: "PO-1", part: "FILTER-X", listed_quantity: 2 },
  ],
  receipts: [
    { id: "RC-1", delivery_note: "DN-1", received: 8, damaged: 1, accepted: 7 },
    { id: "RC-2", delivery_note: "DN-2", received: 2, damaged: 0, accepted: 2 },
  ],
  invoice: { id: "INV-1", part: "FILTER-X", quantity: 10 },
  invoiceLines: [
    { invoice_id: "INV-1", delivery_note: "DN-1" },
    { invoice_id: "INV-1", delivery_note: "DN-2" },
  ],
} as const;

/**
 * Two start states, both built only from the records above.
 *
 * - start_of_shift: the notes are at the bay, nothing counted in, no invoice yet.
 *   This is where the receiving lead actually stands. The receipts above are what
 *   the capture screen should produce - they are withheld, not changed.
 * - invoice_arrived: the full supplied state, exactly as initial.json.
 */
export type ResetMode = "start_of_shift" | "invoice_arrived";
