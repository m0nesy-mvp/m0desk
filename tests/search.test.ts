import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { searchAll } from "@/lib/db/search";
import { createKnowledgeAction } from "@/lib/actions/knowledge";
import { createProjectAction } from "@/lib/actions/projects";
import { createTaskAction } from "@/lib/actions/tasks";
import { createLibraryItemAction } from "@/lib/actions/library";
import { createInboxItemAction } from "@/lib/actions/inbox";

setupTempDb();

const projectInput = {
  title: "",
  description: "",
  status: "active" as const,
  priority: "P0" as const,
  deadline: null,
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
  due_date: null,
};

const knowledgeInput = {
  title: "",
  summary: "",
  content: "",
  category: "",
  tags: [] as string[],
  status: "learning" as const,
  project_id: null as string | null,
};

const libraryInput = {
  title: "",
  type: "paper" as const,
  url: "",
  description: "",
  tags: [] as string[],
  status: "unread" as const,
  project_id: null as string | null,
};

describe("search", () => {
  it("returns grouped results across all entity types", async () => {
    await createProjectAction({ ...projectInput, title: "Skill Eval Framework" });
    await createTaskAction({ ...taskInput, title: "Read MCP docs" });
    await createKnowledgeAction({
      ...knowledgeInput,
      title: "MCP Fundamentals",
      summary: "Model Context Protocol basics",
    });
    await createLibraryItemAction({
      ...libraryInput,
      title: "MCP Documentation",
      url: "https://modelcontextprotocol.io",
    });
    await createInboxItemAction("Understand MCP vs Tool Calling");

    const results = await searchAll("mcp");

    expect(results.projects.map((p) => p.title)).toEqual([]);
    expect(results.tasks.map((t) => t.title)).toEqual(["Read MCP docs"]);
    expect(results.knowledge.map((k) => k.title)).toEqual(["MCP Fundamentals"]);
    expect(results.library.map((l) => l.title)).toEqual(["MCP Documentation"]);
    expect(results.inbox.map((i) => i.content)).toEqual([
      "Understand MCP vs Tool Calling",
    ]);
  });

  it("matches project fields beyond the title", async () => {
    await createProjectAction({
      ...projectInput,
      title: "Paper Research",
      next_action: "Read the verifier survey",
    });
    const results = await searchAll("verifier");
    expect(results.projects.map((p) => p.title)).toEqual(["Paper Research"]);
  });

  it("searches knowledge by tag", async () => {
    await createKnowledgeAction({
      ...knowledgeInput,
      title: "Some entry",
      tags: ["transformer"],
    });
    const results = await searchAll("transformer");
    expect(results.knowledge).toHaveLength(1);
    expect(results.knowledge[0]?.tags).toEqual(["transformer"]);

    const partial = await searchAll("former");
    expect(partial.knowledge).toHaveLength(0);
  });

  it("escapes LIKE wildcards so literals match exactly", async () => {
    await createKnowledgeAction({
      ...knowledgeInput,
      title: "50% of the work",
      tags: [],
    });
    await createKnowledgeAction({
      ...knowledgeInput,
      title: "50X of something",
      tags: [],
    });

    const results = await searchAll("50%");
    expect(results.knowledge.map((k) => k.title)).toEqual(["50% of the work"]);
  });

  it("returns nothing for an empty query", async () => {
    const results = await searchAll("   ");
    expect(results).toEqual({
      projects: [],
      tasks: [],
      knowledge: [],
      library: [],
      inbox: [],
    });
  });

  it("returns nothing when there is no match", async () => {
    const results = await searchAll("zzz-no-such-thing");
    expect(results.knowledge).toHaveLength(0);
  });
});
