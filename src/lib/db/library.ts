import { isSupabase } from "./backend";
import { allPlain, parseTags } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { LibraryItem } from "./types";

function mapRow(row: Record<string, unknown>): LibraryItem {
  return {
    ...(row as unknown as Omit<LibraryItem, "tags">),
    tags: parseTags(String(row.tags ?? "[]")),
  };
}

export async function getLibraryItems(): Promise<LibraryItem[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("library_items")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as LibraryItem[];
  }
  return allPlain<Record<string, unknown>>(
    "SELECT * FROM library_items ORDER BY updated_at DESC",
  ).map(mapRow);
}
