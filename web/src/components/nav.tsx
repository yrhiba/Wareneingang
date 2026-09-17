"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageToggle } from "./language-toggle";
import { useT } from "./locale-provider";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  const pathname = usePathname();
  const t = useT();

  const steps = [
    { href: "/", n: "1", label: t.chrome.steps.receive },
    { href: "/evidence", n: "2", label: t.chrome.steps.evidence },
    { href: "/review", n: "3", label: t.chrome.steps.review },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {t.chrome.brand}
          <span className="font-mono text-faint"> · PO-1</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label={t.chrome.flow}>
          {steps.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "step" : undefined}
                className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition ${
                  active
                    ? "bg-foreground/[0.06] font-semibold"
                    : "text-muted hover:bg-foreground/[0.04]"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-foreground text-background"
                      : "border border-line text-faint"
                  }`}
                >
                  {s.n}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <Link
            href="/docs"
            className="text-xs text-faint underline-offset-4 hover:underline"
          >
            {t.chrome.briefing}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
