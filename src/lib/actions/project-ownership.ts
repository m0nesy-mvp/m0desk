import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Validate that an optional project reference belongs to the current user. */
export async function validateOwnedProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string | null,
): Promise<string | null> {
  if (!projectId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return error.message;
  return data ? null : "Project not found or not owned by the current user.";
}
