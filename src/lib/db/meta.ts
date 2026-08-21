import type { LibraryType, LibraryStatus, KnowledgeStatus, ProjectStatus, Priority, TaskStatus, InboxStatus } from "./types";

// Label/color metadata lives next to the types so UI components stay dumb.

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  P0: { label: "P0", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  P1: { label: "P1", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  P2: { label: "P2", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  P3: { label: "P3", className: "border-border bg-muted/40 text-muted-foreground" },
};

export const projectStatusMeta: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  paused: { label: "Paused", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  completed: { label: "Completed", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  archived: { label: "Archived", className: "border-border bg-muted/40 text-muted-foreground" },
};

export const taskStatusMeta: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To do", className: "border-border bg-muted/40 text-muted-foreground" },
  doing: { label: "Doing", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  done: { label: "Done", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};

export const knowledgeStatusMeta: Record<KnowledgeStatus, { label: string; className: string }> = {
  learning: { label: "Learning", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  understood: { label: "Understood", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  review: { label: "Review", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
};

export const libraryTypeMeta: Record<LibraryType, { label: string; className: string }> = {
  paper: { label: "Paper", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  website: { label: "Website", className: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
  github: { label: "GitHub", className: "border-border bg-muted/40 text-foreground/80" },
  course: { label: "Course", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  video: { label: "Video", className: "border-rose-500/30 bg-rose-500/10 text-rose-400" },
  book: { label: "Book", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  document: { label: "Document", className: "border-border bg-muted/40 text-muted-foreground" },
  other: { label: "Other", className: "border-border bg-muted/40 text-muted-foreground" },
};

export const libraryStatusMeta: Record<LibraryStatus, { label: string; className: string }> = {
  unread: { label: "Unread", className: "border-border bg-muted/40 text-muted-foreground" },
  reading: { label: "Reading", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  finished: { label: "Finished", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  reference: { label: "Reference", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
};

export const inboxStatusMeta: Record<InboxStatus, { label: string; className: string }> = {
  unprocessed: { label: "Unprocessed", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  processed: { label: "Processed", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};
