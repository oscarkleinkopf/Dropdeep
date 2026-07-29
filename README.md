# DropDeep

**DropDeep** is a dropshipping and marketing intelligence hub. Search products to generate deep research reports (demographics, copy angles, UGC scripts, ad copy, and more), manage a saved portfolio, generate zero-token prompt sequences for external chatbots, and run competitive intelligence tools — all from a single PWA.

## Quick start

```bash
npm install
cp .env.example .env   # optional — Supabase auth
npm run dev
```

Open [http://localhost:3000/Dropdeep/](http://localhost:3000/Dropdeep/) (base path matches GitHub Pages). Vite will start the dev server and open the app in your browser.

### Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

The site deploys automatically from the `master` branch via GitHub Actions to:

**https://oscarkleinkopf.github.io/Dropdeep/**

To enable deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** in the repository on GitHub.

### Production auth (required for accounts on the live site)

Add GitHub repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` (no `/rest/v1/`) |
| `VITE_SUPABASE_ANON_KEY` | **publishable** / anon key (never the secret/service_role) |
| `VITE_GEMINI_PROXY` | `true` only after deploying the Edge Function (optional) |

Then push to `master` (or re-run the workflow) so the build embeds those values.

If Supabase secrets are unset, the site still deploys in **demo mode** (local-only, no accounts).

## User accounts (Supabase Auth)

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured:

1. Click **Entrar** in the header to sign up or log in (email/password).
2. **Settings** (Gemini API key) requires an authenticated session.
3. Each user's Gemini key is stored in `localStorage` scoped by user ID (`dropdeep_gemini_key_<uuid>`), so shared machines don't leak keys between accounts.
4. Non-secret prefs (model, language, grounding) sync to `public.profiles` when that table exists (see `supabase/migrations/001_profiles.sql`).

**Setup:**

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** provider under Authentication → Providers.
3. Copy Project URL and **publishable** key into `.env` locally or GitHub Secrets for CI.
4. (Optional) Run the SQL in `supabase/migrations/001_profiles.sql`.
5. Redeploy.

See also `supabase/README.md` for Edge Function proxy deploy steps.

Google OAuth is stubbed for a future phase (`signInWithGoogle` in `src/auth/auth.js`).

## Gemini API key (Deep Research)

**Mode A — BYOK (default):** users paste their own key in Settings; calls go browser → Google.

**Mode B — Proxy (`VITE_GEMINI_PROXY=true`):** authenticated users call a Supabase Edge Function that holds `GEMINI_API_KEY` server-side. See `supabase/README.md`.

1. Get a key from [Google AI Studio](https://aistudio.google.com/apikey) (BYOK or for the server secret).
2. In the app, click **Settings** (sign in first if auth is enabled).
3. Paste your **Gemini API Key** (BYOK), choose model/language, and save.

> **Prompt Hub** and some spy/meta tools work without an API key — they generate copy-paste prompts or use local/static data.

## Security model

DropDeep is primarily a **static SPA** (GitHub Pages). Optional Supabase Auth + Edge Functions add accounts and a server-side Gemini proxy.

| Topic | Approach |
|-------|----------|
| **Gemini API (BYOK)** | Keys stay in browser `localStorage`, scoped per user when auth is on. Never commit keys or put them in `VITE_*` env vars. |
| **Gemini API (proxy)** | `GEMINI_API_KEY` lives in Supabase secrets; only logged-in users can invoke `gemini-proxy`. |
| **Exports** | Portfolio JSON exports strip fields matching `apiKey`, `geminiKey`, `secret`, etc. |
| **XSS** | API/user content inserted via `innerHTML` is escaped in high-risk views (e.g. competitor spy results). |
| **Service worker** | Does not cache `googleapis.com` requests; only app shell and CDN assets. |
| **CSP** | Meta CSP in `index.html` for GitHub Pages; `netlify.toml` adds matching headers on Netlify (including `X-Frame-Options`, `Referrer-Policy`). |
| **Public repo** | Source is public — never store credentials in the repo. |

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | App shell and views |
| `src/main.js` | Entry point |
| `src/auth/` | Supabase client and session helpers |
| `src/events.js` | UI event wiring |
| `src/utils/geminiStorage.js` | Per-user Gemini key/prefs in localStorage |
| `src/research/` | Gemini integration, caching, research flow |
| `src/ui/` | Views: feed, report, portfolio, prompt hub, spy, auth |
| `public/` | PWA manifest, service worker, icons |

## PWA icons

Icons are generated from an inline SVG (brand shield + DropDeep wordmark):

```bash
npm run icons
```

Outputs optimized `public/icon-192.png` and `public/icon-512.png`.

## Tech stack

- [Vite](https://vitejs.dev/) — dev server and build
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) — Gemini client
- [@supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js) — optional auth
- [Chart.js](https://www.chartjs.org/) & [Lucide](https://lucide.dev/) — charts and icons (CDN)

## What's next (Phase 2)

- Supabase Edge Function or Netlify Function as Gemini API proxy (server-held key for paid tiers)
- `profiles` table with Row Level Security for cloud-synced preferences
- Google OAuth provider enabled in Supabase
