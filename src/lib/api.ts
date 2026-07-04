import type { ConfidenceLevel } from "./scoring";

export interface Question {
  id: number;
  prompt: string;
  referenceWidth: number;
  sliderMin: number;
  sliderMax: number;
  defaultLow: number;
  defaultHigh: number;
  domain: string;
  difficulty: string;
  dayIndex: number;
  date: string;
}

export interface GuessPayload {
  deviceId: string;
  dayIndex: number;
  low: number;
  high: number;
  confidence: ConfidenceLevel;
}

export interface GuessResult {
  score: number;
  hit: boolean;
  trueValue: number;
  source: string;
  distanceOutside: number;
  alreadySubmitted: boolean;
}

export interface StatsResponse {
  totalPlayed: number;
  averageScore: number;
  currentStreak: number;
  calibration: {
    statedConfidence: number;
    actualHitRate: number;
    sampleSize: number;
    label: string;
  };
  recentGames: Array<{
    date: string;
    score: number;
    hit: boolean;
    confidence: number;
  }>;
}

export interface TodayStatus {
  played: boolean;
  low?: number;
  high?: number;
  confidence?: number;
  score?: number;
  hit?: boolean;
  trueValue?: number;
  source?: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? "";
  const res = await fetch(`${base}${url}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export function fetchTodayQuestion(): Promise<Question> {
  return fetchJson<Question>("/api/question/today");
}

export function submitGuess(payload: GuessPayload): Promise<GuessResult> {
  return fetchJson<GuessResult>("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function fetchStats(deviceId: string): Promise<StatsResponse> {
  return fetchJson<StatsResponse>(`/api/stats/${deviceId}`);
}

export function fetchTodayStatus(deviceId: string): Promise<TodayStatus> {
  return fetchJson<TodayStatus>(`/api/guess/today/${deviceId}`);
}
