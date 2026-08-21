import { cn } from "@/lib/utils";
import {
  priorityMeta,
  projectStatusMeta,
  taskStatusMeta,
  knowledgeStatusMeta,
  libraryStatusMeta,
  libraryTypeMeta,
  inboxStatusMeta,
} from "@/lib/db/meta";
import type {
  Priority,
  ProjectStatus,
  TaskStatus,
  KnowledgeStatus,
  LibraryStatus,
  LibraryType,
  InboxStatus,
} from "@/lib/db/types";

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-px font-mono text-[10.5px] font-medium leading-4",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = priorityMeta[priority];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const m = projectStatusMeta[status];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const m = taskStatusMeta[status];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function KnowledgeStatusBadge({ status }: { status: KnowledgeStatus }) {
  const m = knowledgeStatusMeta[status];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function LibraryStatusBadge({ status }: { status: LibraryStatus }) {
  const m = libraryStatusMeta[status];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function LibraryTypeBadge({ type }: { type: LibraryType }) {
  const m = libraryTypeMeta[type];
  return <Badge className={m.className}>{m.label}</Badge>;
}

export function InboxStatusBadge({ status }: { status: InboxStatus }) {
  const m = inboxStatusMeta[status];
  return <Badge className={m.className}>{m.label}</Badge>;
}
