import { cookies } from "next/headers";

import { CONFIG_COOKIE, parseConfig, type CaseConfig } from "./index";

/**
 * The active config, read on the server like the locale is.
 *
 * Absent a cookie this is the supplied dataset, which is what the end-to-end
 * suites see: they drive plain HTTP with no cookie jar, so they always run
 * against `initial.json` no matter what a browser has set.
 */
export async function getCaseConfig(): Promise<CaseConfig> {
  const store = await cookies();
  return parseConfig(store.get(CONFIG_COOKIE)?.value);
}
