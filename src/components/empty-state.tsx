import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background shadow-xs">
        <Icon className="size-4.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
