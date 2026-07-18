# Rangewise

A daily calibration game (React PWA frontend + Express API). See `README.md` and `DEPLOY.md` for the full overview and deployment guide.

## Cursor Cloud specific instructions

Standard commands live in `package.json` scripts; prefer those. Notes below are the non-obvious bits.

### Services

Single Node app with two dev processes started together by `npm run dev` (via `concurrently`):

- **API** — Express, `tsx watch server/index.ts` on port **3001**.
- **Client** — Vite dev server on port **5173**, which proxies `/api` → `http://localhost:3001` (see `vite.config.ts`).

### Running / testing

- No external services are required for local dev. When `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are unset, the API automatically falls back to a local file store (`server/db/index.ts`), so `npm run dev` works out of the box. Supabase is only used in production when those env vars are set.
- The Vite dev server (`vite.config.ts`) sets `server.host` and `server.allowedHosts: true` so port 5173 is reachable through the Cloud preview / a tunneled hostname. Without this, Vite returns `403 "This host is not allowed"` for remote hosts, which surfaces in the UI as "failed to fetch". The single-origin Express server (`npm start`, or dev API on 3001 which also serves `dist/`) has no such restriction.
- Lint: `npm run lint` (oxlint). One pre-existing harmless warning in `RangeSlider.tsx`.
- Build: `npm run build` (`tsc -b && vite build`). Requires Node >= 20.
- Production-mode serve: `npm start` (`tsx server/index.ts`) serves the built `dist/` **and** the API from a single origin on port 3001. Use this to test the deployed model locally — the frontend calls relative `/api/*` paths (`src/lib/api.ts` defaults `VITE_API_URL` to `""`), so it only works when the SPA and API share an origin, or when `/api/*` is routed to the API.

### Deployment routing gotcha

- The frontend always calls relative `/api/*`. On Vercel the SPA is static and the Express app runs as the serverless function `api/index.ts`, so `vercel.json` must rewrite `/api/(.*)` → `/api/index` (not bare `/api`, which drops the subpath and yields a 404 from the app's `/api` catch-all). Vercel preserves the original request path once the function is selected, so Express routes internally.
- Docker/Railway/Render deploy the same single Express app that serves `dist/` + API together (see `Dockerfile`, `railway.toml`, `render.yaml`).

### Other

- The dev file store writes guesses to `server/db/data/guesses.json` (note: not `server/data/`, which is what `.gitignore` lists), so local guess data is untracked but not git-ignored — do not commit it.
