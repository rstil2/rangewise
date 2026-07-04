import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfidenceSelector } from "../components/ConfidenceSelector";
import { RangeSlider } from "../components/RangeSlider";
import { RevealBar } from "../components/RevealBar";
import { ShareCard } from "../components/ShareCard";
import { getDeviceId } from "../lib/deviceId";
import {
  fetchTodayQuestion,
  submitGuess,
  fetchStats,
  fetchTodayStatus,
  type Question,
  type GuessResult,
} from "../lib/api";
import type { ConfidenceLevel } from "../lib/scoring";
import { formatValue } from "../lib/scoring";

type GamePhase = "input" | "revealed";

export function GamePage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>("input");
  const [confidence, setConfidence] = useState<ConfidenceLevel>(0.8);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(100);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();

    Promise.all([fetchTodayQuestion(), fetchTodayStatus(deviceId)])
      .then(([q, status]) => {
        setQuestion(q);
        setLoading(false);

        if (status.played) {
          setLow(status.low!);
          setHigh(status.high!);
          setConfidence(status.confidence as ConfidenceLevel);
          setResult({
            score: status.score!,
            hit: status.hit!,
            trueValue: status.trueValue!,
            source: status.source!,
            distanceOutside: 0,
            alreadySubmitted: true,
          });
          setPhase("revealed");
        } else {
          setLow(q.defaultLow);
          setHigh(q.defaultHigh);
        }

        return fetchStats(deviceId);
      })
      .then((s) => s && setStreak(s.currentStreak))
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!question || submitting || phase === "revealed") return;
    setSubmitting(true);
    try {
      const res = await submitGuess({
        deviceId: getDeviceId(),
        dayIndex: question.dayIndex,
        low,
        high,
        confidence,
      });
      setResult(res);
      setPhase("revealed");
      const stats = await fetchStats(getDeviceId());
      setStreak(stats.currentStreak);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page game-page">
        <div className="loading">Loading today's question...</div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="page game-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="page game-page">
      <header className="game-header">
        <Link to="/stats" className="header-link">Stats</Link>
        <h1 className="logo">Rangewise</h1>
        <span className="header-date">{question.date}</span>
      </header>

      <main className="game-main">
        <span className="domain-tag">{question.domain}</span>
        <h2 className="question-prompt">{question.prompt}</h2>

        {phase === "input" ? (
          <>
            <p className="instruction">
              Set your range — I'm{" "}
              <strong>{Math.round(confidence * 100)}%</strong> sure the answer
              is between:
            </p>

            <RangeSlider
              min={question.sliderMin}
              max={question.sliderMax}
              low={low}
              high={high}
              onChange={(l, h) => {
                setLow(l);
                setHigh(h);
              }}
            />

            <div className="number-inputs">
              <label>
                Low
                <input
                  type="number"
                  value={Math.round(low * 10) / 10}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v < high) setLow(v);
                  }}
                />
              </label>
              <label>
                High
                <input
                  type="number"
                  value={Math.round(high * 10) / 10}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > low) setHigh(v);
                  }}
                />
              </label>
            </div>

            <ConfidenceSelector value={confidence} onChange={setConfidence} />

            <button
              type="button"
              className="btn btn-primary btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Lock in guess"}
            </button>
          </>
        ) : result ? (
          <div className="reveal-section">
            <div className={`score-display ${result.hit ? "hit" : "miss"}`}>
              <span className="score-number">{Math.round(result.score)}</span>
              <span className="score-label">
                {result.hit ? "Hit!" : "Miss"}
              </span>
            </div>

            <RevealBar
              low={low}
              high={high}
              trueValue={result.trueValue}
              hit={result.hit}
            />

            <div className="reveal-details">
              <p>
                True value: <strong>{formatValue(result.trueValue)}</strong>
              </p>
              <p className="source">Source: {result.source}</p>
              <p className="your-range">
                Your range: {formatValue(low)} – {formatValue(high)} at{" "}
                {Math.round(confidence * 100)}% confidence
              </p>
            </div>

            <ShareCard
              prompt={question.prompt}
              score={result.score}
              hit={result.hit}
              low={low}
              high={high}
              trueValue={result.trueValue}
              confidence={confidence}
              streak={streak}
              date={question.date}
            />

            <p className="next-hint">Come back tomorrow for a new question.</p>
            <footer className="legal-footer">
              <Link to="/privacy">Privacy Policy</Link>
            </footer>
          </div>
        ) : null}
      </main>
    </div>
  );
}
