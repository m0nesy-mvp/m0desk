import { isSupabase } from "./backend";
import { allPlain } from "./connection";
import { createClient } from "@/lib/supabase/server";

export type DataCounts = {
  projects: number;
  tasks: number;
  knowledge: number;
  library: number;
  inbox: number;
};

export async function getDataCounts(): Promise<DataCounts> {
  if (isSupabase) {
    const supabase = await createClient();
    const [p, t, k, l, i] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("knowledge").select("id", { count: "exact", head: true }),
      supabase.from("library_items").select("id", { count: "exact", head: true }),
      supabase.from("inbox_items").select("id", { count: "exact", head: true }),
    ]);
    const failed = [p, t, k, l, i].find((result) => result.error);
    if (failed?.error) throw new Error(failed.error.message);

    return {
      projects: p.count ?? 0,
      tasks: t.count ?? 0,
      knowledge: k.count ?? 0,
      library: l.count ?? 0,
      inbox: i.count ?? 0,
    };
  }
  const [projects, tasks, knowledge, library, inbox] = await Promise.all([
    allPlain<{ n: number }>("SELECT COUNT(*) AS n FROM projects"),
    allPlain<{ n: number }>("SELECT COUNT(*) AS n FROM tasks"),
    allPlain<{ n: number }>("SELECT COUNT(*) AS n FROM knowledge"),
    allPlain<{ n: number }>("SELECT COUNT(*) AS n FROM library_items"),
    allPlain<{ n: number }>("SELECT COUNT(*) AS n FROM inbox_items"),
  ]);
  return {
    projects: projects[0]?.n ?? 0,
    tasks: tasks[0]?.n ?? 0,
    knowledge: knowledge[0]?.n ?? 0,
    library: library[0]?.n ?? 0,
    inbox: inbox[0]?.n ?? 0,
  };
}
