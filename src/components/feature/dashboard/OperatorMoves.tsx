import type { NavItem } from "../../Layout";

export interface OperatorMovesProps {
  items: NavItem[];
  onNavigate: (to: string) => void;
}

/** ORGANISM — the numbered "operator moves" launcher card on the dashboard. */
export function OperatorMoves({ items, onNavigate }: OperatorMovesProps) {
  return (
    <div className="dash-ops card" style={{ paddingBottom: 0 }}>
      <div className="hl-panel-head" style={{ borderBottom: "none" }}>
        <h3>Operator moves</h3>
        <span className="hl-count">ALL MOVES</span>
      </div>
      {items.map((item, idx) => {
        const { icon: Icon } = item;
        return (
          <button
            key={item.to}
            className="dash-ops__link"
            onClick={() => onNavigate(item.to)}
          >
            <span className="mono">
              {idx + 1} · {item.label.toUpperCase()}
            </span>
            <span className="dash-ops__row">
              <Icon size={17} style={{ color: "var(--teal-deep)" }} />
              <span className="dash-ops__title">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
