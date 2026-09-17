import Link from "next/link";

import { DemoBar } from "@/components/demo-bar";
import {
  btn,
  Card,
  EmptyState,
  Evidence,
  Figure,
  SectionTitle,
  SimulatedTag,
} from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { loadCase } from "@/lib/queries";
import { renderDiscrepancy } from "@/lib/reconcile";

export const dynamic = "force-dynamic";

/** Screen 2 - the chain. Which record supports which claim. */
export default async function EvidencePage() {
  const t = await getT();
  const {
    order,
    notes,
    receipts,
    invoice,
    invoiceLines,
    creditNotes,
    creditNotesAvailable,
    reconciliation: rec,
  } = await loadCase();

  const gap = invoice ? rec.invoicedNet - rec.accepted : 0;

  if (receipts.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <EmptyState
          title={t.evidence.emptyTitle}
          body={t.evidence.emptyBody(notes.length)}
          action={
            <Link href="/" className={btn.primary}>
              {t.evidence.toBay}
            </Link>
          }
        />
        <DemoBar
          canInvoice={false}
          canCredit={false}
          creditNotesAvailable={creditNotesAvailable}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {t.evidence.title(order.id, order.part)}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{t.evidence.intro}</p>
      </header>

      {/* Result first. */}
      <section className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
        <Figure label={t.evidence.ordered} value={rec.ordered} hint={order.id} />
        <Figure
          label={t.evidence.listed}
          value={rec.listed}
          hint={t.evidence.notesHint(notes.length)}
        />
        <Figure
          label={t.evidence.countedIn}
          value={rec.received}
          hint={t.evidence.arrivedHint}
        />
        <Figure
          label={t.evidence.accepted}
          value={rec.accepted}
          tone={rec.damaged > 0 ? "warn" : undefined}
          hint={
            rec.damaged > 0
              ? t.evidence.damagedHint(rec.damaged)
              : t.evidence.noneDamaged
          }
        />
        <Figure
          label={rec.credited > 0 ? t.evidence.invoicedNet : t.evidence.invoiced}
          value={invoice ? rec.invoicedNet : "—"}
          tone={gap !== 0 ? "warn" : invoice ? "ok" : undefined}
          hint={
            !invoice
              ? t.evidence.noInvoiceYet
              : rec.credited > 0
                ? t.evidence.netHint(rec.invoiced, rec.credited)
                : invoice.id
          }
        />
      </section>

      {invoice && gap === 0 && (
        <Card className="mb-8 border-ok/30 bg-ok-soft px-5 py-3 text-sm">
          <strong className="text-ok">{t.evidence.reconciledLead}</strong>{" "}
          {t.evidence.reconciledBody}
        </Card>
      )}

      <section className="mb-8">
        <SectionTitle>{t.evidence.chain}</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">
                  {t.evidence.thRecord}
                </th>
                <th className="px-4 py-2.5 text-start font-medium">
                  {t.evidence.thSupports}
                </th>
                <th className="px-4 py-2.5 text-end font-medium">
                  {t.evidence.thCounted}
                </th>
                <th className="px-4 py-2.5 text-end font-medium">
                  {t.evidence.thDamaged}
                </th>
                <th className="px-4 py-2.5 text-end font-medium">
                  {t.evidence.thAccepted}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="px-4 py-2.5 font-mono font-semibold">{order.id}</td>
                <td className="px-4 py-2.5 text-muted">
                  {t.evidence.purchaseOrder(order.part)}
                </td>
                <td className="px-4 py-2.5 text-end tabular-nums text-muted" colSpan={3}>
                  {t.evidence.orderedQty(order.quantity)}
                </td>
              </tr>

              {notes.map((n) => {
                const r = receipts.find((x) => x.delivery_note === n.id);
                return (
                  <tr key={n.id} className={n.duplicate_of ? "opacity-50" : undefined}>
                    <td className="px-4 py-2.5 font-mono font-semibold">
                      {n.id}
                      {r && <span className="text-faint"> → {r.id}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {n.duplicate_of
                        ? t.evidence.duplicateOf(n.duplicate_of)
                        : t.evidence.noteLists(n.listed_quantity)}
                    </td>
                    <td className="px-4 py-2.5 text-end tabular-nums">
                      {r?.received ?? (
                        <span className="text-faint">{t.evidence.notCounted}</span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-end tabular-nums ${
                        r && r.damaged > 0 ? "font-semibold text-accent" : ""
                      }`}
                    >
                      {r?.damaged ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-end font-semibold tabular-nums text-ok">
                      {r?.accepted ?? "—"}
                    </td>
                  </tr>
                );
              })}

              {invoice && (
                <tr>
                  <td className="px-4 py-2.5 font-mono font-semibold">{invoice.id}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {t.evidence.invoiceBills(
                      invoiceLines.map((l) => l.delivery_note).join(" + "),
                    )}
                  </td>
                  <td
                    className="px-4 py-2.5 text-end tabular-nums text-muted"
                    colSpan={3}
                  >
                    {t.evidence.invoicedQty(invoice.quantity)}
                  </td>
                </tr>
              )}

              {creditNotes.map((c) => (
                <tr key={c.id} className="bg-sim-soft/40">
                  <td className="px-4 py-2.5 font-mono font-semibold">{c.id}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {/*
                      A simulated credit note's reason is text this app wrote, so
                      it can be re-stated in the reader's language. A real
                      supplier's wording would be quoted as it arrived.
                    */}
                    <span className="me-2">
                      {t.evidence.creditNote(
                        c.is_simulated ? t.demo.creditReason(c.quantity) : c.reason,
                      )}
                    </span>
                    {c.is_simulated && <SimulatedTag />}
                  </td>
                  <td
                    className="px-4 py-2.5 text-end tabular-nums text-muted"
                    colSpan={3}
                  >
                    {t.evidence.creditedQty(c.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {rec.discrepancies.length > 0 && (
        <section className="mb-8">
          <SectionTitle>{t.evidence.mismatch}</SectionTitle>
          <div className="space-y-3">
            {rec.discrepancies.map((d) => (
              <Card key={d.key} className="px-5 py-4">
                <p className="font-medium">
                  {renderDiscrepancy(t, d.msg).statement}
                </p>
                <div className="mt-2">
                  <Evidence ids={d.evidence} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/review" className={btn.primary}>
              {t.evidence.toReview}
            </Link>
          </div>
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
