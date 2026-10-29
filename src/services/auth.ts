import { OPERATOR_ID, OPERATOR_PASSWORD } from "../constants";
import type { Operator, ServiceEnvelope, ServiceError } from "../types/models";
import {
  clearSessionToken,
  loadSessionToken,
  resetDb,
  saveSessionToken,
} from "../mocks/localDb";
import { initialsOf } from "../utils/format";
import { ok, trySync } from "./envelope";

/**
 * Frontend-phase operator sign-in: the fixed admin/Portal@2026 credential.
 * When the backend lands this module swaps to POST /auth/login only — the
 * wording contract of the returned errors is what Login.tsx renders.
 */
const OPERATOR: Operator = {
  id: OPERATOR_ID,
  name: "Console Administrator",
  role: "admin",
  initials: initialsOf("Console Administrator"),
  job_title: "Directory Operator",
};

export function signIn(
  id: string,
  password: string,
  remember: boolean,
): ServiceEnvelope<Operator | null> {
  if (
    id.trim().toLowerCase() !== OPERATOR_ID ||
    password !== OPERATOR_PASSWORD
  ) {
    const error: ServiceError = {
      code: "auth/invalid",
      userMessage:
        "Credentials not recognised. Check the operator username and password.",
    };
    return { data: null, error };
  }
  const token = `mock.${btoa(`${OPERATOR_ID}:${Date.now()}`)}`;
  const persisted = trySync(token, () => {
    saveSessionToken(token, remember);
    return token;
  });
  if (persisted.error) return { data: null, error: persisted.error };
  return ok(OPERATOR);
}

export function resumeSession(): ServiceEnvelope<Operator | null> {
  const token = loadSessionToken();
  if (!token) return { data: null, error: null };
  return ok(OPERATOR);
}

export function signOut(): void {
  clearSessionToken();
}

/** Resets the local demo data back to seed fixtures (dev convenience). */
export function resetLocalData(): ServiceEnvelope<boolean> {
  return trySync(true, () => {
    resetDb();
    return true;
  });
}
