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

import { getProject, getProjects, getTaskCountsByProject } from "@/lib/db/projects";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/lib/actions/projects";
import { createTaskAction } from "@/lib/actions/tasks";

setupTempDb();

const input = {
  title: "Skill Eval Framework",
  description: "Build a rubric-based evaluation framework",
  status: "active" as const,
  priority: "P0" as const,
  deadline: null,
  current_stage: "Framework Design",
  next_action: "Define Eval Schema",
  notes: "the big one",
};

describe("projects", () => {
  it("creates and reads a project", async () => {
    const res = await createProjectAction(input);
    expect(res.error).toBeNull();
    expect(res.id).toBeTruthy();

    const p = await getProject(res.id!);
    expect(p?.title).toBe("Skill Eval Framework");
    expect(p?.status).toBe("active");
    expect(p?.priority).toBe("P0");
    expect(p?.current_stage).toBe("Framework Design");
    expect(p?.created_at).toBeTruthy();
    expect(p?.updated_at).toBeTruthy();
  });

  it("rejects an empty title", async () => {
    const res = await createProjectAction({ ...input, title: "   " });
    expect(res.error).toBe("Title is required.");
    expect(await getProjects()).toHaveLength(0);
  });

  it("updates a project", async () => {
    const created = await createProjectAction(input);
    const res = await updateProjectAction(created.id!, {
      ...input,
      title: "Renamed Project",
      status: "paused",
      priority: "P1",
    });
    expect(res.error).toBeNull();

    const p = await getProject(created.id!);
    expect(p?.title).toBe("Renamed Project");
    expect(p?.status).toBe("paused");
    expect(p?.priority).toBe("P1");
  });

  it("deletes a project and redirects to /projects", async () => {
    const created = await createProjectAction(input);

    await expect(deleteProjectAction(created.id!)).rejects.toBeInstanceOf(
      RedirectError,
    );
    expect(await getProject(created.id!)).toBeNull();
  });

  it("lists projects newest-first", async () => {
    await createProjectAction(input);
    await createProjectAction({ ...input, title: "Second project" });
    const list = await getProjects();
    expect(list.map((p) => p.title)).toEqual([
      "Second project",
      "Skill Eval Framework",
    ]);
  });

  it("counts tasks per project (done + open)", async () => {
    const p1 = await createProjectAction(input);
    const p2 = await createProjectAction({ ...input, title: "Empty project" });

    await createTaskAction({
      title: "open task",
      description: "",
      project_id: p1.id!,
      status: "todo",
      priority: "P1",
      due_date: null,
    });
    await createTaskAction({
      title: "done task",
      description: "",
      project_id: p1.id!,
      status: "done",
      priority: "P2",
      due_date: null,
    });

    const counts = await getTaskCountsByProject();
    expect(counts[p1.id!]).toBe(2);
    expect(counts[p2.id!]).toBeUndefined();
  });
});
