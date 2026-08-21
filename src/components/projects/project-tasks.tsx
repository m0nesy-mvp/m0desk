"use client";

import { useState } from "react";
import { Plus, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import type { Task } from "@/lib/db/types";

export function ProjectTasks({
  tasks,
  projectId,
  projects,
}: {
  tasks: Task[];
  projectId: string;
  projects: { id: string; title: string }[];
}) {
  const [adding, setAdding] = useState(false);
  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold tracking-tight">Tasks</h2>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-[12px]"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-3" />
          Add task
        </Button>
      </div>

      <div className="mt-2 rounded-lg border bg-card">
        {openTasks.length === 0 && doneTasks.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={SquareCheck}
              title="No tasks in this project"
              description="Break the project into concrete next steps."
              className="border-0 bg-transparent py-8"
            />
          </div>
        ) : (
          <div className="px-2 py-1">
            {openTasks.map((t) => (
              <TaskRow key={t.id} task={t} projects={projects} showProject={false} />
            ))}
            {doneTasks.length > 0 && (
              <>
                <div className="my-1.5 flex items-center gap-2 px-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-muted-foreground/60">
                    Completed · {doneTasks.length}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                {doneTasks.map((t) => (
                  <TaskRow key={t.id} task={t} projects={projects} showProject={false} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <TaskFormDialog
        open={adding}
        onOpenChange={setAdding}
        projects={projects}
        defaultProjectId={projectId}
      />
    </div>
  );
}
