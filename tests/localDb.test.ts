import { beforeEach, describe, expect, it } from "vitest";
import { loadDb, patchDb, resetDb, saveDb } from "../src/mocks/localDb";
import type { DirectoryUser } from "../src/types/models";

describe("local mock database", () => {
  beforeEach(() => {
    resetDb();
  });

  it("resolves the seed fixtures on a clean store", () => {
    const db = loadDb();
    expect(db.users.length).toBeGreaterThan(0);
    expect(db.balances.length).toBeGreaterThan(0);
    expect(db.leaves.some((l) => l.status === "Pending")).toBe(true);
    expect(db.notices).toHaveLength(1);
  });

  it("persists a mutation through patchDb", () => {
    patchDb((draft) => {
      draft.notices.push({
        id: "no-test",
        to_user_ids: ["u-m1"],
        to_label: "Rohan Fernandes",
        subject: "ping",
        message: "decide the queue",
        sent_on: "2026-10-29",
        channel: "email+app",
      });
    });
    expect(loadDb().notices.some((n) => n.id === "no-test")).toBe(true);
  });

  it("recovers from corrupt json with a fresh seed", () => {
    saveDb({
      users: [],
      balances: [],
      leaves: [],
      notices: [],
      yearEndRuns: [],
    });
    expect(loadDb().users).toHaveLength(0);
    try {
      window.localStorage.setItem("admin-console-db", "{{{not json");
    } catch {
      // jsdom storage is synchronous and always available
    }
    expect(loadDb().users.length).toBeGreaterThan(0);
  });

  it("resetDb restores the full seed", () => {
    patchDb((draft) => {
      const stale: DirectoryUser = draft.users[0]!;
      stale.status = "Inactive";
    });
    resetDb();
    expect(loadDb().users[0]!.status).toBe("Active");
  });
});
