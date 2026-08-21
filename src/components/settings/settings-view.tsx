"use client";

import { Download, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { DataCounts } from "@/lib/db/stats";

const themeOptions = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

const countRows: { key: keyof DataCounts; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "knowledge", label: "Knowledge" },
  { key: "library", label: "Library" },
  { key: "inbox", label: "Inbox" },
];

export function SettingsView({ counts }: { counts: DataCounts }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Settings" description="Your M0Desk preferences." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Profile</CardTitle>
          <CardDescription>
            Local single-user mode — no account needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[13px] text-muted-foreground">
          Your data lives in a private database — Supabase cloud when
          deployed, local SQLite on this machine otherwise. No login screen
          either way.
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Appearance</CardTitle>
          <CardDescription>
            Choose how M0Desk looks. Dark is the default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger className="w-full max-w-56" aria-label="Theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <span className="flex items-center gap-2">
                    <o.icon className="size-3.5 text-muted-foreground" />
                    {o.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Data</CardTitle>
          <CardDescription>
            What&apos;s stored in your local database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {countRows.map((r) => (
              <div
                key={r.key}
                className="rounded-md border bg-muted/20 px-3 py-2.5"
              >
                <p className="font-mono text-lg font-semibold tabular-nums">
                  {counts[r.key]}
                </p>
                <p className="text-[11.5px] text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px]"
            >
              <a href="/api/export" download>
                <Download className="size-3.5" />
                Export backup (JSON)
              </a>
            </Button>
            <p className="text-[11.5px] text-muted-foreground">
              Full backup of all your data — keep it on a USB drive or cloud
              folder.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-[13px] text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">M0Desk</span> v0.1 —
            personal command center.
          </p>
          <p>Next.js 16 · Supabase / SQLite · Tailwind CSS</p>
          <p className="text-[12px] text-muted-foreground/70">
            Your personal command center — fast, quiet, yours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
