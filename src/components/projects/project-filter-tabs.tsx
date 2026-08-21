"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/db/types";

const tabs: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function ProjectFilterTabs({
  current,
  counts,
}: {
  current: ProjectStatus | "all";
  counts: number;
}) {
  const pathname = usePathname();

  return (
    <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b">
      {tabs.map((t) => {
        const href =
          t.value === "all" ? pathname : `${pathname}?status=${t.value}`;
        const active = current === t.value;
        return (
          <Link
            key={t.value}
            href={href}
            className={cn(
              "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.value === "all" && (
              <span className="rounded-full bg-muted px-1.5 font-mono text-[10.5px] tabular-nums text-muted-foreground">
                {counts}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
