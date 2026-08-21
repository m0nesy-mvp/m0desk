"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  action: () => Promise<{ error: string | null }>;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Deleted");
      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[15px]">
            <Trash2 className="size-4 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              run();
            }}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
