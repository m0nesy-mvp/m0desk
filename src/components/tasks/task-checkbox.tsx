"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTaskAction } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

export function TaskCheckbox({
  taskId,
  done,
}: {
  taskId: string;
  done: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={done ? "Mark as not done" : "Mark as done"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleTaskAction(taskId, !done);
          if (result.error) toast.error(result.error);
        })
      }
      className="shrink-0 rounded p-0.5 transition-opacity disabled:opacity-50"
    >
      <Checkbox checked={done} className={cn("size-4", pending && "opacity-60")} />
    </button>
  );
}
