import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../store/AdminContext";
import { PageHead, StatTile } from "../components/ui";
import { NAV } from "../components/Layout";
import { OperatorMoves } from "../components/feature/dashboard/OperatorMoves";
import { Watchlist } from "../components/feature/dashboard/Watchlist";
import { buildNudgeQueue } from "../features/notifications/nudge";
import { fmtDate } from "../utils/dates";
import { lastYearEndLabel } from "../features/balances/yearEndRuns";
import { IconMail } from "../components/Icons";

const OPS = NAV.filter((n) => n.to !== "/dashboard");

export default function Dashboard() {
  const { users, balances, leaves, notices } = useAdmin();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const people = users.filter((u) => u.status === "Active");
  const managers = people.filter((u) => u.role === "manager");
  const pending = leaves.filter((l) => l.status === "Pending");
  const stalest = buildNudgeQueue(users, pending)[0] ?? null;

  const openers = useMemo(
    () =>
      users
        .filter((u) => u.status === "Active")
        .sort((a, b) => b.added_on.localeCompare(a.added_on))
        .slice(0, 5),
    [users],
  );

  const lowPool = useMemo(
    () =>
      balances
        .filter((b) => b.year === currentYear)
        .sort(
          (a, b) =>
            a.annualCredited +
            a.carriedForward -
            a.annualUsed -
            (b.annualCredited + b.carriedForward - b.annualUsed),
        )
        .slice(0, 4)
        .map((b) => {
          const person = users.find((u) => u.user_id === b.user_id);
          return {
            name: person?.full_name ?? "Unknown",
            remaining: String(
              (b.annualCredited + b.carriedForward - b.annualUsed) / 2,
            ),
            total: String((b.annualCredited + b.carriedForward) / 2),
            tag: b.generated_by === "year-end" ? "ROLLED" : "PRO-RATED",
          };
        }),
    [balances, users, currentYear],
  );

  return (
    <div className="page">
      <PageHead eyebrow="Administration · Pulse" title="The operating floor">
        The operating floor. Provision people, keep the allocation ledger honest
        and keep manager queues moving.
      </PageHead>

      <div className="dash-strip">
        <StatTile
          value={people.length}
          label={`Active directory headcount · ${currentYear}`}
        />
        <StatTile
          value={managers.length}
          label="Reporting managers with queues"
        />
        <StatTile
          value={pending.length}
          label="Leave requests still pending"
          tone={pending.length > 3 ? "amber" : "default"}
        />
        <StatTile value={lastYearEndLabel()} label="Year-end rollout" />
      </div>

      <div className="dash-grid">
        <div className="dash-rail">
          <OperatorMoves items={OPS} onNavigate={navigate} />

          <div className="dash-outbox card">
            <div className="hl-panel-head" style={{ borderBottom: "none" }}>
              <h3>Recently added to the directory</h3>
              <span className="hl-count">{openers.length} SHOWN</span>
            </div>
            {openers.map((u) => (
              <div className="dash-outbox__item" key={u.user_id}>
                <div className="dash-outbox__to">
                  {u.role} · {u.emp_no}
                </div>
                <div
                  className="dash-outbox__msg"
                  style={{ color: "var(--ink)", fontWeight: 600 }}
                >
                  {u.full_name}{" "}
                  <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>
                    · {u.job_title}
                  </span>
                </div>
                <div className="dash-outbox__when">
                  joined {fmtDate(u.joined_on)} · added {fmtDate(u.added_on)}
                </div>
              </div>
            ))}
            {openers.length === 0 && (
              <div className="dash-outbox__item">
                <div className="dash-outbox__msg">
                  The directory is empty. Start at “New directory entry”.
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="dash-rail">
          <Watchlist
            currentYear={currentYear}
            stalest={stalest}
            lowPool={lowPool}
            onNudge={() => navigate("/reminders")}
          />

          <div className="dash-outbox card">
            <div className="hl-panel-head" style={{ borderBottom: "none" }}>
              <h3>Outbox — last nudges</h3>
              <span className="hl-count">
                <IconMail size={14} style={{ verticalAlign: -2 }} />
              </span>
            </div>
            {[...notices]
              .sort((a, b) => b.sent_on.localeCompare(a.sent_on))
              .slice(0, 4)
              .map((n) => (
                <div className="dash-outbox__item" key={n.id}>
                  <div className="dash-outbox__to">
                    TO {n.to_label || "ALL MANAGERS"}
                  </div>
                  <div className="dash-outbox__msg">{n.subject}</div>
                  <div className="dash-outbox__when">{fmtDate(n.sent_on)}</div>
                </div>
              ))}
            {notices.length === 0 && (
              <div className="dash-outbox__item">
                <div className="dash-outbox__msg">
                  No nudges sent this session.
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
