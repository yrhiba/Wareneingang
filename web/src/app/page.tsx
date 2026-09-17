import Link from "next/link";

import { DemoBar } from "@/components/demo-bar";
import { ReceiptForm } from "@/components/receipt-form";
import { btn } from "@/components/button-styles";
import { Card, EmptyState, SectionTitle, SimulatedTag } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { loadCase } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Screen 1 - the loading bay. Fast capture of what physically arrived. */
export default async function ReceivePage() {
  const t = await getT();
  const { order, receipts, invoice, notes, creditNotesAvailable, reconciliation: rec } =
    await loadCase();
  const waiting = rec.awaitingReceipt;
  const gap = invoice ? rec.invoicedNet - rec.accepted : 0;
  const alert = invoice ? t.receive.invoiceGap(invoice.id, Math.abs(gap)) : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">{t.receive.title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{t.receive.intro}</p>
      </header>

      {waiting.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>{t.receive.waiting(waiting.length)}</SectionTitle>
          {waiting.map((note) => (
            <ReceiptForm key={note.id} note={note} />
          ))}
        </section>
      ) : (
        <EmptyState
          title={t.receive.emptyTitle}
          body={
            notes.length === 0
              ? t.receive.emptyNoNotes
              : t.receive.emptyAllCounted(notes.length, order.id)
          }
          action={
            <Link href="/evidence" className={btn.primary}>
              {t.receive.toEvidence}
            </Link>
          }
        />
      )}

      {receipts.length > 0 && (
        <section className="mt-10">
          <SectionTitle>{t.receive.recorded}</SectionTitle>
          <Card className="divide-y divide-line">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 text-sm"
              >
                <span className="font-mono font-semibold">{r.id}</span>
                <span className="text-muted">
                  {t.receive.against}{" "}
                  <span className="font-mono">{r.delivery_note}</span>
                </span>
                <span className="ms-auto flex flex-wrap gap-x-5 gap-y-1 tabular-nums">
                  <span className="text-muted">
                    {t.receive.counted}{" "}
                    <strong className="text-foreground">{r.received}</strong>
                  </span>
                  <span className="text-muted">
                    {t.receive.damaged}{" "}
                    <strong className={r.damaged > 0 ? "text-accent" : "text-foreground"}>
                      {r.damaged}
                    </strong>
                  </span>
                  <span className="text-muted">
                    {t.receive.accepted}{" "}
                    <strong className="text-ok">{r.accepted}</strong>
                  </span>
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {alert && gap !== 0 && (
        <section className="mt-8">
          <Card className="flex flex-wrap items-center gap-4 border-accent/30 bg-accent-soft px-5 py-4">
            <p className="text-sm">
              {alert.lead} <strong className="text-accent">{alert.value}</strong>{" "}
              {alert.tail}
            </p>
            <Link href="/review" className={`${btn.primary} ms-auto`}>
              {t.receive.toReview}
            </Link>
          </Card>
        </section>
      )}

      <DemoBar
        canInvoice={!invoice && receipts.length > 0}
        canCredit={gap > 0}
        creditNotesAvailable={creditNotesAvailable}
      />

      <p className="mt-6 flex items-start gap-2 text-xs text-faint">
        <SimulatedTag>{t.receive.legendTag}</SimulatedTag>
        {t.receive.legend}
      </p>
    </main>
  );
}
