import Link from "next/link";
import { CalendarClock, FolderKanban, Inbox, SquareCheck } from "lucide-react";
import { format } from "date-fns";
import { Greeting } from "@/components/today/greeting";
import { QuickCapture } from "@/components/today/quick-capture";
import { SectionCard } from "@/components/section-card";
import { EmptyState } from "@/components/empty-state";
import { PriorityBadge } from "@/components/badges";
import { TodayTaskRow } from "@/components/today/today-task-row";
import {
  getTodayTasks,
  getUpcomingDeadlines,
  getActiveProjects,
  getRecentInbox,
  getProjectTitles,
} from "@/lib/db/today";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [tasks, deadlines, projects, inbox, titles] = await Promise.all([
    getTodayTasks(),
    getUpcomingDeadlines(),
    getActiveProjects(),
    getRecentInbox(),
    getProjectTitles(),
  ]);

  const now = new Date();

  return (
    <div>
      <Greeting />
      <QuickCapture />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Today Tasks"
          action={
            <Link
              href="/tasks"
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        >
          {tasks.length === 0 ? (
            <EmptyState
              icon={SquareCheck}
              title="Nothing due today"
              description="Tasks due today or overdue will show up here."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="-mx-1 space-y-0.5">
              {tasks.map((t) => {
                const overdue =
                  !!t.due_date &&
                  new Date(t.due_date).getTime() < now.getTime();
                return (
                  <TodayTaskRow
                    key={t.id}
                    task={t}
                    projectTitle={t.project_id ? titles[t.project_id] : undefined}
                    overdue={overdue}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Deadlines"
          action={
            <Link
              href="/projects"
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        >
          {deadlines.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No deadlines in the next 14 days"
              description="Project deadlines will appear here, soonest first."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-1.5">
              {deadlines.map((p) => {
                const daysLeft = Math.ceil(
                  (new Date(p.deadline!).getTime() - now.getTime()) / 86_400_000,
                );
                const urgent = daysLeft <= 3;
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/30"
                  >
                    <span
                      className={cn(
                        "w-11 shrink-0 font-mono text-[12px] font-semibold tabular-nums",
                        urgent ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {format(new Date(p.deadline!), "MMM d")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                      {p.title}
                    </span>
                    {urgent && (
                      <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-px text-[10.5px] font-medium text-destructive">
                        {daysLeft === 0 ? "today" : `${daysLeft}d`}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Active Projects"
          action={
            <Link
              href="/projects"
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        >
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No active projects"
              description="Projects in progress appear here with their next action."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group rounded-md border px-3 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                      {p.title}
                    </span>
                    <PriorityBadge priority={p.priority} />
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                    {p.current_stage && (
                      <p>
                        <span className="text-foreground/40">Current: </span>
                        {p.current_stage}
                      </p>
                    )}
                    {p.next_action && (
                      <p>
                        <span className="text-foreground/40">Next: </span>
                        {p.next_action}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Inbox"
          action={
            <Link
              href="/inbox"
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        >
          {inbox.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Inbox zero"
              description="Nothing waiting to be organized."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-1">
              {inbox.map((item) => (
                <Link
                  key={item.id}
                  href="/inbox"
                  className="block truncate rounded-md border px-3 py-2 text-[13px] transition-colors hover:bg-muted/30"
                >
                  {item.content}
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
