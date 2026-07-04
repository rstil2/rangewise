# Deploying Rangewise — step-by-step

This guide takes you from the code on your Mac to a live worldwide app + App Store submission.

---

## Part 1: Supabase (database) — ~15 minutes

Production needs a real database so player data survives deploys.

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free tier is fine)
2. Create a project (pick a region close to your users, e.g. US East)
3. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

> Never put the service role key in frontend code. It stays on the server only.

---

## Part 2: Deploy the web app — ~30 minutes

Pick **Railway** (easiest) or **Render** (also good). Both have free/cheap tiers.

### Option A: Railway

1. Push this repo to GitHub (if you haven't):
   ```bash
   cd ~/projects/rangewise
   git add .
   git commit -m "Production-ready Rangewise v1"
   git remote add origin https://github.com/YOUR_USERNAME/rangewise.git
   git push -u origin main
   ```

2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select your `rangewise` repo
4. Railway detects the `Dockerfile` automatically
5. Add **Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   LAUNCH_DATE=2026-07-04T12:00:00Z
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   APP_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
   CORS_ORIGIN=https://YOUR_RAILWAY_DOMAIN.up.railway.app
   VITE_APP_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
   ```
6. Deploy → wait for green checkmark
7. Visit your Railway URL → play a test game
8. Check Supabase **Table Editor → guesses** — you should see a row after submitting

### Option B: Render

1. Push to GitHub (same as above)
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect repo — Render reads `render.yaml`
4. Set the secret env vars when prompted
5. Deploy

### Custom domain (optional but recommended)

1. Buy a domain (Cloudflare, Namecheap, etc.) — e.g. `rangewise.app`
2. In Railway/Render, add custom domain in settings
3. Update DNS per their instructions (usually a CNAME record)
4. Update env vars: `APP_URL`, `CORS_ORIGIN`, `VITE_APP_URL` to your domain
5. Redeploy

---

## Part 3: Verify production — checklist

- [ ] https://your-domain.com loads the game
- [ ] `/api/health` returns `{ ok: true, questionBankSize: 90, database: "supabase" }`
- [ ] Submitting a guess creates a row in Supabase `guesses` table
- [ ] `/privacy` page loads (required for App Store)
- [ ] Share button downloads/shares a PNG
- [ ] Stats page shows streak after playing

---

## Part 4: iOS App Store — ~2 hours + review wait

You already have an Apple Developer account. This wraps your web app in a native shell using **Capacitor** — no rewrite needed.

### Prerequisites

- Mac with **Xcode** installed (Mac App Store)
- **CocoaPods** installed: `brew install cocoapods` (or `sudo gem install cocoapods`)
- Production web app deployed (Part 2) with a stable HTTPS URL

### Build the iOS app

1. Set your production API URL and rebuild:
   ```bash
   cd ~/projects/rangewise
   export VITE_API_URL=https://your-domain.com
   export VITE_APP_URL=https://your-domain.com
   npm run build
   ```

2. Add iOS platform (first time only):
   ```bash
   npx cap add ios
   npx cap sync ios
   ```

3. Open in Xcode:
   ```bash
   npx cap open ios
   ```

4. In Xcode:
   - Select the **Rangewise** target
   - **Signing & Capabilities** → select your Team (Apple Developer account)
   - Set **Bundle Identifier** to something unique: `com.yourname.rangewise`
   - Update `capacitor.config.ts` `appId` to match

5. Add app icon:
   - In Xcode: `App/App/Assets.xcassets/AppIcon.appiconset`
   - Add a 1024×1024 PNG (required for App Store)

6. Test on your iPhone:
   - Connect phone via USB
   - Select your device in Xcode toolbar
   - Click **Run** (▶)

### TestFlight beta (recommended before public launch)

1. In Xcode: **Product → Archive**
2. **Distribute App → App Store Connect → Upload**
3. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
4. **My Apps → +** → New App → fill in name, bundle ID, SKU
5. After processing, go to **TestFlight** tab
6. Add yourself as internal tester → install TestFlight app on iPhone → test

### App Store submission

In App Store Connect, you'll need:

| Item | What to provide |
|------|-----------------|
| App name | Rangewise |
| Subtitle | Daily calibration game |
| Description | 2-3 paragraphs about guessing ranges + confidence |
| Keywords | trivia, calibration, daily, wordle, quiz |
| Privacy Policy URL | `https://your-domain.com/privacy` |
| Screenshots | iPhone 6.7" and 6.5" (take from simulator) |
| App Privacy | "Data Not Linked to You" — device ID + game scores |
| Age rating | 4+ (no objectionable content) |
| Category | Games → Trivia |

Submit for review. First review usually takes 1-3 days.

---

## Part 5: Push notifications (iOS, post-launch)

Browser notifications work on web. Real iOS push requires:

1. Enable **Push Notifications** capability in Xcode
2. Create an APNs key in Apple Developer portal
3. Wire up `@capacitor/push-notifications` to a push service (Firebase, OneSignal, or custom)
4. Server cron job to send "today's question is up" at a set time

This is a v1.1 feature — ship without it if needed, add after launch.

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Production | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Server-side DB access |
| `LAUNCH_DATE` | Yes | ISO date when day 0 starts |
| `APP_URL` | Yes | Public URL of your app |
| `CORS_ORIGIN` | Yes | Same as APP_URL (or comma-separated) |
| `PORT` | No | Default 3001 |
| `VITE_APP_URL` | Build time | Shown on share cards |
| `VITE_API_URL` | iOS build | Production API URL (empty for web) |

Copy `.env.example` to `.env` for local development.

---

## Is 90 questions enough?

**For launch: yes.** 90 unique daily questions = 3 months before any repeat.

| Question bank | Coverage |
|---------------|----------|
| 90 questions | 3 months unique, then cycles |
| 180 questions | 6 months |
| 365 questions | 1 full year |

After day 90, question 1 repeats. Players who joined on day 1 will see it again on day 90 — acceptable for early stage, but plan to add more questions before you hit that mark.

**Recommendation:** Add 10-20 questions per month after launch. Keep a spreadsheet, fact-check everything, and append to `server/data/questions.json` then redeploy.

---

## Quick commands

```bash
# Local dev
npm run dev

# Production build
npm run build && npm start

# iOS (after web is deployed)
VITE_API_URL=https://your-domain.com VITE_APP_URL=https://your-domain.com npm run build
npx cap sync ios && npx cap open ios
```

---

## Getting help

- Railway docs: https://docs.railway.app
- Supabase docs: https://supabase.com/docs
- Capacitor iOS: https://capacitorjs.com/docs/ios
- App Store review guidelines: https://developer.apple.com/app-store/review/guidelines/
