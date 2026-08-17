/**
 * Genera consultas de búsqueda AliExpress a partir de un problema/nicho.
 * Offline, determinista. No inventa productos ni afirma tendencia de mercado.
 */

const MAX_QUERIES = 6;

/** Frases (español, sin tildes) → queries AE en inglés. Más largas primero. */
const PHRASE_MAP = [
  {
    keys: ['dolor lumbar', 'espalda baja', 'ciatica', 'lumbar'],
    queries: ['lumbar support cushion office', 'posture corrector back', 'seat cushion sciatica'],
  },
  {
    keys: ['dolor de cuello', 'cervical', 'cuello tenso'],
    queries: ['neck massager shiatsu', 'cervical pillow memory foam', 'neck heating pad'],
  },
  {
    keys: ['postura', 'joroba', 'ergonomia'],
    queries: ['posture corrector invisible', 'laptop stand ergonomic', 'lumbar support cushion'],
  },
  {
    keys: ['organizar cocina', 'cocina pequena', 'desorden cocina'],
    queries: ['kitchen organizer', 'under sink organizer', 'spice rack wall'],
  },
  {
    keys: ['pelo de gato', 'pelo de perro', 'pelo mascota'],
    queries: ['pet hair remover roller', 'pet hair vacuum mini', 'lint roller extra sticky'],
  },
  {
    keys: ['comedero lento', 'come rapido', 'ansiedad comida'],
    queries: ['slow feeder dog bowl', 'puzzle feeder cat', 'anti gulp dog bowl'],
  },
  {
    keys: ['acne', 'puntos negros', 'skincare', 'cutis'],
    queries: ['led face mask', 'blackhead vacuum', 'jade roller set'],
  },
  {
    keys: ['ronquido', 'apnea', 'dormir mal'],
    queries: ['anti snoring chin strap', 'nasal dilator', 'white noise machine mini'],
  },
  {
    keys: ['cables', 'enredos', 'escritorio cables'],
    queries: ['magnetic cable organizer', 'cable management box', 'desk cable clips'],
  },
  {
    keys: ['auto', 'auto solar', 'parabrisas'],
    queries: ['magnetic phone mount car', 'car trash can mini', 'sun shade windshield'],
  },
  {
    keys: ['humedad', 'closet humedo', 'moho'],
    queries: ['mini dehumidifier closet', 'moisture absorber pack', 'closet dehumidifier rechargeable'],
  },
  {
    keys: ['frio', 'manos frias', 'calefaccion personal'],
    queries: ['rechargeable hand warmer', 'heated vest usb', 'electric heating pad'],
  },
  {
    keys: ['mascotas', 'perro', 'gato'],
    queries: ['pet hair remover', 'slow feeder dog', 'cat water fountain'],
  },
  {
    keys: ['cocina', 'organizar'],
    queries: ['kitchen organizer', 'pantry storage bins', 'under sink organizer'],
  },
  {
    keys: ['oficina', 'home office', 'escritorio'],
    queries: ['desk organizer', 'laptop stand foldable', 'monitor light bar'],
  },
  {
    keys: ['fitness', 'gym casa', 'ejercicio'],
    queries: ['resistance bands set', 'ab roller wheel', 'yoga mat extra thick'],
  },
  {
    keys: ['belleza', 'maquillaje'],
    queries: ['led makeup mirror', 'hair dryer diffuser', 'makeup organizer rotating'],
  },
  {
    keys: ['asado', '18 de septiembre', 'fiestas patrias', 'picnic'],
    queries: ['portable charcoal grill mini', 'meat thermometer wireless', 'insulated tumbler 30oz'],
  },
  {
    keys: ['luz azul', 'pantallas', 'ojos cansados'],
    queries: ['blue light glasses', 'monitor light bar', 'eye massager'],
  },
  {
    keys: ['unas', 'manicure', 'esmalte'],
    queries: ['nail drill kit', 'uv nail lamp mini', 'nail art kit'],
  },
  {
    keys: ['once', 'termo', 'mate'],
    queries: ['insulated tumbler 30oz', 'electric kettle mini', 'tea infuser bottle'],
  },
];

