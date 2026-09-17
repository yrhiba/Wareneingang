import { cookies } from "next/headers";

import { getDict, isLocale, LOCALE_COOKIE, type Locale } from "./index";

/**
 * The chosen language rides in a cookie, not in the URL or in client state.
 *
 * That is deliberate: every page here is already force-dynamic and rendered on
 * the server, so the server can pick the dictionary and the text direction
 * before the first byte. No flash of the wrong language, no duplicated routes,
 * and the language switch keeps working with JavaScript disabled - which is how
 * the end-to-end suite drives this app.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

/** The dictionary for this request. */
export async function getT() {
  return getDict(await getLocale());
}
