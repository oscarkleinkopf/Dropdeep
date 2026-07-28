// PROMPT HUB STATE & GENERATOR ENGINE
export let promptHubState = {
  activeStep: 1,
  promptData: null
};

export function generateMasterPromptSequence(productName, competitorUrl = '', targetPrice = '', chatbotTarget = 'chatgpt') {
  const name = productName || 'Producto Ganador';
  const priceText = targetPrice ? `$${parseFloat(targetPrice).toFixed(2)}` : 'un precio competitivo de e-commerce';
  const compText = competitorUrl ? `\n- URL de Competidor Directo a Analizar: ${competitorUrl}` : '';

  const step1Titles = {
    chatgpt: "ChatGPT 4o / o3-mini",
    claude: "Claude 3.5 Sonnet",
    gemini: "Gemini 1.5 / 2.0 Web",
    deepseek: "DeepSeek R1 / V3"
  };
  const targetBotName = step1Titles[chatbotTarget] || 'ChatGPT';

  const step1 = `[SISTEMA: ROL DE INVESTIGADOR DE MERCADO DE ÉLITE PARA ${targetBotName.toUpperCase()}]
Actúa como un Investigador de Mercado de Élite y Redactor de Respuesta Directa de nivel mundial especializado en e-commerce y dropshipping.

Tu objetivo es realizar un análisis profundo del producto: "${name}"${compText}.
Precio Retail Estimado: ${priceText}.

Genera los siguientes 5 bloques con información detallada, verídica y profunda en español:

1. FRASES TEXTUALES (VERBATIMS): 15 expresiones emocionales reales que dirían los compradores frustrados en foros (Reddit, Amazon, Trustpilot) sobre el problema que este producto resuelve.
2. HISTORIAS DE TERROR: 3 experiencias negativas detalladas con métodos y productos tradicionales anteriores.
3. MECANISMO ÚNICO DE DOLOR (UMS): La causa raíz biológica, técnica o física por la cual los métodos convencionales fallan.
4. MECANISMO ÚNICO DE SOLUCIÓN (UMP): La explicación científica o técnica de por qué "${name}" funciona exactamente donde otros fallan.
5. 5 ÁNGULOS DE MARKETING Y COPYWRITING:
   - Ángulo 1: Conspiración del Mercado / Revelación
   - Ángulo 2: Sabiduría Ancestral o Método Tradicional Olvidado
   - Ángulo 3: Frustración Empática Profunda
   - Ángulo 4: Mecanismo Biológico Directo
   - Ángulo 5: Contraste Visual Extremo Antes / Después

Devuelve un informe altamente estructurado, claro y sin introducciones innecesarias.`;

  const step2 = `[FASE 2: CONSTRUCCIÓN DE FICHA AVATAR BRIEF]
Basándote en la investigación previa del producto "${name}", construye la Ficha Psicográfica Completa del Comprador Ideal (Avatar Brief):

1. PERFIL DEMOGRÁFICO: Edad objetivo, género predominante, ubicación geográfica, nivel socioeconómico, profesión e identidad.
2. MAPA PSICOGRÁFICO DE DOLORES:
   - P1 (Dolor Físico Directo): Molestias palpables o diarias.
   - P2 (Dolor Emocional / Autoestima): Inseguridades y ansiedad.
   - P3 (Dolor Social / Relacional): Cómo afecta su imagen frente a pareja, familia o colegas.
3. SUEÑOS Y METAS:
   - Objetivos a corto plazo (primeros 7 días)
   - Objetivos a largo plazo (cambio de vida a 6 meses)
4. CULPABLES EXTERNOS (Scapegoats): A quién o a qué culpa el cliente de su situación para liberarse de culpa.
5. PREJUICIOS Y ESCEPTICISMO: Razones exactas por las que ha dudado de productos similares en el pasado.
6. CREENCIA FUNDAMENTAL: La única frase/idea que necesita creer para comprar "${name}" de inmediato.`;

  const step3 = `[FASE 3: ESTRUCTURA DE OFERTA IRRESISTIBLE (OFFER BRIEF)]
Basándote en el producto "${name}" y el avatar psicográfico, diseña la Estrategia de Oferta (Offer Brief):

1. APILAMIENTO DE LA OFERTA (Offer Stacks): Producto Principal + 3 Bonus Digitales/Físicos de alto valor percibido.
2. ANCLAJE DE PRECIO (Price Anchoring): Precio de Comparación Percibido vs Precio de Venta (${priceText}) demostrando un 50%+ de descuento.
3. INVERSIÓN DE RIESGO (Risk Reversal): Garantía de satisfacción de 30 días sin preguntas con redacción empática.
4. GANCHOS DE URGENCIA Y ESCASEZ LÓGICA: Explicación creíble de por qué el descuento o el stock expira pronto.
5. OBJECCIONES CRÍTICAS & CONTRA-ARGUMENTOS: Las 5 preguntas más difíciles del comprador y sus respuestas persuasivas.`;

  const step4 = `[FASE 4: CREATIVOS PUBLICITARIOS - GUIONES UGC & AD COPY]
Genera los Activos de Publicidad de Conversión para "${name}":

1. 3 GUIONES DE VIDEO UGC PARA TIKTOK / REELS / SHORTS:
   - Guion 1 (30s): Gancho de Curiosidad / Patrón Interrumpido.
   - Guion 2 (45s): Historia Empática de Dolor a Transformación.
   - Guion 3 (60s): Explicación Científica del Mecanismo Único.
   (Para cada guion incluye: Marca de tiempo, Dirección Visual de Cámara, Locución de Voz en Off y Texto en Pantalla).

2. 3 VARIANTES DE META ADS (Facebook & Instagram):
   - Variante 1: Gancho Emocional
   - Variante 2: Demostración Directa de Beneficio
   - Variante 3: Prueba Social & Testimonio
   (Incluye: Texto Principal, Titular y Descripción Corta).

3. 3 VARIANTES DE TIKTOK ADS:
   - Hook inicial de 3 segundos, cuerpo de interacción y CTA overlay.`;

  const step5 = `[FASE 5: LANDING PAGE HTML5 & DESCRIPCIÓN SHOPIFY]
Genera el código de venta y la ficha de producto para "${name}":

1. SEO METADATA: Título SEO optimizado, Meta Description y Palabras Clave.
2. CÓDIGO HTML5 DE LANDING PAGE COMPLETA (Con estilos integrados Tailwind CSS):
   - Header con cuenta regresiva de oferta
   - Hero Section con Titular de Respuesta Directa y Subtitular de Mecanismo
   - Galería / Visual del Producto
   - Bloque de Comparación: Métodos Viejos vs "${name}"
   - Beneficios en Bullet Points con iconos
   - Sección de Garantía e Inversión de Riesgo
   - Preguntas Frecuentes (FAQ) colapsables
   - Botón CTA de 'COMPRAR AHORA CON 50% DESCUENTO'.
3. FICHA DE PRODUCTO PARA SHOPIFY: Resumen vendedor de 3 párrafos + lista de especificaciones.`;

  const allInOne = `============================================================
MEGA SYSTEM PROMPT DE RESEARCH & COPYWRITING (ALL-IN-ONE)
============================================================
Actúa como un equipo completo de E-commerce Intelligence para el producto: "${name}"${compText}.
Precio Retail Objetivo: ${priceText}.

EJECUTA LAS SIGUIENTES 5 FASES EN UN SOLO INFORME ESTRUCTURADO EN ESPAÑOL:

--- FASE 1: RESEARCH PSICOGRÁFICO ---
${step1}

--- FASE 2: AVATAR BRIEF ---
${step2}

--- FASE 3: OFFER BRIEF ---
${step3}

--- FASE 4: GUIONES UGC & AD COPY ---
${step4}

--- FASE 5: LANDING PAGE HTML & SHOPIFY ---
${step5}
============================================================`;

  return { step1, step2, step3, step4, step5, allInOne };
}

