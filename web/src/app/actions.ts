"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";
import { loadCase } from "@/lib/queries";
import { INITIAL, type ResetMode } from "@/lib/seed-data";
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
// Start state
// ---------------------------------------------------------------------------

export async function resetDemo(formData: FormData) {
  const mode = (formData.get("mode") as ResetMode) ?? "start_of_shift";
  const db = createServerClient();

  // Order matters: children before parents.
  for (const t of [
    "review_decisions",
    "proposals",
    "credit_notes",
    "invoice_lines",
    "invoices",
    "receipts",
    "delivery_notes",
    "orders",
  ]) {
    const { error } = await db.from(t).delete().neq("id", "__none__");
    // review_decisions/proposals key on uuid; the neq guard above still matches all rows.
    if (error) throw new Error(`${t}: ${error.message}`);
  }

  await db.from("orders").insert(INITIAL.order).throwOnError();
  await db.from("delivery_notes").insert([...INITIAL.notes]).throwOnError();

  if (mode === "invoice_arrived") {
    // The full supplied state, exactly as initial.json.
    await db.from("receipts").insert([...INITIAL.receipts]).throwOnError();
    await db.from("invoices").insert(INITIAL.invoice).throwOnError();
    await db.from("invoice_lines").insert([...INITIAL.invoiceLines]).throwOnError();
    await syncProposals();
  }
  // start_of_shift: notes are at the bay, nothing counted in, no invoice yet.

  refresh();
  redirect(mode === "invoice_arrived" ? "/review" : "/");
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

  // The three quantities are stored separately; accepted is derived so it can
  // never drift from the other two. The DB enforces the same rule as a check
  // constraint, so a bad write fails even if this code is wrong.
  const accepted = received - damaged;
  const id = await nextReceiptId(noteId);

  const { error } = await db
    .from("receipts")
    .insert({ id, delivery_note: noteId, received, damaged, accepted });
  if (error) throw new Error(error.message);

  await syncProposals();
  refresh();

  // Last note at the bay? Move the user on to the evidence they just built.
  const { reconciliation } = await loadCase();
  if (reconciliation.awaitingReceipt.length === 0) redirect("/evidence");
}

/** RC-1 for DN-1, and so on, so a re-run reproduces the supplied record ids. */
async function nextReceiptId(noteId: string) {
  const db = createServerClient();
  const base = noteId.replace(/^DN-/, "RC-");
  const { data } = await db.from("receipts").select("id");
  const taken = new Set((data ?? []).map((r: { id: string }) => r.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}.${n}`)) n++;
  return `${base}.${n}`;
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
    // The supplier's invoice turns up weeks after the goods. Same record as
    // initial.json - the simulation controls only WHEN it appears, not what it says.
    await db.from("invoices").upsert(INITIAL.invoice).throwOnError();
    await db.from("invoice_lines").upsert([...INITIAL.invoiceLines]).throwOnError();
  } else if (kind === "credit_note") {
    // Changed information: the supplier accepts the damaged unit and credits it.
    // A new record, labelled simulated. INV-1 is never edited.
    const { reconciliation, invoice } = await loadCase();
    if (!invoice) throw new Error("No invoice to credit yet.");
    const gap = reconciliation.invoicedNet - reconciliation.accepted;
    if (gap <= 0) throw new Error("Nothing outstanding to credit.");
    await db
      .from("credit_notes")
      .insert({
        id: `CN-${Date.now().toString().slice(-4)}`,
        invoice_id: invoice.id,
        quantity: gap,
        reason: `Supplier credit for ${gap} damaged unit(s) reported at receipt.`,
        is_simulated: true,
      })
      .throwOnError();
  } else {
    throw new Error("Unknown event.");
  }

  // The event updates the evidence AND the outstanding proposal in one step,
  // without a second prompt from the user.
  await syncProposals();
  refresh();
  redirect("/review");
}
