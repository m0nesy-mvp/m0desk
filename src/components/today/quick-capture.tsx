"use client";

import { useState, useTransition } from "react";
import { CornerDownLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createInboxItemAction } from "@/lib/actions/inbox";

export function QuickCapture() {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(async () => {
      const result = await createInboxItemAction(value);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Captured to Inbox");
      setValue("");
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border bg-card p-4 shadow-xs transition-colors focus-within:border-brand/50"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="quick-capture"
          className="text-[13px] font-semibold tracking-tight"
        >
          Quick Capture
        </label>
        <span className="text-[11px] text-muted-foreground">⌘N anywhere</span>
      </div>
      <textarea
        id="quick-capture"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What's on your mind?"
        rows={2}
        className="mt-2 w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/50"
      />
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Captures land in your Inbox, organized later.
        </p>
        <Button
          type="submit"
          size="sm"
          className="h-7 gap-1.5 text-[12px]"
          disabled={pending || !value.trim()}
        >
          Capture
          <CornerDownLeft className="size-3" />
        </Button>
      </div>
    </form>
  );
}
