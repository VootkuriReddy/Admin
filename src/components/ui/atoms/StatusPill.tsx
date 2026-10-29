export type StatusPillKind =
  "active" | "inactive" | "pending" | "sent" | "neutral";

const KIND_FOR: Record<string, StatusPillKind> = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
  Approved: "active",
  Rejected: "inactive",
  Cancelled: "inactive",
  Sent: "sent",
};

export function StatusPill({
  status,
  kind,
}: {
  status: string;
  kind?: StatusPillKind;
}) {
  const resolved = kind ?? KIND_FOR[status] ?? "neutral";
  return <span className={`pill pill--${resolved}`}>{status}</span>;
}
