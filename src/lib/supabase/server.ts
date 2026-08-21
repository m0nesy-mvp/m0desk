import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/db/backend";

/**
 * Server-side Supabase client (Server Components, Server Actions, Route
 * Handlers). Reads the session from cookies via @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore when setting
            // cookies is not allowed here (middleware handles refresh).
          }
        },
      },
    },
  );
}
