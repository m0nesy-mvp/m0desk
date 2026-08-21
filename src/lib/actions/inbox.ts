"use server";

import { revalidatePath } from "next/cache";
import { isSupabase } from "@/lib/db/backend";
import { getDb } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./projects";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createInboxItemAction(
  content: string,
): Promise<ActionResult> {
  if (!content.trim()) return { error: "Content is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("inbox_items")
      .insert({ user_id: userId, content: content.trim() });
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("INSERT INTO inbox_items (content) VALUES (?)").run(content.trim());
  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateInboxItemAction(
  id: string,
  content: string,
): Promise<ActionResult> {
  if (!content.trim()) return { error: "Content is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("inbox_items")
      .update({ content: content.trim() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("UPDATE inbox_items SET content = ? WHERE id = ?").run(
    content.trim(),
    id,
  );
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteInboxItemAction(id: string): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("inbox_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("DELETE FROM inbox_items WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  return { error: null };
}

export async function markInboxProcessedAction(
  id: string,
): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("inbox_items")
      .update({ status: "processed" })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("UPDATE inbox_items SET status = 'processed' WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  return { error: null };
}
