export interface MeterProps {
  used: number;
  total: number;
  label: string;
}

/** Tiny used/total bar for balance columns (half-day store, day-displayed). */
export function Meter({ used, total, label }: MeterProps) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <span
      className="meter"
      title={`${label}: used ${used / 2} of ${total / 2}`}
    >
      <span className="meter__track">
        <span className="meter__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="meter__val">{pct}%</span>
    </span>
  );
}
