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
 * CPC por defecto del simulador Montecarlo (USD).
 * Aproxima el punto medio de la banda ideal Chile (100–200 CLP) a FX ~950.
 */
export const AUDISIO_DEFAULT_MC_CPC_USD = 0.15;

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

/** IVA AliExpress / importación por defecto (Chile). */
export const AUDISIO_ALIEXPRESS_VAT_RATE = 0.19;

/** Defaults editables de comisiones (fracción del PVP). */
export const AUDISIO_DEFAULT_PAYMENT_FEE_RATE = 0.035; // Mercado Pago aprox.
export const AUDISIO_DEFAULT_SHOPIFY_FEE_RATE = 0.02;
export const AUDISIO_DEFAULT_SALES_VAT_RATE = 0.19; // IVA venta Chile típico

/** Umbrales Meta Ads Chile (métricas pegadas por el usuario — no API Meta). */
export const AUDISIO_CTR_MIN = 2;
export const AUDISIO_CTR_GOOD_MIN = 3;
export const AUDISIO_CTR_GOOD_MAX = 4;
export const AUDISIO_CTR_EXCELLENT_MIN = 6;
export const AUDISIO_CTR_EXCELLENT_MAX = 8;

export const AUDISIO_CPC_IDEAL_MIN_CLP = 100;
export const AUDISIO_CPC_IDEAL_MAX_CLP = 200;
export const AUDISIO_CPC_MAX_CLP = 300;

export const AUDISIO_ATC_NORMAL_MIN_CLP = 1_000;
export const AUDISIO_ATC_NORMAL_MAX_CLP = 3_000;
/** ATC tolerado si está entre 1/5 y 1/3 del CPA máx. */
export const AUDISIO_ATC_TOLERANCE_MIN_FRACTION = 1 / 5;
export const AUDISIO_ATC_TOLERANCE_MAX_FRACTION = 1 / 3;

export const AUDISIO_CPM_TYPICAL_MIN_CLP = 3_000;
export const AUDISIO_CPM_TYPICAL_MAX_CLP = 6_000;
export const AUDISIO_CPM_COMPETITIVE_MIN_CLP = 10_000;
export const AUDISIO_CPM_COMPETITIVE_MAX_CLP = 15_000;

/** Creativos / lanzamiento (T41). */
export const AUDISIO_VSL_DURATION_MIN_SEC = 20;
export const AUDISIO_VSL_DURATION_MAX_SEC = 60;
export const AUDISIO_VSL_HOOK_MIN_SEC = 3;
export const AUDISIO_VSL_HOOK_MAX_SEC = 7;
export const AUDISIO_CAPCUT_FONT = 'Montserrat';
export const AUDISIO_CAPCUT_FONT_SIZE = 13;
export const AUDISIO_CANVA_FONT = 'Poppins';
export const AUDISIO_ELEVENLABS_SPEED = 1.15;
export const AUDISIO_MIN_LAUNCH_VIDEOS = 5;
export const AUDISIO_MIN_LAUNCH_IMAGES = 5;
export const AUDISIO_MAX_LAUNCH_IMAGES = 10;
export const AUDISIO_WARMUP_BUDGET_USD = 5;
export const AUDISIO_WARMUP_DAYS_MIN = 1;
export const AUDISIO_WARMUP_DAYS_MAX = 2;
export const AUDISIO_LAUNCH_BUDGET_BEGINNER_USD = 10;
export const AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD = 20;
export const AUDISIO_LAUNCH_MIN_DAYS = 4;
export const AUDISIO_VSL_CHECKLIST_STORAGE_PREFIX = 'dropdeep_vsl_checklist_';

/**
 * Pedidos estimados mínimos en el presupuesto de test ($300) para no “quemar”
 * el budget sin señal de aprendizaje (heurística offline, no Meta API).
 */
export const AUDISIO_TEST_MIN_LEARNING_ORDERS = 20;

/** Ventana típica del presupuesto de testeo (meses). */
export const AUDISIO_TEST_BUDGET_WINDOW_MIN_MONTHS = 1;
export const AUDISIO_TEST_BUDGET_WINDOW_MAX_MONTHS = 1.5;