export function renderPromptHubOutput() {
  const pInput = document.getElementById('prompt-product-input');
  const cInput = document.getElementById('prompt-competitor-input');
  const prInput = document.getElementById('prompt-price-input');
  const botSelect = document.getElementById('prompt-chatbot-select');

  const productName = pInput ? pInput.value.trim() : '';
  const competitorUrl = cInput ? cInput.value.trim() : '';
  const targetPrice = prInput ? prInput.value.trim() : '';
  const chatbotTarget = botSelect ? botSelect.value : 'chatgpt';

  const name = productName || 'Producto Ganador';
  promptHubState.promptData = generateMasterPromptSequence(name, competitorUrl, targetPrice, chatbotTarget);

  updatePromptBoxContent();
}

export function updatePromptBoxContent() {
  if (!promptHubState.promptData) return;

  const step = promptHubState.activeStep || 1;
  const titles = {
    1: "1. Investigación Profunda de Mercado y Psicología del Comprador",
    2: "2. Ficha Avatar Brief & Mapa Psicográfico",
    3: "3. Offer Brief & Estructura de Oferta Irresistible",
    4: "4. Guiones UGC de Video & Ad Copy Matrix",
    5: "5. Landing Page HTML5 & Descripción de Shopify"
  };

  const stepBadge = document.getElementById('prompt-step-badge');
  const stepTitle = document.getElementById('prompt-step-title');
  const codeContent = document.getElementById('prompt-code-content');

  if (stepBadge) stepBadge.textContent = `FASE ${step} DE 5`;
  if (stepTitle) stepTitle.textContent = titles[step] || titles[1];
  if (codeContent) {
    codeContent.textContent = promptHubState.promptData['step' + step] || '';
  }

  // Update tabs active state
  document.querySelectorAll('.prompt-tab-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-prompt-step')) || 1;
    if (s === step) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
