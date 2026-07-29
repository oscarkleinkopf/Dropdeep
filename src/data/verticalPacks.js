/**
 * Starter prompt packs by vertical — zero API cost, copy-ready for free chatbots.
 * Honest templates until the user runs Deep Research or pastes their product.
 */

const PRODUCT_PLACEHOLDER = '[TU PRODUCTO]';
const NICHE_PLACEHOLDER = '[TU NICHO]';

export const verticalPacks = [
  {
    id: 'belleza',
    name: 'Belleza & Skincare',
    emoji: '✨',
    framing:
      'Pack de arranque para cosmética, skincare y dispositivos de belleza en e-commerce. Sustituye ' +
      PRODUCT_PLACEHOLDER + ' por tu SKU (ej. rodillo de jade, serum vitamina C, masajeador facial). ' +
      'Son plantillas — mejores resultados después de un Deep Research o pegando datos reales del producto.',
    prompts: [
      {
        id: 'research',
        title: 'Investigación de producto y dolor del comprador',
        text: `[ROL: Investigador de mercado — nicho Belleza & Skincare]

Analiza el producto "${PRODUCT_PLACEHOLDER}" para dropshipping en LATAM/España.

1. Perfil del comprador ideal (edad, género, ingresos, rutina actual de skincare).
2. 10 verbatims reales que dirían en Reddit/foros sobre su frustración con el problema que resuelve.
3. Soluciones actuales que ya probó y por qué fallan.
4. Mecanismo único del problema (UMP) y de la solución (UMS) en lenguaje simple.
5. 3 competidores directos en Amazon/AliExpress y qué prometen.

Responde en español, estructurado, sin introducciones genéricas.`,
      },
      {
        id: 'angles',
        title: '5 ángulos de marketing para anuncios',
        text: `[ROL: Copywriter de respuesta directa — Belleza]

Para "${PRODUCT_PLACEHOLDER}" genera 5 ángulos publicitarios distintos:

- Ángulo 1: Revelación / lo que la industria no cuenta
- Ángulo 2: Rutina de 60 segundos (facilidad)
- Ángulo 3: Antes/después emocional (autoestima)
- Ángulo 4: Ingrediente o tecnología como héroe
- Ángulo 5: Prueba social / UGC testimonial

Para cada uno: titular (≤8 palabras), gancho de 3 s, narrativa de 2 frases y CTA.`,
      },
      {
        id: 'meta-ads',
        title: '3 variantes Meta Ads (Facebook/Instagram)',
        text: `[ROL: Media buyer + copywriter — Meta Ads Belleza]

Crea 3 anuncios completos para "${PRODUCT_PLACEHOLDER}":

Variante A — dolor + solución
Variante B — curiosidad / patrón interrumpido
Variante C — oferta limitada + garantía

Por variante incluye: texto principal (≤125 palabras), titular, descripción, sugerencia de creativo (imagen/video) y CTA recomendado.`,
      },
      {
        id: 'tiktok-ugc',
        title: 'Guión UGC TikTok/Reels (45 s)',
        text: `[ROL: Guionista UGC — TikTok Belleza]

Escribe un guión de 45 segundos estilo UGC para "${PRODUCT_PLACEHOLDER}":

- Hook 0–3 s (patrón interrumpido)
- Problema empático 3–15 s
- Demostración del producto 15–35 s
- Prueba social rápida 35–42 s
- CTA overlay 42–45 s

Incluye dirección de cámara, texto en pantalla y locución palabra por palabra.`,
      },
      {
        id: 'objections',
        title: 'Objeciones y contra-argumentos',
        text: `[ROL: Especialista en conversión — Belleza]

Lista las 7 objeciones más comunes al comprar "${PRODUCT_PLACEHOLDER}" online (precio, efectividad, envío, ingredientes, etc.).

Para cada objeción:
- Frase exacta del cliente escéptico
- Respuesta persuasiva (≤3 frases)
- Prueba o garantía que la refuerza

Cierra con una garantía de 30 días redactada para la ficha de producto.`,
      },
      {
        id: 'email-cta',
        title: 'Secuencia email + notas de CTA',
        text: `[ROL: Email marketer — e-commerce Belleza]

Diseña una mini-secuencia de 3 emails para carrito abandonado / post-compra de "${PRODUCT_PLACEHOLDER}":

Email 1: recordatorio + beneficio emocional
Email 2: prueba social + urgencia suave
Email 3: último aviso + descuento o bonus

Por email: asunto, preheader y cuerpo (≤150 palabras).

Al final, 5 variantes de CTA para botones (landing y anuncios).`,
      },
    ],
  },
  {
    id: 'pets',
    name: 'Mascotas & Pets',
    emoji: '🐾',
    framing:
      'Pack para accesorios, alimentación automática, grooming y bienestar pet. Reemplaza ' +
      PRODUCT_PLACEHOLDER + ' (ej. comedero inteligente, cepillo deshedding, cama ortopédica). ' +
      'Plantillas listas para copiar — enriquece con Deep Research cuando tengas tu producto validado.',
    prompts: [
      {
        id: 'research',
        title: 'Investigación de nicho pet y avatar',
        text: `[ROL: Investigador — mercado Mascotas]

Investiga "${PRODUCT_PLACEHOLDER}" para dueños de mascotas (perros/gatos) en e-commerce.

1. Avatar: tipo de dueño, raza/tamaño de mascota, dolor principal.
2. 10 frases textuales de foros (Reddit r/dogs, r/cats) sobre el problema.
3. Productos alternativos que ya compraron y decepciones.
4. Estacionalidad y triggers de compra impulsiva.
5. Rangos de precio aceptables y sensibilidad al envío.

Español, formato bullet estructurado.`,
      },
      {
        id: 'angles',
        title: 'Ángulos emocionales (dueño ↔ mascota)',
        text: `[ROL: Copywriter — Pets]

Genera 5 ángulos para "${PRODUCT_PLACEHOLDER}" apelando al vínculo dueño-mascota:

1. "Tu mejor amigo merece…"
2. Problema de salud/comodidad de la mascota
3. Ahorro de tiempo para dueños ocupados
4. Veterinario / experto recomienda (sin claims médicos falsos)
5. Antes/después comportamiento o higiene

Titular + hook + 2 frases de cuerpo + CTA por ángulo.`,
      },
      {
        id: 'meta-ads',
        title: 'Meta Ads para audiencias pet lovers',
        text: `[ROL: Ads — Facebook/Instagram Pets]

3 creativos Meta para "${PRODUCT_PLACEHOLDER}":

- Intereses sugeridos (pet supplies, dog training, cat lovers…)
- Copy principal con emoji moderado
- Titular ≤40 caracteres
- Idea de video: mascota real vs stock

Incluye nota de cumplimiento: no prometer curas veterinarias.`,
      },
      {
        id: 'tiktok-ugc',
        title: 'UGC TikTok con mascota en cámara',
        text: `[ROL: UGC — TikTok Pets]

Guión 30–60 s para "${PRODUCT_PLACEHOLDER}" mostrando a la mascota usando el producto:

Hook visual (mascota reacciona)
Voice-over del dueño
Texto en pantalla
CTA "Link en bio"

Indica si funciona mejor perro, gato o ambos.`,
      },
      {
        id: 'objections',
        title: 'Objeciones típicas pet e-commerce',
        text: `[ROL: Conversión — Pets]

7 objeciones para "${PRODUCT_PLACEHOLDER}":
- "Mi mascota no lo usará"
- "Es de plástico barato / inseguro"
- "Llega tarde desde China"
- "Ya tengo uno similar"
- etc.

Respuesta + elemento de confianza (material, garantía, reviews) por objeción.`,
      },
      {
        id: 'email-cta',
        title: 'Emails post-compra + CTAs',
        text: `[ROL: Retención — Pets]

Secuencia 3 emails para compradores de "${PRODUCT_PLACEHOLDER}":
1. Guía de uso / tips
2. Cross-sell complementario
3. Referido "invita a otro pet parent"

+ 5 CTAs para landing ("Protege a [nombre mascota]", etc.).`,
      },
    ],
  },
  {
    id: 'hogar',
    name: 'Hogar & Organización',
    emoji: '🏠',
    framing:
      'Pack para organización, cocina, limpieza y gadgets de hogar. Usa ' +
      PRODUCT_PLACEHOLDER + ' (ej. organizador bajo fregadero, dispensador aceite, luz LED sensor). ' +
      'Templates honestos — personaliza con tu producto o un reporte Deep Research.',
    prompts: [
      {
        id: 'research',
        title: 'Research hogar: problema y comprador',
        text: `[ROL: Market research — Hogar & Organización]

Analiza "${PRODUCT_PLACEHOLDER}" para hogares en España/LATAM.

1. Quién compra (edad, situación: piso pequeño, familia, teletrabajo).
2. Dolor concreto del espacio/desorden/limpieza.
3. 10 verbatims de Amazon reviews negativas de competidores.
4. Precio psicológico y comparación con alternativas retail (IKEA, Leroy Merlin).
5. Oportunidad estacional (mudanza, rebajas, Black Friday).

Español estructurado.`,
      },
      {
        id: 'angles',
        title: 'Ángulos "antes/después" del hogar',
        text: `[ROL: Copy — Hogar]

5 ángulos para "${PRODUCT_PLACEHOLDER}":

- Caos → orden en 5 minutos
- Ahorro de espacio en cocina/baño
- Regalo perfecto para mamá/pareja
- Solución viral vista en TikTok
- Comparación vs método tradicional caro

Hook + titular + beneficio medible + CTA.`,
      },
      {
        id: 'meta-ads',
        title: 'Meta Ads hogar (problema visual)',
        text: `[ROL: Meta Ads — Home]

3 ads para "${PRODUCT_PLACEHOLDER}" con enfoque visual antes/después:

Copy que describe la transformación del espacio
Titular corto
Sugerencia carrusel vs video demo
Audiencias: home decor, organization hacks, cooking enthusiasts`,
      },
      {
        id: 'tiktok-ugc',
        title: 'TikTok "satisfying organization"',
        text: `[ROL: TikTok — Hogar]

Guión estilo satisfying/organización para "${PRODUCT_PLACEHOLDER}":

ASMR opcional, manos organizando, reveal final
Duración 20–40 s
Hashtags sugeridos
CTA shop now`,
      },
      {
        id: 'objections',
        title: 'Objeciones calidad y envío',
        text: `[ROL: Objeciones — Hogar]

7 objeciones: calidad plástico, medidas incorrectas, no encaja, envío lento, difícil montaje…

Respuestas con specs, tabla de medidas, video instalación, garantía.`,
      },
      {
        id: 'email-cta',
        title: 'Email + CTA landing hogar',
        text: `[ROL: Email — Hogar]

3 emails: bienvenida post-compra, tips de uso, reseña incentivada (sin violar políticas).

5 CTAs: "Ordena tu cocina hoy", "Últimas unidades", etc.`,
      },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness & Bienestar',
    emoji: '💪',
    framing:
      'Pack para equipamiento fitness, recovery y bienestar activo. Sustituye ' +
      PRODUCT_PLACEHOLDER + ' (ej. bandas resistance, masajeador percusión, botella smart). ' +
      'Plantillas — combina con Deep Research para datos de mercado reales.',
    prompts: [
      {
        id: 'research',
        title: 'Research fitness: avatar y competencia',
        text: `[ROL: Research — Fitness]

Producto: "${PRODUCT_PLACEHOLDER}"

1. Avatar (nivel fitness, objetivo, gym vs casa).
2. Dolores: lesiones, falta tiempo, equipamiento caro.
3. 10 verbatims de comunidades fitness.
4. Competidores DTC y precios.
5. Claims permitidos vs prohibidos (salud).`,
      },
      {
        id: 'angles',
        title: 'Ángulos transformación y disciplina',
        text: `[ROL: Copy — Fitness]

5 ángulos: transformación 30 días, entrenar en casa, recovery pro, atleta ocupado, comparación gym mensualidad.

Titular + hook video + CTA.`,
      },
      {
        id: 'meta-ads',
        title: 'Meta Ads fitness',
        text: `[ROL: Meta — Fitness]

3 variantes con video demo ejercicio/recovery para "${PRODUCT_PLACEHOLDER}".

Audiencias: home workout, CrossFit, yoga, running.`,
      },
      {
        id: 'tiktok-ugc',
        title: 'UGC entrenamiento / demo',
        text: `[ROL: UGC Fitness]

Guión 45 s: demo ejercicio o uso recovery, resultados esperados realistas, disclaimer no médico, CTA.`,
      },
      {
        id: 'objections',
        title: 'Objeciones fitness e-commerce',
        text: `[ROL: Objeciones]

"No funciona", "Es chino barato", "Ya tengo gym" — 7 objeciones con respuestas y garantía.`,
      },
      {
        id: 'email-cta',
        title: 'Email rutina + CTAs',
        text: `[ROL: Email Fitness]

Mini-plan 7 días con el producto + 3 emails + 5 CTAs landing.`,
      },
    ],
  },
  {
    id: 'tech',
    name: 'Gadgets & Tech',
    emoji: '📱',
    framing:
      'Pack para gadgets, accesorios tech y regalos geek. Reemplaza ' +
      PRODUCT_PLACEHOLDER + ' (ej. cargador magnético, hub USB-C, auriculares sleep). ' +
      'Templates genéricos — valida specs reales con Deep Research.',
    prompts: [
      {
        id: 'research',
        title: 'Research gadget y early adopters',
        text: `[ROL: Tech market research]

"${PRODUCT_PLACEHOLDER}":

1. Early adopter vs comprador regalo.
2. Specs que importan vs marketing fluff.
3. 10 quejas de reviews Amazon competidores.
4. Precio ancla vs Apple/Samsung alternativas.
5. Canales: TikTok tech vs Meta broad.`,
      },
      {
        id: 'angles',
        title: 'Ángulos specs y lifestyle',
        text: `[ROL: Copy Tech]

5 ángulos: spec hero, comparación marca cara, productividad, regalo perfecto, unboxing viral.`,
      },
      {
        id: 'meta-ads',
        title: 'Meta Ads tech (spec-led)',
        text: `[ROL: Meta Tech]

3 ads con bullet specs, compatibilidad, garantía 2 años. Evitar claims falsos.`,
      },
      {
        id: 'tiktok-ugc',
        title: 'TikTok unboxing / hack',
        text: `[ROL: UGC Tech]

Guión unboxing 30 s + "life hack" con "${PRODUCT_PLACEHOLDER}".`,
      },
      {
        id: 'objections',
        title: 'Objeciones compatibilidad y calidad',
        text: `[ROL: Objeciones Tech]

7 objeciones: compatibilidad, batería, calidad vs original, soporte…`,
      },
      {
        id: 'email-cta',
        title: 'Email setup + CTAs',
        text: `[ROL: Email Tech]

Guía configuración + cross-sell accesorios + CTAs "Upgrade tu setup".`,
      },
    ],
  },
];

export function getVerticalPackById(id) {
  return verticalPacks.find((p) => p.id === id) ?? verticalPacks[0];
}

export function formatPackForCopy(pack, productName = PRODUCT_PLACEHOLDER) {
  const name = productName?.trim() || PRODUCT_PLACEHOLDER;
  const header = `# Pack ${pack.name} — DropDeep\n\n${pack.framing.replace(/\[TU PRODUCTO\]/g, name)}\n\n---\n\n`;
  const body = pack.prompts
    .map(
      (p, i) =>
        `## ${i + 1}. ${p.title}\n\n${p.text.replace(/\[TU PRODUCTO\]/g, name).replace(/\[TU NICHO\]/g, pack.name)}`
    )
    .join('\n\n---\n\n');
  return header + body;
}

export function personalizePromptText(text, productName, nicheName) {
  const name = productName?.trim() || PRODUCT_PLACEHOLDER;
  const niche = nicheName || NICHE_PLACEHOLDER;
  return text.replace(/\[TU PRODUCTO\]/g, name).replace(/\[TU NICHO\]/g, niche);
}
