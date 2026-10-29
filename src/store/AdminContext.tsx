import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminNotice,
  BalanceRow,
  DirectoryUser,
  LeaveRequest,
  Operator,
  ResetRequest,
  ToastKind,
  ToastMsg,
} from "../types/models";
import * as authService from "../services/auth";
import * as usersService from "../services/users";
import * as balancesService from "../services/balances";
import * as credentialsService from "../services/credentials";
import * as notificationsService from "../services/notifications";

interface AdminState {
  authReady: boolean;
  signedIn: boolean;
  operator: Operator | null;
  users: DirectoryUser[];
  balances: BalanceRow[];
  leaves: LeaveRequest[];
  notices: AdminNotice[];
  pwdRequests: ResetRequest[];
  toast: ToastMsg | null;
  signIn: (
    id: string,
    password: string,
    remember: boolean,
  ) => Promise<string | null>;
  signOut: () => Promise<boolean>;
  setToast: (msg: string, kind?: ToastKind) => void;
  addDirectoryUser: (
    user: Omit<DirectoryUser, "user_id" | "added_on">,
  ) => Promise<{ error: string | null; user: DirectoryUser | null }>;
  provisionBalance: (row: BalanceRow) => Promise<{ error: string | null }>;
  runYearEnd: (
    nextRows: BalanceRow[],
    fromYear: number,
  ) => Promise<{ error: string | null }>;
  sendNudge: (
    input: notificationsService.SendNoticeInput,
  ) => Promise<{ error: string | null }>;
  logPwdRequest: (userId: string) => Promise<{ error: string | null }>;
  resolvePwdRequest: (id: string) => Promise<{ error: string | null }>;
  resetDemoData: () => void;
}

const AdminContext = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // Session restore happens during the first render (lazy initializers) so the
  // guard never sees a not-ready flash and the effect below only syncs data.
  const [operator, setOperator] = useState<Operator | null>(
    () => authService.resumeSession().data,
  );
  const [authReady] = useState(true);
  // Workspace rows hydrate the same way: synchronous lazy initializers over the
  // local db, so the first paint is already correct.
  const [users, setUsers] = useState<DirectoryUser[]>(
    () => usersService.listUsers().data,
  );
  const [balances, setBalances] = useState<BalanceRow[]>(
    () => balancesService.listBalances().data,
  );
  const [leaves, setLeaves] = useState<LeaveRequest[]>(
    () => notificationsService.listLeaves().data,
  );
  const [notices, setNotices] = useState<AdminNotice[]>(
    () => notificationsService.listNotices().data,
  );
  const [pwdRequests, setPwdRequests] = useState<ResetRequest[]>(
    () => credentialsService.listResetRequests().data,
  );
  const [toast, setToastState] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // One global toast slot; the ref timer keeps re-renders honest.
  const setToast = useCallback((msg: string, kind: ToastKind = "ok") => {
    setToastState({ id: Date.now(), kind, msg });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastState(null), 3200);
  }, []);

  const loadWorkspace = useCallback(async () => {
    const [usersRes, balancesRes, leavesRes, noticesRes, pwdRes] = [
      usersService.listUsers(),
      balancesService.listBalances(),
      notificationsService.listLeaves(),
      notificationsService.listNotices(),
      credentialsService.listResetRequests(),
    ];
    if (usersRes.error) setToast(usersRes.error.userMessage, "red");
    setUsers(usersRes.data);
    if (balancesRes.error) setToast(balancesRes.error.userMessage, "red");
    setBalances(balancesRes.data);
    setLeaves(leavesRes.data);
    setNotices(noticesRes.data);
    if (pwdRes.error) setToast(pwdRes.error.userMessage, "red");
    setPwdRequests(pwdRes.data);
  }, [setToast]);

  useEffect(() => {
    // Keep the ref timer clean on unmount only; data refresh flows through
    // loadWorkspace() after explicit mutations.
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const signIn = useCallback(
    async (
      id: string,
      password: string,
      remember: boolean,
    ): Promise<string | null> => {
      const res = authService.signIn(id, password, remember);
      if (res.error) return res.error.userMessage;
      setOperator(res.data);
      await loadWorkspace();
      return null;
    },
    [loadWorkspace],
  );

  const signOut = useCallback(async (): Promise<boolean> => {
    authService.signOut();
    setOperator(null);
    setUsers([]);
    setBalances([]);
    setLeaves([]);
    setNotices([]);
    setPwdRequests([]);
    return true;
  }, []);

  const addDirectoryUser = useCallback(
    async (user: Omit<DirectoryUser, "user_id" | "added_on">) => {
      const res = usersService.addUser({ user });
      if (res.error) return { error: res.error.userMessage, user: null };
      setUsers((prev) => [...prev, res.data]);
      return { error: null, user: res.data };
    },
    [],
  );

  const provisionBalance = useCallback(async (row: BalanceRow) => {
    const res = balancesService.provisionRow(row);
    if (res.error) return { error: res.error.userMessage };
    setBalances((prev) => {
      const idx = prev.findIndex(
        (b) => b.user_id === row.user_id && b.year === row.year,
      );
      if (idx === -1) return [...prev, res.data];
      const next = [...prev];
      next[idx] = res.data;
      return next;
    });
    return { error: null };
  }, []);

  const runYearEnd = useCallback(
    async (nextRows: BalanceRow[], fromYear: number) => {
      const res = balancesService.applyYearEnd(nextRows, fromYear);
      if (res.error) return { error: res.error.userMessage };
      await loadWorkspace();
      return { error: null };
    },
    [loadWorkspace],
  );

  const sendNudge = useCallback(
    async (input: notificationsService.SendNoticeInput) => {
      const res = notificationsService.sendNotice(input);
      if (res.error) return { error: res.error.userMessage };
      setNotices((prev) => [...prev, res.data]);
      return { error: null };
    },
    [],
  );

  /** A forgotten-password report lands Open in the credential desk. */
  const logPwdRequest = useCallback(async (userId: string) => {
    const res = credentialsService.logResetRequest(userId);
    if (res.error) return { error: res.error.userMessage };
    setPwdRequests((prev) => [...prev, res.data]);
    return { error: null };
  }, []);

  const resolvePwdRequest = useCallback(async (id: string) => {
    const res = credentialsService.resolveResetRequest(id);
    if (res.error) return { error: res.error.userMessage };
    setPwdRequests((prev) =>
      prev.map((r) => (r.id === id ? (res.data ?? r) : r)),
    );
    return { error: null };
  }, []);

  const resetDemoData = useCallback(() => {
    authService.resetLocalData();
    void loadWorkspace();
  }, [loadWorkspace]);

  const value = useMemo<AdminState>(
    () => ({
      authReady,
      signedIn: operator !== null,
      operator,
      users,
      balances,
      leaves,
      notices,
      pwdRequests,
      toast,
      signIn,
      signOut,
      setToast,
      addDirectoryUser,
      provisionBalance,
      runYearEnd,
      sendNudge,
      logPwdRequest,
      resolvePwdRequest,
      resetDemoData,
    }),
    [
      authReady,
      operator,
      users,
      balances,
      leaves,
      notices,
      pwdRequests,
      toast,
      signIn,
      signOut,
      setToast,
      addDirectoryUser,
      provisionBalance,
      runYearEnd,
      sendNudge,
      logPwdRequest,
      resolvePwdRequest,
      resetDemoData,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
