import { fmtDate } from "../../../utils/dates";
import type { AdminNotice } from "../../../types/models";

export interface NudgeOutboxProps {
  notices: AdminNotice[];
  limit?: number;
}

/** ORGANISM — the "nudges sent" log card (shared, compact variant). */
export function NudgeOutbox({ notices, limit = 6 }: NudgeOutboxProps) {
  return (
    <div className="dash-outbox card" style={{ marginTop: 18 }}>
      <div className="hl-panel-head" style={{ borderBottom: "none" }}>
        <h3>Outbox — nudges sent</h3>
        <span className="hl-count">{notices.length} TOTAL</span>
      </div>
      {[...notices]
        .sort((a, b) => b.sent_on.localeCompare(a.sent_on))
        .slice(0, limit)
        .map((n) => (
          <div className="dash-outbox__item" key={n.id}>
            <div className="dash-outbox__to">
              TO {n.to_label || "ALL MANAGERS"} · {fmtDate(n.sent_on)}
            </div>
            <div
              className="dash-outbox__msg"
              style={{ color: "var(--ink)", fontWeight: 600 }}
            >
              {n.subject}
            </div>
            <div className="dash-outbox__when">{n.message}</div>
          </div>
        ))}
      {notices.length === 0 && (
        <div className="dash-outbox__item">
          <div className="dash-outbox__msg">No nudges sent yet.</div>
        </div>
      )}
    </div>
  );
}
