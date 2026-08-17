/**
 * Hipótesis de temporada Chile para Descubrir.
 * Calendario comercial + queries AliExpress. No es ranking en vivo.
 */

/** @typedef {{ name: string, pain: string, queries: string[] }} ChileSeasonNiche */
/** @typedef {{
 *   id: string,
 *   name: string,
 *   emoji: string,
 *   months: number[],
 *   windowLabel: string,
 *   hook: string,
 *   niches: ChileSeasonNiche[],
 * }} ChileSeason */

const MONTH_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatChileMonth(now = new Date()) {
  return MONTH_ES[now.getMonth()] || '';
}

/** @type {ChileSeason[]} */
export const CHILE_SEASONS = [
  {
    id: 'verano',
    name: 'Verano',
    emoji: '☀️',
    months: [12, 1, 2],
    windowLabel: 'Dic–feb',
    hook: 'Calor, UV y patio. Busca algo que quepa en caja de zapatos.',
    niches: [
      {
        name: 'UV y calor',
        pain: 'Sol en la cara y micro en el auto.',
        queries: ['uv protection visor', 'portable neck fan', 'cooling towel'],
      },
      {
        name: 'Patio / camping',
        pain: 'Salidas de último minuto sin equipo grande.',
        queries: ['portable camping light', 'foldable picnic table mini', 'insect zapper outdoor'],
      },
      {
        name: 'Agua y deporte',
        pain: 'Playa, piscina y celular mojado.',
        queries: ['insulated water bottle 1l', 'waterproof phone pouch', 'swimming goggles anti fog'],
      },
    ],
  },
  {
    id: 'clases',
    name: 'Vuelta a clases',
    emoji: '📚',
    months: [2, 3, 4],
    windowLabel: 'Feb–abr',
    hook: 'Escritorio, mochila y foco. Padres compran en marzo.',
    niches: [
      {
        name: 'Escritorio',
        pain: 'Pieza chica, tarea hasta tarde.',
        queries: ['desk organizer kids', 'led desk lamp clip', 'laptop stand foldable'],
      },
      {
        name: 'Mochila / cables',
        pain: 'Cables y útiles que se pierden todos los días.',
        queries: ['cable organizer magnetic', 'pencil case large capacity', 'water bottle school leak proof'],
      },
      {
        name: 'Estudio',
        pain: 'Postura y concentración en pantallas.',
        queries: ['book stand adjustable', 'timer pomodoro cube', 'posture corrector kids'],
      },
    ],
  },
  {
    id: 'madre',
    name: 'Día de la Madre',
    emoji: '💐',
    months: [4, 5],
    windowLabel: 'Abr–may',
    hook: '2.º domingo de mayo. Regalo compacto, no electrodoméstico enorme.',
    niches: [
      {
        name: 'Belleza en casa',
        pain: 'Ritual corto después del trabajo.',
        queries: ['led face mask', 'facial steamer nano', 'jade roller set'],
      },
      {
        name: 'Cocina práctica',
        pain: 'Once y colación sin ensuciar todo.',
        queries: ['garlic press stainless', 'under sink organizer', 'electric lunch box'],
      },
      {
        name: 'Bienestar',
        pain: 'Cuello y sueño después de un día largo.',
        queries: ['neck massager shiatsu', 'heated eye mask', 'aromatherapy diffuser mini'],
      },
    ],
  },
  {
    id: 'invierno',
    name: 'Invierno',
    emoji: '🌧️',
    months: [6, 7, 8],
    windowLabel: 'Jun–ago',
    hook: 'Frío, humedad y closet. Producto que se usa todas las noches.',
    niches: [
      {
        name: 'Calor personal',
        pain: 'Manos y pie de cama helados.',
        queries: ['rechargeable hand warmer', 'heated vest usb', 'electric heating pad'],
      },
      {
        name: 'Hogar húmedo',
        pain: 'Ropa que no seca y closet con olor.',
        queries: ['mini dehumidifier closet', 'humidifier essential oil', 'window insulation film'],
      },
      {
        name: 'Cuello / sueño',
        pain: 'Tensión y mal dormir con calefacción.',
        queries: ['neck massager', 'weighted sleep mask', 'electric blanket throw'],
      },
    ],
  },
  {
    id: 'patrias',
    name: 'Fiestas Patrias',
    emoji: '🇨🇱',
    months: [8, 9],
    windowLabel: 'Ago–sep',
    hook: 'El 18 se arma asado y picnic. SKU de fiesta, no carpa de feria.',
    niches: [
      {
        name: 'Asado / picnic',
        pain: 'Asado en departamento o plaza.',
        queries: ['portable charcoal grill mini', 'folding picnic basket', 'meat thermometer wireless'],
      },
      {
        name: 'Aire libre',
        pain: 'Térmico, mosquitos y luz cuando se hace de noche.',
        queries: ['insulated tumbler 30oz', 'mosquito killer lamp', 'camping hanging light'],
      },
      {
        name: 'Cocina fiesta',
        pain: 'Empanadas, hielo y once para visita.',
        queries: ['empanada maker press', 'beer dispenser tower', 'ice cube tray large'],
      },
    ],
  },
  {
    id: 'cyber',
    name: 'Cyber',
    emoji: '💳',
    months: [5, 10],
    windowLabel: 'May / oct',
    hook: 'CyberDay y CyberMonday: ten 2–3 candidatos listos, no improvises el día.',
    niches: [
      {
        name: 'Gadgets de impulso',
        pain: 'Compra chica que se justifica en oferta.',
        queries: ['magnetic phone mount car', 'led strip lights usb', 'bluetooth tracker card'],
      },
      {
        name: 'Hogar organización',
        pain: 'Cajones y cables que explotan en invierno.',
        queries: ['vacuum storage bags', 'over door organizer', 'cable management box'],
      },
      {
        name: 'Belleza / cuidado',
        pain: 'Recambio barato (cabezales, uñas, pelo).',
        queries: ['hair dryer diffuser attachment', 'electric toothbrush heads', 'nail drill kit'],
      },
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    months: [10],
    windowLabel: 'Octubre',
    hook: 'Decoración y disfraz compacto. Ventana corta: llega a tiempo.',
    niches: [
      {
        name: 'Decoración',
        pain: 'Depto o frontis sin instalación pesada.',
        queries: ['halloween led string lights', 'fog machine mini', 'spider web halloween outdoor'],
      },
      {
        name: 'Disfraz / makeup',
        pain: 'Último minuto, tiene que entrar en sobre.',
        queries: ['vampire fangs realistic', 'face paint halloween kit', 'witch hat led'],
      },
    ],
  },
  {
    id: 'navidad',
    name: 'Navidad',
    emoji: '🎄',
    months: [11, 12],
    windowLabel: 'Nov–dic',
    hook: 'Regalo que se ve “wow” y viaja en caja chica. Empieza en noviembre.',
    niches: [
      {
        name: 'Decoración',
        pain: 'Living chileno, no árbol de 2 metros.',
        queries: ['christmas projector lights', 'led curtain lights', 'christmas tree topper star'],
      },
      {
        name: 'Regalo compacto',
        pain: 'Secret Santa y familia: un objeto, no un kit enorme.',
        queries: ['mini projector portable', 'wireless charger stand', 'smart led alarm clock'],
      },
      {
        name: 'Cocina fiesta',
        pain: 'Cena y once de diciembre.',
        queries: ['cookie press gun', 'wine opener electric', 'ice maker countertop mini'],
      },
    ],
  },
];

/**
 * @param {Date} [now]
 * @returns {{ active: ChileSeason[], upcoming: ChileSeason[], monthLabel: string }}
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
  return { active, upcoming, monthLabel: formatChileMonth(now) };
}
