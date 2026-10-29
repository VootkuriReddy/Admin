import {
  buildProvisionRow,
  proRataAllocationFor,
  remainingAnnual,
} from "../src/features/balances/provisioning";

describe("DOJ-based pro-rata allocation", () => {
  it("gives the full pool to someone who joined in an earlier year", () => {
    const result = proRataAllocationFor("2021-05-04", 2026);
    expect(result.annualCredited).toBe(48);
    expect(result.contingencyCredited).toBe(0);
  });

  it("gives nothing for a joining date in a later year", () => {
    expect(proRataAllocationFor("2028-01-01", 2026).annualCredited).toBe(0);
  });

  it("pro-rates within the allocation year by months remaining", () => {
    // June 2026 join → 5 whole months served, Jul..Dec = 7 months left
    // → 24 d * 7/12 = 14 d = 28 units
    const midYear = proRataAllocationFor("2026-06-14", 2026);
    expect(midYear.annualCredited).toBe(28);
    expect(midYear.contingencyCredited).toBe(0);
  });

  it("floors the annual allocation at one day so nobody gets nothing", () => {
    const late = proRataAllocationFor("2026-12-01", 2026);
    expect(late.annualCredited).toBeGreaterThanOrEqual(2);
  });

  it("builds a fresh row with zero take-up", () => {
    const row = buildProvisionRow(
      { user_id: "u-x", joined_on: "2024-01-15" },
      2026,
    );
    expect(row.annualUsed).toBe(0);
    expect(row.carriedForward).toBe(0);
    expect(row.generated_by).toBe("doj-provision");
  });

  it("remaining annual nets credited + carried over take-up", () => {
    expect(
      remainingAnnual({
        annualCredited: 40,
        carriedForward: 6,
        annualUsed: 10,
      }),
    ).toBe(36);
  });
});
