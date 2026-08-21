import { isSupabase } from "./backend";
import { allPlain } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { InboxItem, Project, Task } from "./types";

/** Open (not done) tasks due today or overdue — the "must see" list. */
export async function getTodayTasks(limit = 8): Promise<Task[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(
      startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1,
    );
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .neq("status", "done")
      .lte("due_date", endOfToday.toISOString())
      .order("due_date", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Task[];
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  return allPlain<Task>(
    `SELECT * FROM tasks
     WHERE status != 'done' AND due_date IS NOT NULL AND due_date <= ?
     ORDER BY due_date ASC LIMIT ?`,
    endOfToday.toISOString(),
    limit,
  );
}

/** Project deadlines within the next 14 days, soonest first. */
export async function getUpcomingDeadlines(
  days = 14,
  limit = 6,
): Promise<Project[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const now = new Date();
    const horizon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .not("deadline", "is", null)
      .gte("deadline", now.toISOString())
      .lte("deadline", horizon.toISOString())
      .neq("status", "archived")
      .order("deadline", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
  const now = new Date();
  const horizon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return allPlain<Project>(
    `SELECT * FROM projects
     WHERE deadline IS NOT NULL AND deadline >= ? AND deadline <= ? AND status != 'archived'
     ORDER BY deadline ASC LIMIT ?`,
    now.toISOString(),
    horizon.toISOString(),
    limit,
  );
}

/** Recently updated active projects. */
export async function getActiveProjects(limit = 4): Promise<Project[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
  return allPlain<Project>(
    "SELECT * FROM projects WHERE status = 'active' ORDER BY updated_at DESC LIMIT ?",
    limit,
  );
}

/** Latest unprocessed inbox items for the preview. */
export async function getRecentInbox(limit = 4): Promise<InboxItem[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inbox_items")
      .select("*")
      .eq("status", "unprocessed")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as InboxItem[];
  }
  return allPlain<InboxItem>(
    "SELECT * FROM inbox_items WHERE status = 'unprocessed' ORDER BY created_at DESC LIMIT ?",
    limit,
  );
}

/** Project titles for tasks that reference projects. */
export async function getProjectTitles(): Promise<Record<string, string>> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title");
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {};
    for (const p of data ?? []) map[p.id] = p.title;
    return map;
  }
  const rows = allPlain<{ id: string; title: string }>(
    "SELECT id, title FROM projects",
  );
  const map: Record<string, string> = {};
  for (const r of rows) map[r.id] = r.title;
  return map;
}
