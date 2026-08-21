import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { PriorityBadge } from "@/components/badges";
import { TaskCheckbox } from "@/components/tasks/task-checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db/types";

export function TodayTaskRow({
  task,
  projectTitle,
  overdue,
}: {
  task: Task;
  projectTitle?: string;
  overdue: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/30">
      <TaskCheckbox taskId={task.id} done={task.status === "done"} />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
        {task.title}
      </span>
      {projectTitle && (
        <span className="hidden max-w-32 truncate rounded border border-border bg-muted/40 px-1.5 py-px text-[10.5px] text-muted-foreground sm:block">
          {projectTitle}
        </span>
      )}
      <PriorityBadge priority={task.priority} />
      {task.due_date && (
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[10.5px] tabular-nums",
            overdue ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <CalendarDays className="size-3" />
          {format(new Date(task.due_date), "MMM d")}
        </span>
      )}
    </div>
  );
}
