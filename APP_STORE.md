# App Store path — what's done and what's left

## Done for you

| Step | Status |
|------|--------|
| Code on GitHub | https://github.com/rstil2/rangewise |
| Supabase database | Connected locally |
| CocoaPods + iOS project | Ready in `ios/` |
| Privacy page | `/privacy` (required for App Store) |
| **Free hosting config** | `vercel.json` — $0 on Vercel Hobby |

---

## Step 1: Deploy free on Vercel (~5 min)

Railway and Render now charge for web apps. **Vercel Hobby is free** for personal projects (no paid plan required).

1. Go to **[vercel.com/new](https://vercel.com/new)** → sign in with GitHub
2. Click **Import** next to **`rstil2/rangewise`**
3. Leave defaults (Vercel detects `vercel.json` automatically)
4. Add **Environment Variables** before deploying:

   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | `https://pbfupzshmkpplzivmyju.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key (Supabase → Settings → API) |
   | `LAUNCH_DATE` | `2026-07-04T12:00:00Z` |
   | `NODE_ENV` | `production` |

5. Click **Deploy** — wait ~2 minutes
6. Copy your URL (e.g. `https://rangewise.vercel.app`)
7. In Vercel → **Settings → Environment Variables**, add:
   - `APP_URL` = your Vercel URL
   - `CORS_ORIGIN` = your Vercel URL
   - `VITE_APP_URL` = your Vercel URL
8. **Deployments → Redeploy** (so share cards show the right URL)

**Test:** open `https://YOUR-URL.vercel.app/api/health`  
Should show: `"database": "supabase"`

**Privacy policy URL for App Store:** `https://YOUR-URL.vercel.app/privacy`

---

## Step 2: Build the iOS app

Fix Xcode once if needed:

```bash
sudo xcodebuild -runFirstLaunch
```

Build pointing at your live Vercel URL:

```bash
cd ~/projects/rangewise
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh https://YOUR-URL.vercel.app
npx cap open ios
```

In **Xcode** (open `ios/App/App.xcworkspace`):

1. **Signing & Capabilities** → your Apple Developer Team
2. Bundle ID → unique, e.g. `com.rstil2.rangewise`
3. Add **1024×1024** app icon
4. Connect iPhone → **Run ▶**

---

## Step 3: Submit to App Store

1. Xcode → **Product → Archive**
2. **Distribute → App Store Connect → Upload**
3. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps → +**
4. Privacy Policy URL: `https://YOUR-URL.vercel.app/privacy`
5. Submit (or use **TestFlight** first)

---

## Free tier limits (you won't hit these early)

| Service | Free allowance |
|---------|----------------|
| **Vercel** | Hobby plan — plenty for a daily game |
| **Supabase** | 500MB database, 500K edge requests |

---

## Other $0 options (if Vercel doesn't work)

| Option | Notes |
|--------|-------|
| **Cloudflare Pages** | Free static hosting; would need API refactor |
| **Fly.io** | Small free VM; may ask for credit card but won't charge if within limits |
| **Oracle Cloud** | Always-free VM forever; harder setup |

---

## Is 90 questions enough?

Yes for launch — **90 unique days** (~3 months). Add more to `server/data/questions.json` before day 90.
