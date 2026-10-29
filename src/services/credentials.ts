import type { ResetRequest } from "../types/models";
import { loadDb, patchDb } from "../mocks/localDb";
import { todayISO } from "../utils/dates";
import { trySync, type ServiceEnvelope } from "./envelope";

export function listResetRequests(): ServiceEnvelope<ResetRequest[]> {
  return trySync([], () => loadDb().pwdRequests);
}

/** An employee forgot their password: a report lands Open in the desk. */
export function logResetRequest(userId: string): ServiceEnvelope<ResetRequest> {
  const request: ResetRequest = {
    id: `pwd-${Date.now().toString(36)}`,
    user_id: userId,
    requested_on: todayISO(),
    status: "Open",
  };
  return trySync(request, () => {
    patchDb((draft) => {
      draft.pwdRequests.push(request);
    });
    return request;
  });
}

/** Admin solved it: a starter credential was issued through IT. */
export function resolveResetRequest(
  id: string,
): ServiceEnvelope<ResetRequest | null> {
  return trySync(null, () => {
    patchDb((draft) => {
      const row = draft.pwdRequests.find(
        (r) => r.id === id && r.status === "Open",
      );
      if (row) {
        row.status = "Resolved";
        row.resolved_on = todayISO();
      }
    });
    return loadDb().pwdRequests.find((r) => r.id === id) ?? null;
  });
}
