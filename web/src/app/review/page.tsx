import Link from "next/link";

import { raiseProposals } from "@/app/actions";
import { DecisionForm } from "@/components/decision-form";
import { DemoBar } from "@/components/demo-bar";
import { btn } from "@/components/button-styles";
import {
  Card,
  CausePill,
  ConfidenceNote,
  EmptyState,
  Evidence,
  SectionTitle,
  SimulatedTag,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { eventFacts } from "@/lib/event-facts";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { loadCase } from "@/lib/queries";
import { renderDiscrepancy } from "@/lib/reconcile";
import type { Cause, Proposal } from "@/lib/types";

export const dynamic = "force-dynamic";

/*
 * Pending is the client's indigo, not amber. Amber means "a number that needs a
 * decision" and coral means "simulated", and a pending proposal sits with the
 * simulated tag right beside it - two warm pills a reader has to tell apart at
 * 11px. Indigo says "this one is yours to act on" and cannot be confused with
 * either. Corrected keeps amber: a human overrode the proposal there.
 */
const STATUS_CLASS = {
  approved: "border-ok/30 text-ok bg-ok-soft",
  corrected: "border-accent/30 text-accent bg-accent-soft",
  rejected: "border-line text-muted bg-foreground/[0.04]",
  pending: "border-brand/30 text-brand bg-brand-soft",
} as const;

/** Screen 3 - the reviewer decides. Nothing else in the app settles a difference. */
export default async function ReviewPage() {
  const t = getDict(await getLocale());
  const data = await loadCase();
  const {
    invoice,
    proposals,
    decisions,
    receipts,
    creditNotesAvailable,
    reconciliation: rec,
  } = data;
  const facts = await eventFacts(data);

  const pending = proposals.filter((p) => p.status === "pending");
  const settled = proposals.filter((p) => p.status !== "pending");
  const gap = invoice ? rec.invoicedNet - rec.accepted : 0;
  const byProposal = new Map(decisions.map((d) => [d.proposal_id, d]));

  // A proposal is stored with the English sentence AND the facts behind it.
  // Re-render from the facts where they are present, so a proposal raised in one
  // language reads correctly in the other; fall back to the stored text.
  const say = (p: Proposal) => {
    const msg = p.proposed_state?.msg;
    return msg
      ? renderDiscrepancy(t, msg)
      : {
          statement: p.summary,
          proposedAction: p.proposed_state?.action ?? "",
          settledBy: p.proposed_state?.settled_by ?? "",
        };
  };

  // Differences the engine can see that have no proposal row yet - happens when
  // records were seeded straight into Postgres rather than through the app.
  const knownKeys = new Set(proposals.map((p) => p.kind));
  const unraised = rec.discrepancies.filter((d) => !knownKeys.has(d.key));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">{t.review.title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{t.review.intro}</p>
      </header>

      {unraised.length > 0 && (
        <section className="mb-10">
          <SectionTitle>{t.review.unraised(unraised.length)}</SectionTitle>
          <Card className="px-5 py-4">
            <ul className="mb-4 space-y-3">
              {unraised.map((d) => (
                <li key={d.key}>
                  <p className="text-sm font-medium">
                    {renderDiscrepancy(t, d.msg).statement}
                  </p>
                  <div className="mt-1.5">
                    <Evidence ids={d.evidence} />
                  </div>
                </li>
              ))}
            </ul>
            <form action={raiseProposals}>
              <SubmitButton className={btn.primary} pendingLabel={t.review.raising}>
                {t.review.raise}
              </SubmitButton>
            </form>
            <p className="mt-2 text-xs text-faint">{t.review.unraisedNote}</p>
          </Card>
        </section>
      )}

      {pending.length === 0 && settled.length === 0 && unraised.length === 0 ? (
        <EmptyState
          title={t.review.emptyTitle}
          body={
            receipts.length === 0
              ? t.review.emptyNoReceipts
              : !invoice
                ? t.review.emptyNoInvoice
                : t.review.emptyReconciled
          }
          action={
            <Link href={receipts.length === 0 ? "/" : "/evidence"} className={btn.primary}>
              {receipts.length === 0 ? t.review.toBay : t.review.toEvidence}
            </Link>
          }
        />
      ) : null}

      {pending.length > 0 && (
        <section className="mb-10">
          <SectionTitle>{t.review.pending(pending.length)}</SectionTitle>
          <div className="space-y-4">
            {pending.map((p) => {
              const alternatives = (p.proposed_state?.alternatives ??
                [p.cause]) as Cause[];
              const copy = say(p);
              return (
                <Card key={p.id} className="overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`lc rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS.pending}`}
                      >
                        {t.review.status.pending}
                      </span>
                      {p.is_simulated && (
                        <SimulatedTag>{t.review.proposedBy}</SimulatedTag>
                      )}
                    </div>

                    <p className="text-[15px] font-medium">{copy.statement}</p>

                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-faint">{t.review.causesLead}</p>
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

                    {copy.settledBy && (
                      <p className="mt-3 bg-background px-3 py-2 text-sm text-muted">
                        {copy.settledBy}
                      </p>
                    )}

                    <div className="mt-3 border border-line px-3 py-2.5">
                      <p className="text-[11px] font-semibold text-faint">
                        {t.review.nextAction}
                      </p>
                      <p className="mt-1 text-sm">{copy.proposedAction}</p>
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
          <SectionTitle>{t.review.history}</SectionTitle>
          <Card className="divide-y divide-line">
            {settled.map((p) => {
              const d = byProposal.get(p.id);
              const copy = say(p);
              // A rejected proposal records no action; anything else keeps the
              // one that was proposed, re-stated in the current language.
              const action =
                p.status === "rejected" ? t.review.noAction : copy.proposedAction;
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`lc rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        STATUS_CLASS[p.status]
                      }`}
                    >
                      {t.review.status[p.status]}
                    </span>
                    <span className="text-sm font-medium">
                      {t.review.recordedAs(t.cause[p.cause])}
                    </span>
                    {d && (
                      <span className="ms-auto text-xs text-faint">
                        {d.reviewer} ·{" "}
                        {new Date(d.decided_at).toLocaleTimeString(
                          // The tag lives in the dictionary next to the
                          // language it belongs to: en-GB, ar-MA, de-DE.
                          // Morocco writes times with Latin digits in both of
                          // its languages; only the am/pm marker changes.
                          t.bcp47,
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{copy.statement}</p>
                  {d?.note && (
                    <p className="mt-1.5 text-sm italic text-muted">“{d.note}”</p>
                  )}
                  {d?.final_state?.action && (
                    <p className="mt-2 text-sm">
                      <span className="text-faint">{t.review.actionRecorded}</span>
                      {action}
                      {p.status !== "rejected" && (
                        <span className="ms-2">
                          <SimulatedTag>{t.review.notSent}</SimulatedTag>
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
        facts={facts}
      />
    </main>
  );
}
