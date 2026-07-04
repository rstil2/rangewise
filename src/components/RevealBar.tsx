import { formatValue } from "../lib/scoring";

interface RevealBarProps {
  low: number;
  high: number;
  trueValue: number;
  hit: boolean;
}

export function RevealBar({ low, high, trueValue, hit }: RevealBarProps) {
  const padding = Math.max((high - low) * 0.5, Math.abs(trueValue) * 0.1, 1);
  const viewMin = Math.min(low, trueValue) - padding;
  const viewMax = Math.max(high, trueValue) + padding;
  const range = viewMax - viewMin;

  const pct = (v: number) => ((v - viewMin) / range) * 100;

  return (
    <div className="reveal-bar">
      <div className="reveal-track">
        <div
          className={`reveal-range ${hit ? "hit" : "miss"}`}
          style={{
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
          }}
        />
        <div
          className="reveal-true"
          style={{ left: `${pct(trueValue)}%` }}
          title={`True value: ${formatValue(trueValue)}`}
        />
      </div>
      <div className="reveal-legend">
        <span className="legend-item">
          <span className="dot range-dot" /> Your range
        </span>
        <span className="legend-item">
          <span className="dot true-dot" /> True value ({formatValue(trueValue)})
        </span>
      </div>
    </div>
  );
}
