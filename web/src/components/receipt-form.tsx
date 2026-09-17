"use client";

import { useState } from "react";

import { captureReceipt } from "@/app/actions";
import type { DeliveryNote } from "@/lib/types";

import { useT } from "./locale-provider";
import { SubmitButton } from "./submit-button";
import { btn, Card } from "./ui";

/**
 * The answer to the case's starting question, as a screen.
 *
 * The clerk records TWO numbers and the third is derived, so accepted can never
 * silently drift from received and damaged. All three are stored separately -
 * collapsing them into one net figure is exactly what makes the invoice
 * unresolvable later.
 */
export function ReceiptForm({ note }: { note: DeliveryNote }) {
  const t = useT();
  const [received, setReceived] = useState(note.listed_quantity);
  const [damaged, setDamaged] = useState(0);

  const accepted = Math.max(0, received - damaged);
  const short = note.listed_quantity - received;
  const invalid = damaged > received;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-3">
        <div>
          <span className="font-mono text-sm font-semibold">{note.id}</span>
          <span className="ms-2 text-sm text-muted">
            {t.form.noteFor(note.part, note.order_id)}
          </span>
        </div>
        <span className="text-sm text-muted">
          {t.form.noteLists}{" "}
          <strong className="tabular-nums text-foreground">
            {note.listed_quantity}
          </strong>
        </span>
      </div>

      <form action={captureReceipt} className="px-5 py-5">
        <input type="hidden" name="delivery_note" value={note.id} />

        <div className="grid gap-4 sm:grid-cols-3">
          <QtyField
            label={t.form.countedIn}
            hint={t.form.countedInHint}
            name="received"
            value={received}
            onChange={setReceived}
          />
          <QtyField
            label={t.form.damagedLabel}
            hint={t.form.damagedHint}
            name="damaged"
            value={damaged}
            onChange={setDamaged}
            tone="warn"
          />
          <div className="rounded-lg border border-line bg-background px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {t.form.acceptedLabel}
            </div>
            <div className="qty-input mt-1 text-3xl font-semibold text-ok">
              {accepted}
            </div>
            <div className="mt-1 text-[11px] leading-tight text-faint">
              {t.form.acceptedHint}
            </div>
          </div>
        </div>

        {short > 0 && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {t.form.shortWarning(short, note.id)}
          </p>
        )}
        {invalid && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {t.form.invalid}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <SubmitButton
            className={btn.primary}
            disabled={invalid}
            pendingLabel={t.form.submitting}
          >
            {t.form.submit}
          </SubmitButton>
          <span className="text-xs text-faint">{t.form.footnote}</span>
        </div>
      </form>
    </Card>
  );
}

function QtyField({
  label,
  hint,
  name,
  value,
  onChange,
  tone,
}: {
  label: string;
  hint: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  tone?: "warn";
}) {
  return (
    <label className="block rounded-lg border border-line bg-background px-3 py-2.5 focus-within:border-faint">
      <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <input
        type="number"
        name={name}
        min={0}
        required
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={`qty-input mt-1 block w-full bg-transparent text-3xl font-semibold outline-none ${
          tone === "warn" && value > 0 ? "text-accent" : "text-foreground"
        }`}
      />
      <span className="mt-1 block text-[11px] leading-tight text-faint">{hint}</span>
    </label>
  );
}
