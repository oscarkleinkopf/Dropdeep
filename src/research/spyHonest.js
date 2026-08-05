/**
 * Honestidad Spy (T11 Opción A) — helpers puros sin DOM.
 * Pixel/GA no se escanean del HTML; nunca se muestran como Sí/No verificados.
 */

export const SPY_UNVERIFIED_LABEL = 'No verificado';

export const SPY_INFERRED_BANNER =
  'Análisis inferido por IA — no verificado. No sustituye visitar la tienda.';

/**
 * Normaliza señales tech del análisis Spy: CMS/apps pueden venir de Gemini (inferidos),
 * pero pixel/GA siempre son "No verificado".
 */
export function describeSpyTechSignals(platform = {}) {
  const apps = Array.isArray(platform.appsDetected)
    ? platform.appsDetected.filter(Boolean).map(String)
    : [];
  return {
    cms: platform.cms ? String(platform.cms) : SPY_UNVERIFIED_LABEL,
    theme: platform.theme ? String(platform.theme) : SPY_UNVERIFIED_LABEL,
    appsDetected: apps,
    metaPixel: SPY_UNVERIFIED_LABEL,
    tiktokPixel: SPY_UNVERIFIED_LABEL,
    googleAnalytics4: SPY_UNVERIFIED_LABEL,
    ignoredBooleans: {
      pixelDetected: platform.pixelDetected,
      tiktokPixel: platform.tiktokPixel,
      googleAnalytics4: platform.googleAnalytics4,
    },
    disclaimer:
      'Pixel / TikTok Pixel / GA4: no escaneamos el HTML de la tienda. Cualquier Sí/No de la IA se ignora y se muestra como No verificado.',
  };
}
