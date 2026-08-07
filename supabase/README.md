# Supabase backend (Phase 2)

## 1. Profiles table

In Supabase Dashboard → **SQL Editor**, paste and run (in order):

- `supabase/migrations/001_profiles.sql`
- `supabase/migrations/002_research_reports.sql` (cloud history sync)
- `supabase/migrations/003_gemini_usage.sql` (daily proxy quota)
- `supabase/migrations/004_research_session_quota.sql` (quota per investigation session)
- `supabase/migrations/005_proxy_abuse.sql` (**T20** — rate 10/10s + cooldown 30s entre sesiones nuevas)
- `supabase/migrations/006_report_feedback.sql` (**T54** — feedback dogfooding opt-in)
- `supabase/migrations/007_analytics_events.sql` (**T55** — eventos funnel privacy-friendly)

`research_reports` stores completed Deep Research JSON per user (RLS by `user_id`). The app merges remote rows with local portfolio/cache on login.

`report_feedback` (T54) syncs dogfooding feedback **solo con checkbox opt-in** + sesión. Local T35 sigue siendo el default.

`analytics_events` (T55) recibe inserts anónimos (`view_discover`, `parse_ae`, `start_research`, `copilot_paste_ok`, `save_portfolio`); **sin SELECT** para clientes. Consultas founder: `docs/sql/founder-observability.sql`.

`gemini_usage` tracks per-user daily **investigations** (not individual Gemini RPC calls). The Edge Function increments via `check_and_increment_gemini_usage(user, limit, session_id)` — repeated calls with the same `researchSessionId` in one run do not consume extra quota.

`gemini_proxy_hits` + RPCs `check_proxy_rate_limit` / `check_new_session_cooldown` (005) limit abuse; only `service_role` (Edge Function) can call them.

## 2. Gemini proxy Edge Function

Keeps `GEMINI_API_KEY` on the server. Only authenticated users can call it. Enforces a **daily starter quota** (default **2 complete investigations**/user/day — not per Gemini call) plus **T20** rate/cooldown/payload caps.

The client sends `researchSessionId` (UUID per Deep Research run). All steps in the same run share one quota unit.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npx supabase`)
- Access token: [Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
- Project ref: `texzlizelxavrybkdjdj`

### Deploy T20 (migración 005 + función) — recomendado

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...   # tu token personal
bash scripts/deploy-t20-proxy.sh
```

O desde GitHub Actions: workflow **Deploy Supabase proxy (T20)** (`workflow_dispatch`) con secret `SUPABASE_ACCESS_TOKEN`.

### Deploy manual (CLI)

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
# SQL Editor: pegar 005_proxy_abuse.sql  —o—  supabase db push tras link
supabase secrets set GEMINI_API_KEY=your_google_ai_studio_key --project-ref texzlizelxavrybkdjdj
supabase secrets set GEMINI_PROXY_DAILY_LIMIT=2 --project-ref texzlizelxavrybkdjdj
supabase functions deploy gemini-proxy --project-ref texzlizelxavrybkdjdj
```

### Enable in the frontend

Local `.env` / GitHub Secrets:

```env
VITE_GEMINI_PROXY=true
VITE_FREE_TIER_PROXY_DAILY=2
```

When `true` and the user is logged in, Deep Research uses the Edge Function instead of a browser-held Gemini key. When quota is exhausted, the client shows:

> Cuota diaria agotada (investigaciones completas). Pega tu clave Gemini (gratis en AI Studio) o vuelve mañana.

Rate limit / cooldown (T20) surfaces Spanish errors `proxy_rate_limit` / `proxy_session_cooldown` / `proxy_payload_too_large`.

## 2b. Discover enrich Edge Function (T53)

`discover-enrich` hace un **fetch limitado** de la ficha pública AliExpress y extrae `og:title` / imagen / precio USD si aparecen en meta o JSON-LD. **No** usa Affiliate API ni Gemini; siempre responde `verified: false`.

Requiere sesión (JWT). Si la función no está desplegada, Descubrir sigue con pegado manual + opcional Gemini BYOK.

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
supabase functions deploy discover-enrich --project-ref texzlizelxavrybkdjdj
# o: bash scripts/deploy-discover-enrich.sh
# o: GitHub Actions → "Deploy discover-enrich (T53)" → Run workflow
```

En la UI: tras **Analizar enlace**, el cliente intenta meta pública (logueado) y, si faltan campos y hay BYOK, Gemini inferido. Los campos llevan badge **No verificado**.

### Deploy migraciones T54/T55

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
bash scripts/deploy-t54-t55-migrations.sh
# o: GitHub Actions → "Deploy T54/T55 migrations" → Run workflow
# o: pegar 006 + 007 en SQL Editor
```

Consultas founder (agregados / funnel): `docs/sql/founder-observability.sql`.

## 3. Auth redirect URLs

Authentication → URL Configuration:

- Site URL: `https://oscarkleinkopf.github.io/Dropdeep`
- Redirect URLs: `https://oscarkleinkopf.github.io/Dropdeep/**`, `http://localhost:3000/**`

## 4. Free tier (no Supabase required)

Prompt Hub, portafolio local (cap 10), dashboard feed, Spy Meta static interests, and BYOK Deep Research work without accounts. Login unlocks cloud sync + proxy starter credits only.
