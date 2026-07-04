import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeviceId } from "../lib/deviceId";
import { fetchStats, type StatsResponse } from "../lib/api";

export function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchStats(getDeviceId())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
    if (permission === "granted") {
      localStorage.setItem("rangewise_notifications", "true");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("rangewise_notifications") === "true") {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  if (loading) {
    return (
      <div className="page stats-page">
        <div className="loading">Loading stats...</div>
      </div>
    );
  }

  const cal = stats?.calibration;
  const hitPct = cal ? Math.round(cal.actualHitRate * 100) : 0;
  const targetPct = cal ? Math.round(cal.statedConfidence * 100) : 80;

  return (
    <div className="page stats-page">
      <header className="game-header">
        <Link to="/" className="header-link">← Play</Link>
        <h1 className="logo">Stats</h1>
        <span className="header-spacer" />
      </header>

      <main className="stats-main">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats?.currentStreak ?? 0}</span>
            <span className="stat-label">Day streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.totalPlayed ?? 0}</span>
            <span className="stat-label">Games played</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.averageScore ?? 0}</span>
            <span className="stat-label">Avg score</span>
          </div>
        </div>

        <section className="calibration-section">
          <h2>Calibration</h2>
          <p className="calibration-desc">
            At {targetPct}% confidence, how often does the true value land in
            your range?
          </p>

          <div className="calibration-bar-container">
            <div className="calibration-target" style={{ left: `${targetPct}%` }}>
              <span>Target {targetPct}%</span>
            </div>
            <div className="calibration-bar">
              <div
                className="calibration-fill"
                style={{ width: `${Math.min(hitPct, 100)}%` }}
              />
            </div>
            <div className="calibration-labels">
              <span>0%</span>
              <span className="your-rate">You: {hitPct}%</span>
              <span>100%</span>
            </div>
          </div>

          <p className="calibration-verdict">{cal?.label}</p>
          {cal && cal.sampleSize > 0 && (
            <p className="calibration-sample">
              Based on {cal.sampleSize} game{cal.sampleSize !== 1 ? "s" : ""} at{" "}
              {targetPct}% confidence
            </p>
          )}
        </section>

        {stats && stats.recentGames.length > 0 && (
          <section className="recent-section">
            <h2>Recent games</h2>
            <ul className="recent-list">
              {stats.recentGames.map((g) => (
                <li key={g.date} className={g.hit ? "hit" : "miss"}>
                  <span className="recent-date">{g.date}</span>
                  <span className="recent-score">{g.score} pts</span>
                  <span className="recent-badge">{g.hit ? "Hit" : "Miss"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="notifications-section">
          <h2>Daily reminder</h2>
          <p>Get notified when today's question is ready.</p>
          {!notificationsEnabled ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={requestNotifications}
            >
              Enable notifications
            </button>
          ) : (
            <p className="notifications-on">Notifications enabled</p>
          )}
        </section>

        <footer className="legal-footer">
          <Link to="/privacy">Privacy Policy</Link>
        </footer>
      </main>
    </div>
  );
}
