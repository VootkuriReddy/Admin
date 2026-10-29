import type { BalanceRow } from "../types/models";
import { loadDb, patchDb } from "../mocks/localDb";
import { trySync, type ServiceEnvelope } from "./envelope";

export function listBalances(): ServiceEnvelope<BalanceRow[]> {
  return trySync([], () => loadDb().balances);
}

/** Upsert one user's row for a year (add-user provisioning / admin edit). */
export function provisionRow(row: BalanceRow): ServiceEnvelope<BalanceRow> {
  return trySync(row, () => {
    patchDb((draft) => {
      const existing = draft.balances.find(
        (b) => b.user_id === row.user_id && b.year === row.year,
      );
      if (existing) Object.assign(existing, row);
      else draft.balances.push(row);
    });
    return row;
  });
}

/** Rollover: replace the following year's rows with the rolled-over ones. */
export function applyYearEnd(
  nextRows: BalanceRow[],
  fromYear: number,
): ServiceEnvelope<BalanceRow[]> {
  const toYear = fromYear + 1;
  return trySync(nextRows, () => {
    patchDb((draft) => {
      draft.balances = draft.balances.filter((b) => b.year !== toYear);
      draft.balances.push(...nextRows);
      const stamp = `${fromYear} → ${toYear}`;
      if (!draft.yearEndRuns.includes(stamp)) draft.yearEndRuns.push(stamp);
    });
    return nextRows;
  });
}

export function listYearEndRuns(): ServiceEnvelope<string[]> {
  return trySync([], () => loadDb().yearEndRuns);
}
