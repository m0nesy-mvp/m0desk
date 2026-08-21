import { isSupabase } from "./backend";
import { allPlain } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "./types";

export type TaskWithProject = Task & { project: { title: string } | null };

function mapRow(row: Record<string, unknown>): TaskWithProject {
  const { project_title, ...task } = row;
  return {
    ...(task as unknown as Task),
    project: project_title ? { title: String(project_title) } : null,
  };
}

export async function getTasks(): Promise<TaskWithProject[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project:projects(title)")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TaskWithProject[];
  }
  const rows = allPlain<Record<string, unknown>>(
    `SELECT t.*, p.title AS project_title
     FROM tasks t LEFT JOIN projects p ON p.id = t.project_id
     ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at ASC`,
  );
  return rows.map(mapRow);
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Task[];
  }
  return allPlain<Task>(
    `SELECT * FROM tasks
     WHERE project_id = ?
     ORDER BY due_date IS NULL, due_date ASC, created_at ASC`,
    projectId,
  );
}
