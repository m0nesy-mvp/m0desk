import { describe, expect, it, vi } from "vitest";
import { setupTempDb } from "./helpers";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { getTasks } from "@/lib/db/tasks";
import { getProjects } from "@/lib/db/projects";
import { getKnowledge } from "@/lib/db/knowledge";
import { getLibraryItems } from "@/lib/db/library";
import { getUnprocessedInbox } from "@/lib/db/inbox";
import { createInboxItemAction } from "@/lib/actions/inbox";
import { convertInboxItemAction } from "@/lib/actions/convert-inbox";
import { getDb } from "@/lib/db/connection";

setupTempDb();

describe("inbox conversion", () => {
  it.each([
    ["task", "/tasks"],
    ["project", expect.stringMatching(/^\/projects\//)],
    ["knowledge", expect.stringMatching(/^\/knowledge\//)],
    ["library", "/library"],
  ] as const)(
    "converts a capture into a %s",
    async (target, hrefMatcher) => {
      await createInboxItemAction(`capture -> ${target}`);
      const [item] = await getUnprocessedInbox();

      const res = await convertInboxItemAction(item.id, target);
      expect(res.error).toBeNull();
      expect(res.href).toEqual(hrefMatcher);
      expect(await getUnprocessedInbox()).toHaveLength(0);

      if (target === "task") {
        const tasks = await getTasks();
        expect(tasks.some((t) => t.title === `capture -> task`)).toBe(true);
      } else if (target === "project") {
        const projects = await getProjects();
        expect(projects.some((p) => p.title === `capture -> project`)).toBe(
          true,
        );
      } else if (target === "knowledge") {
        const knowledge = await getKnowledge();
        expect(
          knowledge.some((k) => k.title === `capture -> knowledge`),
        ).toBe(true);
      } else {
        const library = await getLibraryItems();
        expect(library.some((l) => l.title === `capture -> library`)).toBe(
          true,
        );
      }
    },
  );

  it("rejects a second conversion of the same item", async () => {
    await createInboxItemAction("already organized");
    const [item] = await getUnprocessedInbox();

    await convertInboxItemAction(item.id, "task");
    const res = await convertInboxItemAction(item.id, "knowledge");
    expect(res.error).toBe("Already processed.");
  });

  it("rejects a missing item", async () => {
    const res = await convertInboxItemAction("does-not-exist", "task");
    expect(res.error).toBe("Inbox item not found.");
  });

  it("rejects an invalid runtime target", async () => {
    const res = await convertInboxItemAction(
      "does-not-matter",
      "invalid" as "task",
    );
    expect(res.error).toBe("Invalid conversion target.");
  });

  it("rolls back the created row when marking the inbox item fails", async () => {
    await createInboxItemAction("must stay atomic");
    const [item] = await getUnprocessedInbox();
    getDb().exec(`
      CREATE TRIGGER fail_processed_update
      BEFORE UPDATE OF status ON inbox_items
      WHEN NEW.status = 'processed'
      BEGIN
        SELECT RAISE(ABORT, 'forced conversion failure');
      END;
    `);

    const res = await convertInboxItemAction(item.id, "task");

    expect(res.error).toContain("forced conversion failure");
    expect(await getTasks()).toHaveLength(0);
    expect(await getUnprocessedInbox()).toHaveLength(1);
  });
});
