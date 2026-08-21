"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeFormDialog } from "./knowledge-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteKnowledgeAction } from "@/lib/actions/knowledge";
import type { Knowledge } from "@/lib/db/types";

export function KnowledgeDetailActions({
  entry,
  projects,
}: {
  entry: Knowledge;
  projects: { id: string; title: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-[13px]"
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 text-[13px] text-muted-foreground hover:text-destructive"
        onClick={() => setDeleting(true)}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
      <KnowledgeFormDialog
        open={editing}
        onOpenChange={setEditing}
        entry={entry}
        projects={projects}
      />
      <ConfirmDeleteDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete knowledge?"
        description={`"${entry.title}" will be permanently removed.`}
        action={() => deleteKnowledgeAction(entry.id)}
      />
    </>
  );
}
