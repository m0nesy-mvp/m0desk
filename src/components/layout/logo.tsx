import { Command } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground">
        <Command className="size-4" strokeWidth={2.25} />
      </div>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          M0<span className="text-brand">Desk</span>
        </span>
      )}
    </div>
  );
}
