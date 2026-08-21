import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
