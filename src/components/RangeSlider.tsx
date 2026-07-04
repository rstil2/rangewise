import { useCallback, useEffect, useRef, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  disabled?: boolean;
}

export function RangeSlider({
  min,
  max,
  low,
  high,
  onChange,
  disabled,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

  const toPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const fromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return min + ratio * (max - min);
    },
    [min, max],
  );

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const value = fromClientX(e.clientX);
      if (dragging === "low") {
        onChange(Math.min(value, high - (max - min) * 0.02), high);
      } else {
        onChange(low, Math.max(value, low + (max - min) * 0.02));
      }
    };

    const onUp = () => setDragging(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, fromClientX, high, low, max, min, onChange]);

  const lowPct = toPercent(low);
  const highPct = toPercent(high);

  return (
    <div className={`range-slider ${disabled ? "disabled" : ""}`}>
      <div className="range-track" ref={trackRef}>
        <div
          className="range-fill"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        <button
          type="button"
          className="range-handle range-handle-low"
          style={{ left: `${lowPct}%` }}
          onPointerDown={() => !disabled && setDragging("low")}
          aria-label="Lower bound"
        />
        <button
          type="button"
          className="range-handle range-handle-high"
          style={{ left: `${highPct}%` }}
          onPointerDown={() => !disabled && setDragging("high")}
          aria-label="Upper bound"
        />
      </div>
      <div className="range-labels">
        <span>{formatCompact(low)}</span>
        <span>{formatCompact(high)}</span>
      </div>
    </div>
  );
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toFixed(1);
}

export function getSliderBounds(referenceWidth: number, seed = 100) {
  const center = seed;
  const span = referenceWidth * 4;
  return {
    min: Math.max(0, center - span),
    max: center + span,
    defaultLow: center - referenceWidth * 0.5,
    defaultHigh: center + referenceWidth * 0.5,
  };
}
