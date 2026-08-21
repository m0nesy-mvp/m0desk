"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, TaskStatus } from "@/lib/db/types";
import { priorityMeta } from "@/lib/db/meta";

const statusTabs: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
];

export function TaskFilters({
  projects,
}: {
  projects: { id: string; title: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "all") as TaskStatus | "all";
  const project = searchParams.get("project") ?? "all";
  const priority = searchParams.get("priority") ?? "all";

  const setParams = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/tasks?${next.toString()}`);
  };

  const selectClass = "h-8 w-full text-[12.5px]";

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-1 overflow-x-auto border-b">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setParams("status", t.value)}
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

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Select value={project} onValueChange={(v) => setParams("project", v)}>
          <SelectTrigger className={selectClass} aria-label="Filter by project">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setParams("priority", v)}>
          <SelectTrigger className={selectClass} aria-label="Filter by priority">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {priorityMeta[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
