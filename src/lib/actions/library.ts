"use server";

import { revalidatePath } from "next/cache";
import { isSupabase } from "@/lib/db/backend";
import { getDb, insertedId, toTags } from "@/lib/db/connection";
import { createClient } from "@/lib/supabase/server";
import { validateOwnedProject } from "./project-ownership";
import type { ActionResult } from "./projects";
import type { LibraryStatus, LibraryType } from "@/lib/db/types";

export type LibraryFormInput = {
  title: string;
  type: LibraryType;
  url: string;
  description: string;
  tags: string[];
  status: LibraryStatus;
  project_id: string | null;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createLibraryItemAction(
  input: LibraryFormInput,
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
      .from("library_items")
      .insert({
        user_id: userId,
        project_id: input.project_id,
        title: input.title.trim(),
        type: input.type,
        url: input.url.trim(),
        description: input.description.trim(),
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
      `INSERT INTO library_items (project_id, title, type, url, description, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.project_id,
      input.title.trim(),
      input.type,
      input.url.trim(),
      input.description.trim(),
      toTags(input.tags),
      input.status,
    );

  revalidatePath("/", "layout");
  return {
    error: null,
    id: insertedId(db, "library_items", result.lastInsertRowid),
  };
}

export async function updateLibraryItemAction(
  id: string,
  input: LibraryFormInput,
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
      .from("library_items")
      .update({
        project_id: input.project_id,
        title: input.title.trim(),
        type: input.type,
        url: input.url.trim(),
        description: input.description.trim(),
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
    `UPDATE library_items SET
       project_id = ?, title = ?, type = ?, url = ?, description = ?, tags = ?, status = ?
     WHERE id = ?`,
  ).run(
    input.project_id,
    input.title.trim(),
    input.type,
    input.url.trim(),
    input.description.trim(),
    toTags(input.tags),
    input.status,
    id,
  );

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteLibraryItemAction(
  id: string,
): Promise<ActionResult> {
  if (isSupabase) {
    const { supabase, userId } = await requireUserId();
    if (!userId) return { error: "Not signed in." };
    const { error } = await supabase
      .from("library_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  }

  const db = getDb();
  db.prepare("DELETE FROM library_items WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  return { error: null };
}
