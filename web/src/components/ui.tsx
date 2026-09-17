import type { ReactNode } from "react";

import type { Cause, Confidence } from "@/lib/types";
import { CAUSE_LABEL } from "@/lib/types";

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
export function SimulatedTag({ children = "Simulated" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sim-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sim">
      <span aria-hidden>◆</span>
      {children}
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
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs ${
        leading
          ? "border-accent/40 bg-accent-soft font-semibold text-accent"
          : "border-line text-muted"
      }`}
    >
      {CAUSE_LABEL[cause]}
    </span>
  );
}

const CONFIDENCE_COPY: Record<Confidence, string> = {
  likely: "Likely — one record accounts for it exactly",
  possible: "Possible — consistent, but not the only reading",
  uncertain: "Uncertain — the records cannot rank the causes",
};

export function ConfidenceNote({ confidence }: { confidence: Confidence }) {
  return <p className="text-xs font-medium text-muted">{CONFIDENCE_COPY[confidence]}</p>;
}

export function Evidence({ ids }: { ids: string[] }) {
  return (
    <p className="font-mono text-xs text-faint">
      Evidence:{" "}
      {ids.map((id, i) => (
        <span key={`${id}-${i}`}>
          {i > 0 && " · "}
          <span className="text-muted">{id}</span>
        </span>
      ))}
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
