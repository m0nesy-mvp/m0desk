import {
  BookOpen,
  FolderKanban,
  Inbox,
  Library,
  Sparkles,
  SquareCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  section: "main" | "ai" | "system";
};

export const navItems: NavItem[] = [
  { title: "Today", href: "/today", icon: Sun, section: "main" },
  { title: "Projects", href: "/projects", icon: FolderKanban, section: "main" },
  { title: "Tasks", href: "/tasks", icon: SquareCheck, section: "main" },
  { title: "Knowledge", href: "/knowledge", icon: BookOpen, section: "main" },
  { title: "Library", href: "/library", icon: Library, section: "main" },
  { title: "Inbox", href: "/inbox", icon: Inbox, section: "main" },
  { title: "Secretary", href: "/secretary", icon: Sparkles, section: "ai" },
];
