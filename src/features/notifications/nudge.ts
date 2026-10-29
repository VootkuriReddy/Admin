import type { DirectoryUser, LeaveRequest } from "../../types/models";
import { fmtDate } from "../../utils/dates";

export interface ManagerNudge {
  manager: DirectoryUser;
  requests: LeaveRequest[];
  oldestSubmitted: string | null;
}

/** Group still-pending requests under their reporting manager, busiest last. */
export function buildNudgeQueue(
  users: DirectoryUser[],
  leaves: LeaveRequest[],
): ManagerNudge[] {
  const byId = new Map(users.map((u) => [u.user_id, u]));
  const queue = new Map<string, LeaveRequest[]>();
  for (const leave of leaves) {
    if (leave.status !== "Pending") continue;
    const employee = byId.get(leave.user_id);
    if (!employee?.manager_id) continue;
    queue.set(employee.manager_id, [
      ...(queue.get(employee.manager_id) ?? []),
      leave,
    ]);
  }
  return [...queue.entries()]
    .map(([managerId, requests]) => ({
      manager: byId.get(managerId)!,
      requests,
      oldestSubmitted: requests.map((r) => r.submitted_on).sort()[0] ?? null,
    }))
    .sort((a, b) => b.requests.length - a.requests.length);
}

/** Default copy for the compose form, merged across the picked managers. */
export function draftNudgeText(picks: ManagerNudge[]): {
  subject: string;
  message: string;
} {
  const total = picks.reduce((acc, p) => acc + p.requests.length, 0);
  if (picks.length === 1 && picks[0]) {
    const p = picks[0];
    const first = p.requests[0];
    return {
      subject: `${p.requests.length} pending leave request${p.requests.length > 1 ? "s" : ""} awaiting you`,
      message:
        `Hi ${p.manager.full_name.split(" ")[0]}, you have ${p.requests.length} pending request${p.requests.length > 1 ? "s" : ""}` +
        (first
          ? `, the earliest being ${first.request_no} submitted on ${fmtDate(first.submitted_on)}`
          : "") +
        ". Please review and decide in the portal at your earliest convenience.",
    };
  }
  return {
    subject: `Pending approvals reminder — ${total} request${total === 1 ? "" : "s"} across your teams`,
    message:
      "Pending leave requests are waiting on the managers in this list. Please review your queue and decide this week so balances stay accurate for year-end.",
  };
}
