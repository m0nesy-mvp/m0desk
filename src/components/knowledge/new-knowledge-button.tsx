"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeFormDialog } from "./knowledge-form-dialog";

export function NewKnowledgeButton({
  projects,
}: {
  projects: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="h-8 gap-1.5 text-[13px]"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-3.5" strokeWidth={2.25} />
        New Knowledge
      </Button>
      <KnowledgeFormDialog open={open} onOpenChange={setOpen} projects={projects} />
    </>
  );
}
