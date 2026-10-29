// LOCAL-date helpers throughout — never ISO/UTC, which shifts the day for
// timezone after UTC (the off-by-one the leave portal fixed with todayISO()).
export function todayISO(): string {
  const now = new Date();
  return isoOf(now);
}

function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 26 Feb 2024 */
export function fmtDate(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dayName(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-GB", { weekday: "long" });
}

/** Whole months from `fromISO` up to `toISO` (clamped at 0). */
export function wholeMonthsFrom(fromISO: string, toISO: string): number {
  const from = parseISO(fromISO);
  const to = parseISO(toISO);
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

export function yearOf(iso: string): number {
  return parseISO(iso).getFullYear();
}
