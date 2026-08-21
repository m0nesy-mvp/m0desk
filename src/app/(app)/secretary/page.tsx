import {
  FileText,
  Inbox,
  Search,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const capabilities = [
  { icon: Inbox, label: "Organize Inbox" },
  { icon: FileText, label: "Summarize projects" },
  { icon: SunMedium, label: "Suggest today's priorities" },
  { icon: Search, label: "Search personal knowledge" },
];

export default function SecretaryPage() {
  return (
    <div className="flex min-h-[62vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border bg-brand/10">
          <Sparkles className="size-5 text-brand" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          M0Desk Secretary
        </h1>
        <div className="mt-2">
          <Badge variant="secondary" className="text-[11px] font-medium">
            Coming later
          </Badge>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
          Your personal AI assistant for M0Desk. Planned capabilities:
        </p>
        <ul className="mt-4 space-y-2 text-left">
          {capabilities.map((c) => (
            <li
              key={c.label}
              className="flex items-center gap-2.5 rounded-md border bg-muted/30 px-3 py-2 text-[13px]"
            >
              <c.icon className="size-3.5 text-muted-foreground" />
              {c.label}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] text-muted-foreground/70">
          v0.1 does not call any AI models. This page is a placeholder.
        </p>
      </div>
    </div>
  );
}