const WORD_MAP = {
  lumbar: ['lumbar support cushion'],
  espalda: ['back stretcher', 'lumbar support cushion'],
  cuello: ['neck massager'],
  postura: ['posture corrector'],
  cocina: ['kitchen organizer'],
  organizador: ['organizer storage'],
  perro: ['dog slow feeder'],
  gato: ['cat water fountain'],
  mascota: ['pet hair remover'],
  acne: ['led face mask'],
  cables: ['cable organizer magnetic'],
  humedad: ['mini dehumidifier'],
  frio: ['hand warmer rechargeable'],
  calor: ['portable neck fan'],
  uv: ['uv protection visor'],
  yoga: ['yoga mat'],
  masaje: ['massage gun mini'],
  luz: ['led strip lights'],
  auto: ['car phone holder magnetic'],
  asado: ['portable charcoal grill mini'],
  unas: ['nail drill kit'],
  termo: ['insulated tumbler 30oz'],
};

/** Chips de ejemplo en Descubrir (input → suggestAeQueries). */
export const DISCOVER_EXAMPLES = [
  { label: 'Dolor lumbar', input: 'dolor lumbar en la oficina' },
  { label: 'Pelo de gato', input: 'pelo de gato en el sofá' },
  { label: 'Cocina chica', input: 'organizar cocina pequeña' },
  { label: 'Humedad', input: 'humedad en el closet' },
  { label: 'Cuello tenso', input: 'dolor de cuello' },
];

export function stripAccents(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function aliexpressSearchUrl(query) {
  const q = String(query || '').trim();
  return `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`;
}

export function googleTrendsClUrl(query) {
  const q = String(query || '').trim();
  return `https://trends.google.com/trends/explore?geo=CL&q=${encodeURIComponent(q)}`;
}

export function mercadoLibreClSearchUrl(query) {
  const q = String(query || '').trim();
  return `https://www.mercadolibre.cl/jm/search?as_word=${encodeURIComponent(q)}`;
}

/**
 * @param {string} query
 * @returns {{ query: string, aeUrl: string, trendsUrl: string, mlUrl: string }}
 */
export function buildSearchLinks(query) {
  const q = String(query || '').trim();
  return {
    query: q,
    aeUrl: aliexpressSearchUrl(q),
    trendsUrl: googleTrendsClUrl(q),
    mlUrl: mercadoLibreClSearchUrl(q),
  };
}

function uniqueQueries(list) {
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const q = String(raw || '').trim();
    if (!q) continue;
    const key = stripAccents(q);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
    if (out.length >= MAX_QUERIES) break;
  }
  return out;
}

/**
 * @param {string} rawInput
 * @returns {{ ok: false, error: string } | { ok: true, source: string, queries: ReturnType<typeof buildSearchLinks>[], disclaimer: string }}
 */
export function suggestAeQueries(rawInput) {
  const original = String(rawInput || '').trim();
  if (original.length < 3) {
    return {
      ok: false,
      error: 'Escribe un problema o nicho (mínimo 3 caracteres).',
    };
  }

  const normalized = stripAccents(original);
  const collected = [];
  let source = 'texto-libre';

  for (const row of PHRASE_MAP) {
    if (row.keys.some((k) => normalized.includes(k))) {
      collected.push(...row.queries);
      source = 'diccionario';
    }
  }

  if (collected.length === 0) {
    const tokens = normalized.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
    for (const token of tokens) {
      const mapped = WORD_MAP[token];
      if (mapped) collected.push(...mapped);
    }
    if (collected.length) source = 'diccionario';
  }

  if (!collected.some((q) => stripAccents(q) === normalized)) {
    collected.unshift(original);
  }

  const queries = uniqueQueries(collected).map(buildSearchLinks);

  return {
    ok: true,
    source,
    queries,
    disclaimer:
      'Son búsquedas, no productos “hot”. El listing lo eliges tú en AliExpress.',
  };
}

/**
 * @param {{ name?: string, queries?: string[] }} niche
 */
export function suggestQueriesFromNiche(niche) {
  const list = Array.isArray(niche?.queries) ? niche.queries : [];
  if (!list.length) {
    return { ok: false, error: 'Este nicho no tiene búsquedas.' };
  }
  return {
    ok: true,
    source: 'calendario-chile',
    queries: uniqueQueries(list).map(buildSearchLinks),
    disclaimer:
      'Hipótesis de temporada Chile — no es ranking en vivo. El listing lo eliges tú.',
  };
}
