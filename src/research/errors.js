/** Classify Gemini / proxy failures for Spanish UX. */
export function classifyGeminiError(error) {
  const raw = String(error?.message || error || '');
  const msg = raw.toLowerCase();

  if (msg.includes('abort') || msg.includes('cancel')) {
    return {
      type: 'cancelled',
      title: 'Investigación cancelada',
      message: 'Detuviste la investigación. Puedes relanzarla cuando quieras.',
      actions: ['retry'],
    };
  }

  if (
    msg.includes('api key not valid') ||
    msg.includes('api_key_invalid') ||
    msg.includes('invalid api key') ||
    msg.includes('key is invalid') ||
    msg.includes('clave no válida')
  ) {
    return {
      type: 'invalid_key',
      title: 'Clave API de Gemini no válida',
      message: 'La clave guardada fue rechazada por Google. Revisa que esté completa y activa en Google AI Studio.',
      actions: ['settings', 'retry'],
    };
  }

  if (
    msg.includes('quota') ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('limit') ||
    msg.includes('exhausted') ||
    msg.includes('rate limit')
  ) {
    if (
      msg.includes('daily_limit') ||
      msg.includes('cuota diaria') ||
      msg.includes('daily limit') ||
      msg.includes('proxy_daily')
    ) {
      return {
        type: 'proxy_daily_quota',
        title: 'Cuota diaria de proxy agotada',
        message:
          'Cuota diaria agotada. Pega tu clave Gemini (gratis en AI Studio) o vuelve mañana.',
        actions: ['settings'],
      };
    }
    return {
      type: 'quota',
      title: 'Cuota o límite de peticiones alcanzado',
      message: 'Has superado el límite de tu plan Gemini. Espera unos minutos o revisa tu cuota en Google AI Studio.',
      actions: ['retry'],
    };
  }

  if (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('504') ||
    msg.includes('saturación') ||
    msg.includes('unavailable')
  ) {
    return {
      type: 'network',
      title: 'Error de conexión o servicio temporal',
      message: 'No se pudo contactar con Gemini. Comprueba tu internet e inténtalo de nuevo en unos segundos.',
      actions: ['retry'],
    };
  }

  if (
    msg.includes('gemini-proxy') ||
    msg.includes('proxy') ||
    msg.includes('edge function') ||
    msg.includes('functions.invoke') ||
    msg.includes('server misconfigured') ||
    msg.includes('gemini_api_key secret')
  ) {
    return {
      type: 'proxy',
      title: 'Proxy Gemini no disponible',
      message: 'El proxy seguro de Supabase no respondió. Verifica que la Edge Function esté desplegada y que GEMINI_API_KEY exista en secretos, o usa BYOK en Ajustes.',
      actions: ['settings', 'retry'],
    };
  }

  if (
    msg.includes('unauthorized') ||
    msg.includes('missing authorization') ||
    msg.includes('401')
  ) {
    return {
      type: 'auth',
      title: 'Sesión requerida para el proxy',
      message: 'Inicia sesión para usar el proxy Gemini o configura tu propia clave en Ajustes.',
      actions: ['settings'],
    };
  }

  if (
    msg.includes('parse') ||
    msg.includes('json') ||
    msg.includes('no pudo ser parseado') ||
    msg.includes('unexpected token')
  ) {
    return {
      type: 'parse',
      title: 'Respuesta de Gemini ilegible',
      message: 'El modelo devolvió un formato que no pudimos interpretar. Prueba otro modelo en Ajustes o relanza la investigación.',
      actions: ['settings', 'retry'],
    };
  }

  return {
    type: 'unknown',
    title: 'Error en Deep Research',
    message: raw || 'Ocurrió un error inesperado durante la investigación.',
    actions: ['settings', 'retry'],
  };
}
