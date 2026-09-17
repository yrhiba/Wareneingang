"use client";

import { resetDemo, simulateEvent } from "@/app/actions";

import { useT } from "./locale-provider";
import { SubmitButton } from "./submit-button";
import { btn, SimulatedTag } from "./ui";

/**
 * Demo controls. Everything here is explicitly a simulation - the exercise
 * allows an injected event only if it is labelled as one, so it is labelled
 * in the heading, on the tag and on every button.
 */
export function DemoBar({
  canInvoice,
  canCredit,
  creditNotesAvailable = true,
}: {
  canInvoice: boolean;
  canCredit: boolean;
  creditNotesAvailable?: boolean;
}) {
  const t = useT();
  return (
    <section className="mt-12 rounded-xl border border-dashed border-sim/40 bg-sim-soft/40 p-4">
      <div className="mb-1 flex items-center gap-2">
        <SimulatedTag>{t.demo.heading}</SimulatedTag>
      </div>
      <p className="mb-4 text-xs text-muted">{t.demo.intro}</p>

      {!creditNotesAvailable && (
        <p className="mb-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
          {t.demo.creditUnavailableBefore}{" "}
          <code className="font-mono">supabase/migrations/001_credit_notes.sql</code>{" "}
          {t.demo.creditUnavailableAfter}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={simulateEvent}>
          <input type="hidden" name="kind" value="invoice_arrives" />
          <SubmitButton
            className={btn.sim}
            disabled={!canInvoice}
            pendingLabel={t.demo.invoiceArriving}
          >
            {t.demo.invoiceArrives}
          </SubmitButton>
        </form>

        <form action={simulateEvent}>
          <input type="hidden" name="kind" value="credit_note" />
          <SubmitButton
            className={btn.sim}
            disabled={!canCredit || !creditNotesAvailable}
            pendingLabel={t.demo.creditIssuing}
          >
            {t.demo.creditIssued}
          </SubmitButton>
        </form>

        <div className="ms-auto flex flex-wrap gap-2">
          <form action={resetDemo}>
            <input type="hidden" name="mode" value="start_of_shift" />
            <SubmitButton className={btn.danger} pendingLabel={t.demo.resetting}>
              {t.demo.resetShift}
            </SubmitButton>
          </form>
          <form action={resetDemo}>
            <input type="hidden" name="mode" value="invoice_arrived" />
            <SubmitButton className={btn.danger} pendingLabel={t.demo.resetting}>
              {t.demo.resetInvoice}
            </SubmitButton>
          </form>
        </div>
      </div>
    </section>
  );
}
