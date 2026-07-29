// Supabase Edge Function: gemini-proxy
// Deploy: supabase functions deploy gemini-proxy --project-ref <ref>
// Secret:  supabase secrets set GEMINI_API_KEY=... --project-ref <ref>
// Requires authenticated JWT (verify_jwt = true by default).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnon) {
      return json({ error: 'Server misconfigured (Supabase env)' }, 500);
    }
    if (!geminiKey) {
      return json({ error: 'GEMINI_API_KEY secret not set' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
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
