"use client";

import { useState, useTransition } from "react";
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
import { TagInput } from "@/components/tags-input";
import {
  createKnowledgeAction,
  updateKnowledgeAction,
  type KnowledgeFormInput,
} from "@/lib/actions/knowledge";
import type { Knowledge, KnowledgeStatus } from "@/lib/db/types";
import { knowledgeStatusMeta } from "@/lib/db/meta";

const statuses: KnowledgeStatus[] = ["learning", "understood", "review"];

export function KnowledgeFormDialog({
  open,
  onOpenChange,
  entry,
  projects,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: Knowledge | null;
  projects: { id: string; title: string }[];
  defaultProjectId?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const projectId = String(fd.get("project_id") ?? "");
    const input: KnowledgeFormInput = {
      title: String(fd.get("title") ?? ""),
      summary: String(fd.get("summary") ?? ""),
      content: String(fd.get("content") ?? ""),
      category: String(fd.get("category") ?? ""),
      tags,
      status: (String(fd.get("status")) || "learning") as KnowledgeStatus,
      project_id: projectId && projectId !== "__none__" ? projectId : null,
    };

    startTransition(async () => {
      const result = entry
        ? await updateKnowledgeAction(entry.id, input)
        : await createKnowledgeAction(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(entry ? "Knowledge updated" : "Knowledge saved");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Knowledge" : "New Knowledge"}</DialogTitle>
          <DialogDescription>
            Distill something you&apos;ve learned and understood.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="k-title" className="text-[13px]">Title *</Label>
            <Input
              id="k-title"
              name="title"
              defaultValue={entry?.title ?? ""}
              placeholder="e.g. MCP — Model Context Protocol"
              className="h-9"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="k-summary" className="text-[13px]">Summary</Label>
            <Textarea
              id="k-summary"
              name="summary"
              defaultValue={entry?.summary ?? ""}
              placeholder="One or two sentences — what is this, in your own words?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="k-content" className="text-[13px]">
              Notes <span className="text-muted-foreground/70">(Markdown supported)</span>
            </Label>
            <Textarea
              id="k-content"
              name="content"
              defaultValue={entry?.content ?? ""}
              placeholder={"## Core idea\n\nWhat you understood, with examples…"}
              rows={7}
              className="font-mono text-[12.5px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="k-category" className="text-[13px]">Category</Label>
              <Input
                id="k-category"
                name="category"
                defaultValue={entry?.category ?? ""}
                placeholder="e.g. AI Engineering"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select name="status" defaultValue={entry?.status ?? "learning"}>
                <SelectTrigger className="h-9" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {knowledgeStatusMeta[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Related Project</Label>
            <Select
              name="project_id"
              defaultValue={entry?.project_id ?? defaultProjectId ?? "__none__"}
            >
              <SelectTrigger className="h-9" aria-label="Related project">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {entry ? "Save changes" : "Save knowledge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
