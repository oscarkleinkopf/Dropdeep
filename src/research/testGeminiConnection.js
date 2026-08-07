/**
 * Lightweight Gemini API key check (models.get — no generateContent).
 * @param {string} apiKey
 * @param {string} [modelName]
 * @returns {Promise<{ ok: boolean, status: number, message: string }>}
 */
export async function testGeminiConnection(apiKey, modelName = 'gemini-2.0-flash') {
  const key = String(apiKey || '').trim();
  if (!key) {
    return {
      ok: false,
      status: 0,
      message: 'Ingresa una API Key para probar la conexión.',
    };
  }

  const model = String(modelName || 'gemini-2.0-flash').trim() || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.status === 200) {
      return { ok: true, status: 200, message: 'Conexión válida' };
    }

    let message = `Error HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error?.message) {
        message = String(body.error.message);
      }
    } catch {
      /* keep status message */
    }

    return { ok: false, status: res.status, message };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err?.message || 'No se pudo conectar con Google Gemini.',
    };
  }
}
