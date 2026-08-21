"use server";

import { revalidatePath } from "next/cache";
import { isSupabase } from "@/lib/db/backend";
import { getDb, insertedId, toTags } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import { validateOwnedProject } from "./project-ownership";
import type { ActionResult } from "./projects";
import type { KnowledgeStatus } from "@/lib/db/types";

export type KnowledgeFormInput = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  status: KnowledgeStatus;
  project_id: string | null;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createKnowledgeAction(
  input: KnowledgeFormInput,
): Promise<ActionResult & { id?: string }> {
  if (!input.title.trim()) return { error: "Title is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const projectError = await validateOwnedProject(
      supabase,
      userId,
      input.project_id,
    );
    if (projectError) return { error: projectError };
    const { data, error } = await supabase
      .from("knowledge")
      .insert({
        user_id: userId,
        project_id: input.project_id,
        title: input.title.trim(),
        summary: input.summary.trim(),
        content: input.content.trim(),
        category: input.category.trim(),
        tags: input.tags,
        status: input.status,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null, id: data.id };
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO knowledge (project_id, title, summary, content, category, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.project_id,
      input.title.trim(),
      input.summary.trim(),
      input.content.trim(),
      input.category.trim(),
      toTags(input.tags),
      input.status,
    );

  revalidatePath("/", "layout");
  return { error: null, id: insertedId(db, "knowledge", result.lastInsertRowid) };
}

export async function updateKnowledgeAction(
  id: string,
  input: KnowledgeFormInput,
): Promise<ActionResult> {
  if (!input.title.trim()) return { error: "Title is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const projectError = await validateOwnedProject(
      supabase,
      userId,
      input.project_id,
    );
    if (projectError) return { error: projectError };
    const { error } = await supabase
      .from("knowledge")
      .update({
        project_id: input.project_id,
        title: input.title.trim(),
        summary: input.summary.trim(),
        content: input.content.trim(),
        category: input.category.trim(),
        tags: input.tags,
        status: input.status,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare(
    `UPDATE knowledge SET
       project_id = ?, title = ?, summary = ?, content = ?, category = ?, tags = ?, status = ?
     WHERE id = ?`,
  ).run(
    input.project_id,
    input.title.trim(),
    input.summary.trim(),
    input.content.trim(),
    input.category.trim(),
    toTags(input.tags),
    input.status,
    id,
  );

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteKnowledgeAction(id: string): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("knowledge")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("DELETE FROM knowledge WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  return { error: null };
}
