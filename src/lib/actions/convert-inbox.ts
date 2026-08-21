"use server";

import { revalidatePath } from "next/cache";
import { isSupabase } from "@/lib/db/backend";
import { getDb, getPlain, insertedId } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./projects";

export type ConvertTarget = "task" | "project" | "knowledge" | "library";

type TableName = "tasks" | "projects" | "knowledge" | "library_items";

const targets: Record<ConvertTarget, { table: TableName; href: (id?: string) => string }> = {
  task: { table: "tasks", href: () => "/tasks" },
  project: { table: "projects", href: (id) => `/projects/${id ?? ""}` },
  knowledge: { table: "knowledge", href: (id) => `/knowledge/${id ?? ""}` },
  library: { table: "library_items", href: () => "/library" },
};

function isConvertTarget(value: string): value is ConvertTarget {
  return Object.hasOwn(targets, value);
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

/**
 * Convert an inbox item into a real record (task/project/knowledge/library),
 * then mark the original item as processed.
 */
export async function convertInboxItemAction(
  id: string,
  target: ConvertTarget,
): Promise<ActionResult & { href?: string }> {
  if (!isConvertTarget(target)) return { error: "Invalid conversion target." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };

    const { data: createdId, error } = await supabase.rpc(
      "convert_inbox_item",
      { p_item_id: id, p_target: target },
    );
    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return { error: null, href: targets[target].href(String(createdId)) };
  }

  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const item = getPlain<{ id: string; content: string; status: string }>(
      "SELECT id, content, status FROM inbox_items WHERE id = ?",
      id,
    );
    if (!item) {
      db.exec("ROLLBACK");
      return { error: "Inbox item not found." };
    }
    if (item.status === "processed") {
      db.exec("ROLLBACK");
      return { error: "Already processed." };
    }

    const { table, href } = targets[target];
    const result = db
      .prepare(`INSERT INTO ${table} (title) VALUES (?)`)
      .run(item.content.trim());
    const update = db
      .prepare(
        "UPDATE inbox_items SET status = 'processed' WHERE id = ? AND status = 'unprocessed'",
      )
      .run(id);
    if (update.changes !== 1) throw new Error("Inbox item was converted concurrently.");

    const createdId = insertedId(db, table, result.lastInsertRowid);
    db.exec("COMMIT");
    revalidatePath("/", "layout");
    return { error: null, href: href(createdId) };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Transaction was already closed by SQLite.
    }
    return {
      error: error instanceof Error ? error.message : "Conversion failed.",
    };
  }
}
