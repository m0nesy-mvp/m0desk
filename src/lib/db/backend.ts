/**
 * Backend selection: Supabase when configured, SQLite otherwise.
 * Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to use
 * the cloud backend (Vercel deployment); leave them unset for pure-local mode.
 *
 * Tests always run against SQLite — never the cloud project.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const hasCompleteSupabaseConfig = Boolean(
  supabaseUrl && supabasePublishableKey,
);

if (
  process.env.NODE_ENV !== "test" &&
  Boolean(supabaseUrl) !== Boolean(supabasePublishableKey)
) {
  throw new Error(
    "Supabase configuration is incomplete. Set both " +
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, " +
      "or leave both unset for local SQLite mode.",
  );
}

export const isSupabase =
  process.env.NODE_ENV !== "test" && hasCompleteSupabaseConfig;

export function getSupabaseConfig(): { url: string; publishableKey: string } {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}
