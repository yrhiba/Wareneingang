import { ar } from "./ar";
import { de } from "./de";
import { en, type Dict } from "./en";

export { en } from "./en";
export { ar } from "./ar";
export { de } from "./de";
export type { Dict, Dir } from "./en";

export const LOCALES = ["en", "ar", "de"] as const;
export type Locale = (typeof LOCALES)[number];

/** Read on the server and written by the setLanguage action. */
export const LOCALE_COOKIE = "c04-lang";

const DICTS: Record<Locale, Dict> = { en, ar, de };

export const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Unknown or missing locale falls back to English rather than throwing. */
export function getDict(locale: string | undefined | null): Dict {
  return DICTS[isLocale(locale) ? locale : "en"];
}

export function dirOf(locale: string | undefined | null) {
  return getDict(locale).dir;
}
