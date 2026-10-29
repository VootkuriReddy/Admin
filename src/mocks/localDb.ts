// Frontend-only persistence: a localStorage-backed database standing in for the
// future FastAPI backend. Every mutation goes through `patch` so the store
// stays the single source of truth; swapping in real services later means
// replacing these functions, not the pages.
import type {
  AdminNotice,
  BalanceRow,
  DirectoryUser,
  LeaveRequest,
  ResetRequest,
} from "../types/models";
import {
  seedBalances,
  seedDirectory,
  seedLeaves,
  seedNotices,
  seedPwdRequests,
} from "../data/seed";

export interface DbShape {
  users: DirectoryUser[];
  balances: BalanceRow[];
  leaves: LeaveRequest[];
  notices: AdminNotice[];
  pwdRequests: ResetRequest[];
  yearEndRuns: string[];
}

const DB_KEY = "admin-console-db";
const SESSION_KEY = "admin-console-session";

function buildSeed(): DbShape {
  return {
    users: seedDirectory(),
    balances: seedBalances(),
    leaves: seedLeaves(),
    notices: seedNotices(),
    pwdRequests: seedPwdRequests(),
    yearEndRuns: [],
  };
}

export function loadDb(): DbShape {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    if (!Array.isArray(parsed.users)) return buildSeed();
    return {
      users: parsed.users ?? [],
      balances: parsed.balances ?? [],
      leaves: parsed.leaves ?? [],
      notices: parsed.notices ?? [],
      pwdRequests: parsed.pwdRequests ?? [],
      yearEndRuns: parsed.yearEndRuns ?? [],
    };
  } catch {
    return buildSeed();
  }
}

export function saveDb(db: DbShape): void {
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // private-mode storage failure: keep the in-memory copy running
  }
}

/** Mutating helper: runs `mutate` against a fresh copy and persists it. */
export function patchDb(mutate: (draft: DbShape) => void): void {
  const db = loadDb();
  mutate(db);
  saveDb(db);
}

/** Test/dem reset: wipes the local database back to the seed fixtures. */
export function resetDb(): void {
  try {
    window.localStorage.removeItem(DB_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // noop
  }
}

// ---- operator session (mock JWT substitute) ----

export function loadSessionToken(): string | null {
  try {
    return (
      window.sessionStorage.getItem(SESSION_KEY) ||
      window.localStorage.getItem(SESSION_KEY)
    );
  } catch {
    return null;
  }
}

export function saveSessionToken(token: string, remember: boolean): void {
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(
      SESSION_KEY,
      token,
    );
  } catch {
    // private-mode storage failure — session lives only in memory
  }
}

export function clearSessionToken(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // noop
  }
}
