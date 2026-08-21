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
  createLibraryItemAction,
  updateLibraryItemAction,
  type LibraryFormInput,
} from "@/lib/actions/library";
import type { LibraryItem, LibraryStatus, LibraryType } from "@/lib/db/types";
import { libraryStatusMeta, libraryTypeMeta } from "@/lib/db/meta";

const types = Object.keys(libraryTypeMeta) as LibraryType[];
const statuses = Object.keys(libraryStatusMeta) as LibraryStatus[];

export function LibraryFormDialog({
  open,
  onOpenChange,
  item,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LibraryItem | null;
  projects: { id: string; title: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const projectId = String(fd.get("project_id") ?? "");
    const input: LibraryFormInput = {
      title: String(fd.get("title") ?? ""),
      type: (String(fd.get("type")) || "other") as LibraryType,
      url: String(fd.get("url") ?? ""),
      description: String(fd.get("description") ?? ""),
      tags,
      status: (String(fd.get("status")) || "unread") as LibraryStatus,
      project_id: projectId && projectId !== "__none__" ? projectId : null,
    };

    startTransition(async () => {
      const result = item
        ? await updateLibraryItemAction(item.id, input)
        : await createLibraryItemAction(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(item ? "Library item updated" : "Library item saved");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Library Item" : "New Library Item"}
          </DialogTitle>
          <DialogDescription>
            Save raw material — a paper, repo, course, or anything worth
            revisiting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="l-title" className="text-[13px]">Title *</Label>
            <Input
              id="l-title"
              name="title"
              defaultValue={item?.title ?? ""}
              placeholder="e.g. Attention Is All You Need"
              className="h-9"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Type</Label>
              <Select name="type" defaultValue={item?.type ?? "other"}>
                <SelectTrigger className="h-9" aria-label="Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {libraryTypeMeta[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Status</Label>
              <Select name="status" defaultValue={item?.status ?? "unread"}>
                <SelectTrigger className="h-9" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {libraryStatusMeta[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="l-url" className="text-[13px]">URL</Label>
            <Input
              id="l-url"
              name="url"
              type="url"
              defaultValue={item?.url ?? ""}
              placeholder="https://…"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="l-description" className="text-[13px]">My note</Label>
            <Textarea
              id="l-description"
              name="description"
              defaultValue={item?.description ?? ""}
              placeholder="Why did you save this? What to look for?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Related Project</Label>
            <Select
              name="project_id"
              defaultValue={item?.project_id ?? "__none__"}
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
              {item ? "Save changes" : "Save item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
