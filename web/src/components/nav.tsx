"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageToggle } from "./language-toggle";
import { useT } from "./locale-provider";
import { ThemeToggle } from "./theme-toggle";

/**
 * The client's nav, which is a row of outline pills - that and the lowercase
 * are the two things you notice first on trast.de.
 *
 * The numbered circles are ours, not theirs, and they stay: 1 → 2 → 3 is the
 * order the work actually happens in on a receiving bay, and a lead who walks
 * up mid-shift needs to see which step they are on before anything else. The
 * pill carries the client's look; the number carries the workflow.
 *
 * Deliberately no trast mark or wordmark. The assignment is an exercise and
 * does not imply the client endorsed any of this, so the styling is borrowed
 * and the identity is not.
 */
export function Nav() {
  const pathname = usePathname();
  const t = useT();

  const steps = [
    { href: "/", n: "1", label: t.chrome.steps.receive },
    { href: "/evidence", n: "2", label: t.chrome.steps.evidence },
    { href: "/review", n: "3", label: t.chrome.steps.review },
  ];

  const quiet =
    "lc rounded-full px-3 py-1.5 text-xs text-faint transition hover:bg-foreground/[0.06] hover:text-foreground";

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/75 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="lc flex items-center gap-2 text-sm font-bold">
          <span aria-hidden className="size-3 shrink-0 bg-brand" />
          {t.chrome.brand}
          <span className="font-mono font-medium text-faint">· PO-1</span>
        </Link>

        <nav className="flex items-center gap-1.5" aria-label={t.chrome.flow}>
          {steps.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "step" : undefined}
                className={`lc flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm transition sm:px-3 sm:py-1.5 ${
                  active
                    ? "border-brand bg-brand font-semibold text-brand-ink"
                    : "border-line text-muted hover:border-brand/50 hover:text-brand"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    active ? "bg-brand-ink/20 text-brand-ink" : "bg-foreground/[0.07]"
                  }`}
                >
                  {s.n}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* flex-wrap: German is long, and at 320px this group is 333px wide -
            the only thing on any screen that does not fit that viewport. */}
        <div className="ms-auto flex flex-wrap items-center justify-end gap-1.5">
          <Link href="/docs" className={quiet}>
            {t.chrome.briefing}
          </Link>
          <Link href="/settings" className={quiet}>
            {t.chrome.settings}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
