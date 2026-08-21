"use client";

import { useState } from "react";
import { Plus, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import type { TaskWithProject } from "@/lib/db/tasks";

export function TaskList({
  tasks,
  projects,
}: {
  tasks: TaskWithProject[];
  projects: { id: string; title: string }[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <Button
          size="sm"
          className="h-8 gap-1.5 text-[13px]"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-3.5" strokeWidth={2.25} />
          New Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={SquareCheck}
          title="No tasks yet."
          description="Create a task to keep track of what needs to be done."
        />
      ) : (
        <div className="rounded-lg border bg-card px-2 py-1">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} projects={projects} />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={adding}
        onOpenChange={setAdding}
        projects={projects}
      />
    </div>
  );
}
