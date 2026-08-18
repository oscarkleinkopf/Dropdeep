# Supabase backend (Phase 2)

## 1. Profiles table

In Supabase Dashboard → **SQL Editor**, paste and run (in order):

- `supabase/migrations/001_profiles.sql`
- `supabase/migrations/002_research_reports.sql` (cloud history sync)
- `supabase/migrations/003_gemini_usage.sql` (daily proxy quota)
- `supabase/migrations/004_research_session_quota.sql` (quota per investigation session)
- `supabase/migrations/005_proxy_abuse.sql` (**T20** — rate 10/10s + cooldown 30s entre sesiones nuevas)

`research_reports` stores completed Deep Research JSON per user (RLS by `user_id`). The app merges remote rows with local portfolio/cache on login.

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

## 2c. Discover proxy Edge Function (T45 — AliExpress Affiliate)

`discover-proxy` firma peticiones Affiliate **en el servidor** (HMAC/MD5). El App Secret **nunca** va al cliente, a `VITE_*` ni al git.

Requiere sesión (JWT). Sin secretos responde **501** con: *Catálogo Affiliate no configurado todavía…* El flujo T67 (hipótesis + Buscar en AliExpress + pegar) sigue funcionando.

### Founder: crear la app (después del mail “profile approved”)

1. Entra a [AliExpress Open Platform](https://openservice.aliexpress.com/) (o el enlace del mail).
2. **Create Application** — tipo Affiliate / Open Platform según el asistente. Acepta las APIs:
   - `aliexpress.affiliate.product.query`
   - `aliexpress.affiliate.hotproduct.query` (el Edge la expone; la UI de Descubrir **no** la usa como ranking de inicio).
3. Copia **App Key**. **App Secret** solo se muestra al crear: guárdalo en un gestor de contraseñas, no en chat ni issues.
4. En [Portals](https://portals.aliexpress.com) (Affiliate ya aprobado): **Tracking ID** (PID).
5. En Supabase (Dashboard → Edge Functions → Secrets **o** CLI):

```bash
# NUNCA pongas estos valores en .env del frontend ni en GitHub Actions VITE_*
export SUPABASE_ACCESS_TOKEN=sbp_...
supabase secrets set ALIEXPRESS_APP_KEY=... --project-ref texzlizelxavrybkdjdj
supabase secrets set ALIEXPRESS_APP_SECRET=... --project-ref texzlizelxavrybkdjdj
supabase secrets set ALIEXPRESS_TRACKING_ID=... --project-ref texzlizelxavrybkdjdj
# opcional:
# supabase secrets set ALIEXPRESS_SIGN_METHOD=md5
# supabase secrets set DISCOVER_PROXY_DAILY_LIMIT=40
```

6. SQL Editor: pega `supabase/migrations/008_discover_usage.sql`.
7. Deploy:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
bash scripts/deploy-discover-proxy.sh
# o GitHub Actions → "Deploy discover-proxy (T45)" → Run workflow
```

La UI: Descubrir → hipótesis → **Buscar catálogo (sesión)** con la consulta armada. Sin login: CTA **Iniciar sesión**. Copiloto/eval/pegar **nunca** se bloquean si Affiliate falla.

## 3. Auth redirect URLs

Authentication → URL Configuration:

- Site URL: `https://oscarkleinkopf.github.io/Dropdeep`
- Redirect URLs: `https://oscarkleinkopf.github.io/Dropdeep/**`, `http://localhost:3000/**`

## 4. Free tier (no Supabase required)

Prompt Hub, portafolio local (cap 10), dashboard feed, Spy Meta static interests, and BYOK Deep Research work without accounts. Login unlocks cloud sync + proxy starter credits only.
