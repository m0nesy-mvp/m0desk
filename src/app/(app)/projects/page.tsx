import { Suspense } from "react";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilterTabs } from "@/components/projects/project-filter-tabs";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, getTaskCountsByProject } from "@/lib/db/projects";
import type { ProjectStatus } from "@/lib/db/types";

const statuses: (ProjectStatus | "all")[] = [
  "all",
  "active",
  "paused",
  "completed",
  "archived",
];

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (statuses as string[]).includes(status ?? "")
    ? (status as ProjectStatus | "all")
    : "all";

  const [projects, counts] = await Promise.all([
    getProjects(),
    getTaskCountsByProject(),
  ]);

  const visible =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Everything you're building, paused, or done."
        action={
          <Suspense fallback={<Skeleton className="h-8 w-24" />}>
            <NewProjectButton />
          </Suspense>
        }
      />

      <ProjectFilterTabs current={filter} counts={projects.length} />

      {visible.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={filter === "all" ? "No projects yet." : `No ${filter} projects.`}
          description={
            filter === "all"
              ? "Create your first project to start organizing your work."
              : "Nothing in this state right now."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={counts[project.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
