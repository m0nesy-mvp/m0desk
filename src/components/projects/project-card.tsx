import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Project } from "@/lib/db/types";
import { PriorityBadge, ProjectStatusBadge } from "@/components/badges";

export function ProjectCard({
  project,
  taskCount,
}: {
  project: Project;
  taskCount: number;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold tracking-tight">
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <ProjectStatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
        {project.deadline && (
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">
            <CalendarDays className="size-3" />
            {format(new Date(project.deadline), "MMM d")}
          </span>
        )}
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/60">
          {taskCount} task{taskCount === 1 ? "" : "s"}
        </span>
      </div>

      {(project.current_stage || project.next_action) && (
        <div className="mt-3 space-y-1 border-t pt-2.5 text-[12px] leading-relaxed">
          {project.current_stage && (
            <p className="text-muted-foreground">
              <span className="text-foreground/50">Current: </span>
              {project.current_stage}
            </p>
          )}
          {project.next_action && (
            <p className="text-muted-foreground">
              <span className="text-foreground/50">Next: </span>
              {project.next_action}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
