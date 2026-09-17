import { createBrowserClient } from "@supabase/ssr";

/** Browser client. Read-only in practice: RLS blocks every write from this key. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
