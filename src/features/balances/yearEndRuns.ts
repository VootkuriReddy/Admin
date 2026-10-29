import { listYearEndRuns } from "../../services/balances";

/** All "2025 → 2026" stamps, in run order. */
export function allRuns(): string[] {
  return listYearEndRuns().data;
}

/** Stamp of the most recent year-end rollout, or "Not run yet". */
export function lastYearEndLabel(): string {
  const runs = allRuns();
  return runs.length > 0 ? runs[runs.length - 1]! : "Not run yet";
}
