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
  createProjectAction,
  updateProjectAction,
  type ProjectFormInput,
} from "@/lib/actions/projects";
import type { Project, Priority, ProjectStatus } from "@/lib/db/types";
import { projectStatusMeta, priorityMeta } from "@/lib/db/meta";

const priorities: Priority[] = ["P0", "P1", "P2", "P3"];
const statuses: ProjectStatus[] = ["active", "paused", "completed", "archived"];

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  defaultStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  defaultStatus?: ProjectStatus;
}) {
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: ProjectFormInput = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      status: (String(fd.get("status")) || defaultStatus || "active") as ProjectStatus,
      priority: (String(fd.get("priority")) || "P2") as Priority,
      deadline: (String(fd.get("deadline")) || null),
      current_stage: String(fd.get("current_stage") ?? ""),
      next_action: String(fd.get("next_action") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    };

    startTransition(async () => {
      const result = project
        ? await updateProjectAction(project.id, input)
        : await createProjectAction(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(project ? "Project updated" : "Project created");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update the project details."
              : "Define what you're working toward."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[13px]">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={project?.title ?? ""}
              placeholder="e.g. Skill Eval Framework"
              className="h-9"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[13px]">Goal</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ""}
              placeholder="What does success look like for this project?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select name="status" defaultValue={project?.status ?? defaultStatus ?? "active"}>
                <SelectTrigger className="h-9" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {projectStatusMeta[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Priority</Label>
              <Select name="priority" defaultValue={project?.priority ?? "P2"}>
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

          <div className="space-y-1.5">
            <Label htmlFor="deadline" className="text-[13px]">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={
                project?.deadline
                  ? new Date(project.deadline).toISOString().slice(0, 10)
                  : ""
              }
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="current_stage" className="text-[13px]">Current Stage</Label>
            <Input
              id="current_stage"
              name="current_stage"
              defaultValue={project?.current_stage ?? ""}
              placeholder="e.g. Framework Design"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="next_action" className="text-[13px]">Next Action</Label>
            <Input
              id="next_action"
              name="next_action"
              defaultValue={project?.next_action ?? ""}
              placeholder="e.g. Define Eval Schema"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-[13px]">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={project?.notes ?? ""}
              placeholder="Anything worth remembering."
              rows={3}
            />
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
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
