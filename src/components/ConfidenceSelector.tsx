import type { ConfidenceLevel } from "../lib/scoring";

const LEVELS: { value: ConfidenceLevel; label: string }[] = [
  { value: 0.5, label: "50%" },
  { value: 0.8, label: "80%" },
  { value: 0.95, label: "95%" },
];

interface ConfidenceSelectorProps {
  value: ConfidenceLevel;
  onChange: (value: ConfidenceLevel) => void;
  disabled?: boolean;
}

export function ConfidenceSelector({
  value,
  onChange,
  disabled,
}: ConfidenceSelectorProps) {
  return (
    <div className="confidence-selector">
      <p className="confidence-label">I'm this confident:</p>
      <div className="confidence-buttons">
        {LEVELS.map(({ value: v, label }) => (
          <button
            key={v}
            type="button"
            className={`confidence-btn ${value === v ? "active" : ""}`}
            onClick={() => onChange(v)}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
