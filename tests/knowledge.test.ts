import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { getKnowledge, getKnowledgeEntry } from "@/lib/db/knowledge";
import {
  createKnowledgeAction,
  deleteKnowledgeAction,
  updateKnowledgeAction,
} from "@/lib/actions/knowledge";
import { createProjectAction } from "@/lib/actions/projects";

setupTempDb();

const input = {
  title: "MCP — Model Context Protocol",
  summary: "A protocol for LLM tool calling",
  content: "# MCP\n\nKey concepts…",
  category: "AI Engineering",
  tags: ["mcp", "protocol", "tools"],
  status: "learning" as const,
  project_id: null as string | null,
};

describe("knowledge", () => {
  it("creates and reads an entry with tags round-tripping", async () => {
    const res = await createKnowledgeAction(input);
    expect(res.error).toBeNull();

    const k = await getKnowledgeEntry(res.id!);
    expect(k?.title).toBe(input.title);
    expect(k?.tags).toEqual(["mcp", "protocol", "tools"]);
    expect(k?.category).toBe("AI Engineering");
    expect(k?.status).toBe("learning");
  });

  it("rejects an empty title", async () => {
    const res = await createKnowledgeAction({ ...input, title: " " });
    expect(res.error).toBe("Title is required.");
  });

  it("updates an entry", async () => {
    const created = await createKnowledgeAction(input);
    const res = await updateKnowledgeAction(created.id!, {
      ...input,
      title: "Verifier",
      tags: ["verifier"],
      status: "understood",
    });
    expect(res.error).toBeNull();

    const k = await getKnowledgeEntry(created.id!);
    expect(k?.title).toBe("Verifier");
    expect(k?.tags).toEqual(["verifier"]);
    expect(k?.status).toBe("understood");
  });

  it("links an entry to a project", async () => {
    const p = await createProjectAction({
      title: "Skill Eval",
      description: "",
      status: "active",
      priority: "P0",
      deadline: null,
      current_stage: "",
      next_action: "",
      notes: "",
    });
    const created = await createKnowledgeAction({ ...input, project_id: p.id! });
    expect(created.error).toBeNull();

    const list = await getKnowledge();
    expect(list.find((k) => k.id === created.id)?.project_id).toBe(p.id);
  });

  it("deletes an entry", async () => {
    const created = await createKnowledgeAction(input);
    const res = await deleteKnowledgeAction(created.id!);
    expect(res.error).toBeNull();
    expect(await getKnowledge()).toHaveLength(0);
  });
});
