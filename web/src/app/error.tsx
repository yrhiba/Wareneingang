"use client";

import { useEffect } from "react";

import { useT } from "@/components/locale-provider";

/**
 * Presentation insurance.
 *
 * Anything that throws during a render or a server action lands here instead of
 * a stack trace on the projector. It offers the two things that actually
 * recover the demo: retry, and rebuild the start state.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error("[c04]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <div className="rounded-xl border border-line bg-surface px-6 py-10 text-center">
        <p className="text-base font-medium">{t.error.title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t.error.body}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-85"
          >
            {t.error.retry}
          </button>
          {/* A plain anchor on purpose: this is the recovery path, and the
              client router may be exactly what broke. Force a full reload. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition hover:border-faint"
          >
            {t.error.home}
          </a>
        </div>

        <details className="mt-8 text-start">
          <summary className="cursor-pointer text-xs text-faint">
            {t.error.detail}
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-3 font-mono text-[11px] text-muted">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
        </details>
      </div>
    </main>
  );
}
