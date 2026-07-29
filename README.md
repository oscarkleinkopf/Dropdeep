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

## Tier operativo gratis

DropDeep sigue la filosofía **Influ_JSON**: el camino feliz cuesta **$0** al fundador para el flujo principal. Sin Stripe, sin paywalls falsos, sin mocks de investigación.

| Gratis sin cuenta | Requiere cuenta (opcional) |
|-------------------|----------------------------|
| **Prompt Hub** — copiar/pegar prompts (nunca bloqueado) | Sincronizar portafolio en `research_reports` |
| **Portafolio local** — leer/escribir hasta 10 productos | **Proxy Gemini** — créditos diarios starter (default **2**/día) |
| **Dashboard/feed** — solo datos locales + caché 24 h | Comparar **3** nichos (gratis: máx. **2**) |
| **Spy Meta** — intereses estáticos curados | |
| **Exportar** JSON/CSV/MD/PDF desde reportes locales | |
| **Deep Research BYOK** — tu clave Gemini en el navegador | Deep Research vía proxy (cuota diaria) |

**Ruta recomendada (~60 s):** Prompt Hub → copia prompts → pega en ChatGPT/Claude gratis → opcionalmente BYOK Gemini o cuenta para sync/proxy.

Límites honestos (v1):

- Portafolio local: **10** items — toast + sugerencia de exportar JSON al llenarse.
- Comparar nichos: **2** sin sesión; **3** con sesión (Pro próximamente).
- Spy URL en vivo: BYOK o proxy con sesión (respeta cuota); sin API = mensaje honesto, sin datos simulados.

Env opcional de copy: `VITE_FREE_TIER_PROXY_DAILY=2` (display). Límite real en Edge Function: `GEMINI_PROXY_DAILY_LIMIT` (default 2). Migración: `supabase/migrations/003_gemini_usage.sql`.

## User accounts (Supabase Auth)

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured:

1. The app opens **immediately** — Prompt Hub, portafolio local, dashboard y Spy Meta funcionan sin login.
2. An optional **sync CTA banner** invites account creation for cloud sync + proxy starter credits (dismissible).
3. Click **Entrar** / **Crear cuenta** (or Google if enabled) for sync and proxy.
4. **Settings** (Gemini BYOK) works without sign-in; keys are stored in `localStorage` (`dropdeep_gemini_key` anonymous, or `dropdeep_gemini_key_<uuid>` when logged in).
5. Non-secret prefs sync to `public.profiles` when logged in.
6. Completed reports sync to `public.research_reports` (RLS) when logged in; offline falls back to localStorage/cache.

Without Supabase env vars, the site runs in **demo mode** (open access, accounts banner).

**Setup:**

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** provider under Authentication → Providers.
3. Copy Project URL and **publishable** key into `.env` locally or GitHub Secrets for CI.
4. Run SQL in `supabase/migrations/001_profiles.sql`, `002_research_reports.sql`, and `003_gemini_usage.sql`.
5. Redeploy.

See also `supabase/README.md` for Edge Function proxy deploy steps.

Google OAuth: enable **Google** under Authentication → Providers, then use the Google button in the login modal. Redirect URLs must include `https://oscarkleinkopf.github.io/Dropdeep/**` and `http://localhost:3000/**`.

## Gemini API key (Deep Research)

**Mode A — BYOK (default):** users paste their own key in Settings; calls go browser → Google.

**Mode B — Proxy (`VITE_GEMINI_PROXY=true`):** logged-in users call a Supabase Edge Function that holds `GEMINI_API_KEY` server-side. Daily starter quota enforced per user (default **2** calls/day via `GEMINI_PROXY_DAILY_LIMIT`). See `supabase/README.md`.

| Env var | Where | Purpose |
|---------|--------|---------|
| `VITE_GEMINI_PROXY` | `.env` / GitHub Secrets | `true` to prefer proxy when logged in |
| `VITE_FREE_TIER_PROXY_DAILY` | `.env` / GitHub Secrets | Display-only copy for starter quota (default 2) |
| `GEMINI_API_KEY` | Supabase secrets only | Server key for `gemini-proxy` Edge Function |
| `GEMINI_PROXY_DAILY_LIMIT` | Supabase secrets only | Enforced daily proxy calls per user (default 2) |

1. Get a key from [Google AI Studio](https://aistudio.google.com/apikey) (BYOK or for the server secret).
2. In the app, click **Settings** — no sign-in required for BYOK.
3. Paste your **Gemini API Key** (BYOK), choose model/language, and save.

> **Prompt Hub** works without an API key or login — it generates copy-paste prompts. With an open research report, prompts are prefilled with real niche insights.

Deep Research requires BYOK (no account) or the server proxy (account + daily quota). There is no procedural/demo fallback — reports come from live API responses or your saved portfolio/cache.

### Deep Research UX

- **Cancel:** use *Cancelar investigación* in the terminal to abort safely.
- **Errors:** Spanish messages for invalid key, quota, network, proxy down, and parse failures — with *Abrir Ajustes* / *Reintentar*.
- **Retries:** up to 2 automatic retries on transient API errors.

## Export & compare

- **Export report:** CSV, Markdown (`.md`), or PDF via `window.print()` from the report header.
- **Compare niches:** select 2 products free (3 when logged in) in Portafolio → *Comparar*.
- **History sync:** portfolio + 24h cache + Supabase `research_reports` merge on login.

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
| `src/research/` | Gemini integration, caching, history sync, research flow |
| `src/ui/` | Views: feed, report, portfolio, prompt hub, spy, auth |
| `supabase/migrations/` | SQL for `profiles`, `research_reports`, and `gemini_usage` |
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
