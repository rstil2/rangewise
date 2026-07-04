import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="page legal-page">
      <header className="game-header">
        <Link to="/" className="header-link">
          ← Back
        </Link>
        <h1 className="logo">Privacy</h1>
        <span className="header-spacer" />
      </header>

      <main className="legal-main">
        <p className="legal-updated">Last updated: July 4, 2026</p>

        <h2>Overview</h2>
        <p>
          Rangewise ("we", "the app") is a daily calibration game. We collect
          minimal data to operate the game and improve the product. We do not
          sell your data.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Anonymous device ID</strong> — a random identifier stored
            in your browser or app, used to track your streak and stats across
            sessions.
          </li>
          <li>
            <strong>Game data</strong> — your daily range guesses, confidence
            level, score, and whether you hit or missed.
          </li>
          <li>
            <strong>Usage events</strong> — anonymous events such as completing
            a game, sharing a result, or visiting a page.
          </li>
        </ul>

        <h2>What we do not collect</h2>
        <ul>
          <li>Name, email, or phone number (unless you contact us directly)</li>
          <li>Location data</li>
          <li>Contacts or photos</li>
          <li>Payment information</li>
        </ul>

        <h2>Push notifications</h2>
        <p>
          If you opt in to daily reminders, we use your device's notification
          system. You can disable notifications at any time in your device
          settings.
        </p>

        <h2>Data storage</h2>
        <p>
          Game data is stored in a secure cloud database (Supabase). Anonymous
          device IDs and guesses are retained to power your stats and
          calibration history.
        </p>

        <h2>Third parties</h2>
        <p>
          We use Supabase for data storage and hosting providers to run the
          app. We may add privacy-friendly analytics (e.g. Plausible) to
          understand usage — no ad tracking.
        </p>

        <h2>Children</h2>
        <p>
          Rangewise is not directed at children under 13. We do not knowingly
          collect data from children.
        </p>

        <h2>Your choices</h2>
        <p>
          Clear your browser local storage to reset your anonymous device ID.
          Contact us to request deletion of your game data associated with a
          device ID.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:privacy@rangewise.app">privacy@rangewise.app</a>
        </p>
      </main>
    </div>
  );
}
