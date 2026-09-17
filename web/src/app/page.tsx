import Link from "next/link";

import { DemoBar } from "@/components/demo-bar";
import { ReceiptForm } from "@/components/receipt-form";
import { btn, Card, EmptyState, SectionTitle, SimulatedTag } from "@/components/ui";
import { loadCase } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Screen 1 - the loading bay. Fast capture of what physically arrived. */
export default async function ReceivePage() {
  const { order, receipts, invoice, notes, creditNotesAvailable, reconciliation: rec } =
    await loadCase();
  const waiting = rec.awaitingReceipt;
  const gap = invoice ? rec.invoicedNet - rec.accepted : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          Goods receipt — bay 1
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Record what physically arrived against each delivery note. Count, damage
          and what actually goes into stock are three separate numbers — keeping
          them apart here is what lets someone resolve the invoice later.
        </p>
      </header>

      {waiting.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>
            {waiting.length} delivery note{waiting.length > 1 ? "s" : ""} waiting
          </SectionTitle>
          {waiting.map((note) => (
            <ReceiptForm key={note.id} note={note} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="Nothing waiting at the bay"
          body={
            notes.length === 0
              ? "No delivery notes for this order yet."
              : `All ${notes.length} notes against ${order.id} have been counted in. The evidence is linked and ready for whoever picks up the invoice.`
          }
          action={
            <Link href="/evidence" className={btn.primary}>
              See the linked evidence →
            </Link>
          }
        />
      )}

      {receipts.length > 0 && (
        <section className="mt-10">
          <SectionTitle>Recorded this shift</SectionTitle>
          <Card className="divide-y divide-line">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 text-sm"
              >
                <span className="font-mono font-semibold">{r.id}</span>
                <span className="text-muted">
                  against <span className="font-mono">{r.delivery_note}</span>
                </span>
                <span className="ml-auto flex gap-5 tabular-nums">
                  <span className="text-muted">
                    counted <strong className="text-foreground">{r.received}</strong>
                  </span>
                  <span className="text-muted">
                    damaged{" "}
                    <strong className={r.damaged > 0 ? "text-accent" : "text-foreground"}>
                      {r.damaged}
                    </strong>
                  </span>
                  <span className="text-muted">
                    accepted <strong className="text-ok">{r.accepted}</strong>
                  </span>
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {invoice && gap !== 0 && (
        <section className="mt-8">
          <Card className="flex flex-wrap items-center gap-4 border-accent/30 bg-accent-soft px-5 py-4">
            <p className="text-sm">
              <strong>{invoice.id}</strong> has arrived and does not match what was
              accepted. A difference of{" "}
              <strong className="text-accent">{Math.abs(gap)}</strong> is waiting for
              a decision.
            </p>
            <Link href="/review" className={`${btn.primary} ml-auto`}>
              Review the difference →
            </Link>
          </Card>
        </section>
      )}

      <DemoBar
        canInvoice={!invoice && receipts.length > 0}
        canCredit={gap > 0}
        creditNotesAvailable={creditNotesAvailable}
      />

      <p className="mt-6 flex items-center gap-2 text-xs text-faint">
        <SimulatedTag>How to read this</SimulatedTag>
        Purple marks anything injected or simulated. Nothing in this prototype
        contacts a supplier or posts to stock.
      </p>
    </main>
  );
}
