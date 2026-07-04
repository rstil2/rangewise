# Rangewise

A daily calibration game — guess a **range**, not a number.

**→ New to deployment? Read [DEPLOY.md](./DEPLOY.md) for the full step-by-step guide to go live + App Store.**

## Quick start (local)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## MVP features

- Daily question (same for everyone, Wordle-style)
- Dual-handle range slider + 50%/80%/95% confidence selector
- Reveal screen with visual range comparison
- Scoring based on hit/miss + range sharpness
- Shareable result card (PNG export / native share)
- Calibration stats page (rolling hit rate vs stated confidence)
- 3-screen onboarding (no login required)
- Push notification opt-in on stats page
- Anonymous device ID persistence

## Project structure

```
server/           Express API + question bank
src/              React PWA frontend
  components/     RangeSlider, ShareCard, etc.
  pages/          Game, Stats
  lib/            Scoring, API client
```

## Deployment

Build the frontend and serve both from the same host, or deploy API separately:

```bash
npm run build
npm start   # API on :3001
npx vite preview  # static frontend
```

Point the Vite proxy `/api` to your production API URL in `vite.config.ts`, or serve the built `dist/` from Express.

## Question bank

30 questions are included in `server/data/questions.json`. Add more before launch — target ~90 days banked. Each question needs:

- `prompt`, `trueValue`, `referenceWidth`, `source`, `domain`, `difficulty`
- Optional `sliderMin` / `sliderMax` for custom UI bounds

Launch date is set in `server/index.ts` (`LAUNCH_DATE`) — day 0 maps to question index 0.
