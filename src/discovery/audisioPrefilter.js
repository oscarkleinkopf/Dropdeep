import {
  evaluateAudisioPricing,
  suggestRetailFromCost,
  getStoredFxClpPerUsd,
} from '../research/pricingAudisio.js';
import { AUDISIO_METHOD_LABEL } from '../config/audisioRules.js';

/**
 * Pre-filtro Audisio sobre un candidato con costo AliExpress (USD).
 * No sustituye evaluación Winner (T39).
 *
 * @param {{ costUsd: number, retailUsd?: number, fxClpPerUsd?: number }} input
 */
export function prefilterAliExpressCandidate(input = {}) {
  const costUsd = Number(input.costUsd);
  const hasCost = Number.isFinite(costUsd) && costUsd > 0;
  if (!hasCost) {
    return {
      ready: false,
      label: AUDISIO_METHOD_LABEL,
      disclaimer:
        'Pre-filtro Audisio — indica el costo AliExpress (USD) para estimar PVP y margen. No sustituye la evaluación Winner.',
      pricing: null,
      summary: 'Sin costo — completa el precio del proveedor para el pre-filtro.',
      rankHint: 'unknown',
    };
  }

  const retailUsd =
    Number.isFinite(Number(input.retailUsd)) && Number(input.retailUsd) > 0
      ? Number(input.retailUsd)
      : suggestRetailFromCost(costUsd);

  const pricing = evaluateAudisioPricing({
    costUsd,
    retailUsd,
    fxClpPerUsd: input.fxClpPerUsd ?? getStoredFxClpPerUsd(),
  });

  const hasError = pricing.flags.some((f) => f.level === 'error');
  const hasWarn = pricing.flags.some((f) => f.level === 'warn');

  let rankHint = 'ok';
  let summary = `PVP sugerido ≈ $${pricing.suggestedRetailUsd.toFixed(2)} USD (${pricing.suggestedRetailClp.toLocaleString('es-CL')} CLP). Margen bruto estimado $${pricing.grossMarginUsd.toFixed(2)} USD.`;
  if (hasError) {
    rankHint = 'reject';
    summary = `Fuera de reglas Audisio: ${pricing.flags.find((f) => f.level === 'error')?.message || 'revisa costo/PVP'}`;
  } else if (hasWarn) {
    rankHint = 'caution';
    summary = `Viable con matices: ${pricing.flags.find((f) => f.level === 'warn')?.message || summary}`;
  }

  return {
    ready: true,
    label: AUDISIO_METHOD_LABEL,
    disclaimer:
      'Pre-filtro Audisio — estimación offline con tu costo. No sustituye la evaluación Winner ni datos de Affiliate en vivo.',
    pricing,
    summary,
    rankHint,
  };
}
