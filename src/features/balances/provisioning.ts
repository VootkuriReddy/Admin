import { POLICY } from "../../constants";
import { wholeMonthsFrom, yearOf, todayISO } from "../../utils/dates";
import type { BalanceRow } from "../../types/models";

/**
 * DOJ-based pro-rata for a fresh allocation year.
 *
 * Annual entitlement accrues monthly from the month of joining; somebody who
 * joined in June of the allocation year gets the remaining months' share. Someone
 * already on the books last year gets the full pool. Half-day units are kept
 * throughout — half a day (1 unit) is the smallest step.
 *
 * Contingency is NOT granted at provisioning: new users start at 0 and grants
 * are handled outside this module.
 */
export function proRataAllocationFor(
  doj: string,
  year: number,
): { annualCredited: number; contingencyCredited: number } {
  const annualHalfTotal = POLICY.AnnualTotal * 2;
  if (yearOf(doj) < year) {
    return { annualCredited: annualHalfTotal, contingencyCredited: 0 };
  }
  if (yearOf(doj) > year) {
    return { annualCredited: 0, contingencyCredited: 0 };
  }
  const monthsIn = Math.min(12, wholeMonthsFrom(`${year}-01-01`, doj));
  const monthsLeft = Math.max(0, 12 - monthsIn);
  const annualCredited = Math.max(
    2,
    Math.round((annualHalfTotal / 12) * monthsLeft),
  );
  return { annualCredited, contingencyCredited: 0 };
}

/**
 * Provision (or top-up if not provisioned yet) a balance row for a user for
 * `year`, driven purely by date of joining. Decided-but-unsubmitted rows are
 * never touched; this only fills the credited side.
 */
export function buildProvisionRow(
  userPick: { user_id: string; joined_on: string },
  year: number,
): BalanceRow {
  const { annualCredited } = proRataAllocationFor(userPick.joined_on, year);
  return {
    user_id: userPick.user_id,
    year,
    annualCredited,
    carriedForward: 0,
    annualUsed: 0,
    contingencyCredited: 0,
    contingencyUsed: 0,
    compOffTaken: 0,
    generated_by: "doj-provision",
  };
}

/** Remaining annual-days figure (half-day store, displayed days). */
export function remainingAnnual(
  row: Pick<BalanceRow, "annualCredited" | "carriedForward" | "annualUsed">,
): number {
  return row.annualCredited + row.carriedForward - row.annualUsed;
}

export function remainingContingency(
  row: Pick<BalanceRow, "contingencyCredited" | "contingencyUsed">,
): number {
  return row.contingencyCredited - row.contingencyUsed;
}

export function currentYear(): number {
  return yearOf(todayISO());
}
