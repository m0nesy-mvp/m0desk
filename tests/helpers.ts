import { beforeEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { resetDbForTests } from "@/lib/db/connection";

let counter = 0;

/**
 * Point the SQLite singleton at a fresh throwaway file before every test,
 * so each test starts from a clean database.
 */
export function setupTempDb() {
  beforeEach(() => {
    process.env.M0DESK_DB_PATH = path.join(
      os.tmpdir(),
      `m0desk-test-${process.pid}-${counter++}.db`,
    );
    resetDbForTests();
  });
}
