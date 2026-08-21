"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Library, Pencil, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { LibraryStatusBadge, LibraryTypeBadge } from "@/components/badges";
import { LibraryFormDialog } from "./library-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteLibraryItemAction } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import type { LibraryItem, LibraryType } from "@/lib/db/types";
import { libraryTypeMeta } from "@/lib/db/meta";

const typeTabs: { value: LibraryType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.keys(libraryTypeMeta) as LibraryType[]).map((t) => ({
    value: t,
    label: libraryTypeMeta[t].label,
  })),
];

export function LibraryBrowser({
  items,
  projects,
}: {
  items: LibraryItem[];
  projects: { id: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<LibraryType | "all">("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [deleting, setDeleting] = useState<LibraryItem | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (status !== "all" && i.status !== status) return false;
      if (q) {
        const haystack = [i.title, i.description, ...i.tags].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, type, status]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search library…"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-[12.5px] text-muted-foreground outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="unread">Unread</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
          <option value="reference">Reference</option>
        </select>
      </div>

      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b">
        {typeTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              type === t.value
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title={
            items.length === 0
              ? "No library items yet."
              : "Nothing matches."
          }
          description={
            items.length === 0
              ? "Save papers, websites, GitHub repos and courses for later."
              : "Try a different search or filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {visible.map((i) => (
            <div
              key={i.id}
              className="group flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/20"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {i.url ? (
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 truncate text-[13.5px] font-medium hover:text-brand"
                    >
                      {i.title}
                      <ExternalLink className="size-3 shrink-0 text-muted-foreground/60" />
                    </a>
                  ) : (
                    <span className="truncate text-[13.5px] font-medium">
                      {i.title}
                    </span>
                  )}
                </div>
                {i.description && (
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
                    {i.description}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <LibraryTypeBadge type={i.type} />
                  <LibraryStatusBadge status={i.status} />
                  {i.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10.5px] text-muted-foreground/80"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(i)}
                  aria-label="Edit item"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(i)}
                  aria-label="Delete item"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LibraryFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        item={editing}
        projects={projects}
      />
      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete library item?"
        description={deleting ? `"${deleting.title}" will be permanently removed.` : ""}
        action={() => (deleting ? deleteLibraryItemAction(deleting.id) : Promise.resolve({ error: null }))}
      />
    </div>
  );
}
