import { useRef } from "react";
import { useDismiss } from "../../hooks/useDismiss";
import { IconButton } from "../ui";
import { IconX } from "../Icons";
import { fmtDate } from "../../utils/dates";
import type { AdminNotice } from "../../types/models";

export interface NotificationsPanelProps {
  notices: AdminNotice[];
  onDismiss: () => void;
}

/** The outbox log — every nudge this operator has sent, newest last. */
export default function NotificationsPanel({
  notices,
  onDismiss,
}: NotificationsPanelProps): React.ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  useDismiss(ref, { onClose: onDismiss });
  const ordered = [...notices].sort((a, b) =>
    b.sent_on.localeCompare(a.sent_on),
  );

  return (
    <div ref={ref} className="notif-pop" role="dialog" aria-label="Outbox log">
      <div className="pop-bar" />
      <div className="notif-pop__head">
        <span className="eyebrow">Outbox log</span>
        <IconButton label="Close outbox log" onClick={onDismiss}>
          <IconX size={17} />
        </IconButton>
      </div>
      <div className="notif-pop__list">
        {notices.length === 0 ? (
          <div className="notif-pop__empty">
            <b>Nothing sent yet.</b>
            <span>
              Nudges go to managers sitting on pending leave requests.
            </span>
          </div>
        ) : (
          ordered.map((n) => (
            <div
              className="notif-item notif-item--sent"
              style={{ cursor: "default" }}
              key={n.id}
            >
              <div className="notif-item__body">
                <span className="notif-item__title">{n.subject}</span>
                <span className="notif-item__meta">
                  To: {n.to_label || "All managers"} · {fmtDate(n.sent_on)}
                </span>
                <span
                  className="notif-item__meta"
                  style={{ whiteSpace: "normal" }}
                >
                  {n.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
