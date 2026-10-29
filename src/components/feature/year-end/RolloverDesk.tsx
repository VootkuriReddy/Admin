import { useMemo, useState } from "react";
import { Button, ConfirmModal, Field, PanelTable } from "../../ui";
import type { PanelColumn } from "../../ui";
import {
  rollYearBalances,
  type YearEndOutcome,
} from "../../../features/balances/yearEnd";
import { currentYear } from "../../../features/balances/provisioning";
import { POLICY } from "../../../constants";
import { fmtDays } from "../../../utils/format";
import type { BalanceRow, DirectoryUser } from "../../../types/models";
import { IconRefresh } from "../../Icons";

export interface RolloverDeskProps {
  users: DirectoryUser[];
  balances: BalanceRow[];
  runs: string[];
  /** Runs the rollout; page persists via the store and toasts the result. */
  onExecute: (nextRows: BalanceRow[], fromYear: number) => Promise<void>;
}

/** ORGANISM — year picker, rollout plan, skipped list, history and confirm. */
export function RolloverDesk({
  users,
  balances,
  runs,
  onExecute,
}: RolloverDeskProps) {
  const [fromYear, setFromYear] = useState(currentYear());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const outcome: YearEndOutcome = useMemo(
    () => rollYearBalances(users, balances, fromYear),
    [users, balances, fromYear],
  );
  const toYear = fromYear + 1;

  const execute = async () => {
    setBusy(true);
    await onExecute(outcome.rows, fromYear);
    setBusy(false);
    setConfirming(false);
  };

  const columns: PanelColumn<BalanceRow>[] = [
    {
      label: "Person",
      cell: (row) =>
        users.find((u) => u.user_id === row.user_id)?.full_name ?? row.user_id,
    },
    {
      label: "Remainder",
      cell: (row) => {
        const src = balances.find(
          (b) => b.user_id === row.user_id && b.year === fromYear,
        );
        const leftover = src
          ? Math.max(
              0,
              src.annualCredited + src.carriedForward - src.annualUsed,
            )
          : 0;
        const carried = Math.min(leftover, POLICY.CarryForwardCap * 2);
        return (
          <span className="mono">
            {carried / 2}d{" "}
            {carried < leftover ? (
              <span className="muted">(capped from {fmtDays(leftover)}d)</span>
            ) : null}
            {carried === 0 ? (
              <span className="muted"> · none banked</span>
            ) : null}
          </span>
        );
      },
    },
    {
      label: "Contingency in",
      cell: () => <span className="mono">resets to 10d</span>,
    },
    { label: "Comp-off", cell: () => <span className="mono">cleared</span> },
  ];

  return (
    <>
      <div className="yearbar">
        <Field label="Close year" htmlFor="ye-year">
          <select
            id="ye-year"
            className="select"
            value={fromYear}
            onChange={(e) => setFromYear(Number(e.target.value))}
          >
            {Array.from({ length: 6 }, (_, i) => currentYear() - i).map((y) => (
              <option key={y} value={y}>
                {y} → {y + 1}
              </option>
            ))}
          </select>
        </Field>
        <div className="yearbar__grow muted" style={{ fontSize: 12.5 }}>
          {balances.filter((b) => b.year === fromYear).length} source rows ·{" "}
          {outcome.rows.length} people will roll over ·{" "}
          {fmtDays(outcome.totalCarried)}d total banked
        </div>
        <Button
          onClick={() => setConfirming(true)}
          disabled={outcome.rows.length === 0}
        >
          <IconRefresh size={16} /> Run year-end
        </Button>
      </div>

      <div className="hl-cols">
        <PanelTable
          title={`Rollout plan · ${fromYear} → ${toYear}`}
          count={`${outcome.rows.length} READY`}
          columns={columns}
          rows={outcome.rows}
          rowKey={(row) => row.user_id}
          empty="Nothing to roll over for this year."
        />

        <div className="card">
          <div className="hl-panel-head">
            <h3>Skipped</h3>
            <span className="hl-count">{outcome.skipped.length}</span>
          </div>
          <div className="table-scroll">
            <table className="table">
              <tbody>
                {outcome.skipped.length === 0 ? (
                  <tr>
                    <td className="table__empty">
                      Nobody skipped — everyone active has a source row.
                    </td>
                  </tr>
                ) : (
                  outcome.skipped.map((name, i) => (
                    <tr key={i}>
                      <td>{name}</td>
                      <td className="mono muted" style={{ textAlign: "right" }}>
                        inactive / no row
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dash-outbox card" style={{ marginTop: 16 }}>
        <div className="hl-panel-head" style={{ borderBottom: "none" }}>
          <h3>Rollover history</h3>
          <span className="hl-count">{runs.length} RUNS</span>
        </div>
        {runs.length === 0 ? (
          <div className="dash-outbox__item">
            <div className="dash-outbox__msg">
              No year-end rollout has run on this console yet.
            </div>
          </div>
        ) : (
          [...runs].reverse().map((run, i) => (
            <div className="dash-outbox__item" key={`${run}-${i}`}>
              <div className="dash-outbox__to">ROLLOVER · {run}</div>
              <div className="dash-outbox__when">
                balances regenerated for the new year
              </div>
            </div>
          ))
        )}
      </div>

      {confirming && (
        <ConfirmModal
          title={`Close ${fromYear} and open ${toYear}?`}
          text={`${outcome.rows.length} people get new pools with up to 10 d carried forward (${fmtDays(outcome.totalCarried)}d total). Contingency and comp-off reset. This cannot be undone from the console.`}
          confirmLabel="Run the rollout"
          busy={busy}
          danger
          onConfirm={execute}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
}
