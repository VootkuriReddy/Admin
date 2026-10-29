import { useState } from "react";
import { ConfirmModal, PanelTable, StatusPill } from "../../ui";
import type { PanelColumn } from "../../ui";
import { suggestPassword } from "../../../features/users/generate";
import { fmtDate } from "../../../utils/dates";
import type { DirectoryUser, ResetRequest } from "../../../types/models";
import { IconKey } from "../../Icons";

export interface ResetInboxProps {
  open: ResetRequest[];
  byId: Map<string, DirectoryUser>;
  /** Close the report: the admin has issued the starter credential. */
  onIssue: (request: ResetRequest, starter: string) => Promise<void>;
}

/** ORGANISM — the open forgotten-password queue plus the issue-reset confirm. */
export function ResetInbox({ open, byId, onIssue }: ResetInboxProps) {
  const [issuing, setIssuing] = useState<ResetRequest | null>(null);
  const [starter, setStarter] = useState("");
  const [busy, setBusy] = useState(false);

  const beginIssue = (request: ResetRequest) => {
    setStarter(suggestPassword());
    setIssuing(request);
  };

  const issue = async () => {
    if (!issuing) return;
    setBusy(true);
    await onIssue(issuing, starter);
    setBusy(false);
    setIssuing(null);
  };

  const columns: PanelColumn<ResetRequest>[] = [
    {
      label: "Person",
      cell: (r) => {
        const u = byId.get(r.user_id);
        return (
          <div className="req-name">
            <b>{u?.full_name ?? r.user_id}</b>
            <span>
              {u
                ? `${u.emp_no} · ${u.role} · ${u.email}`
                : "left the directory"}
            </span>
          </div>
        );
      },
    },
    {
      label: "Reported",
      cell: (r) => (
        <span className="hl-date">
          <b>{fmtDate(r.requested_on)}</b> <span>waiting</span>
        </span>
      ),
      width: 150,
    },
    {
      label: "State",
      cell: () => <StatusPill status="Pending" kind="pending" />,
    },
    {
      label: "Action",
      cell: (r) => (
        <button
          className="pill-act pill-act--run"
          onClick={() => beginIssue(r)}
        >
          <IconKey size={12} /> Issue reset
        </button>
      ),
    },
  ];

  const person = issuing ? byId.get(issuing.user_id) : undefined;

  return (
    <>
      <PanelTable
        title="Open reports"
        count={`${open.length} WAITING`}
        columns={columns}
        rows={open}
        rowKey={(r) => r.id}
        empty="Nobody is locked out right now."
      />

      {issuing && (
        <ConfirmModal
          title="Issue the reset?"
          text={
            `${person?.full_name ?? "The user"} gets a fresh starter credential: ` +
            `${starter} — sent by email, changed at first sign-in. This closes their report.`
          }
          confirmLabel="Issue & close"
          busy={busy}
          onConfirm={issue}
          onClose={() => setIssuing(null)}
        />
      )}
    </>
  );
}
