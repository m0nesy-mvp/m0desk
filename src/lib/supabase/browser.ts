import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/db/backend";

/**
 * Browser-side Supabase client (client components). Uses the public key and
 * relies on RLS to protect data — never put secret keys here.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
