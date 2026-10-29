import { POLICY } from "../../constants";
import type { BalanceRow, DirectoryUser } from "../../types/models";
import { remainingAnnual } from "./provisioning";

export interface YearEndOutcome {
  rows: BalanceRow[];
  skipped: string[];
  totalCarried: number;
}

/**
 * Year-end balance rollout: for every active employee with a source-year row,
 * close the year and open the next one — full new entitlement, contingency
 * pool reset, comp-off cleared, and annual leftover banked as carry-forward
 * capped at the policy limit. Inactive employees are skipped, as is anyone
 * with carry-forward below a half-day (1 unit).
 */
export function rollYearBalances(
  users: DirectoryUser[],
  rows: BalanceRow[],
  fromYear: number,
): YearEndOutcome {
  const toYear = fromYear + 1;
  const nextRows: BalanceRow[] = [];
  const skipped: string[] = [];
  let totalCarried = 0;

  for (const user of users) {
    if (user.status === "Inactive") {
      skipped.push(user.full_name);
      continue;
    }
    const row = rows.find(
      (r) => r.user_id === user.user_id && r.year === fromYear,
    );
    if (!row) {
      skipped.push(user.full_name);
      continue;
    }
    const leftover = Math.max(0, remainingAnnual(row));
    const carried = Math.min(leftover, POLICY.CarryForwardCap * 2);
    totalCarried += carried;
    nextRows.push({
      user_id: user.user_id,
      year: toYear,
      annualCredited: POLICY.AnnualTotal * 2,
      carriedForward: carried,
      annualUsed: 0,
      contingencyCredited: POLICY.ContingencyMax * 2,
      contingencyUsed: 0,
      compOffTaken: 0,
      generated_by: "year-end",
    });
  }
  return { rows: nextRows, skipped, totalCarried };
}
