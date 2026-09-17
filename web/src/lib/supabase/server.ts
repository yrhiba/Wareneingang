import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server client, holds the secret key and bypasses RLS.
 * Every write in this app goes through here, behind a review step - never
 * straight from the browser. See the working agreement in CLAUDE.md.
 */
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}
