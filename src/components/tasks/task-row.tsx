"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/badges";
import { TaskCheckbox } from "./task-checkbox";
import { TaskFormDialog } from "./task-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteTaskAction } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db/types";

export function TaskRow({
  task,
  projects,
  showProject = true,
}: {
  task: Task & { project?: { title: string } | null };
  projects: { id: string; title: string }[];
  showProject?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const done = task.status === "done";
  // Display-time "is this overdue" check — not part of render purity scope.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const overdue = !done && !!task.due_date && new Date(task.due_date).getTime() < now;

  return (
    <div className="group flex items-center gap-3 rounded-md border-b px-2 py-2.5 transition-colors last:border-b-0 hover:bg-muted/30">
      <TaskCheckbox taskId={task.id} done={done} />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13.5px] font-medium",
            done && "text-muted-foreground line-through decoration-muted-foreground/50",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="truncate text-[12px] text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      {showProject && task.project?.title && (
        <Link
          href={`/projects/${task.project_id}`}
          className="hidden max-w-40 truncate rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          {task.project.title}
        </Link>
      )}

      <PriorityBadge priority={task.priority} />

      {task.due_date && (
        <span
          className={cn(
            "hidden items-center gap-1 font-mono text-[11px] tabular-nums sm:inline-flex",
            overdue ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <CalendarDays className="size-3" />
          {format(new Date(task.due_date), "MMM d")}
        </span>
      )}

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
          aria-label="Edit task"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleting(true)}
          aria-label="Delete task"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <TaskFormDialog
        open={editing}
        onOpenChange={setEditing}
        task={task}
        projects={projects}
      />
      <ConfirmDeleteDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete task?"
        description={`"${task.title}" will be permanently removed.`}
        action={() => deleteTaskAction(task.id)}
      />
    </div>
  );
}
