import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import {
  getActiveProjects,
  getRecentInbox,
  getTodayTasks,
  getUpcomingDeadlines,
} from "@/lib/db/today";
import { createProjectAction } from "@/lib/actions/projects";
import { createTaskAction } from "@/lib/actions/tasks";
import {
  createInboxItemAction,
  markInboxProcessedAction,
} from "@/lib/actions/inbox";
import { getUnprocessedInbox } from "@/lib/db/inbox";

setupTempDb();

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const projectInput = {
  title: "Base active project",
  description: "",
  status: "active" as const,
  priority: "P0" as const,
  deadline: null as string | null,
  current_stage: "",
  next_action: "",
  notes: "",
};

const taskInput = {
  title: "",
  description: "",
  project_id: null as string | null,
  status: "todo" as const,
  priority: "P2" as const,
  due_date: null as string | null,
};

describe("today dashboard queries", () => {
  it("lists open tasks due today or overdue, never done ones", async () => {
    const end = endOfToday();
    await createTaskAction({
      ...taskInput,
      title: "due today",
      due_date: new Date(end.getTime() - 1000).toISOString(),
    });
    await createTaskAction({
      ...taskInput,
      title: "overdue",
      due_date: new Date(Date.now() - 86400_000).toISOString(),
    });
    await createTaskAction({
      ...taskInput,
      title: "tomorrow",
      due_date: new Date(end.getTime() + 1000).toISOString(),
    });
    await createTaskAction({
      ...taskInput,
      title: "done today",
      status: "done",
      due_date: new Date(end.getTime() - 1000).toISOString(),
    });

    const today = await getTodayTasks();
    expect(today.map((t) => t.title).sort()).toEqual(["due today", "overdue"]);
  });

  it("lists project deadlines within the next 14 days, sorted soonest-first", async () => {
    const in3d = new Date(Date.now() + 3 * 86400_000).toISOString();
    const in10d = new Date(Date.now() + 10 * 86400_000).toISOString();
    const in30d = new Date(Date.now() + 30 * 86400_000).toISOString();

    await createProjectAction({ ...projectInput, title: "later", deadline: in10d });
    await createProjectAction({ ...projectInput, title: "sooner", deadline: in3d });
    await createProjectAction({ ...projectInput, title: "too far", deadline: in30d });
    await createProjectAction({
      ...projectInput,
      title: "archived soon",
      deadline: in3d,
      status: "archived",
    });

    const deadlines = await getUpcomingDeadlines();
    expect(deadlines.map((p) => p.title)).toEqual(["sooner", "later"]);
  });

  it("lists active projects only, most recently updated first", async () => {
    await createProjectAction(projectInput);
    await createProjectAction({ ...projectInput, title: "Paused one", status: "paused" });
    await createProjectAction({ ...projectInput, title: "Active two" });

    const active = await getActiveProjects();
    expect(active.map((p) => p.title)).toEqual(["Active two", "Base active project"]);
  });

  it("previews the latest unprocessed inbox items", async () => {
    await createInboxItemAction("oldest");
    await createInboxItemAction("middle");
    await createInboxItemAction("newest");
    await createInboxItemAction("processed one");
    const [processed] = await getUnprocessedInbox();
    await markInboxProcessedAction(processed.id);

    const items = await getRecentInbox(2);
    expect(items.map((i) => i.content)).toEqual(["newest", "middle"]);
    expect(items.every((item) => item.status === "unprocessed")).toBe(true);
  });
});
