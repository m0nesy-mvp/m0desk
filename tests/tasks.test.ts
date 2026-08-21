import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

const { RedirectError } = vi.hoisted(() => {
  class RedirectError extends Error {
    url: string;
    constructor(url: string) {
      super(`redirect:${url}`);
      this.url = url;
    }
  }
  return { RedirectError };
});
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
}));

import { getTasks } from "@/lib/db/tasks";
import { allPlain } from "@/lib/db/connection";
import { createProjectAction, deleteProjectAction } from "@/lib/actions/projects";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/lib/actions/tasks";

setupTempDb();

const taskInput = {
  title: "Finish framework design",
  description: "",
  project_id: null as string | null,
  status: "todo" as const,
  priority: "P0" as const,
  due_date: null,
};

const projectInput = {
  title: "Skill Eval Framework",
  description: "",
  status: "active" as const,
  priority: "P0" as const,
  deadline: null,
  current_stage: "",
  next_action: "",
  notes: "",
};

describe("tasks", () => {
  it("creates a task and joins the project title", async () => {
    const p = await createProjectAction(projectInput);
    const res = await createTaskAction({
      ...taskInput,
      title: "Write the schema",
      project_id: p.id!,
    });
    expect(res.error).toBeNull();
    expect(res.id).toBeTruthy();

    const tasks = await getTasks();
    const t = tasks.find((x) => x.id === res.id);
    expect(t?.title).toBe("Write the schema");
    expect(t?.project?.title).toBe("Skill Eval Framework");
  });

  it("orders tasks by due date, nulls last", async () => {
    await createTaskAction({
      ...taskInput,
      title: "no date",
      due_date: null,
    });
    await createTaskAction({
      ...taskInput,
      title: "later",
      due_date: new Date(Date.now() + 10 * 86400_000).toISOString(),
    });
    await createTaskAction({
      ...taskInput,
      title: "sooner",
      due_date: new Date(Date.now() + 86400_000).toISOString(),
    });

    const tasks = await getTasks();
    expect(tasks.map((t) => t.title)).toEqual(["sooner", "later", "no date"]);
  });

  it("rejects an empty title", async () => {
    const res = await createTaskAction({ ...taskInput, title: "" });
    expect(res.error).toBe("Title is required.");
  });

  it("updates a task", async () => {
    const created = await createTaskAction(taskInput);
    const res = await updateTaskAction(created.id!, {
      ...taskInput,
      title: "Renamed task",
      status: "doing",
      priority: "P1",
    });
    expect(res.error).toBeNull();

    const [t] = (await getTasks()).filter((x) => x.id === created.id);
    expect(t?.title).toBe("Renamed task");
    expect(t?.status).toBe("doing");
  });

  it("toggles a task done and back", async () => {
    const created = await createTaskAction(taskInput);

    await toggleTaskAction(created.id!, true);
    let t = (await getTasks()).find((x) => x.id === created.id);
    expect(t?.status).toBe("done");
    expect(t?.completed_at).toBeTruthy();

    await toggleTaskAction(created.id!, false);
    t = (await getTasks()).find((x) => x.id === created.id);
    expect(t?.status).toBe("todo");
    expect(t?.completed_at).toBeNull();
  });

  it("sets project_id to null when the project is deleted (FK)", async () => {
    const p = await createProjectAction(projectInput);
    const t = await createTaskAction({ ...taskInput, project_id: p.id! });

    await deleteProjectAction(p.id!).catch(() => {});

    const rows = allPlain<{ project_id: string | null }>(
      "SELECT project_id FROM tasks WHERE id = ?",
      t.id!,
    );
    expect(rows[0]?.project_id).toBeNull();
  });

  it("deletes a task", async () => {
    const created = await createTaskAction(taskInput);
    const res = await deleteTaskAction(created.id!);
    expect(res.error).toBeNull();
    expect(await getTasks()).toHaveLength(0);
  });
});
