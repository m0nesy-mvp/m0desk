import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("request boundary", () => {
  it("allows local SQLite requests without Supabase environment variables", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/today"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
