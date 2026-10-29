import type { DirectoryUser } from "../types/models";
import { loadDb, patchDb } from "../mocks/localDb";
import { todayISO } from "../utils/dates";
import { trySync, type ServiceEnvelope } from "./envelope";

export function listUsers(): ServiceEnvelope<DirectoryUser[]> {
  return trySync([], () => loadDb().users);
}

export function getUser(userId: string): ServiceEnvelope<DirectoryUser | null> {
  return trySync(
    null,
    () => loadDb().users.find((u) => u.user_id === userId) ?? null,
  );
}

export interface NewUserInput {
  user: Omit<DirectoryUser, "user_id" | "added_on">;
}

export function addUser(input: NewUserInput): ServiceEnvelope<DirectoryUser> {
  const full: DirectoryUser = {
    ...input.user,
    user_id: `u-u${loadDb().users.length + 1}-${Date.now().toString(36)}`,
    added_on: todayISO(),
  };
  return trySync(full, () => {
    patchDb((draft) => {
      draft.users.push(full);
    });
    return full;
  });
}

export function setUserStatus(
  userId: string,
  status: DirectoryUser["status"],
): ServiceEnvelope<DirectoryUser | null> {
  return trySync(null, () => {
    patchDb((draft) => {
      const row = draft.users.find((u) => u.user_id === userId);
      if (row) row.status = status;
    });
    return loadDb().users.find((u) => u.user_id === userId) ?? null;
  });
}
