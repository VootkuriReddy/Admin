import { useMemo, useState } from "react";
import { useAdmin } from "../store/AdminContext";
import { PageHead, PanelTable, StatusPill } from "../components/ui";
import type { PanelColumn } from "../components/ui";
import { NudgeComposer } from "../components/feature/manager-reminders/NudgeComposer";
import { NudgeOutbox } from "../components/feature/manager-reminders/NudgeOutbox";
import {
  buildNudgeQueue,
  draftNudgeText,
  type ManagerNudge,
} from "../features/notifications/nudge";
import { fmtDate } from "../utils/dates";

export default function Reminders() {
  const { users, leaves, notices, sendNudge, setToast } = useAdmin();
  const queue = useMemo(() => buildNudgeQueue(users, leaves), [users, leaves]);
  const [picks, setPicks] = useState<Set<string>>(
    () => new Set(queue.map((n) => n.manager.user_id)),
  );
  const [subject, setSubject] = useState(() => draftNudgeText(queue).subject);
  const [message, setMessage] = useState(() => draftNudgeText(queue).message);
  const [busy, setBusy] = useState(false);

  const picked = queue.filter((n) => picks.has(n.manager.user_id));

  const toggle = (id: string) => {
    const next = new Set(picks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicks(next);
  };

  const refillCopy = (selected: ManagerNudge[]) => {
    const copy = draftNudgeText(selected.length > 0 ? selected : queue);
    setSubject(copy.subject);
    setMessage(copy.message);
  };

  const send = async () => {
    if (picked.length === 0) {
      setToast("Pick at least one manager to nudge.", "red");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setToast(
        "Subject and message are both needed for email delivery.",
        "red",
      );
      return;
    }
    setBusy(true);
    const res = await sendNudge({
      to_user_ids: picked.map((p) => p.manager.user_id),
      to_label:
        picked.length === 1
          ? picked[0]!.manager.full_name
          : `${picked.length} managers`,
      subject: subject.trim(),
      message: message.trim(),
    });
    setBusy(false);
    if (res.error) {
      setToast(res.error, "red");
      return;
    }
    setToast(
      `Nudge sent to ${picked.length === 1 ? picked[0]!.manager.full_name : `${picked.length} managers`} via email and in-app.`,
    );
  };

  const requestColumns: PanelColumn<ManagerNudge>[] = [
    {
      label: "Manager",
      cell: (n) => (
        <div className="req-name">
          <b>{n.manager.full_name}</b>
          <span>
            {n.manager.emp_no} · {n.manager.job_title}
          </span>
        </div>
      ),
    },
    {
      label: "Pending",
      cell: (n) => (
        <span className="mono">
          {n.requests.length} request{n.requests.length > 1 ? "s" : ""}
        </span>
      ),
    },
    {
      label: "Oldest",
      cell: (n) => (
        <span className="hl-date">
          {n.oldestSubmitted ? (
            <>
              <b>{fmtDate(n.oldestSubmitted)}</b> <span>waiting</span>
            </>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      label: "Hold",
      cell: (n) => {
        const isOn = picks.has(n.manager.user_id);
        return (
          <button
            className={`chip${isOn ? " is-on" : ""}`}
            aria-pressed={isOn}
            onClick={() => toggle(n.manager.user_id)}
          >
            Nudge
          </button>
        );
      },
    },
  ];

  const detailColumns: PanelColumn<{
    request_no: string;
    name: string;
    role_label: string;
    leave_type: string;
    from: string;
    days: number;
  }>[] = [
    {
      label: "Request",
      cell: (r) => <span className="req-id">{r.request_no}</span>,
    },
    {
      label: "Person",
      cell: (r) => (
        <div className="req-name">
          <b>{r.name}</b>
          <span>{r.role_label}</span>
        </div>
      ),
    },
    { label: "Type", cell: (r) => r.leave_type },
    {
      label: "From",
      cell: (r) => <span className="mono">{fmtDate(r.from)}</span>,
    },
    { label: "Days", cell: (r) => <span className="mono">{r.days / 2}</span> },
  ];

  const flatRows = queue.flatMap((n) =>
    n.requests.map((r) => {
      const person = users.find((u) => u.user_id === r.user_id);
      return {
        request_no: r.request_no,
        name: person?.full_name ?? r.user_id,
        role_label: `${person?.emp_no ?? ""} · reports to ${n.manager.full_name}`,
        leave_type: r.leave_type,
        from: r.from,
        days: r.days,
      };
    }),
  );

  return (
    <div className="page">
      <PageHead
        eyebrow="Administration · Manager Reminders"
        title="Nudge the queueholders"
      >
        See who is sitting on pending time-off decisions and send an email +
        in-app nudge without leaving the desk.
      </PageHead>

      {queue.length === 0 ? (
        <div className="strip-note">
          <StatusPill status="Sent" />
          <div>
            <b>All clear</b>No pending leave requests are waiting on any manager
            right now.
          </div>
        </div>
      ) : (
        <>
          <div className="hl-panel-head" style={{ padding: "0 0 10px" }}>
            <h3>Queues holding pending requests</h3>
            <span className="hl-count">{queue.length} MANAGERS</span>
          </div>
          <PanelTable
            title="Pending queue by manager"
            count={`${flatRows.length} REQUESTS`}
            columns={requestColumns}
            rows={queue}
            rowKey={(n) => n.manager.user_id}
            empty="Nothing pending."
          />
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <NudgeComposer
          queue={queue}
          picks={picks}
          onToggle={toggle}
          subject={subject}
          onSubject={setSubject}
          message={message}
          onMessage={setMessage}
          busy={busy}
          onRebuild={() => refillCopy(picked)}
          onSend={send}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <PanelTable
          title="Every pending request in the system"
          count={`${flatRows.length}`}
          columns={detailColumns}
          rows={flatRows}
          rowKey={(r) => r.request_no}
          empty="No pending requests."
        />
      </div>

      <NudgeOutbox notices={notices} />
    </div>
  );
}
