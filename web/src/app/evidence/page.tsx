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
import { loadCase } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Screen 2 - the chain. Which record supports which claim. */
export default async function EvidencePage() {
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
          title="No evidence yet"
          body={`${notes.length} delivery note${notes.length === 1 ? " is" : "s are"} at the bay but nothing has been counted in. The chain starts with the goods receipt.`}
          action={
            <Link href="/" className={btn.primary}>
              Go to the bay →
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
          Evidence — {order.id} · {order.part}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Every figure below traces to a record. The chain is receipt → delivery
          note → order → invoice line, so a difference can be resolved to a cause
          rather than argued about.
        </p>
      </header>

      {/* Result first. */}
      <section className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
        <Figure label="Ordered" value={rec.ordered} hint={order.id} />
        <Figure label="Listed" value={rec.listed} hint={`${notes.length} notes`} />
        <Figure label="Counted in" value={rec.received} hint="physically arrived" />
        <Figure
          label="Accepted"
          value={rec.accepted}
          tone={rec.damaged > 0 ? "warn" : undefined}
          hint={rec.damaged > 0 ? `${rec.damaged} damaged` : "none damaged"}
        />
        <Figure
          label={rec.credited > 0 ? "Invoiced net" : "Invoiced"}
          value={invoice ? rec.invoicedNet : "—"}
          tone={gap !== 0 ? "warn" : invoice ? "ok" : undefined}
          hint={
            !invoice
              ? "no invoice yet"
              : rec.credited > 0
                ? `${rec.invoiced} billed − ${rec.credited} credited`
                : invoice.id
          }
        />
      </section>

      {invoice && gap === 0 && (
        <Card className="mb-8 border-ok/30 bg-ok-soft px-5 py-3 text-sm">
          <strong className="text-ok">Reconciled.</strong> What the supplier claims
          now matches what went into stock.
        </Card>
      )}

      <section className="mb-8">
        <SectionTitle>The chain</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Record</th>
                <th className="px-4 py-2.5 font-medium">Supports</th>
                <th className="px-4 py-2.5 text-right font-medium">Counted</th>
                <th className="px-4 py-2.5 text-right font-medium">Damaged</th>
                <th className="px-4 py-2.5 text-right font-medium">Accepted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="px-4 py-2.5 font-mono font-semibold">{order.id}</td>
                <td className="px-4 py-2.5 text-muted">
                  Purchase order · {order.part}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted" colSpan={3}>
                  {order.quantity} ordered
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
                        ? `Duplicate scan of ${n.duplicate_of} — excluded`
                        : `Delivery note · lists ${n.listed_quantity}`}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {r?.received ?? <span className="text-faint">not counted</span>}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${
                        r && r.damaged > 0 ? "font-semibold text-accent" : ""
                      }`}
                    >
                      {r?.damaged ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ok">
                      {r?.accepted ?? "—"}
                    </td>
                  </tr>
                );
              })}

              {invoice && (
                <tr>
                  <td className="px-4 py-2.5 font-mono font-semibold">{invoice.id}</td>
                  <td className="px-4 py-2.5 text-muted">
                    Supplier invoice · bills{" "}
                    {invoiceLines.map((l) => l.delivery_note).join(" + ")}
                  </td>
                  <td
                    className="px-4 py-2.5 text-right tabular-nums text-muted"
                    colSpan={3}
                  >
                    {invoice.quantity} invoiced
                  </td>
                </tr>
              )}

              {creditNotes.map((c) => (
                <tr key={c.id} className="bg-sim-soft/40">
                  <td className="px-4 py-2.5 font-mono font-semibold">{c.id}</td>
                  <td className="px-4 py-2.5 text-muted">
                    <span className="mr-2">Credit note · {c.reason}</span>
                    {c.is_simulated && <SimulatedTag />}
                  </td>
                  <td
                    className="px-4 py-2.5 text-right tabular-nums text-muted"
                    colSpan={3}
                  >
                    −{c.quantity} credited
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {rec.discrepancies.length > 0 && (
        <section className="mb-8">
          <SectionTitle>What does not line up</SectionTitle>
          <div className="space-y-3">
            {rec.discrepancies.map((d) => (
              <Card key={d.key} className="px-5 py-4">
                <p className="font-medium">{d.statement}</p>
                <div className="mt-2">
                  <Evidence ids={d.evidence} />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/review" className={btn.primary}>
              Take it to review →
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
