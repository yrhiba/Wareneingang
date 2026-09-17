"use client";

import type { ReactNode } from "react";

import type { Cause, Confidence } from "@/lib/types";

import { useT } from "./locale-provider";

/*
 * The shape rule, taken from trast.de: containers are square, controls are
 * round. Every block of content on their site is a hard-edged rectangle and
 * every interactive thing - the whole nav, every call to action - is a fully
 * rounded outline pill. Following both halves is what makes this read as a
 * deliberate system rather than a recolour.
 */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-line bg-surface ${className}`}>{children}</div>
  );
}

/** Section labels were uppercase and tracked, which is the exact opposite of
 *  the client's look. Lowercase comes from the h2 rule in globals.css. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold text-faint">{children}</h2>;
}

/**
 * Coral means simulated, everywhere, without exception.
 *
 * It used to be violet, until the restyle made indigo the brand colour - the
 * two are the same hue family, and the one thing this tag cannot afford is to
 * look like ordinary chrome. Coral is the client's own, and as far from their
 * indigo as their palette goes. The diamond and the word carry it too, so the
 * label still works in greyscale and for a colour-blind reader.
 */
export function SimulatedTag({ children }: { children?: ReactNode }) {
  const t = useT();
  // shrink-0 and nowrap: this is a label, not prose. Left to wrap, it turned
  // into a four-line oval on a phone.
  return (
    <span className="lc inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-sim/30 bg-sim-soft px-2.5 py-0.5 text-[11px] font-semibold text-sim">
      <span aria-hidden>◆</span>
      {children ?? t.ui.simulated}
    </span>
  );
}

export function CausePill({
  cause,
  leading = false,
}: {
  cause: Cause;
  leading?: boolean;
}) {
  const t = useT();
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs ${
        leading
          ? "border-accent/40 bg-accent-soft font-semibold text-accent"
          : "border-line text-muted"
      }`}
    >
      {t.cause[cause]}
    </span>
  );
}

export function ConfidenceNote({ confidence }: { confidence: Confidence }) {
  const t = useT();
  return (
    <p className="text-xs font-medium text-muted">{t.confidence[confidence]}</p>
  );
}

export function Evidence({ ids }: { ids: string[] }) {
  const t = useT();
  return (
    <p className="text-xs text-faint">
      {t.ui.evidence}{" "}
      {/* The ids are one left-to-right run even in Arabic; see globals.css. */}
      <span className="font-mono">
        {ids.map((id, i) => (
          <span key={`${id}-${i}`}>
            {i > 0 && " · "}
            <span className="text-muted">{id}</span>
          </span>
        ))}
      </span>
    </p>
  );
}

export function Figure({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone?: "warn" | "ok";
  hint?: string;
}) {
  const toneClass =
    tone === "warn" ? "text-accent" : tone === "ok" ? "text-ok" : "text-foreground";
  return (
    <div className="bg-surface px-4 py-4">
      {/* Figure labels keep their capitals. Bestellt / Gezählt / Angenommen are
          the three quantities somebody scans down a column, and lowercasing
          German nouns here would cost more than it buys. */}
      <div className="text-[11px] font-semibold text-faint">{label}</div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-tight text-faint">{hint}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="px-6 py-14 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}
