import { isSupabase } from "./backend";
import { allPlain, getPlain, parseTags } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { Knowledge } from "./types";

function mapRow(row: Record<string, unknown>): Knowledge {
  return {
    ...(row as unknown as Omit<Knowledge, "tags">),
    tags: parseTags(String(row.tags ?? "[]")),
  };
}

export async function getKnowledge(): Promise<Knowledge[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Knowledge[];
  }
  return allPlain<Record<string, unknown>>(
    "SELECT * FROM knowledge ORDER BY updated_at DESC",
  ).map(mapRow);
}

export async function getKnowledgeEntry(id: string): Promise<Knowledge | null> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Knowledge) ?? null;
  }
  const row = getPlain<Record<string, unknown>>(
    "SELECT * FROM knowledge WHERE id = ?",
    id,
  );
  return row ? mapRow(row) : null;
}
