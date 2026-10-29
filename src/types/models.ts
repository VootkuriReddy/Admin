import type { ROLES, STATUSES, TOAST_KIND } from "../constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type UserStatus = (typeof STATUSES)[keyof typeof STATUSES];
export type ToastKind = (typeof TOAST_KIND)[keyof typeof TOAST_KIND];

/** A directory entry — employee or manager, admin operators live separately. */
export interface DirectoryUser {
  user_id: string;
  emp_no: string;
  full_name: string;
  email: string;
  role: Exclude<Role, "admin">;
  status: UserStatus;
  job_title: string;
  /** Emp that this employee reports to — managers have none. */
  manager_id: string | null;
  joined_on: string; // ISO yyyy-mm-dd
  added_on: string; // ISO yyyy-mm-dd
  password_set: boolean;
}

/** One allocation year of pools for one employee. Days are in half-days. */
export interface BalanceRow {
  user_id: string;
  year: number;
  annualCredited: number;
  /** Feb 26-style leftover pooled from the previous year. */
  carriedForward: number;
  annualUsed: number;
  contingencyCredited: number;
  contingencyUsed: number;
  compOffTaken: number;
  generated_by?: "doj-provision" | "add-user" | "year-end";
}

/** A pending or decided leave request sitting with a manager. */
export interface LeaveRequest {
  request_no: string;
  user_id: string;
  leave_type: string;
  from: string;
  to: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  submitted_on: string;
}

/** An employee "I forgot my password" report waiting in the credential desk. */
export interface ResetRequest {
  id: string;
  user_id: string;
  requested_on: string; // ISO yyyy-mm-dd
  status: "Open" | "Resolved";
  resolved_on?: string; // ISO yyyy-mm-dd
}

/** A nudge the admin has sent to managers / broadcast records (outbox). */
export interface AdminNotice {
  id: string;
  /** Manager user_ids the nudge was addressed to (empty = broadcast). */
  to_user_ids: string[];
  to_label: string;
  subject: string;
  message: string;
  sent_on: string; // ISO yyyy-mm-dd
  channel: "email+app";
}

export interface Operator {
  id: string;
  name: string;
  role: "admin";
  initials: string;
  job_title: string;
}

export interface ToastMsg {
  id: number;
  kind: ToastKind;
  msg: string;
}

export interface ServiceEnvelope<T> {
  data: T;
  error: ServiceError | null;
}

export interface ServiceError {
  code: string;
  userMessage: string;
}
