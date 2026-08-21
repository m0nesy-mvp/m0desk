import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { getLibraryItems } from "@/lib/db/library";
import {
  createLibraryItemAction,
  deleteLibraryItemAction,
  updateLibraryItemAction,
} from "@/lib/actions/library";

setupTempDb();

const input = {
  title: "Attention Is All You Need",
  type: "paper" as const,
  url: "https://arxiv.org/abs/1706.03762",
  description: "The transformer paper",
  tags: ["transformer", "nlp"],
  status: "reading" as const,
  project_id: null as string | null,
};

describe("library", () => {
  it("creates and reads an item with tags round-tripping", async () => {
    const res = await createLibraryItemAction(input);
    expect(res.error).toBeNull();

    const items = await getLibraryItems();
    const item = items.find((i) => i.id === res.id);
    expect(item?.title).toBe(input.title);
    expect(item?.type).toBe("paper");
    expect(item?.url).toBe("https://arxiv.org/abs/1706.03762");
    expect(item?.tags).toEqual(["transformer", "nlp"]);
    expect(item?.status).toBe("reading");
  });

  it("rejects an empty title", async () => {
    const res = await createLibraryItemAction({ ...input, title: "" });
    expect(res.error).toBe("Title is required.");
  });

  it("updates an item", async () => {
    const created = await createLibraryItemAction(input);
    const res = await updateLibraryItemAction(created.id!, {
      ...input,
      title: "Transformer paper",
      status: "finished",
    });
    expect(res.error).toBeNull();

    const items = await getLibraryItems();
    const item = items.find((i) => i.id === created.id);
    expect(item?.title).toBe("Transformer paper");
    expect(item?.status).toBe("finished");
  });

  it("deletes an item", async () => {
    const created = await createLibraryItemAction(input);
    const res = await deleteLibraryItemAction(created.id!);
    expect(res.error).toBeNull();
    expect(await getLibraryItems()).toHaveLength(0);
  });
});
