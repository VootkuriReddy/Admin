import { rollYearBalances } from "../src/features/balances/yearEnd";
import type { BalanceRow, DirectoryUser } from "../src/types/models";

const user = (
  id: string,
  status: DirectoryUser["status"] = "Active",
): DirectoryUser => ({
  user_id: id,
  emp_no: `EMP-${id}`,
  full_name: `Person ${id}`,
  email: `${id}@emids.com`,
  role: "employee",
  status,
  job_title: "Engineer",
  manager_id: null,
  joined_on: "2020-02-01",
  added_on: "2020-02-01",
  password_set: true,
});

function row(id: string, over: Partial<BalanceRow> = {}): BalanceRow {
  return {
    user_id: id,
    year: 2026,
    annualCredited: 48,
    carriedForward: 0,
    annualUsed: 0,
    contingencyCredited: 20,
    contingencyUsed: 0,
    compOffTaken: 0,
    ...over,
  };
}

describe("year-end rollover", () => {
  it("opens next year with full pools and banks leftover annual under the cap", () => {
    const users = [user("u1"), user("u2")];
    const rows = [
      row("u1", { annualUsed: 12, carriedForward: 8 }), // remainder 44 units → capped 20
      row("u2", { annualCredited: 20, annualUsed: 6 }), // remainder 14 units → banked as-is
    ];
    const result = rollYearBalances(users, rows, 2026);
    expect(result.rows).toHaveLength(2);
    const next = result.rows.find((r) => r.user_id === "u1")!;
    expect(next.year).toBe(2027);
    expect(next.annualCredited).toBe(48);
    expect(next.carriedForward).toBe(20);
    expect(result.rows.find((r) => r.user_id === "u2")!.carriedForward).toBe(
      14,
    );
    expect(result.totalCarried).toBe(34);
    expect(
      result.rows.every(
        (r) => r.generated_by === "year-end" && r.annualUsed === 0,
      ),
    ).toBe(true);
  });

  it("skips inactive people and those without a source row", () => {
    const users = [user("u1", "Inactive"), user("u2")];
    const rows = [row("u1")];
    const result = rollYearBalances(users, rows, 2026);
    expect(result.rows).toHaveLength(0);
    expect(result.skipped).toEqual(["Person u1", "Person u2"]);
  });
});
