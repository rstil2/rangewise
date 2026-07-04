export type ConfidenceLevel = 0.5 | 0.8 | 0.95;

export interface GuessInput {
  low: number;
  high: number;
  confidence: ConfidenceLevel;
  trueValue: number;
  referenceWidth: number;
}

export interface ScoreResult {
  score: number;
  hit: boolean;
  distanceOutside: number;
}

export function computeScore(input: GuessInput): ScoreResult {
  const { low, high, trueValue, referenceWidth } = input;
  const width = high - low;
  const ref = Math.max(referenceWidth, 1e-9);

  if (low <= trueValue && trueValue <= high) {
    const baseScore = 100 - (width / ref) * 40;
    return {
      score: clamp(baseScore, 0, 100),
      hit: true,
      distanceOutside: 0,
    };
  }

  const distanceOutside =
    trueValue < low ? low - trueValue : trueValue - high;
  const penalty = distanceOutside / ref;
  const baseScore = Math.max(60 - penalty * 60, 0);

  return {
    score: clamp(baseScore, 0, 100),
    hit: false,
    distanceOutside,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export interface CalibrationStats {
  statedConfidence: number;
  actualHitRate: number;
  sampleSize: number;
  label: string;
}

export function computeCalibration(
  guesses: Array<{ confidence: number; hit: boolean }>,
  targetConfidence = 0.8,
): CalibrationStats {
  const relevant = guesses.filter((g) => g.confidence === targetConfidence);
  const hits = relevant.filter((g) => g.hit).length;
  const rate = relevant.length > 0 ? hits / relevant.length : 0;

  let label: string;
  if (relevant.length < 3) {
    label = "Keep playing to see your calibration";
  } else if (rate > targetConfidence + 0.15) {
    label = "You're hitting more than expected — try tighter ranges";
  } else if (rate < targetConfidence - 0.15) {
    label = "You're missing more than expected — widen your ranges";
  } else {
    label = "Well calibrated!";
  }

  return {
    statedConfidence: targetConfidence,
    actualHitRate: rate,
    sampleSize: relevant.length,
    label,
  };
}
