"use client";

import { Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({
  onMenuClick,
  onSearchClick,
  onQuickAddClick,
}: {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onQuickAddClick: () => void;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 md:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

      <button
        onClick={onSearchClick}
        className="group flex h-8 w-full max-w-sm items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70"
      >
        <Search className="size-3.5 shrink-0" strokeWidth={2} />
        <span className="truncate">Search M0Desk…</span>
        <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[13px]"
          onClick={onQuickAddClick}
        >
          <Plus className="size-3.5" strokeWidth={2.25} />
          Add
        </Button>
      </div>
    </header>
  );
}
