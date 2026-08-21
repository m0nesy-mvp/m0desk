import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { getInboxItems, getUnprocessedInbox } from "@/lib/db/inbox";
import {
  createInboxItemAction,
  deleteInboxItemAction,
  markInboxProcessedAction,
  updateInboxItemAction,
} from "@/lib/actions/inbox";

setupTempDb();

describe("inbox", () => {
  it("captures an item (newest first)", async () => {
    const res = await createInboxItemAction("Understand MCP vs Tool Calling");
    expect(res.error).toBeNull();
    await createInboxItemAction("Buy a second monitor");

    const items = await getInboxItems();
    expect(items).toHaveLength(2);
    expect(items[0].content).toBe("Buy a second monitor");
    expect(items[0].status).toBe("unprocessed");
  });

  it("rejects empty content", async () => {
    const res = await createInboxItemAction("   ");
    expect(res.error).toBe("Content is required.");
  });

  it("edits an item", async () => {
    await createInboxItemAction("old text");
    const [item] = await getUnprocessedInbox();

    const res = await updateInboxItemAction(item.id, "new text");
    expect(res.error).toBeNull();

    const [updated] = await getUnprocessedInbox();
    expect(updated.content).toBe("new text");
  });

  it("marks an item processed", async () => {
    await createInboxItemAction("do it");
    const [item] = await getUnprocessedInbox();

    const res = await markInboxProcessedAction(item.id);
    expect(res.error).toBeNull();
    expect(await getUnprocessedInbox()).toHaveLength(0);

    const all = await getInboxItems();
    expect(all.find((i) => i.id === item.id)?.status).toBe("processed");
  });

  it("deletes an item", async () => {
    await createInboxItemAction("delete me");
    const [item] = await getInboxItems();

    const res = await deleteInboxItemAction(item.id);
    expect(res.error).toBeNull();
    expect(await getInboxItems()).toHaveLength(0);
  });
});
