"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildRecords,
  CONFIG_COOKIE,
  isSupplied,
  MAX_PART,
  MAX_QTY,
  SUPPLIED,
  type CaseConfig,
} from "@/lib/case-config";
import { getCaseConfig } from "@/lib/case-config/server";
import { CREDIT_NOTE_ID } from "@/lib/event-facts";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";
import { loadCase } from "@/lib/queries";
import { type ResetMode } from "@/lib/seed-data";
import type { Cause } from "@/lib/types";

/**
 * Every write in this app lands here.
 *
 * The browser key cannot write - row-level security refuses it (42501). So a
 * state change can only happen through a server action, which is how "no stock
 * or accounting write without review" is enforced by the database rather than
 * by convention.
 *
 * Nothing here contacts the outside world. No supplier message, no inventory
 * update, no accounting entry is executed; an approved action is recorded as a
 * decision, and the UI labels it as simulated.
 */

function refresh() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

/**
 * Switching language is a write like any other, so it goes through an action.
 *
 * The cookie is what the server reads to choose the dictionary and the text
 * direction, which is why this cannot be client state: <html dir> has to be
 * right in the first response, not corrected afterwards. No redirect is needed
 * - Next re-renders the page the form was posted from.
 */
export async function setLanguage(formData: FormData) {
  const lang = formData.get("lang");
  if (!isLocale(lang)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  refresh();
}

// ---------------------------------------------------------------------------
// Start state
// ---------------------------------------------------------------------------

// Children before parents, or the foreign keys refuse the delete.
//
// PostgREST needs a filter on a DELETE, and it must be one every row matches.
// Comparing an id is not safe here: proposals and review_decisions key on
// uuid (so a text sentinel fails to cast) and invoice_lines has no id column
// at all. So each table names a NOT NULL column and we filter on "is not
// null", which is type-agnostic and always true.
const CLEAR_ORDER: [table: string, notNullColumn: string][] = [
  ["review_decisions", "decided_at"],
  ["proposals", "created_at"],
  ["credit_notes", "created_at"],
  ["invoice_lines", "invoice_id"],
  ["invoices", "created_at"],
  ["receipts", "created_at"],
  ["delivery_notes", "created_at"],
  ["orders", "created_at"],
];

type Db = ReturnType<typeof createServerClient>;

async function clearCase(db: Db) {
  for (const [table, col] of CLEAR_ORDER) {
    const { error } = await db.from(table).delete().not(col, "is", null);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/**
 * Rebuilds the case from a config.
 *
 * With no config cookie set that is `initial.json` verbatim, which is what the
 * reset buttons and the end-to-end suites get. The settings screen can hand a
 * changed one in; the records it produces keep the same ids and the same
 * shape, so every screen still reads the same chain.
 */
async function seedCase(db: Db, config: CaseConfig, mode: ResetMode) {
  const records = buildRecords(config);

  await db.from("orders").insert(records.order).throwOnError();
  await db.from("delivery_notes").insert(records.notes).throwOnError();

  if (mode === "invoice_arrived") {
    await db.from("receipts").insert(records.receipts).throwOnError();
    await db.from("invoices").insert(records.invoice).throwOnError();
    await db.from("invoice_lines").insert(records.invoiceLines).throwOnError();
    await syncProposals();
  }
  // start_of_shift: notes are at the bay, nothing counted in, no invoice yet.
}

export async function resetDemo(formData: FormData) {
  const mode = (formData.get("mode") as ResetMode) ?? "start_of_shift";
  const db = createServerClient();

  await clearCase(db);
  await seedCase(db, await getCaseConfig(), mode);

  refresh();
  redirect(mode === "invoice_arrived" ? "/review" : "/");
}

// ---------------------------------------------------------------------------
// Case configuration - prototype scaffolding, labelled everywhere it shows
// ---------------------------------------------------------------------------

function readQty(formData: FormData, field: string, label: string): number {
  const n = Number(formData.get(field) ?? NaN);
  if (!Number.isInteger(n) || n < 0 || n > MAX_QTY)
    throw new Error(`${label} must be a whole number between 0 and ${MAX_QTY}.`);
  return n;
}

/**
 * Applies a changed case and rebuilds from it.
 *
 * The config is kept in a cookie rather than a table: it is presenter
 * scaffolding, so it needs no migration to work and it cannot leave a shared
 * database in a state a later demo inherits by surprise. The records it
 * produces are written to Postgres like any other - nothing reads the cookie
 * except the reset path and this screen.
 *
 * Applying rebuilds the case, because the numbers are what the engine
 * reconciles: counts and proposals raised against the old ones would be
 * answering a question that no longer exists.
 */
export async function saveCaseConfig(formData: FormData) {
  const mode = (formData.get("mode") as ResetMode) ?? "start_of_shift";

  const part = String(formData.get("part") ?? "").trim().slice(0, MAX_PART);
  if (!part) throw new Error("Part needs a name.");

  const config: CaseConfig = {
    part,
    ordered: readQty(formData, "ordered", "Ordered quantity"),
    invoiced: readQty(formData, "invoiced", "Invoiced quantity"),
    notes: SUPPLIED.notes.map((n) => {
      const counted = readQty(formData, `counted:${n.id}`, `Counted in on ${n.id}`);
      const damaged = readQty(formData, `damaged:${n.id}`, `Damaged on ${n.id}`);
      // Mirrors the receipts check constraint, so a bad number is a readable
      // message here rather than a 23514 from Postgres.
      if (damaged > counted)
        throw new Error(`Damaged on ${n.id} cannot exceed what was counted in.`);
      return {
        id: n.id,
        listed: readQty(formData, `listed:${n.id}`, `Listed on ${n.id}`),
        counted,
        damaged,
      };
    }),
  };

  const store = await cookies();
  if (isSupplied(config)) {
    // Typed back to the supplied numbers: drop the cookie rather than keep one
    // that says nothing, so the "changed" marker clears itself.
    store.delete({ name: CONFIG_COOKIE, path: "/" });
  } else {
    store.set(CONFIG_COOKIE, JSON.stringify(config), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  }

  const db = createServerClient();
  await clearCase(db);
  await seedCase(db, config, mode);

  refresh();
  redirect(mode === "invoice_arrived" ? "/review" : "/");
}

/** Back to `initial.json`, records and marker both. */
export async function restoreSupplied() {
  const store = await cookies();
  store.delete({ name: CONFIG_COOKIE, path: "/" });

  const db = createServerClient();
  await clearCase(db);
  await seedCase(db, SUPPLIED, "start_of_shift");

  refresh();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Screen 1 - goods receipt capture
// ---------------------------------------------------------------------------

export async function captureReceipt(formData: FormData) {
  const noteId = String(formData.get("delivery_note") ?? "");
  const received = Number(formData.get("received") ?? 0);
  const damaged = Number(formData.get("damaged") ?? 0);

  if (!noteId) throw new Error("Pick a delivery note.");
  if (!Number.isInteger(received) || received < 0)
    throw new Error("Counted-in quantity must be a whole number, zero or more.");
  if (!Number.isInteger(damaged) || damaged < 0 || damaged > received)
    throw new Error("Damaged cannot be negative or exceed what was counted in.");

  const db = createServerClient();

  // One receipt per delivery note. A second physical delivery arrives with its
  // own note, so a second receipt against the same one is a double submit -
  // and silently doubling the counted-in quantity mid-demo is the worst
  // failure this screen has. Treat it as a no-op rather than an error.
  const { data: existing } = await db
    .from("receipts")
    .select("id")
    .eq("delivery_note", noteId)
    .maybeSingle();

  if (!existing) {
    // The three quantities are stored separately; accepted is derived so it can
    // never drift from the other two. The DB enforces the same rule as a check
    // constraint, so a bad write fails even if this code is wrong.
    const accepted = received - damaged;
    const { error } = await db
      .from("receipts")
      .insert({ id: noteId.replace(/^DN-/, "RC-"), delivery_note: noteId, received, damaged, accepted });
    if (error) throw new Error(error.message);
  }

  await syncProposals();
  refresh();

  // Last note at the bay? Move the user on to the evidence they just built.
  const { reconciliation } = await loadCase();
  if (reconciliation.awaitingReceipt.length === 0) redirect("/evidence");
}

// ---------------------------------------------------------------------------
// Proposals - raised by the system, never auto-applied
// ---------------------------------------------------------------------------

/**
 * Makes sure every open discrepancy has a proposal waiting for a person.
 * Idempotent: one proposal per discrepancy key, ever. Decided proposals stay
 * as history even once the gap they describe is closed.
 */
export async function syncProposals() {
  const db = createServerClient();
  const { reconciliation, proposals, order } = await loadCase();
  const seen = new Set(proposals.map((p) => p.kind));

  const fresh = reconciliation.discrepancies
    .filter((d) => !seen.has(d.key))
    .map((d) => ({
      kind: d.key,
      summary: d.statement,
      cause: d.likely ?? "unknown",
      confidence: d.confidence,
      evidence: d.evidence,
      proposed_state: {
        action: d.proposedAction,
        delta: d.delta,
        part: order.part,
        settled_by: d.settledBy,
        alternatives: d.candidates,
        // The facts, not just the English sentence. A proposal outlives the
        // request that raised it and may be reviewed in the other language.
        msg: d.msg,
      },
      status: "pending" as const,
      is_simulated: true,
    }));

  if (fresh.length === 0) return;
  const { error } = await db.from("proposals").insert(fresh);
  if (error) throw new Error(error.message);
}

/**
 * Raise any detected difference that has no proposal yet.
 *
 * Capture, reset and the simulated events all sync proposals themselves, so
 * this is for records that arrived from outside the app - seeded straight into
 * Postgres, or inserted by a facilitator. Without it screen 3 looks empty while
 * screen 1 is reporting a difference.
 */
export async function raiseProposals() {
  await syncProposals();
  refresh();
}

// ---------------------------------------------------------------------------
// Screen 3 - the reviewer decides. This is the only thing that sets state.
// ---------------------------------------------------------------------------

export async function decideProposal(formData: FormData) {
  const proposalId = String(formData.get("proposal_id") ?? "");
  const decision = String(formData.get("decision") ?? "") as
    | "approved"
    | "corrected"
    | "rejected";
  const reviewer = String(formData.get("reviewer") || "Receiving lead");
  const note = String(formData.get("note") ?? "").trim() || null;
  const correctedCause = formData.get("cause") as Cause | null;

  if (!proposalId) throw new Error("Missing proposal.");
  if (!["approved", "corrected", "rejected"].includes(decision))
    throw new Error("Unknown decision.");

  const db = createServerClient();
  const { data: proposal, error: readErr } = await db
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();
  if (readErr) throw new Error(readErr.message);

  // The reviewed outcome becomes the state: a correction overrides the cause the
  // system proposed, and that is what is recorded - not the original guess.
  const finalCause =
    decision === "corrected" && correctedCause ? correctedCause : proposal.cause;

  const { error: decErr } = await db.from("review_decisions").insert({
    proposal_id: proposalId,
    decision,
    reviewer,
    note,
    final_state: {
      cause: finalCause,
      action: decision === "rejected" ? "No action taken." : proposal.proposed_state?.action,
    },
  });
  if (decErr) throw new Error(decErr.message);

  const { error: updErr } = await db
    .from("proposals")
    .update({ status: decision, cause: finalCause })
    .eq("id", proposalId);
  if (updErr) throw new Error(updErr.message);

  refresh();
}

// ---------------------------------------------------------------------------
// Simulated incoming events. Labelled as simulations everywhere they appear.
// ---------------------------------------------------------------------------

export async function simulateEvent(formData: FormData) {
  const kind = String(formData.get("kind") ?? "");
  const db = createServerClient();

  if (kind === "invoice_arrives") {
    // The supplier's invoice turns up weeks after the goods. Same record the
    // reset seeds - the simulation controls only WHEN it appears, not what it
    // says, so it is built from the active config rather than from a literal.
    const records = buildRecords(await getCaseConfig());
    await db.from("invoices").upsert(records.invoice).throwOnError();
    await db.from("invoice_lines").upsert(records.invoiceLines).throwOnError();
  } else if (kind === "credit_note") {
    // Changed information: the supplier accepts the damaged unit and credits it.
    // A new record, labelled simulated. INV-1 is never edited.
    const { reconciliation, invoice, creditNotes } = await loadCase();
    const gap = invoice ? reconciliation.invoicedNet - reconciliation.accepted : 0;

    // Nothing to credit, or already credited (a double-click). Fall through to
    // the redirect rather than throwing: an error page mid-presentation is far
    // worse than a button that quietly does nothing.
    if (invoice && gap > 0 && creditNotes.length === 0) {
      await db
        .from("credit_notes")
        .insert({
          id: CREDIT_NOTE_ID,
          invoice_id: invoice.id,
          quantity: gap,
          reason: `Supplier credit for ${gap} damaged unit(s) reported at receipt.`,
          is_simulated: true,
        })
        .throwOnError();
    }
  } else {
    throw new Error("Unknown event.");
  }

  // The event updates the evidence AND the outstanding proposal in one step,
  // without a second prompt from the user.
  await syncProposals();
  refresh();
  redirect("/review");
}
