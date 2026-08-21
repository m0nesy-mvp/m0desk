"use server";

import { revalidatePath } from "next/cache";
import { isSupabase } from "@/lib/db/backend";
import { getDb, insertedId, nowIso } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import { validateOwnedProject } from "./project-ownership";
import type { ActionResult } from "./projects";
import type { Priority, TaskStatus } from "@/lib/db/types";

export type TaskFormInput = {
  title: string;
  description: string;
  project_id: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createTaskAction(
  input: TaskFormInput,
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
      .from("tasks")
      .insert({
        user_id: userId,
        project_id: input.project_id,
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
        due_date: input.due_date || null,
        completed_at: input.status === "done" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null, id: data.id };
  }

  const db = getDb();
  const completedAt = input.status === "done" ? nowIso() : null;
  const result = db
    .prepare(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.project_id,
      input.title.trim(),
      input.description.trim(),
      input.status,
      input.priority,
      input.due_date || null,
      completedAt,
    );

  revalidatePath("/", "layout");
  return { error: null, id: insertedId(db, "tasks", result.lastInsertRowid) };
}

export async function updateTaskAction(
  id: string,
  input: TaskFormInput,
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
      .from("tasks")
      .update({
        project_id: input.project_id,
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status,
        priority: input.priority,
        due_date: input.due_date || null,
        completed_at: input.status === "done" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  const completedAt = input.status === "done" ? nowIso() : null;
  db.prepare(
    `UPDATE tasks SET
       project_id = ?, title = ?, description = ?, status = ?, priority = ?, due_date = ?, completed_at = ?
     WHERE id = ?`,
  ).run(
    input.project_id,
    input.title.trim(),
    input.description.trim(),
    input.status,
    input.priority,
    input.due_date || null,
    completedAt,
    id,
  );

  revalidatePath("/", "layout");
  return { error: null };
}

export async function toggleTaskAction(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("tasks")
      .update({
        status: done ? "done" : "todo",
        completed_at: done ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?").run(
    done ? "done" : "todo",
    done ? nowIso() : null,
    id,
  );
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  return { error: null };
}
