import { isSupabase } from "./backend";
import { allPlain, getPlain } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "./types";

export async function getProjects(): Promise<Project[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
  return allPlain<Project>("SELECT * FROM projects ORDER BY updated_at DESC");
}

export async function getProject(id: string): Promise<Project | null> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Project) ?? null;
  }
  return getPlain<Project>("SELECT * FROM projects WHERE id = ?", id);
}

/** Task counts per project — used for the projects list. */
export async function getTaskCountsByProject(): Promise<Record<string, number>> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("project_id, status");
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = {};
    for (const t of data ?? []) {
      if (!t.project_id) continue;
      counts[t.project_id] = (counts[t.project_id] ?? 0) + 1;
    }
    return counts;
  }
  const rows = allPlain<{ project_id: string; n: number }>(
    "SELECT project_id, COUNT(*) AS n FROM tasks WHERE project_id IS NOT NULL GROUP BY project_id",
  );
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.project_id] = r.n;
  return counts;
}

/** Lightweight id+title list for form selects. */
export async function getProjectOptions(): Promise<{ id: string; title: string }[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title")
      .order("title");
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; title: string }[];
  }
  return allPlain<{ id: string; title: string }>(
    "SELECT id, title FROM projects ORDER BY title",
  );
}

/** Knowledge entries linked to a project. */
export async function getProjectKnowledge(
  projectId: string,
): Promise<{ id: string; title: string; status: string; category: string }[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge")
      .select("id, title, status, category")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; title: string; status: string; category: string }[];
  }
  return allPlain(
    `SELECT id, title, status, category FROM knowledge
     WHERE project_id = ? ORDER BY updated_at DESC`,
    projectId,
  );
}

/** Library items linked to a project. */
export async function getProjectLibrary(
  projectId: string,
): Promise<{ id: string; title: string; type: string; status: string }[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("library_items")
      .select("id, title, type, status")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; title: string; type: string; status: string }[];
  }
  return allPlain(
    `SELECT id, title, type, status FROM library_items
     WHERE project_id = ? ORDER BY updated_at DESC`,
    projectId,
  );
}
