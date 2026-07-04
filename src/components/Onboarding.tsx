import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const SCREENS = [
  {
    title: "Guess a range, not a number",
    body: "Each day, one question. Instead of a single guess, set a range you're confident contains the answer.",
    emoji: "🎯",
  },
  {
    title: "State your confidence",
    body: "Pick 50%, 80%, or 95% confidence. A tight range at 80% means you're really sure — and you'll score higher if you're right.",
    emoji: "📊",
  },
  {
    title: "Get calibrated",
    body: "Your score rewards accuracy and appropriate confidence. Track how well-calibrated you are over time — not just whether you're right.",
    emoji: "🧠",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const screen = SCREENS[step];
  const isLast = step === SCREENS.length - 1;

  return (
    <div className="onboarding">
      <div className="onboarding-content">
        <span className="onboarding-emoji">{screen.emoji}</span>
        <h1>{screen.title}</h1>
        <p>{screen.body}</p>
        <div className="onboarding-dots">
          {SCREENS.map((_, i) => (
            <span key={i} className={`dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => (isLast ? onComplete() : setStep(step + 1))}
      >
        {isLast ? "Play today's question" : "Next"}
      </button>
    </div>
  );
}
