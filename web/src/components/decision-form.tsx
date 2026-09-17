"use client";

import { useState } from "react";

import { decideProposal } from "@/app/actions";
import type { Cause, Proposal } from "@/lib/types";
import { CAUSE_LABEL } from "@/lib/types";

import { SubmitButton } from "./submit-button";
import { btn } from "./ui";

/**
 * The reviewer's decision. This is the only thing in the app that settles a
 * difference - the system proposes, a person disposes, and the corrected answer
 * is what gets recorded, not the original guess.
 */
export function DecisionForm({
  proposal,
  alternatives,
}: {
  proposal: Proposal;
  alternatives: Cause[];
}) {
  const [correcting, setCorrecting] = useState(false);

  return (
    <form action={decideProposal} className="border-t border-line px-5 py-4">
      <input type="hidden" name="proposal_id" value={proposal.id} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-faint" htmlFor={`rev-${proposal.id}`}>
          Reviewer
        </label>
        <input
          id={`rev-${proposal.id}`}
          name="reviewer"
          defaultValue="Parts receiving lead"
          className="rounded-md border border-line bg-background px-2 py-1 text-xs"
        />
      </div>

      {correcting && (
        <div className="mb-4 rounded-lg border border-line bg-background p-3">
          <p className="mb-2 text-xs font-medium text-muted">
            The system proposed <strong>{CAUSE_LABEL[proposal.cause]}</strong>. Record
            the cause you judge correct:
          </p>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((c, i) => (
              <label
                key={c}
                className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:font-semibold has-[:checked]:text-accent"
              >
                <input
                  type="radio"
                  name="cause"
                  value={c}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {CAUSE_LABEL[c]}
              </label>
            ))}
          </div>
          <textarea
            name="note"
            rows={2}
            placeholder="Why — e.g. supplier confirmed both notes were one dispatch"
            className="mt-3 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-faint"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {correcting ? (
          <>
            <SubmitButton
              name="decision"
              value="corrected"
              className={btn.primary}
              pendingLabel="Recording correction…"
            >
              Save correction
            </SubmitButton>
            <button
              type="button"
              onClick={() => setCorrecting(false)}
              className={btn.secondary}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <SubmitButton
              name="decision"
              value="approved"
              className={btn.primary}
              pendingLabel="Recording decision…"
            >
              Approve proposal
            </SubmitButton>
            <button
              type="button"
              onClick={() => setCorrecting(true)}
              className={btn.secondary}
            >
              Correct it
            </button>
            <SubmitButton
              name="decision"
              value="rejected"
              className={btn.danger}
              pendingLabel="Recording…"
            >
              Reject
            </SubmitButton>
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-faint">
        Approving records the decision and the action to take. It does not send
        anything to the supplier.
      </p>
    </form>
  );
}
