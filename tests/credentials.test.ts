import { beforeEach, describe, expect, it } from "vitest";
import {
  listResetRequests,
  logResetRequest,
  resolveResetRequest,
} from "../src/services/credentials";
import { resetDb } from "../src/mocks/localDb";

describe("credential desk reset requests", () => {
  beforeEach(() => {
    resetDb();
  });

  it("seeds one resolved and two open reports", () => {
    const { data } = listResetRequests();
    expect(data.filter((r) => r.status === "Open")).toHaveLength(2);
    expect(data.some((r) => r.status === "Resolved")).toBe(true);
  });

  it("logs a forgotten-password report as Open for the reporting user", () => {
    const created = logResetRequest("u-e4");
    expect(created.error).toBeNull();
    expect(created.data.status).toBe("Open");
    expect(created.data.user_id).toBe("u-e4");
    expect(
      listResetRequests().data.filter((r) => r.status === "Open"),
    ).toHaveLength(3);
  });

  it("resolving closes the report with a resolution date and keeps history", () => {
    const open = listResetRequests().data.filter((r) => r.status === "Open");
    const target = open[0]!;
    const res = resolveResetRequest(target.id);
    expect(res.error).toBeNull();
    const after = listResetRequests().data.find((r) => r.id === target.id)!;
    expect(after.status).toBe("Resolved");
    expect(after.resolved_on).toBeTruthy();
    expect(after.requested_on).toBe(target.requested_on);
    expect(
      listResetRequests().data.filter((r) => r.status === "Open"),
    ).toHaveLength(open.length - 1);
  });

  it("resolving an unknown id is a soft no-op", () => {
    const result = resolveResetRequest("pwd-nobody");
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });
});
