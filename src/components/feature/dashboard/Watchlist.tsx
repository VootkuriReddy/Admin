import { IconAlertTriangle, IconClock } from "../../Icons";
import { fmtDate } from "../../../utils/dates";
import type { ManagerNudge } from "../../../features/notifications/nudge";

export interface LowPoolRow {
  name: string;
  remaining: string;
  total: string;
  tag: string;
}

export interface WatchlistProps {
  currentYear: number;
  stalest: ManagerNudge | null;
  lowPool: LowPoolRow[];
  onNudge: () => void;
}

/** ORGANISM — the live side rail: year state, stalest queue, tightest pools. */
export function Watchlist({
  currentYear,
  stalest,
  lowPool,
  onNudge,
}: WatchlistProps) {
  return (
    <div className="dash-pulse card">
      <div className="hl-panel-head" style={{ borderBottom: "none" }}>
        <h3>Watchlist</h3>
        <span className="hl-count">LIVE</span>
      </div>
      <div className="dash-pulse__row">
        <span className="dash-pulse__dot" />
        <span className="dash-pulse__text">
          Allocation year <b>{currentYear}</b> is open; policy pools are
          current.
        </span>
      </div>
      {stalest ? (
        <button className="dash-pulse__row" onClick={onNudge}>
          <span className="dash-pulse__dot dash-pulse__dot--amber" />
          <span className="dash-pulse__text">
            <IconAlertTriangle
              size={12}
              style={{ verticalAlign: -2, marginRight: 4 }}
            />
            {stalest.manager.full_name} holds {stalest.requests.length} pending
            request{stalest.requests.length > 1 ? "s" : ""} — oldest{" "}
            {stalest.oldestSubmitted ? fmtDate(stalest.oldestSubmitted) : "n/a"}
            .
          </span>
          <span className="dash-pulse__when">NUDGE →</span>
        </button>
      ) : null}
      {lowPool.map((row) => (
        <div className="dash-pulse__row" key={row.name}>
          <span className="dash-pulse__dot" />
          <span className="dash-pulse__text">
            <IconClock
              size={12}
              style={{ verticalAlign: -2, marginRight: 4 }}
            />
            {row.name} — {row.remaining}d left of {row.total}d annual.
          </span>
          <span className="dash-pulse__when">{row.tag}</span>
        </div>
      ))}
    </div>
  );
}
