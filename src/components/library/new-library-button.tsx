"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryFormDialog } from "./library-form-dialog";

export function NewLibraryButton({
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
        New Library Item
      </Button>
      <LibraryFormDialog open={open} onOpenChange={setOpen} projects={projects} />
    </>
  );
}
