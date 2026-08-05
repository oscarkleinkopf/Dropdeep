// Supabase Edge Function: gemini-proxy
// Deploy: supabase functions deploy gemini-proxy --project-ref <ref>
// Secret:  supabase secrets set GEMINI_API_KEY=... --project-ref <ref>
// Optional: supabase secrets set GEMINI_PROXY_DAILY_LIMIT=2
// Requires authenticated JWT (verify_jwt = true by default).
// Migrations: 003 + 004 (daily session quota), 005 (rate limit + session cooldown).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Keep in sync with src/config/proxyAbuse.js */
const MAX_CONTENTS_CHARS = 100_000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 10;
const NEW_SESSION_COOLDOWN_SEC = 30;

function parseDailyLimit() {
  const raw = Deno.env.get('GEMINI_PROXY_DAILY_LIMIT') ?? '2';
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

function estimateContentsChars(contents) {
  try {
    return JSON.stringify(contents ?? null).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function structuredLog(event, fields = {}) {
  // Never log prompts / contents — privacy (T20 / T21)
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }));
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

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body', code: 'bad_request' }, 400);
    }

    const researchSessionId = body.researchSessionId
      ? String(body.researchSessionId)
      : null;
    const sessionUuid = researchSessionId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          researchSessionId,
        )
      ? researchSessionId
      : null;

    const model = String(body.model || 'gemini-2.5-flash');
    const contents = body.contents;
    const useSearch = Boolean(body.useSearch);
    const tools = Array.isArray(body.tools) ? body.tools : (useSearch ? [{ google_search: {} }] : undefined);

    if (!contents) {
      return json({ error: 'Missing contents', code: 'bad_request' }, 400);
    }

    const payloadChars = estimateContentsChars(contents);
    if (payloadChars > MAX_CONTENTS_CHARS) {
      structuredLog('gemini_proxy_reject', {
        userId: user.id,
        reason: 'payload_too_large',
        payloadChars,
        maxChars: MAX_CONTENTS_CHARS,
      });
      return json(
        {
          error: 'payload_too_large',
          code: 'proxy_payload_too_large',
          message:
            'El prompt es demasiado grande para el proxy. Acorta el contexto o usa BYOK en Ajustes.',
          payloadChars,
          maxChars: MAX_CONTENTS_CHARS,
        },
        413,
      );
    }

    // Abuse: burst rate (10 / 10s)
    const { data: rateResult, error: rateError } = await admin.rpc('check_proxy_rate_limit', {
      p_user_id: user.id,
      p_max_requests: RATE_LIMIT_MAX,
      p_window_seconds: RATE_LIMIT_WINDOW_SEC,
    });

    if (rateError) {
      structuredLog('gemini_proxy_error', {
        userId: user.id,
        reason: 'rate_rpc_failed',
        detail: rateError.message,
      });
      return json({ error: 'Rate check failed', details: rateError.message }, 500);
    }

    if (!rateResult?.allowed) {
      structuredLog('gemini_proxy_reject', {
        userId: user.id,
        reason: 'rate_limit',
        count: rateResult?.count,
        limit: rateResult?.limit,
      });
      return json(
        {
          error: 'rate_limit_exceeded',
          code: 'proxy_rate_limit',
          message:
            'Demasiadas peticiones al proxy en poco tiempo. Espera unos segundos o usa BYOK / Modo Copiloto.',
          count: rateResult?.count ?? RATE_LIMIT_MAX,
          limit: rateResult?.limit ?? RATE_LIMIT_MAX,
          windowSeconds: RATE_LIMIT_WINDOW_SEC,
          retryAfterSeconds: RATE_LIMIT_WINDOW_SEC,
        },
        429,
      );
    }

    // Abuse: cooldown between NEW research sessions
    const { data: coolResult, error: coolError } = await admin.rpc('check_new_session_cooldown', {
      p_user_id: user.id,
      p_session_id: sessionUuid,
      p_cooldown_seconds: NEW_SESSION_COOLDOWN_SEC,
    });

    if (coolError) {
      structuredLog('gemini_proxy_error', {
        userId: user.id,
        reason: 'cooldown_rpc_failed',
        detail: coolError.message,
      });
      return json({ error: 'Cooldown check failed', details: coolError.message }, 500);
    }

    if (!coolResult?.allowed) {
      const retryAfter = coolResult?.retry_after_seconds ?? NEW_SESSION_COOLDOWN_SEC;
      structuredLog('gemini_proxy_reject', {
        userId: user.id,
        reason: 'session_cooldown',
        retryAfterSeconds: retryAfter,
      });
      return json(
        {
          error: 'session_cooldown',
          code: 'proxy_session_cooldown',
          message: `Espera ${retryAfter}s antes de iniciar otra investigación proxy (protección anti-abuso).`,
          retryAfterSeconds: retryAfter,
          cooldownSeconds: NEW_SESSION_COOLDOWN_SEC,
        },
        429,
      );
    }

    const { data: quotaResult, error: quotaError } = await admin.rpc(
      'check_and_increment_gemini_usage',
      {
        p_user_id: user.id,
        p_daily_limit: dailyLimit,
        p_session_id: sessionUuid,
      },
    );

    if (quotaError) {
      structuredLog('gemini_proxy_error', {
        userId: user.id,
        reason: 'quota_rpc_failed',
        detail: quotaError.message,
      });
      return json({ error: 'Quota check failed', details: quotaError.message }, 500);
    }

    if (!quotaResult?.allowed) {
      structuredLog('gemini_proxy_reject', {
        userId: user.id,
        reason: 'daily_quota',
        count: quotaResult?.count,
        limit: quotaResult?.limit,
      });
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
      structuredLog('gemini_proxy_upstream_error', {
        userId: user.id,
        model,
        status: geminiRes.status,
        payloadChars,
        // message only — no prompt
        upstream: String(msg).slice(0, 200),
      });
      return json({ error: msg, details: geminiJson }, geminiRes.status);
    }

    const text = geminiJson?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || '';

    structuredLog('gemini_proxy_ok', {
      userId: user.id,
      model,
      payloadChars,
      sessionReused: !!quotaResult?.session_reused,
      usageCount: quotaResult?.count ?? null,
      usageLimit: quotaResult?.limit ?? dailyLimit,
      responseChars: text.length,
    });

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
    structuredLog('gemini_proxy_exception', {
      detail: String(err?.message || err).slice(0, 200),
    });
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
