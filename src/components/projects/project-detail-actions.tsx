"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "./project-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteProjectAction } from "@/lib/actions/projects";
import type { Project } from "@/lib/db/types";

export function ProjectDetailActions({ project }: { project: Project }) {
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
      <ProjectFormDialog
        open={editing}
        onOpenChange={setEditing}
        project={project}
      />
      <ConfirmDeleteDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete project?"
        description={`"${project.title}" and its related tasks will be permanently removed.`}
        action={() => deleteProjectAction(project.id)}
      />
    </>
  );
}
