"use client";

import { createContext, useContext, type ReactNode } from "react";

import { getDict, type Dict, type Locale } from "@/lib/i18n";

/**
 * Client components read the dictionary from here instead of from the cookie.
 *
 * The server already resolved the locale for this request and renders the
 * provider with it, so the first client render matches the server render
 * exactly - there is no effect, no second pass and nothing to hydrate around.
 */
const LocaleContext = createContext<{ locale: Locale; t: Dict }>({
  locale: "en",
  t: getDict("en"),
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: getDict(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** The dictionary, in a client component. */
export const useT = () => useContext(LocaleContext).t;

/** The active locale code, for the language switch itself. */
export const useLocale = () => useContext(LocaleContext).locale;
