import { Link } from "react-router-dom";

export function SupportPage() {
  return (
    <div className="page legal-page">
      <header className="game-header">
        <Link to="/" className="header-link">
          ← Back
        </Link>
        <h1 className="logo">Support</h1>
        <span className="header-spacer" />
      </header>

      <main className="legal-main">
        <h2>Need help with Rangewise?</h2>
        <p>
          Rangewise is a daily calibration game. One question per day — set a
          range, pick your confidence, and see how well-calibrated you are.
        </p>

        <h2>Common questions</h2>
        <ul>
          <li>
            <strong>I already played today.</strong> Come back tomorrow for a
            new question. Only one puzzle is available each day.
          </li>
          <li>
            <strong>My streak reset.</strong> Streaks are stored on this device.
            Clearing browser data or switching phones can reset them.
          </li>
          <li>
            <strong>The app won&apos;t load today&apos;s question.</strong> Check
            your internet connection and try force-quitting and reopening the
            app.
          </li>
        </ul>

        <h2>Contact</h2>
        <p>
          Email us at{" "}
          <a href="mailto:support@rangewise.app">support@rangewise.app</a> and
          we&apos;ll get back to you as soon as we can.
        </p>

        <p>
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
