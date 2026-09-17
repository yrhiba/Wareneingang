"use client";

import { useId, useRef } from "react";

import { simulateEvent } from "@/app/actions";
import type { EventFacts } from "@/lib/types";

import { btn } from "./button-styles";
import { useT } from "./locale-provider";
import { SubmitButton } from "./submit-button";
import { SimulatedTag } from "./ui";

type Kind = "invoice_arrives" | "credit_note";

/**
 * The step between clicking a simulated event and the database changing.
 *
 * Both of these buttons used to write on one press, mid-demo, without saying
 * what they were about to write. That is the one thing this whole prototype
 * argues against - no stock or accounting write without review - so the demo
 * controls should not be the exception. The box states the record, says plainly
 * that nothing leaves the prototype, and offers the document the event delivers.
 *
 * Progressive enhancement, deliberately: the trigger is a real submit button in
 * a real form, and JavaScript is what turns that click into a dialog instead of
 * a post. With scripting off - which is how the end-to-end suites drive this
 * app - the button still fires the event exactly as it did before.
 */
export function ConfirmEvent({
  kind,
  facts,
  disabled,
  label,
  pendingLabel,
}: {
  kind: Kind;
  facts: EventFacts;
  disabled?: boolean;
  label: string;
  pendingLabel: string;
}) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const copy = t.demo.confirm;

  const isInvoice = kind === "invoice_arrives";
  const notes = facts.noteIds.join(" + ");
  const documentId = isInvoice ? facts.invoiceId : facts.creditId;

  return (
    <>
      <form action={simulateEvent}>
        <input type="hidden" name="kind" value={kind} />
        <button
          type="submit"
          className={btn.sim}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            dialog.current?.showModal();
          }}
        >
          {label}
        </button>
      </form>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Clicking the backdrop is the same as cancelling. The target is the
        // dialog itself only when the click landed outside its content.
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        // m-auto is load-bearing: a modal dialog is centred by `margin: auto`
        // in the UA stylesheet, and Tailwind's preflight resets every margin to
        // zero, which pins it to the top-left corner.
        // The backdrop is trast's navy in both themes rather than a token: a
        // scrim always darkens, and --foreground inverts in dark mode, which
        // washed the page out instead of dimming it.
        className="m-auto max-h-[85dvh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto border border-line bg-surface p-0 text-foreground backdrop:bg-[#0e0e2e]/70"
      >
        <div className="p-6">
          <SimulatedTag />
          <h2 id={titleId} className="mt-3 text-lg font-semibold tracking-tight">
            {isInvoice ? copy.invoiceTitle : copy.creditTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{copy.lead}</p>

          <div className="mt-5 border border-line bg-background px-4 py-3">
            <p className="lc text-[11px] font-semibold text-faint">{copy.writes}</p>
            <p className="mt-1.5 text-sm">
              {isInvoice
                ? copy.invoiceWrites(
                    facts.invoiceId,
                    facts.invoiceQty,
                    facts.part,
                    notes,
                  )
                : copy.creditWrites(facts.creditId, facts.creditQty, facts.invoiceId)}
            </p>
            <p className="mt-2 text-xs text-muted">{copy.thenRaised}</p>
          </div>

          <div className="mt-4 border border-line px-4 py-3">
            <p className="lc text-[11px] font-semibold text-faint">
              {copy.documentHeading}
            </p>
            <p className="mt-1.5 text-xs text-muted">{copy.documentNote}</p>
            {/* `download` is what turns the inline response into a saved file,
                and it is also what names it INV-1.pdf rather than "invoice". */}
            <a
              href={isInvoice ? "/documents/invoice" : "/documents/credit-note"}
              download={`${documentId}.pdf`}
              className={`${btn.secondary} mt-3`}
            >
              {copy.download}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-background px-6 py-4">
          <button
            type="button"
            className={btn.danger}
            onClick={() => dialog.current?.close()}
          >
            {copy.cancel}
          </button>
          <form action={simulateEvent}>
            <input type="hidden" name="kind" value={kind} />
            <SubmitButton className={btn.sim} pendingLabel={pendingLabel}>
              {copy.go}
            </SubmitButton>
          </form>
        </div>
      </dialog>
    </>
  );
}
