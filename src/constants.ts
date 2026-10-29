// Mirrors of the domain values the console works with. `as const` lets
// src/types/models.ts derive literal unions from these values.
export const ROLES = {
  Employee: "employee",
  Manager: "manager",
  Admin: "admin",
} as const;

export const STATUSES = {
  Active: "Active",
  Inactive: "Inactive",
} as const;

export const TOAST_KIND = {
  Ok: "ok",
  Error: "red",
} as const;

// The built-in operator login (frontend-only phase — no backend yet).
export const OPERATOR_ID = "admin";
export const OPERATOR_PASSWORD = "Portal@2026";

// Allocation policy (per allocation year): annual entitlement and the
// contingency/comp-off pools. DOJ-based provisioning pro-rates annual leave
// from the month of joining.
export const POLICY = {
  AnnualTotal: 24,
  ContingencyMax: 10,
  CarryForwardCap: 10,
} as const;

// Year-end rollover year selection goes a couple of years out and back.
export const YEAR_MIN = 2020;
export const YEAR_SPAN = 8;
