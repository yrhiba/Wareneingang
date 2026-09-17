"use client";

import { useState } from "react";

import { restoreSupplied, saveCaseConfig } from "@/app/actions";
import { MAX_PART, MAX_QTY, type CaseConfig, type NoteConfig } from "@/lib/case-config";

import { useT } from "./locale-provider";
import { SubmitButton } from "./submit-button";
import { btn, Card, Figure, SectionTitle } from "./ui";

/**
 * The case parameters, as a form.
 *
 * Every field is posted under the name the server action reads, so this works
 * without JavaScript like the rest of the app; the state here only drives the
 * live preview and the "was N" markers.
 */
export function SettingsForm({
  config,
  supplied,
}: {
  config: CaseConfig;
  supplied: CaseConfig;
}) {
  const t = useT();
  const [part, setPart] = useState(config.part);
  const [ordered, setOrdered] = useState(config.ordered);
  const [invoiced, setInvoiced] = useState(config.invoiced);
  const [notes, setNotes] = useState<NoteConfig[]>(config.notes);

  const patch = (id: string, change: Partial<NoteConfig>) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...change } : n)));

  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
  const listed = sum(notes.map((n) => n.listed));
  const counted = sum(notes.map((n) => n.counted));
  const damaged = sum(notes.map((n) => n.damaged));
  const accepted = counted - damaged;
  const gap = invoiced - accepted;

  // Same rule as the receipts check constraint. Caught here so the button says
  // no, and caught again in the action so a posted form cannot get past it.
  const broken = notes.find((n) => n.damaged > n.counted);

  return (
    <>
      <form action={saveCaseConfig}>
        <section className="mb-6">
          <SectionTitle>{t.settings.orderHeading}</SectionTitle>
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="block rounded-lg border border-line bg-background px-3 py-2.5 focus-within:border-faint">
              <span className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                {t.settings.part}
                <Was show={part !== supplied.part} value={supplied.part} />
              </span>
              <input
                type="text"
                name="part"
                required
                maxLength={MAX_PART}
                value={part}
                onChange={(e) => setPart(e.target.value)}
                className="mt-1 block w-full bg-transparent font-mono text-2xl font-semibold outline-none"
              />
              <span className="mt-1 block text-[11px] leading-tight text-faint">
                {t.settings.partHint}
              </span>
            </label>

            <Qty
              label={t.settings.ordered}
              hint={t.settings.orderedHint}
              name="ordered"
              value={ordered}
              onChange={setOrdered}
              supplied={supplied.ordered}
            />
          </Card>
        </section>

        <section className="mb-6">
          <SectionTitle>{t.settings.invoiceHeading}</SectionTitle>
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Qty
              label={t.settings.invoiced}
              hint={t.settings.invoicedHint}
              name="invoiced"
              value={invoiced}
              onChange={setInvoiced}
              supplied={supplied.invoiced}
            />
          </Card>
        </section>

        <section className="mb-6">
          <SectionTitle>{t.settings.notesHeading}</SectionTitle>
          <p className="mb-3 max-w-2xl text-xs text-muted">{t.settings.notesIntro}</p>
          <div className="space-y-4">
            {notes.map((n, i) => {
              const was = supplied.notes[i];
              return (
                <Card key={n.id} className="overflow-hidden">
                  <div className="border-b border-line px-5 py-2.5">
                    <span className="font-mono text-sm font-semibold">{n.id}</span>
                  </div>
                  <div className="grid gap-4 p-5 sm:grid-cols-4">
                    <Qty
                      label={t.settings.listed}
                      name={`listed:${n.id}`}
                      value={n.listed}
                      onChange={(v) => patch(n.id, { listed: v })}
                      supplied={was?.listed}
                    />
                    <Qty
                      label={t.settings.counted}
                      name={`counted:${n.id}`}
                      value={n.counted}
                      onChange={(v) => patch(n.id, { counted: v })}
                      supplied={was?.counted}
                    />
                    <Qty
                      label={t.settings.damagedLabel}
                      name={`damaged:${n.id}`}
                      value={n.damaged}
                      onChange={(v) => patch(n.id, { damaged: v })}
                      supplied={was?.damaged}
                      tone="warn"
                    />
                    <div className="rounded-lg border border-line bg-background px-3 py-2.5">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
                        {t.settings.acceptedLabel}
                      </div>
                      <div className="qty-input mt-1 text-2xl font-semibold text-ok">
                        {Math.max(0, n.counted - n.damaged)}
                      </div>
                      <div className="mt-1 text-[11px] leading-tight text-faint">
                        {t.settings.derived}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <SectionTitle>{t.settings.previewHeading}</SectionTitle>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
            <Figure label={t.settings.previewOrdered} value={ordered} />
            <Figure label={t.settings.previewListed} value={listed} />
            <Figure label={t.settings.previewCounted} value={counted} />
            <Figure
              label={t.settings.previewAccepted}
              value={accepted}
              tone={damaged > 0 ? "warn" : undefined}
            />
            <Figure
              label={t.settings.previewInvoiced}
              value={invoiced}
              tone={gap !== 0 ? "warn" : "ok"}
            />
          </div>
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              gap === 0 ? "bg-ok-soft text-ok" : "bg-accent-soft text-accent"
            }`}
          >
            {gap === 0 ? t.settings.gapNone : t.settings.gapSome(gap)}
          </p>
          <p className="mt-2 text-xs text-faint">{t.settings.previewNote}</p>
        </section>

        {broken && (
          <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {t.settings.invalid(broken.id)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* The submitter's name/value is what tells the action which preset
              to rebuild into - so there is deliberately no hidden "mode". */}
          <SubmitButton
            className={btn.primary}
            name="mode"
            value="start_of_shift"
            disabled={!!broken}
            pendingLabel={t.settings.applying}
          >
            {t.settings.applyShift}
          </SubmitButton>
          <SubmitButton
            className={btn.secondary}
            name="mode"
            value="invoice_arrived"
            disabled={!!broken}
            pendingLabel={t.settings.applying}
          >
            {t.settings.applyInvoice}
          </SubmitButton>
        </div>
        <p className="mt-3 max-w-2xl text-xs text-faint">{t.settings.applyNote}</p>
      </form>

      {/* Its own form: a different action, and it must work even if the fields
          above are in a state the validation refuses. */}
      <form action={restoreSupplied} className="mt-8 border-t border-line pt-6">
        <SubmitButton className={btn.danger} pendingLabel={t.settings.restoring}>
          {t.settings.restore}
        </SubmitButton>
        <p className="mt-2 text-xs text-faint">{t.settings.restoreHint}</p>
      </form>
    </>
  );
}

function Was({ show, value }: { show: boolean; value: string | number }) {
  const t = useT();
  if (!show) return null;
  return (
    <span className="rounded-full bg-accent-soft px-1.5 py-0.5 font-semibold normal-case tracking-normal text-accent">
      {t.settings.suppliedValue(value)}
    </span>
  );
}

function Qty({
  label,
  hint,
  name,
  value,
  onChange,
  supplied,
  tone,
}: {
  label: string;
  hint?: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  supplied?: number;
  tone?: "warn";
}) {
  return (
    <label className="block rounded-lg border border-line bg-background px-3 py-2.5 focus-within:border-faint">
      <span className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
        <Was show={supplied !== undefined && supplied !== value} value={supplied ?? 0} />
      </span>
      <input
        type="number"
        name={name}
        min={0}
        max={MAX_QTY}
        required
        value={value}
        onChange={(e) =>
          onChange(Math.min(MAX_QTY, Math.max(0, Math.trunc(Number(e.target.value) || 0))))
        }
        className={`qty-input mt-1 block w-full bg-transparent text-2xl font-semibold outline-none ${
          tone === "warn" && value > 0 ? "text-accent" : "text-foreground"
        }`}
      />
      {hint && (
        <span className="mt-1 block text-[11px] leading-tight text-faint">{hint}</span>
      )}
    </label>
  );
}
