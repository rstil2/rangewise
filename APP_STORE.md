# App Store path — what's done and what's left

## Done for you

| Step | Status |
|------|--------|
| Code on GitHub | https://github.com/rstil2/rangewise |
| Supabase database | Connected locally |
| CocoaPods installed | Yes |
| iOS Xcode project | `ios/` folder ready |
| Privacy page | `/privacy` (needed for App Store) |

## Blocker: host the server online

Your **Railway trial expired**, so Railway won't deploy until you pick a plan (~$5/mo) at [railway.app/pricing](https://railway.app/pricing).

**Free alternative: Render** (~10 minutes, no credit card for free tier):

### Deploy on Render (free)

1. Open **[render.com/deploy](https://render.com/deploy)** and sign in with GitHub
2. Select repo **`rstil2/rangewise`**
3. Render reads `render.yaml` automatically
4. When prompted for **secret env vars**, add:

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | `https://pbfupzshmkpplzivmyju.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase → Settings → API → service_role) |
   | `APP_URL` | Leave blank first; update after deploy with your Render URL |
   | `CORS_ORIGIN` | Same as APP_URL |
   | `VITE_APP_URL` | Same as APP_URL |

5. Click **Deploy** — wait ~5 minutes
6. Copy your URL (e.g. `https://rangewise.onrender.com`)
7. Go back to Render → **Environment** → set `APP_URL`, `CORS_ORIGIN`, and `VITE_APP_URL` to that URL → **Redeploy**
8. Test: open `https://YOUR-URL.onrender.com/api/health` — should show `"database": "supabase"`

---

## Build the iOS app (after Render is live)

Fix Xcode first (one time, if needed):

```bash
sudo xcodebuild -runFirstLaunch
```

Then build pointing at your live server:

```bash
cd ~/projects/rangewise
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh https://YOUR-RENDER-URL.onrender.com
npx cap open ios
```

In **Xcode**:

1. Open **`ios/App/App.xcworkspace`** (not `.xcodeproj`)
2. **Signing & Capabilities** → Team = your Apple Developer account
3. Bundle ID → change to something unique, e.g. `com.rstil2.rangewise`
4. Add a **1024×1024** app icon (Assets → AppIcon)
5. Connect iPhone → **Run ▶**

---

## Submit to App Store

1. Xcode → **Product → Archive**
2. **Distribute App → App Store Connect → Upload**
3. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps → +**
4. Privacy Policy URL: `https://YOUR-RENDER-URL.onrender.com/privacy`
5. Submit for review

**TestFlight first** (recommended): install via TestFlight app before going public.

---

## Is 90 questions enough?

Yes for launch — **90 unique days** (~3 months). After day 90, questions repeat. Add more to `server/data/questions.json` over time.
