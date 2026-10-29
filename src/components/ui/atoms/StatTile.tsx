import type { ReactNode } from "react";

export interface StatTileProps {
  value: ReactNode;
  label: string;
  icon?: ReactNode;
  tone?: "default" | "amber";
}

/** KPI cell for the dashboard audit strip (not a button — no action attached). */
export function StatTile({
  value,
  label,
  icon,
  tone = "default",
}: StatTileProps) {
  return (
    <div className="dash-strip__cell">
      <div className="dash-strip__num">
        {value}
        {icon ? (
          <span
            style={{
              color: "var(--teal-deep)",
              verticalAlign: "middle",
              marginLeft: 8,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className="dash-strip__label"
        style={tone === "amber" ? { color: "var(--amber-deep)" } : undefined}
      >
        {label}
      </div>
    </div>
  );
}
