/**
 * Hipótesis de temporada Chile para Descubrir.
 * No es ranking en vivo ni Google Trends: calendario comercial + queries
 * de búsqueda AliExpress para que el usuario abra AE y pegue un listing.
 */

/** @typedef {{ name: string, queries: string[] }} ChileSeasonNiche */
/** @typedef {{
 *   id: string,
 *   name: string,
 *   months: number[],
 *   windowLabel: string,
 *   why: string,
 *   niches: ChileSeasonNiche[],
 * }} ChileSeason */

/** @type {ChileSeason[]} */
export const CHILE_SEASONS = [
  {
    id: 'verano',
    name: 'Verano',
    months: [12, 1, 2],
    windowLabel: 'Diciembre–febrero',
    why: 'Calor, UV, patio y playa. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'UV y calor',
        queries: ['uv protection visor', 'portable neck fan', 'cooling towel'],
      },
      {
        name: 'Patio / camping',
        queries: ['portable camping light', 'foldable picnic table mini', 'insect zapper outdoor'],
      },
      {
        name: 'Agua y deporte',
        queries: ['insulated water bottle 1l', 'waterproof phone pouch', 'swimming goggles anti fog'],
      },
    ],
  },
  {
    id: 'clases',
    name: 'Vuelta a clases',
    months: [2, 3, 4],
    windowLabel: 'Febrero–abril',
    why: 'Útiles, escritorio y organización escolar. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Escritorio',
        queries: ['desk organizer kids', 'led desk lamp clip', 'laptop stand foldable'],
      },
      {
        name: 'Mochila / cables',
        queries: ['cable organizer magnetic', 'pencil case large capacity', 'water bottle school leak proof'],
      },
      {
        name: 'Estudio',
        queries: ['book stand adjustable', 'timer pomodoro cube', 'posture corrector kids'],
      },
    ],
  },
  {
    id: 'madre',
    name: 'Día de la Madre',
    months: [4, 5],
    windowLabel: 'Abril–mayo',
    why: 'Regalos compactos (2.º domingo de mayo). Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Belleza en casa',
        queries: ['led face mask', 'facial steamer nano', 'jade roller set'],
      },
      {
        name: 'Cocina práctica',
        queries: ['garlic press stainless', 'under sink organizer', 'electric lunch box'],
      },
      {
        name: 'Bienestar',
        queries: ['neck massager shiatsu', 'heated eye mask', 'aromatherapy diffuser mini'],
      },
    ],
  },
  {
    id: 'invierno',
    name: 'Invierno',
    months: [6, 7, 8],
    windowLabel: 'Junio–agosto',
    why: 'Frío, humedad y hogar. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Calor personal',
        queries: ['rechargeable hand warmer', 'heated vest usb', 'electric heating pad'],
      },
      {
        name: 'Hogar húmedo',
        queries: ['mini dehumidifier closet', 'humidifier essential oil', 'window insulation film'],
      },
      {
        name: 'Cuello / sueño',
        queries: ['neck massager', 'weighted sleep mask', 'electric blanket throw'],
      },
    ],
  },
  {
    id: 'patrias',
    name: 'Fiestas Patrias',
    months: [8, 9],
    windowLabel: 'Agosto–septiembre',
    why: 'Asado, picnic y 18. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Asado / picnic',
        queries: ['portable charcoal grill mini', 'folding picnic basket', 'meat thermometer wireless'],
      },
      {
        name: 'Aire libre',
        queries: ['insulated tumbler 30oz', 'mosquito killer lamp', 'camping hanging light'],
      },
      {
        name: 'Cocina fiesta',
        queries: ['empanada maker press', 'beer dispenser tower', 'ice cube tray large'],
      },
    ],
  },
  {
    id: 'cyber',
    name: 'Cyber / ofertas',
    months: [5, 10],
    windowLabel: 'Mayo y octubre',
    why: 'Ventanas CyberDay / CyberMonday Chile: conviene tener candidatos listos. Hipótesis — no es ranking en vivo.',
    niches: [
      {
        name: 'Gadgets de impulso',
        queries: ['magnetic phone mount car', 'led strip lights usb', 'bluetooth tracker card'],
      },
      {
        name: 'Hogar organización',
        queries: ['vacuum storage bags', 'over door organizer', 'cable management box'],
      },
      {
        name: 'Belleza / cuidado',
        queries: ['hair dryer diffuser attachment', 'electric toothbrush heads', 'nail drill kit'],
      },
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    months: [10],
    windowLabel: 'Octubre',
    why: 'Decoración y disfraz compacto. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Decoración',
        queries: ['halloween led string lights', 'fog machine mini', 'spider web halloween outdoor'],
      },
      {
        name: 'Disfraz / makeup',
        queries: ['vampire fangs realistic', 'face paint halloween kit', 'witch hat led'],
      },
    ],
  },
  {
    id: 'navidad',
    name: 'Navidad',
    months: [11, 12],
    windowLabel: 'Noviembre–diciembre',
    why: 'Regalos y decoración. Hipótesis de calendario — no es ranking en vivo.',
    niches: [
      {
        name: 'Decoración',
        queries: ['christmas projector lights', 'led curtain lights', 'christmas tree topper star'],
      },
      {
        name: 'Regalo compacto',
        queries: ['mini projector portable', 'wireless charger stand', 'smart led alarm clock'],
      },
      {
        name: 'Cocina fiesta',
        queries: ['cookie press gun', 'wine opener electric', 'ice maker countertop mini'],
      },
    ],
  },
];

/**
 * @param {Date} [now]
 * @returns {{ active: ChileSeason[], upcoming: ChileSeason[] }}
 */
export function getSeasonsForDate(now = new Date()) {
  const month = now.getMonth() + 1;
  const next1 = month === 12 ? 1 : month + 1;
  const next2 = next1 === 12 ? 1 : next1 + 1;
  const active = CHILE_SEASONS.filter((s) => s.months.includes(month));
  const activeIds = new Set(active.map((s) => s.id));
  const upcoming = CHILE_SEASONS.filter(
    (s) => !activeIds.has(s.id) && (s.months.includes(next1) || s.months.includes(next2)),
  );
  return { active, upcoming };
}
