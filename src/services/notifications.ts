import type { AdminNotice, LeaveRequest } from "../types/models";
import { loadDb, patchDb } from "../mocks/localDb";
import { todayISO } from "../utils/dates";
import { trySync, type ServiceEnvelope } from "./envelope";

export function listNotices(): ServiceEnvelope<AdminNotice[]> {
  return trySync([], () => loadDb().notices);
}

export interface SendNoticeInput {
  to_user_ids: string[];
  to_label: string;
  subject: string;
  message: string;
}

export function sendNotice(
  input: SendNoticeInput,
): ServiceEnvelope<AdminNotice> {
  const notice: AdminNotice = {
    id: `no-${Date.now().toString(36)}`,
    ...input,
    sent_on: todayISO(),
    channel: "email+app",
  };
  return trySync(notice, () => {
    patchDb((draft) => {
      draft.notices.push(notice);
    });
    return notice;
  });
}

export function listLeaves(): ServiceEnvelope<LeaveRequest[]> {
  return trySync([], () => loadDb().leaves);
}
