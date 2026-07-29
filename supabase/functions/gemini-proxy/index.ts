// Supabase Edge Function: gemini-proxy
// Deploy: supabase functions deploy gemini-proxy --project-ref <ref>
// Secret:  supabase secrets set GEMINI_API_KEY=... --project-ref <ref>
// Optional: supabase secrets set GEMINI_PROXY_DAILY_LIMIT=2
// Requires authenticated JWT (verify_jwt = true by default).
// Run migration 003_gemini_usage.sql for daily quota tracking.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseDailyLimit() {
  const raw = Deno.env.get('GEMINI_PROXY_DAILY_LIMIT') ?? '2';
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization', code: 'unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const dailyLimit = parseDailyLimit();

    if (!supabaseUrl || !supabaseAnon) {
      return json({ error: 'Server misconfigured (Supabase env)' }, 500);
    }
    if (!serviceRoleKey) {
      return json({ error: 'Server misconfigured (service role)' }, 500);
    }
    if (!geminiKey) {
      return json({ error: 'GEMINI_API_KEY secret not set' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Unauthorized', code: 'unauthorized' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const researchSessionId = body.researchSessionId
      ? String(body.researchSessionId)
      : null;
    const sessionUuid = researchSessionId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          researchSessionId,
        )
      ? researchSessionId
      : null;

    const { data: quotaResult, error: quotaError } = await admin.rpc(
      'check_and_increment_gemini_usage',
      {
        p_user_id: user.id,
        p_daily_limit: dailyLimit,
        p_session_id: sessionUuid,
      },
    );

    if (quotaError) {
      console.error('gemini_usage rpc error:', quotaError.message);
      return json({ error: 'Quota check failed', details: quotaError.message }, 500);
    }

    if (!quotaResult?.allowed) {
      return json(
        {
          error: 'daily_limit_exceeded',
          code: 'proxy_daily_quota',
          message:
            'Cuota diaria agotada (investigaciones completas). Pega tu clave Gemini (gratis en AI Studio) o vuelve mañana.',
          count: quotaResult?.count ?? dailyLimit,
          limit: quotaResult?.limit ?? dailyLimit,
        },
        429,
      );
    }

    const model = String(body.model || 'gemini-2.5-flash');
    const contents = body.contents;
    const useSearch = Boolean(body.useSearch);
    const tools = Array.isArray(body.tools) ? body.tools : (useSearch ? [{ google_search: {} }] : undefined);

    if (!contents) {
      return json({ error: 'Missing contents' }, 400);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`;

    const payload = {
      contents,
      ...(tools ? { tools } : {}),
    };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const geminiJson = await geminiRes.json();
    if (!geminiRes.ok) {
      const msg = geminiJson?.error?.message || `Gemini HTTP ${geminiRes.status}`;
      return json({ error: msg, details: geminiJson }, geminiRes.status);
    }

    const text = geminiJson?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || '';

    return json({
      text,
      candidates: geminiJson.candidates || [],
      userId: user.id,
      usage: {
        count: quotaResult?.count ?? null,
        limit: quotaResult?.limit ?? dailyLimit,
      },
    });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
