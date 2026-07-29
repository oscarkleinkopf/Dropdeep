# Supabase backend (Phase 2)

## 1. Profiles table

In Supabase Dashboard → **SQL Editor**, paste and run:

`supabase/migrations/001_profiles.sql`

This creates `public.profiles` with RLS so each user only reads/writes their own row. A trigger creates a profile on signup.

## 2. Gemini proxy Edge Function

Keeps `GEMINI_API_KEY` on the server. Only authenticated users can call it.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Logged in: `supabase login`
- Link project: `supabase link --project-ref texzlizelxavrybkdjdj`

### Deploy

```bash
supabase secrets set GEMINI_API_KEY=your_google_ai_studio_key
supabase functions deploy gemini-proxy
```

### Enable in the frontend

Local `.env` / GitHub Secrets:

```env
VITE_GEMINI_PROXY=true
```

When `true` and the user is logged in, Deep Research uses the Edge Function instead of a browser-held Gemini key.

## 3. Auth redirect URLs

Authentication → URL Configuration:

- Site URL: `https://oscarkleinkopf.github.io/Dropdeep`
- Redirect URLs: `https://oscarkleinkopf.github.io/Dropdeep/**`, `http://localhost:3000/**`
