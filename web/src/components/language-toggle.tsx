"use client";

import { setLanguage } from "@/app/actions";
import { ar, en, LOCALES } from "@/lib/i18n";

import { useLocale, useT } from "./locale-provider";

const LABEL = { en: en.short, ar: ar.short };
const FULL = { en: en.name, ar: ar.name };

/**
 * Language switch. A real form posting to a server action, not client state:
 * the choice has to reach the server so the next render picks the dictionary
 * AND the text direction. Doing it client-side would leave <html dir> stale.
 */
export function LanguageToggle() {
  const active = useLocale();
  const t = useT();

  return (
    <form
      action={setLanguage}
      className="flex items-center rounded-lg border border-line p-0.5"
      aria-label={t.chrome.language}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="submit"
          name="lang"
          value={l}
          lang={l}
          aria-current={l === active ? "true" : undefined}
          title={FULL[l]}
          className={`rounded-md px-2 py-0.5 text-xs transition ${
            l === active
              ? "bg-foreground font-semibold text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </form>
  );
}
