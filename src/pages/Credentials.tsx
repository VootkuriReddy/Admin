import { useMemo } from "react";
import { useAdmin } from "../store/AdminContext";
import { PageHead, PanelTable, StatusPill } from "../components/ui";
import type { PanelColumn } from "../components/ui";
import { ResetInbox } from "../components/feature/credential-desk/ResetInbox";
import { LogReportCard } from "../components/feature/credential-desk/LogReportCard";
import { fmtDate } from "../utils/dates";
import { IconKey } from "../components/Icons";
import type { ResetRequest } from "../types/models";

export default function Credentials() {
  const { users, pwdRequests, logPwdRequest, resolvePwdRequest, setToast } =
    useAdmin();

  const byId = useMemo(
    () => new Map(users.map((u) => [u.user_id, u])),
    [users],
  );
  const open = [...pwdRequests]
    .filter((r) => r.status === "Open")
    .sort((a, b) => a.requested_on.localeCompare(b.requested_on));
  const resolved = [...pwdRequests]
    .filter((r) => r.status === "Resolved")
    .sort((a, b) => (b.resolved_on ?? "").localeCompare(a.resolved_on ?? ""));

  // Organism owns the modal + starter password; the page owns persistence.
  const issue = async (request: ResetRequest, starter: string) => {
    const res = await resolvePwdRequest(request.id);
    if (res.error) {
      setToast(res.error, "red");
      return;
    }
    setToast(
      `Starter credential issued to ${byId.get(request.user_id)?.full_name ?? "the user"} (${starter}).`,
    );
  };

  const logOnBehalf = async (userId: string): Promise<string | null> => {
    const res = await logPwdRequest(userId);
    if (res.error) return res.error;
    setToast(
      `Forgotten-password report logged for ${byId.get(userId)?.full_name ?? "the user"}.`,
    );
    return null;
  };

  const resolvedColumns: PanelColumn<ResetRequest>[] = [
    {
      label: "Person",
      cell: (r) => {
        const u = byId.get(r.user_id);
        return (
          <div className="req-name">
            <b>{u?.full_name ?? r.user_id}</b>
            <span>{u?.emp_no ?? ""}</span>
          </div>
        );
      },
    },
    {
      label: "Reported",
      cell: (r) => <span className="mono">{fmtDate(r.requested_on)}</span>,
    },
    {
      label: "Closed",
      cell: (r) => (
        <span className="mono">
          {r.resolved_on ? fmtDate(r.resolved_on) : "—"}
        </span>
      ),
    },
    {
      label: "State",
      cell: () => <StatusPill status="Resolved" kind="active" />,
    },
  ];

  return (
    <div className="page">
      <PageHead eyebrow="Administration · Credentials" title="Credential desk">
        Forgotten-password reports land here. Review the queue, issue a starter
        credential and the person is back in.
      </PageHead>

      <div className="strip-note">
        <IconKey size={18} />
        <div>
          <b>How the desk runs</b>
          When a user reports "I forgot my password" the console is notified and
          the report shows up as Open below. Issue a reset to hand them a fresh
          starter password over email — the old credential is retired and they
          change it at first sign-in.
        </div>
      </div>

      <div className="hl-cols">
        <ResetInbox open={open} byId={byId} onIssue={issue} />

        <div>
          <LogReportCard
            people={users.filter((u) => u.status === "Active")}
            onLog={logOnBehalf}
            onError={(msg) => setToast(msg, "red")}
          />

          <PanelTable
            title="Recently resolved"
            count={`${resolved.length}`}
            columns={resolvedColumns}
            rows={resolved}
            rowKey={(r) => r.id}
            empty="No resets issued yet."
          />
        </div>
      </div>
    </div>
  );
}
