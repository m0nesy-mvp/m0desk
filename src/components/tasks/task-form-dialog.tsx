"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTaskAction,
  updateTaskAction,
  type TaskFormInput,
} from "@/lib/actions/tasks";
import type { Priority, Task, TaskStatus } from "@/lib/db/types";
import { priorityMeta, taskStatusMeta } from "@/lib/db/meta";

const priorities: Priority[] = ["P0", "P1", "P2", "P3"];
const statuses: TaskStatus[] = ["todo", "doing", "done"];

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  projects,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  projects: { id: string; title: string }[];
  defaultProjectId?: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const projectId = String(fd.get("project_id") ?? "");
    const input: TaskFormInput = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      project_id: projectId && projectId !== "__none__" ? projectId : null,
      status: (String(fd.get("status")) || "todo") as TaskStatus,
      priority: (String(fd.get("priority")) || "P2") as Priority,
      due_date: String(fd.get("due_date") ?? "") || null,
    };

    startTransition(async () => {
      const result = task
        ? await updateTaskAction(task.id, input)
        : await createTaskAction(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details." : "Add something to get done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-[13px]">Title *</Label>
            <Input
              id="task-title"
              name="title"
              defaultValue={task?.title ?? ""}
              placeholder="e.g. Finish framework design"
              className="h-9"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description" className="text-[13px]">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              defaultValue={task?.description ?? ""}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Project</Label>
              <Select
                name="project_id"
                defaultValue={task?.project_id ?? defaultProjectId ?? "__none__"}
              >
                <SelectTrigger className="h-9" aria-label="Project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Priority</Label>
              <Select name="priority" defaultValue={task?.priority ?? "P2"}>
                <SelectTrigger className="h-9" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityMeta[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select name="status" defaultValue={task?.status ?? "todo"}>
                <SelectTrigger className="h-9" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {taskStatusMeta[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className="text-[13px]">Due date</Label>
              <Input
                id="task-due"
                name="due_date"
                type="date"
                defaultValue={
                  task?.due_date
                    ? new Date(task.due_date).toISOString().slice(0, 10)
                    : ""
                }
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
