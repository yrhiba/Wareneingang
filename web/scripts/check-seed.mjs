/**
 * Guards the exercise rule "do not alter the supplied records".
 *
 * src/lib/seed-data.ts holds the records the app reseeds from. This compares it
 * field by field against the supplied ../initial.json and fails loudly on any
 * drift. Run it before a demo; it is cheap and the failure mode it catches
 * (quietly "fixing" the data so the prototype looks right) is disqualifying.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const supplied = JSON.parse(
  readFileSync(resolve(here, "../../initial.json"), "utf8"),
);
const { INITIAL } = await import("../src/lib/seed-data.ts");

const problems = [];
const eq = (label, a, b) => {
  const x = JSON.stringify(a);
  const y = JSON.stringify(b);
  if (x !== y) problems.push(`${label}\n    initial.json: ${y}\n    seed-data.ts: ${x}`);
};

eq("orders[0]", INITIAL.order, supplied.orders[0]);
eq(
  "delivery_notes",
  INITIAL.notes.map((n) => ({
    id: n.id,
    order_id: n.order_id,
    part: n.part,
    listed_quantity: n.listed_quantity,
  })),
  supplied.delivery_notes,
);
eq("receipts", INITIAL.receipts, supplied.receipts);
eq("invoices[0]", INITIAL.invoice, {
  id: supplied.invoices[0].id,
  part: supplied.invoices[0].part,
  quantity: supplied.invoices[0].quantity,
});
eq(
  "invoice_lines",
  INITIAL.invoiceLines.map((l) => l.delivery_note),
  supplied.invoices[0].delivery_notes,
);

if (problems.length) {
  console.error("✗ seed-data.ts has drifted from initial.json:\n");
  for (const p of problems) console.error("  " + p + "\n");
  process.exit(1);
}
console.log("✓ seed-data.ts matches initial.json exactly");
