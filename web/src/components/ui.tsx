"use client";

import type { ReactNode } from "react";

import type { Cause, Confidence } from "@/lib/types";

import { useT } from "./locale-provider";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-faint">
      {children}
    </h2>
  );
}

/** Purple means simulated, everywhere, without exception. */
export function SimulatedTag({ children }: { children?: ReactNode }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sim-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sim">
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
      className={`rounded-full border px-2.5 py-1 text-xs ${
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
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </div>
      <div className={`mt-1 text-3xl font-semibold tabular-nums ${toneClass}`}>
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
      <p className="text-base font-medium">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-85 disabled:opacity-40",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-faint disabled:opacity-40",
  sim: "inline-flex items-center justify-center gap-2 rounded-lg border border-sim/35 bg-sim-soft px-4 py-2.5 text-sm font-semibold text-sim transition hover:border-sim/60 disabled:opacity-40",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-muted transition hover:border-faint disabled:opacity-40",
};
