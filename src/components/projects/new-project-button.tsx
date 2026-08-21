"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "./project-form-dialog";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="h-8 gap-1.5 text-[13px]"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-3.5" strokeWidth={2.25} />
        New Project
      </Button>
      <ProjectFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
