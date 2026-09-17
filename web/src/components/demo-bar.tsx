"use client";

import { resetDemo } from "@/app/actions";
import type { EventFacts } from "@/lib/types";

import { ConfirmEvent } from "./confirm-event";
import { useT } from "./locale-provider";
import { SubmitButton } from "./submit-button";
import { btn } from "./button-styles";
import { SimulatedTag } from "./ui";

/**
 * Demo controls. Everything here is explicitly a simulation - the exercise
 * allows an injected event only if it is labelled as one, so it is labelled
 * in the heading, on the tag and on every button.
 *
 * The two supplier events confirm first and offer their document; the two reset
 * buttons do not, because they put the case back to a known start rather than
 * adding a record to it.
 */
export function DemoBar({
  canInvoice,
  canCredit,
  creditNotesAvailable = true,
  facts,
}: {
  canInvoice: boolean;
  canCredit: boolean;
  creditNotesAvailable?: boolean;
  facts: EventFacts;
}) {
  const t = useT();
  return (
    <section className="mt-12 border border-dashed border-sim/40 bg-sim-soft/40 p-4">
      <div className="mb-1 flex items-center gap-2">
        <SimulatedTag>{t.demo.heading}</SimulatedTag>
      </div>
      <p className="mb-4 text-xs text-muted">{t.demo.intro}</p>

      {!creditNotesAvailable && (
        <p className="mb-3 border border-line bg-surface px-3 py-2 text-xs text-muted">
          {t.demo.creditUnavailableBefore}{" "}
          <code className="font-mono">supabase/migrations/001_credit_notes.sql</code>{" "}
          {t.demo.creditUnavailableAfter}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <ConfirmEvent
          kind="invoice_arrives"
          facts={facts}
          disabled={!canInvoice}
          label={t.demo.invoiceArrives}
          pendingLabel={t.demo.invoiceArriving}
        />

        <ConfirmEvent
          kind="credit_note"
          facts={facts}
          disabled={!canCredit || !creditNotesAvailable}
          label={t.demo.creditIssued}
          pendingLabel={t.demo.creditIssuing}
        />

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
