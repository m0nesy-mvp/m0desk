import { isSupabase } from "./backend";
import { allPlain } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { InboxItem } from "./types";

export async function getInboxItems(): Promise<InboxItem[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inbox_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as InboxItem[];
  }
  return allPlain<InboxItem>(
    "SELECT * FROM inbox_items ORDER BY created_at DESC",
  );
}

export async function getUnprocessedInbox(): Promise<InboxItem[]> {
  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inbox_items")
      .select("*")
      .eq("status", "unprocessed")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as InboxItem[];
  }
  return allPlain<InboxItem>(
    "SELECT * FROM inbox_items WHERE status = 'unprocessed' ORDER BY created_at DESC",
  );
}
