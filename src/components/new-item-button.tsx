"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandMenu } from "@/components/layout/command-context";

export function NewItemButton({ label }: { label: string }) {
  const { openCommand } = useCommandMenu();
  return (
    <Button
      size="sm"
      className="h-8 gap-1.5 text-[13px]"
      onClick={() => openCommand("add")}
    >
      <Plus className="size-3.5" strokeWidth={2.25} />
      {label}
    </Button>
  );
}
