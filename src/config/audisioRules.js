/**
 * Reglas financieras del método Audisio & Domingo (Chile / CLP).
 * Constantes de producto — no son cotizaciones ni benchmarks en vivo.
 * Ver docs/PLAN-MEJORAS.md §9 y docs/MANUAL.md.
 */

/** Costo origen → PVP sugerido (ej. 10 → ~25). */
export const AUDISIO_COST_TO_RETAIL_MULTIPLIER = 2.5;

/** Margen neto objetivo aproximado (facilitar con oferta/regalo). */
export const AUDISIO_NET_MARGIN_TARGET = 0.35;

/** Piso absoluto de venta en tienda (CLP). */
export const AUDISIO_PVP_FLOOR_CLP = 20_000;

/** Banda recomendada de PVP (CLP). */
export const AUDISIO_PVP_RECOMMENDED_MIN_CLP = 40_000;
export const AUDISIO_PVP_RECOMMENDED_MAX_CLP = 100_000;

/** Margen bruto mínimo por unidad (USD). */
export const AUDISIO_GROSS_MARGIN_MIN_USD = 15;

/** Presupuesto publicitario de testeo primer mes / mes y medio (USD). */
export const AUDISIO_TEST_AD_BUDGET_USD = 300;

/**
 * Tipo de cambio por defecto CLP por 1 USD (editable por el usuario).
 * No es feed en vivo — documentado como referencia editable.
 */
export const AUDISIO_DEFAULT_FX_CLP_PER_USD = 950;

export const AUDISIO_FX_STORAGE_KEY = 'dropdeep_audisio_fx_clp';

export const AUDISIO_METHOD_LABEL = 'Según método Audisio & Domingo';

/** CPA proyectado (USD): banda de testeo inicial. */
export const AUDISIO_CPA_TEST_MIN_USD = 5;
export const AUDISIO_CPA_TEST_IDEAL_MAX_USD = 7;

/** CPA máximo aceptable en general (USD). */
export const AUDISIO_CPA_ACCEPTABLE_MAX_USD = 15;

/** CPA estirado solo si el ticket del producto es ~caro. */
export const AUDISIO_CPA_STRETCH_MAX_USD = 20;
export const AUDISIO_CPA_STRETCH_TICKET_USD = 100;

/**
 * Score mínimo de “tamaño/peso” (0–100) para considerar empaque ≤ caja de zapatos.
 * En la rúbrica, 100 = pequeño/liviano.
 */
export const AUDISIO_SHIPPING_SIZE_MIN_SCORE = 50;

/** Mínimo de pilares Winner (solución / emoción / WOW) que deben cumplirse. */
export const AUDISIO_WINNER_PILLARS_MIN = 1;

export const AUDISIO_WINNER_PILLAR_IDS = ['solvesPain', 'emotionalHook', 'wowFactor'];
