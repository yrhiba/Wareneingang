import Link from "next/link";

import { raiseProposals } from "@/app/actions";
import { DecisionForm } from "@/components/decision-form";
import { DemoBar } from "@/components/demo-bar";
import {
  btn,
  Card,
  CausePill,
  ConfidenceNote,
  EmptyState,
  Evidence,
  SectionTitle,
  SimulatedTag,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { loadCase } from "@/lib/queries";
import { CAUSE_LABEL, type Cause } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COPY = {
  approved: { label: "Approved", cls: "text-ok bg-ok-soft" },
  corrected: { label: "Corrected by reviewer", cls: "text-accent bg-accent-soft" },
  rejected: { label: "Rejected", cls: "text-muted bg-foreground/[0.06]" },
  pending: { label: "Waiting for a decision", cls: "text-accent bg-accent-soft" },
} as const;

/** Screen 3 - the reviewer decides. Nothing else in the app settles a difference. */
export default async function ReviewPage() {
  const {
    invoice,
    proposals,
    decisions,
    receipts,
    creditNotesAvailable,
    reconciliation: rec,
  } = await loadCase();

  const pending = proposals.filter((p) => p.status === "pending");
  const settled = proposals.filter((p) => p.status !== "pending");
  const gap = invoice ? rec.invoicedNet - rec.accepted : 0;
  const byProposal = new Map(decisions.map((d) => [d.proposal_id, d]));

  // Differences the engine can see that have no proposal row yet - happens when
  // records were seeded straight into Postgres rather than through the app.
  const knownKeys = new Set(proposals.map((p) => p.kind));
  const unraised = rec.discrepancies.filter((d) => !knownKeys.has(d.key));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Discrepancy review</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          The system raises a proposal with the evidence behind it and the cause it
          thinks most likely. It does not decide. You approve, correct or reject,
          and your answer becomes the record.
        </p>
      </header>

      {unraised.length > 0 && (
        <section className="mb-10">
          <SectionTitle>
            {unraised.length} difference{unraised.length > 1 ? "s" : ""} detected,
            not yet raised
          </SectionTitle>
          <Card className="px-5 py-4">
            <ul className="mb-4 space-y-3">
              {unraised.map((d) => (
                <li key={d.key}>
                  <p className="text-sm font-medium">{d.statement}</p>
                  <div className="mt-1.5">
                    <Evidence ids={d.evidence} />
                  </div>
                </li>
              ))}
            </ul>
            <form action={raiseProposals}>
              <SubmitButton className={btn.primary} pendingLabel="Raising…">
                Raise for review
              </SubmitButton>
            </form>
            <p className="mt-2 text-xs text-faint">
              These records were loaded outside the receiving flow, so no proposal
              was raised automatically.
            </p>
          </Card>
        </section>
      )}

      {pending.length === 0 && settled.length === 0 && unraised.length === 0 ? (
        <EmptyState
          title="Nothing to review"
          body={
            receipts.length === 0
              ? "Nothing has been counted in yet, so there is nothing to reconcile."
              : !invoice
                ? "Goods are counted in and reconcile against the notes. The supplier's invoice has not arrived yet."
                : "Every figure reconciles. What the supplier claims matches what went into stock."
          }
          action={
            <Link href={receipts.length === 0 ? "/" : "/evidence"} className={btn.primary}>
              {receipts.length === 0 ? "Go to the bay →" : "See the evidence →"}
            </Link>
          }
        />
      ) : null}

      {pending.length > 0 && (
        <section className="mb-10">
          <SectionTitle>
            {pending.length} proposal{pending.length > 1 ? "s" : ""} waiting
          </SectionTitle>
          <div className="space-y-4">
            {pending.map((p) => {
              const alternatives = (p.proposed_state?.alternatives ??
                [p.cause]) as Cause[];
              return (
                <Card key={p.id} className="overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COPY.pending.cls}`}
                      >
                        {STATUS_COPY.pending.label}
                      </span>
                      {p.is_simulated && <SimulatedTag>Proposed by the system</SimulatedTag>}
                    </div>

                    <p className="text-[15px] font-medium">{p.summary}</p>

                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-faint">
                        Most likely cause, and what else stays open:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <CausePill cause={p.cause} leading />
                        {alternatives
                          .filter((c) => c !== p.cause)
                          .map((c) => (
                            <CausePill key={c} cause={c} />
                          ))}
                      </div>
                      <div className="mt-2">
                        <ConfidenceNote confidence={p.confidence} />
                      </div>
                    </div>

                    {p.proposed_state?.settled_by && (
                      <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-muted">
                        {String(p.proposed_state.settled_by)}
                      </p>
                    )}

                    <div className="mt-3 rounded-lg border border-line px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                        Proposed next action
                      </p>
                      <p className="mt-1 text-sm">{p.proposed_state?.action}</p>
                    </div>

                    <div className="mt-3">
                      <Evidence ids={p.evidence} />
                    </div>
                  </div>

                  <DecisionForm proposal={p} alternatives={alternatives} />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {settled.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Decision history</SectionTitle>
          <Card className="divide-y divide-line">
            {settled.map((p) => {
              const d = byProposal.get(p.id);
              const s = STATUS_COPY[p.status];
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.cls}`}
                    >
                      {s.label}
                    </span>
                    <span className="text-sm font-medium">
                      Recorded as {CAUSE_LABEL[p.cause]}
                    </span>
                    {d && (
                      <span className="ml-auto text-xs text-faint">
                        {d.reviewer} ·{" "}
                        {new Date(d.decided_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{p.summary}</p>
                  {d?.note && (
                    <p className="mt-1.5 text-sm italic text-muted">“{d.note}”</p>
                  )}
                  {d?.final_state?.action && (
                    <p className="mt-2 text-sm">
                      <span className="text-faint">Action recorded: </span>
                      {d.final_state.action}
                      {p.status !== "rejected" && (
                        <span className="ml-2">
                          <SimulatedTag>Not sent</SimulatedTag>
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </Card>
        </section>
      )}

      <DemoBar
        canInvoice={!invoice && receipts.length > 0}
        canCredit={gap > 0}
        creditNotesAvailable={creditNotesAvailable}
      />
    </main>
  );
}
