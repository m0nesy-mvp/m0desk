"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabase } from "@/lib/db/backend";
import { getDb, insertedId } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import type { Priority, ProjectStatus } from "@/lib/db/types";

export type ProjectFormInput = {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  deadline: string | null;
  current_stage: string;
  next_action: string;
  notes: string;
};

export type ActionResult = { error: string | null };

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createProjectAction(
  input: ProjectFormInput,
): Promise<ActionResult & { id?: string }> {
  if (!input.title.trim()) return { error: "Title is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
        deadline: input.deadline || null,
        current_stage: input.current_stage.trim(),
        next_action: input.next_action.trim(),
        notes: input.notes.trim(),
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
      `INSERT INTO projects (title, description, status, priority, deadline, current_stage, next_action, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.title.trim(),
      input.description.trim(),
      input.status,
      input.priority,
      input.deadline || null,
      input.current_stage.trim(),
      input.next_action.trim(),
      input.notes.trim(),
    );

  revalidatePath("/", "layout");
  return { error: null, id: insertedId(db, "projects", result.lastInsertRowid) };
}

export async function updateProjectAction(
  id: string,
  input: ProjectFormInput,
): Promise<ActionResult> {
  if (!input.title.trim()) return { error: "Title is required." };

  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("projects")
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
        deadline: input.deadline || null,
        current_stage: input.current_stage.trim(),
        next_action: input.next_action.trim(),
        notes: input.notes.trim(),
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare(
    `UPDATE projects SET
       title = ?, description = ?, status = ?, priority = ?,
       deadline = ?, current_stage = ?, next_action = ?, notes = ?
     WHERE id = ?`,
  ).run(
    input.title.trim(),
    input.description.trim(),
    input.status,
    input.priority,
    input.deadline || null,
    input.current_stage.trim(),
    input.next_action.trim(),
    input.notes.trim(),
    id,
  );

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    redirect("/projects");
  }

  const db = getDb();
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/projects");
}
