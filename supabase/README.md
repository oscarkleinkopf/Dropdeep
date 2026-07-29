# Supabase backend (Phase 2)

## 1. Profiles table

In Supabase Dashboard → **SQL Editor**, paste and run:

- `supabase/migrations/001_profiles.sql`
- `supabase/migrations/002_research_reports.sql` (cloud history sync)
- `supabase/migrations/003_gemini_usage.sql` (daily proxy quota)

`research_reports` stores completed Deep Research JSON per user (RLS by `user_id`). The app merges remote rows with local portfolio/cache on login.

`gemini_usage` tracks per-user daily proxy calls. The Edge Function increments via `check_and_increment_gemini_usage()` (service role only).

## 2. Gemini proxy Edge Function

Keeps `GEMINI_API_KEY` on the server. Only authenticated users can call it. Enforces a **daily starter quota** (default **2** calls/user/day).

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Logged in: `supabase login`
- Link project: `supabase link --project-ref texzlizelxavrybkdjdj`

### Deploy

```bash
supabase secrets set GEMINI_API_KEY=your_google_ai_studio_key
supabase secrets set GEMINI_PROXY_DAILY_LIMIT=2
supabase functions deploy gemini-proxy
```

### Enable in the frontend

Local `.env` / GitHub Secrets:

```env
VITE_GEMINI_PROXY=true
VITE_FREE_TIER_PROXY_DAILY=2
```

When `true` and the user is logged in, Deep Research uses the Edge Function instead of a browser-held Gemini key. When quota is exhausted, the client shows:

> Cuota diaria agotada. Pega tu clave Gemini (gratis en AI Studio) o vuelve mañana.

## 3. Auth redirect URLs

Authentication → URL Configuration:

- Site URL: `https://oscarkleinkopf.github.io/Dropdeep`
- Redirect URLs: `https://oscarkleinkopf.github.io/Dropdeep/**`, `http://localhost:3000/**`

## 4. Free tier (no Supabase required)

Prompt Hub, portafolio local (cap 10), dashboard feed, Spy Meta static interests, and BYOK Deep Research work without accounts. Login unlocks cloud sync + proxy starter credits only.
