import { useRef } from "react";
import html2canvas from "html2canvas";
import { formatValue } from "../lib/scoring";
import type { ConfidenceLevel } from "../lib/scoring";

import { trackShare as trackShareEvent } from "../lib/analytics";

interface ShareCardProps {
  prompt: string;
  score: number;
  hit: boolean;
  low: number;
  high: number;
  trueValue: number;
  confidence: ConfidenceLevel;
  streak: number;
  date: string;
  onShared?: () => void;
}

export function ShareCard({
  prompt,
  score,
  hit,
  low,
  high,
  trueValue,
  confidence,
  streak,
  date,
  onShared,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "rangewise-result.png", {
          type: "image/png",
        });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Rangewise",
            text: `I scored ${Math.round(score)} on today's Rangewise! Can you beat my calibration?`,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "rangewise-result.png";
          a.click();
          URL.revokeObjectURL(url);
        }

        onShared?.();
        trackShareEvent();
      });
    } catch {
      // User cancelled share
    }
  };

  const padding = Math.max((high - low) * 0.5, Math.abs(trueValue) * 0.1, 1);
  const viewMin = Math.min(low, trueValue) - padding;
  const viewMax = Math.max(high, trueValue) + padding;
  const range = viewMax - viewMin;
  const pct = (v: number) => ((v - viewMin) / range) * 100;

  return (
    <div className="share-section">
      <div className="share-card" ref={cardRef}>
        <div className="share-header">
          <span className="share-logo">Rangewise</span>
          <span className="share-date">{date}</span>
        </div>
        <p className="share-prompt">{prompt}</p>
        <div className="share-score-row">
          <div className={`share-score ${hit ? "hit" : "miss"}`}>
            {Math.round(score)}
          </div>
          <div className="share-meta">
            <span>{hit ? "Hit!" : "Miss"}</span>
            <span>{Math.round(confidence * 100)}% confidence</span>
            {streak > 0 && <span>{streak}-day streak</span>}
          </div>
        </div>
        <div className="share-bar">
          <div
            className={`share-range ${hit ? "hit" : "miss"}`}
            style={{
              left: `${pct(low)}%`,
              width: `${pct(high) - pct(low)}%`,
            }}
          />
          <div className="share-true" style={{ left: `${pct(trueValue)}%` }} />
        </div>
        <div className="share-values">
          <span>{formatValue(low)} – {formatValue(high)}</span>
          <span>True: {formatValue(trueValue)}</span>
        </div>
        <p className="share-cta">{import.meta.env.VITE_APP_URL ?? "rangewise.app"}</p>
      </div>
      <button type="button" className="btn btn-primary share-btn" onClick={handleShare}>
        Share result
      </button>
    </div>
  );
}
