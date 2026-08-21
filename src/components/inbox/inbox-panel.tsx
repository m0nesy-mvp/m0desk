"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CornerDownLeft, Inbox, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import {
  createInboxItemAction,
  deleteInboxItemAction,
  markInboxProcessedAction,
  updateInboxItemAction,
} from "@/lib/actions/inbox";
import { convertInboxItemAction, type ConvertTarget } from "@/lib/actions/convert-inbox";
import { cn } from "@/lib/utils";
import type { InboxItem } from "@/lib/db/types";

const convertOptions: { target: ConvertTarget; label: string }[] = [
  { target: "task", label: "Convert to Task" },
  { target: "project", label: "Convert to Project" },
  { target: "knowledge", label: "Convert to Knowledge" },
  { target: "library", label: "Convert to Library Item" },
];

export function InboxPanel({ items }: { items: InboxItem[] }) {
  const [tab, setTab] = useState<"unprocessed" | "processed">("unprocessed");
  const [capture, setCapture] = useState("");
  const [pendingCapture, startCapture] = useTransition();
  const [editing, setEditing] = useState<InboxItem | null>(null);
  const [editText, setEditText] = useState("");
  const [deleting, setDeleting] = useState<InboxItem | null>(null);

  const submitCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const content = capture.trim();
    if (!content) return;
    startCapture(async () => {
      const result = await createInboxItemAction(content);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Captured to Inbox");
      setCapture("");
    });
  };

  const convert = (item: InboxItem, target: ConvertTarget) => {
    toast.promise(convertInboxItemAction(item.id, target), {
      loading: "Converting…",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        return `Converted to ${target}`;
      },
      error: (err) => err.message ?? "Conversion failed",
    });
  };

  const visible = items.filter((i) =>
    tab === "unprocessed" ? i.status === "unprocessed" : i.status === "processed",
  );

  return (
    <div>
      <form onSubmit={submitCapture} className="mb-5 flex gap-2">
        <Input
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
          placeholder="Capture anything — organize it later…"
          className="h-9 flex-1 text-[13.5px]"
        />
        <Button
          type="submit"
          className="h-9 gap-1.5 text-[13px]"
          disabled={pendingCapture || !capture.trim()}
        >
          <CornerDownLeft className="size-3.5" />
          Capture
        </Button>
      </form>

      <div className="mb-4 flex items-center gap-1 border-b">
        {(["unprocessed", "processed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              tab === t
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "unprocessed" ? "Unprocessed" : "Processed"}
            <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">
              {items.filter((i) => i.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === "unprocessed" ? "Inbox zero." : "Nothing processed yet."}
          description={
            tab === "unprocessed"
              ? "Nothing waiting to be organized."
              : "Processed items will appear here."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {visible.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/20"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-relaxed">{item.content}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {format(new Date(item.created_at), "MMM d, HH:mm")}
                </p>
              </div>

              {item.status === "unprocessed" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-[12px]"
                    >
                      Convert
                      <ArrowRight className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {convertOptions.map((o) => (
                      <DropdownMenuItem
                        key={o.target}
                        onClick={() => convert(item, o.target)}
                        className="text-[13px]"
                      >
                        {o.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        toast.promise(markInboxProcessedAction(item.id), {
                          loading: "Marking…",
                          success: () => "Marked as processed",
                          error: "Failed",
                        })
                      }
                      className="text-[13px] text-muted-foreground"
                    >
                      Mark processed (no convert)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditing(item);
                    setEditText(item.content);
                  }}
                  aria-label="Edit item"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(item)}
                  aria-label="Delete item"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit capture</DialogTitle>
            <DialogDescription>
              Update the captured content.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            className="text-[13.5px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                toast.promise(updateInboxItemAction(editing.id, editText), {
                  loading: "Saving…",
                  success: () => {
                    setEditing(null);
                    return "Updated";
                  },
                  error: "Failed",
                });
              }}
              disabled={!editText.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete capture?"
        description={
          deleting ? `"${deleting.content.slice(0, 60)}…" will be removed.` : ""
        }
        action={() =>
          deleting
            ? deleteInboxItemAction(deleting.id)
            : Promise.resolve({ error: null })
        }
      />
    </div>
  );
}
