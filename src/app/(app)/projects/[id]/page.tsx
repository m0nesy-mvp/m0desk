import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, BookOpen, Library } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { PriorityBadge, ProjectStatusBadge, KnowledgeStatusBadge, LibraryTypeBadge } from "@/components/badges";
import { ProjectDetailActions } from "@/components/projects/project-detail-actions";
import { ProjectTasks } from "@/components/projects/project-tasks";
import { getProject, getTaskCountsByProject, getProjectOptions, getProjectKnowledge, getProjectLibrary } from "@/lib/db/projects";
import { getProjectTasks } from "@/lib/db/tasks";
import type { KnowledgeStatus, LibraryType } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, tasks, counts, projectOptions, knowledge, library] =
    await Promise.all([
      getProject(id),
      getProjectTasks(id),
      getTaskCountsByProject(),
      getProjectOptions(),
      getProjectKnowledge(id),
      getProjectLibrary(id),
    ]);

  if (!project) notFound();

  const deadline = project.deadline
    ? format(new Date(project.deadline), "MMM d, yyyy")
    : null;

  const fields: { label: string; value: string; empty?: string }[] = [
    { label: "Goal", value: project.description, empty: "No goal defined yet." },
    { label: "Current Stage", value: project.current_stage, empty: "Not set." },
    { label: "Next Action", value: project.next_action, empty: "Not set." },
  ];

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`${counts[id] ?? 0} task${(counts[id] ?? 0) === 1 ? "" : "s"} · created ${format(new Date(project.created_at), "MMM d, yyyy")}`}
        action={<ProjectDetailActions project={project} />}
      />

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <ProjectStatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
        {deadline && (
          <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] text-muted-foreground">
            <CalendarDays className="size-3" />
            Due {deadline}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {fields.map((f) => (
          <SectionCard key={f.label} title={f.label}>
            {f.value ? (
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                {f.value}
              </p>
            ) : (
              <p className="text-[13px] italic text-muted-foreground/60">
                {f.empty}
              </p>
            )}
          </SectionCard>
        ))}

        <SectionCard title="Notes" className="lg:col-span-2">
          {project.notes ? (
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
              {project.notes}
            </p>
          ) : (
            <p className="text-[13px] italic text-muted-foreground/60">
              No notes yet.
            </p>
          )}
        </SectionCard>

        <div className="lg:col-span-2">
          <ProjectTasks
            tasks={tasks}
            projectId={project.id}
            projects={projectOptions}
          />
        </div>

        <SectionCard
          title="Related Knowledge"
          action={
            <Link
              href="/knowledge"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Open Knowledge
            </Link>
          }
        >
          {knowledge.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No related knowledge"
              description="Linked knowledge entries appear here."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-1">
              {knowledge.map((k) => (
                <Link
                  key={k.id}
                  href={`/knowledge/${k.id}`}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-muted/30"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {k.title}
                  </span>
                  <KnowledgeStatusBadge status={k.status as KnowledgeStatus} />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Related Library"
          action={
            <Link
              href="/library"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Open Library
            </Link>
          }
        >
          {library.length === 0 ? (
            <EmptyState
              icon={Library}
              title="No related library items"
              description="Linked papers, repos and resources appear here."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-1">
              {library.map((l) => (
                <Link
                  key={l.id}
                  href="/library"
                  className="flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-muted/30"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {l.title}
                  </span>
                  <LibraryTypeBadge type={l.type as LibraryType} />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
