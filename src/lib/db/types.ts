// Row types for all M0Desk tables (mirror of src/lib/db/schema.sql)

export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type TaskStatus = "todo" | "doing" | "done";
export type KnowledgeStatus = "learning" | "understood" | "review";
export type LibraryType =
  | "paper"
  | "website"
  | "github"
  | "course"
  | "video"
  | "book"
  | "document"
  | "other";
export type LibraryStatus = "unread" | "reading" | "finished" | "reference";
export type InboxStatus = "unprocessed" | "processed";
export type Priority = "P0" | "P1" | "P2" | "P3";

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  deadline: string | null;
  current_stage: string;
  next_action: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Knowledge = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  status: KnowledgeStatus;
  created_at: string;
  updated_at: string;
};

export type LibraryItem = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  type: LibraryType;
  url: string;
  description: string;
  tags: string[];
  status: LibraryStatus;
  created_at: string;
  updated_at: string;
};

export type InboxItem = {
  id: string;
  user_id: string;
  content: string;
  status: InboxStatus;
  created_at: string;
  updated_at: string;
};

export type DataCounts = {
  projects: number;
  tasks: number;
  knowledge: number;
  library: number;
  inbox: number;
};
