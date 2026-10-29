import type { DirectoryUser } from "../../types/models";

/** Next `EMP-####` number: highest existing + 1, seeded at 1000 if empty. */
export function nextEmpNo(users: DirectoryUser[]): string {
  const highest = users.reduce(
    (max, u) => Math.max(max, Number(u.emp_no.split("-")[1] ?? 0)),
    999,
  );
  return `EMP-${String(highest + 1).padStart(4, "0")}`;
}

/** Auto-worked corporate email from a name (kabir.tiwari@emids.com). */
export function suggestEmail(fullName: string, users: DirectoryUser[]): string {
  const slug = fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z]/g, ""))
    .filter(Boolean)
    .join(".");
  const base = slug || "new.employee";
  let candidate = `${base}@emids.com`;
  let n = 2;
  while (users.some((u) => u.email === candidate)) {
    candidate = `${base}${n}@emids.com`;
    n += 1;
  }
  return candidate;
}

/** A readable one-off password suggestion meeting policy (10+, mixed). */
export function suggestPassword(): string {
  const words = [
    "Anchor",
    "Breeze",
    "Comet",
    "Drift",
    "Ember",
    "Flint",
    "Grove",
    "Harbor",
  ];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = String(Math.floor(Math.random() * 90) + 10);
  return `${word}-${digits}!x`;
}
