import { resetDemo, simulateEvent } from "@/app/actions";

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
  return (
    <section className="mt-12 rounded-xl border border-dashed border-sim/40 bg-sim-soft/40 p-4">
      <div className="mb-1 flex items-center gap-2">
        <SimulatedTag>Simulated events</SimulatedTag>
      </div>
      <p className="mb-4 text-xs text-muted">
        Nothing below contacts a supplier or an accounting system. These buttons
        inject a record the facilitator would otherwise hand over mid-exercise.
      </p>

      {!creditNotesAvailable && (
        <p className="mb-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
          Credit notes are unavailable: run{" "}
          <code className="font-mono">supabase/migrations/001_credit_notes.sql</code>{" "}
          in the Supabase SQL editor to enable that event.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={simulateEvent}>
          <input type="hidden" name="kind" value="invoice_arrives" />
          <SubmitButton
            className={btn.sim}
            disabled={!canInvoice}
            pendingLabel="Delivering invoice…"
          >
            ◆ Supplier invoice arrives
          </SubmitButton>
        </form>

        <form action={simulateEvent}>
          <input type="hidden" name="kind" value="credit_note" />
          <SubmitButton
            className={btn.sim}
            disabled={!canCredit || !creditNotesAvailable}
            pendingLabel="Issuing credit…"
          >
            ◆ Supplier issues a credit note
          </SubmitButton>
        </form>

        <div className="ml-auto flex flex-wrap gap-2">
          <form action={resetDemo}>
            <input type="hidden" name="mode" value="start_of_shift" />
            <SubmitButton className={btn.danger} pendingLabel="Resetting…">
              Reset — start of shift
            </SubmitButton>
          </form>
          <form action={resetDemo}>
            <input type="hidden" name="mode" value="invoice_arrived" />
            <SubmitButton className={btn.danger} pendingLabel="Resetting…">
              Reset — invoice arrived
            </SubmitButton>
          </form>
        </div>
      </div>
    </section>
  );
}
