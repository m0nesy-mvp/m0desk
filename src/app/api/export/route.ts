import { NextResponse } from "next/server";
import { isSupabase } from "@/lib/db/backend";
import { getDb, parseTags } from "@/lib/db/connection";

export const dynamic = "force-dynamic";

const TABLES = [
  "projects",
  "tasks",
  "knowledge",
  "library_items",
  "inbox_items",
] as const;

type TableName = (typeof TABLES)[number];

function normalizeRows(
  table: TableName,
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  if (table !== "knowledge" && table !== "library_items") {
    return rows.map((row) => ({ ...row }));
  }

  return rows.map((row) => ({
    ...row,
    tags: Array.isArray(row.tags)
      ? row.tags.map(String)
      : parseTags(String(row.tags ?? "[]")),
  }));
}

/**
 * Full JSON backup of all data — download and keep somewhere safe.
 * Works on both backends (Supabase cloud / local SQLite).
 */
export async function GET() {
  const backup: Record<string, unknown[]> = {};

  if (isSupabase) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        return NextResponse.json(
          { error: `Backup failed for ${table}: ${error.message}` },
          { status: 500 },
        );
      }
      backup[table] = normalizeRows(
        table,
        (data ?? []) as Record<string, unknown>[],
      );
    }
  } else {
    const db = getDb();
    for (const table of TABLES) {
      backup[table] = normalizeRows(
        table,
        db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[],
      );
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="m0desk-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
