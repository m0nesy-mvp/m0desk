import { isSupabase } from "./backend";
import { allPlain, parseTags } from "./connection";
import { createClient } from "@/lib/supabase/server";
import type { InboxItem, Knowledge, LibraryItem, Project, Task } from "./types";

export type SearchResults = {
  projects: Project[];
  tasks: Task[];
  knowledge: Knowledge[];
  library: LibraryItem[];
  inbox: InboxItem[];
};

function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function like(q: string): string {
  return `%${escapeLike(q)}%`;
}

const empty: SearchResults = {
  projects: [],
  tasks: [],
  knowledge: [],
  library: [],
  inbox: [],
};

function mapKnowledgeRow(row: Record<string, unknown>): Knowledge {
  return {
    ...(row as unknown as Omit<Knowledge, "tags">),
    tags: parseTags(String(row.tags ?? "[]")),
  };
}

function mapLibraryRow(row: Record<string, unknown>): LibraryItem {
  return {
    ...(row as unknown as Omit<LibraryItem, "tags">),
    tags: parseTags(String(row.tags ?? "[]")),
  };
}

/** Simple keyword search across all entity types, grouped by type. */
export async function searchAll(query: string, limit = 5): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return empty;
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 50));

  if (isSupabase) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_all", {
      p_query: q,
      p_limit: safeLimit,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Search returned an invalid response.");
    }
    return data as unknown as SearchResults;
  }

  const l = like(q);
  const [projects, tasks, knowledge, library, inbox] = await Promise.all([
    allPlain<Project>(
      `SELECT * FROM projects
       WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\'
          OR current_stage LIKE ? ESCAPE '\\' OR next_action LIKE ? ESCAPE '\\'
       ORDER BY updated_at DESC LIMIT ?`,
      l, l, l, l, safeLimit,
    ),
    allPlain<Task>(
      `SELECT * FROM tasks
       WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\'
       ORDER BY updated_at DESC LIMIT ?`,
      l, l, safeLimit,
    ),
    allPlain<Record<string, unknown>>(
      `SELECT * FROM knowledge
       WHERE title LIKE ? ESCAPE '\\' OR summary LIKE ? ESCAPE '\\'
          OR category LIKE ? ESCAPE '\\'
          OR EXISTS (SELECT 1 FROM json_each(knowledge.tags) WHERE value = ?)
       ORDER BY updated_at DESC LIMIT ?`,
      l, l, l, q, safeLimit,
    ).map(mapKnowledgeRow),
    allPlain<Record<string, unknown>>(
      `SELECT * FROM library_items
       WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\'
          OR url LIKE ? ESCAPE '\\'
          OR EXISTS (SELECT 1 FROM json_each(library_items.tags) WHERE value = ?)
       ORDER BY updated_at DESC LIMIT ?`,
      l, l, l, q, safeLimit,
    ).map(mapLibraryRow),
    allPlain<InboxItem>(
      `SELECT * FROM inbox_items
       WHERE content LIKE ? ESCAPE '\\'
       ORDER BY created_at DESC LIMIT ?`,
      l, safeLimit,
    ),
  ]);

  return { projects, tasks, knowledge, library, inbox };
}
