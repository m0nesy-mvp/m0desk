"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { KnowledgeStatusBadge } from "@/components/badges";
import { NewKnowledgeButton } from "./new-knowledge-button";
import { cn } from "@/lib/utils";
import type { Knowledge, KnowledgeStatus } from "@/lib/db/types";

const tabs: { value: KnowledgeStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "learning", label: "Learning" },
  { value: "understood", label: "Understood" },
  { value: "review", label: "Review" },
];

export function KnowledgeBrowser({
  entries,
  projects,
}: {
  entries: Knowledge[];
  projects: { id: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<KnowledgeStatus | "all">("all");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [entries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (category !== "all" && e.category !== category) return false;
      if (q) {
        const haystack = [e.title, e.summary, e.category, ...e.tags]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, query, status, category]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge…"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        {categories.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] transition-colors",
                category === "all"
                  ? "border-brand/50 bg-brand/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? "all" : c)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] transition-colors",
                  category === c
                    ? "border-brand/50 bg-brand/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto">
          <NewKnowledgeButton projects={projects} />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              status === t.value
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
          icon={BookOpen}
          title={
            entries.length === 0
              ? "No knowledge entries yet."
              : "Nothing matches."
          }
          description={
            entries.length === 0
              ? "Capture concepts you've truly understood — with summaries, notes and tags."
              : "Try a different search or filter."
          }
        />
      ) : (
        <div className="space-y-2">
          {visible.map((e) => (
            <Link
              key={e.id}
              href={`/knowledge/${e.id}`}
              className="group block rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold tracking-tight">
                    {e.title}
                  </h3>
                  {e.summary && (
                    <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                      {e.summary}
                    </p>
                  )}
                </div>
                <KnowledgeStatusBadge status={e.status} />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {e.category && (
                  <span className="rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] text-muted-foreground">
                    {e.category}
                  </span>
                )}
                {e.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10.5px] text-muted-foreground/80"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
