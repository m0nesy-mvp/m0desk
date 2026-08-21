import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { getTasks } from "@/lib/db/tasks";
import { getProjectOptions } from "@/lib/db/projects";
import type { Priority, TaskStatus } from "@/lib/db/types";

export const dynamic = "force-dynamic";

const validStatuses: TaskStatus[] = ["todo", "doing", "done"];
const validPriorities: Priority[] = ["P0", "P1", "P2", "P3"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const [tasks, projectOptions] = await Promise.all([
    getTasks(),
    getProjectOptions(),
  ]);

  const status = validStatuses.includes(params.status as TaskStatus)
    ? (params.status as TaskStatus)
    : null;
  const priority = validPriorities.includes(params.priority as Priority)
    ? (params.priority as Priority)
    : null;
  const projectId = params.project ?? null;

  const visible = tasks.filter((t) => {
    if (status && t.status !== status) return false;
    if (priority && t.priority !== priority) return false;
    if (projectId && t.project_id !== projectId) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Everything that needs to get done, sorted by due date."
      />
      <TaskFilters projects={projectOptions} />
      <TaskList tasks={visible} projects={projectOptions} />
    </div>
  );
}
