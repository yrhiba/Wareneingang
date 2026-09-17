import { INITIAL } from "@/lib/seed-data";

/**
 * Prototype scaffolding, and labelled as such on every screen it touches.
 *
 * The numbers this exposes are not settings a real system would have: a
 * purchase order quantity comes from the ERP, a listed quantity comes off the
 * supplier's note, and neither is something a receiving clerk may retype. They
 * are here because the demo has to answer "does this only work for 10
 * FILTER-X?" - the engine reads these values from the database like any other
 * record, so changing them changes every screen, both languages included.
 *
 * `initial.json` is never edited. The supplied values below are read from the
 * same verbatim copy the reset buttons use; a change lives in a cookie, and the
 * banner says so for as long as one is set.
 */

export const CONFIG_COOKIE = "c04-case";

/** Generous, but bounded: the columns are integers with a >= 0 check. */
export const MAX_QTY = 9999;
export const MAX_PART = 32;

export type NoteConfig = {
  id: string;
  /** What the supplier's note claims is in the shipment. */
  listed: number;
  /** What the count finds. Seeded by the "invoice arrived" preset only - at
   *  the bay this is the number the clerk types. */
  counted: number;
  /** Of those counted in, how many arrived unusable. */
  damaged: number;
};

export type CaseConfig = {
  part: string;
  ordered: number;
  invoiced: number;
  notes: NoteConfig[];
};

/** The supplied records, in the shape the settings screen edits. */
export const SUPPLIED: CaseConfig = {
  part: INITIAL.order.part,
  ordered: INITIAL.order.quantity,
  invoiced: INITIAL.invoice.quantity,
  notes: INITIAL.notes.map((n) => {
    const receipt = INITIAL.receipts.find((r) => r.delivery_note === n.id);
    return {
      id: n.id,
      listed: n.listed_quantity,
      counted: receipt?.received ?? n.listed_quantity,
      damaged: receipt?.damaged ?? 0,
    };
  }),
};

const qty = (v: unknown, fallback: number) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= MAX_QTY
    ? n
    : fallback;
};

const partName = (v: unknown) => {
  const s = typeof v === "string" ? v.trim().slice(0, MAX_PART) : "";
  return s || SUPPLIED.part;
};

/**
 * Reads a config back out of the cookie, clamping every field.
 *
 * The note list comes from the supplied records, not from the cookie, so an
 * edited cookie can change quantities but cannot invent or drop a delivery
 * note - the ids stay the ones the case ships with.
 */
export function parseConfig(raw: string | undefined | null): CaseConfig {
  if (!raw) return SUPPLIED;
  let value: Partial<CaseConfig>;
  try {
    value = JSON.parse(raw) as Partial<CaseConfig>;
  } catch {
    return SUPPLIED;
  }
  const incoming = Array.isArray(value.notes) ? value.notes : [];

  return {
    part: partName(value.part),
    ordered: qty(value.ordered, SUPPLIED.ordered),
    invoiced: qty(value.invoiced, SUPPLIED.invoiced),
    notes: SUPPLIED.notes.map((supplied) => {
      const got = incoming.find((n) => n?.id === supplied.id);
      const counted = qty(got?.counted, supplied.counted);
      return {
        id: supplied.id,
        listed: qty(got?.listed, supplied.listed),
        counted,
        // accepted = received - damaged is a check constraint; never write a
        // row the database would reject.
        damaged: Math.min(qty(got?.damaged, supplied.damaged), counted),
      };
    }),
  };
}

export function isSupplied(config: CaseConfig): boolean {
  return (
    config.part === SUPPLIED.part &&
    config.ordered === SUPPLIED.ordered &&
    config.invoiced === SUPPLIED.invoiced &&
    config.notes.every((n, i) => {
      const s = SUPPLIED.notes[i];
      return (
        s &&
        n.id === s.id &&
        n.listed === s.listed &&
        n.counted === s.counted &&
        n.damaged === s.damaged
      );
    })
  );
}

/**
 * Turns a config into the rows to seed.
 *
 * Ids, the order/note/invoice structure and the note-to-invoice links are
 * fixed - they are the case. Only the quantities and the part name move.
 */
export function buildRecords(config: CaseConfig) {
  return {
    order: { id: INITIAL.order.id, part: config.part, quantity: config.ordered },
    notes: config.notes.map((n) => ({
      id: n.id,
      order_id: INITIAL.order.id,
      part: config.part,
      listed_quantity: n.listed,
    })),
    receipts: config.notes.map((n) => ({
      id: n.id.replace(/^DN-/, "RC-"),
      delivery_note: n.id,
      received: n.counted,
      damaged: n.damaged,
      accepted: n.counted - n.damaged,
    })),
    invoice: { id: INITIAL.invoice.id, part: config.part, quantity: config.invoiced },
    invoiceLines: INITIAL.invoiceLines.map((l) => ({ ...l })),
  };
}
