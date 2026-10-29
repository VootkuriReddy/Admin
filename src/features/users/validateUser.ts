import { isEmail } from "../../utils/format";
import { todayISO } from "../../utils/dates";
import { STATUSES } from "../../constants";
import type { DirectoryUser, Role } from "../../types/models";

export interface UserDraft {
  full_name: string;
  email: string;
  emp_no: string;
  role: Exclude<Role, "admin">;
  job_title: string;
  manager_id: string;
  joined_on: string;
  password: string;
  status?: Exclude<import("../../types/models").UserStatus, never>;
}

export interface DraftErrors {
  [field: string]: string;
}

const PASSWORD_MIN = 10;

/** Password policy: 10+ chars, upper + lower + digit + special. */
export function passwordIssue(value: string): string | null {
  if (value.length < PASSWORD_MIN) return "At least 10 characters";
  if (!/[a-z]/.test(value)) return "Needs a lowercase letter";
  if (!/[A-Z]/.test(value)) return "Needs an uppercase letter";
  if (!/[0-9]/.test(value)) return "Needs a digit";
  if (!/[^A-Za-z0-9]/.test(value)) return "Needs a special character";
  return null;
}

export function empNoIssue(
  value: string,
  users: DirectoryUser[],
): string | null {
  if (!/^EMP-\d{4}$/.test(value)) return "Format: EMP-0000";
  if (users.some((u) => u.emp_no === value)) return "Already in the directory";
  return null;
}

export function emailIssue(
  value: string,
  users: DirectoryUser[],
): string | null {
  if (!isEmail(value)) return "Not a valid email address";
  if (users.some((u) => u.email.toLowerCase() === value.trim().toLowerCase()))
    return "Already in the directory";
  return null;
}

export function joinedOnIssue(value: string): string | null {
  if (!value) return "Pick the date of joining";
  if (
    value > todayISO() &&
    value.slice(0, 4) >= String(new Date().getFullYear() + 2)
  )
    return "Too far in the future";
  return null;
}

export function managerIssue(
  role: Exclude<Role, "admin">,
  managerId: string,
): string | null {
  if (role === "employee" && !managerId)
    return "Employees need a reporting manager";
  return null;
}

export function validateDraft(
  draft: UserDraft,
  users: DirectoryUser[],
): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.full_name.trim()) errors.full_name = "Full name is required";
  const email = emailIssue(draft.email, users);
  if (email) errors.email = email;
  const empNo = empNoIssue(draft.emp_no, users);
  if (empNo) errors.emp_no = empNo;
  if (!draft.job_title.trim()) errors.job_title = "Job title is required";
  const doj = joinedOnIssue(draft.joined_on);
  if (doj) errors.joined_on = doj;
  const mgr = managerIssue(draft.role, draft.manager_id);
  if (mgr) errors.manager_id = mgr;
  const pwd = passwordIssue(draft.password);
  if (pwd) errors.password = pwd;
  return errors;
}

export function draftToUser(
  draft: UserDraft,
): Omit<DirectoryUser, "user_id" | "added_on"> {
  return {
    emp_no: draft.emp_no,
    full_name: draft.full_name.trim(),
    email: draft.email.trim().toLowerCase(),
    role: draft.role,
    status: draft.status ?? STATUSES.Active,
    job_title: draft.job_title.trim(),
    manager_id: draft.role === "manager" ? null : draft.manager_id,
    joined_on: draft.joined_on,
    password_set: draft.password.length > 0,
  };
}
