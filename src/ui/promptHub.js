import { state } from '../state.js';
import {
  verticalPacks,
  getVerticalPackById,
  formatPackForCopy,
  personalizePromptText,
} from '../data/verticalPacks.js';
import { showToast } from '../utils/toast.js';
import { escapeHtml } from '../utils/sanitize.js';

// PROMPT HUB STATE & GENERATOR ENGINE
export let promptHubState = {
  activeStep: 1,
  promptData: null,
  source: 'generic', // 'generic' | 'report'
  activeVerticalId: verticalPacks[0]?.id ?? 'belleza',
  hubMode: 'master', // 'master' | 'packs'
};

function insightBlock(report) {
  if (!report) return '';
  const lines = [];
  if (report.demographics?.who) lines.push(`- Público: ${report.demographics.who}`);
  if (report.demographics?.belief) lines.push(`- Creencia central: "${report.demographics.belief}"`);
  if (report.demographics?.defeats) lines.push(`- Frustración principal: ${report.demographics.defeats}`);
  if (report.secrets?.mechanismProblem) lines.push(`- UMP (problema): ${report.secrets.mechanismProblem}`);
  if (report.secrets?.mechanismSolution) lines.push(`- UMS (solución): ${report.secrets.mechanismSolution}`);
  if (report.offerBrief?.bigIdea) lines.push(`- Gran idea: ${report.offerBrief.bigIdea}`);
  if (report.angles?.[0]?.hook) lines.push(`- Gancho validado: "${report.angles[0].hook}"`);
  if (report.verbatims?.length) {
    lines.push(`- Verbatims reales (muestra): ${report.verbatims.slice(0, 5).map((v) => `"${v}"`).join(', ')}`);
  }
  return lines.length ? `\n\nCONTEXTO DE INVESTIGACIÓN REAL (Deep Research DropDeep):\n${lines.join('\n')}` : '';
}

export function generateMasterPromptSequence(productName, competitorUrl = '', targetPrice = '', chatbotTarget = 'chatgpt', report = null) {
  const name = productName || report?.name || 'Producto Ganador';
  const priceText = targetPrice
    ? `$${parseFloat(targetPrice).toFixed(2)}`
    : report?.retail
      ? `$${parseFloat(report.retail).toFixed(2)}`
      : 'un precio competitivo de e-commerce';
  const compText = (competitorUrl || report?.competitorUrl)
    ? `\n- URL de Competidor Directo a Analizar: ${competitorUrl || report.competitorUrl}`
    : '';
  const insights = insightBlock(report);

  const step1Titles = {
    chatgpt: "ChatGPT 4o / o3-mini",
    claude: "Claude 3.5 Sonnet",
    gemini: "Gemini 1.5 / 2.0 Web",
    deepseek: "DeepSeek R1 / V3"
  };
  const targetBotName = step1Titles[chatbotTarget] || 'ChatGPT';

  const step1 = `[SISTEMA: ROL DE INVESTIGADOR DE MERCADO DE ÉLITE PARA ${targetBotName.toUpperCase()}]
Actúa como un Investigador de Mercado de Élite y Redactor de Respuesta Directa de nivel mundial especializado en e-commerce y dropshipping.

Tu objetivo es ${report ? 'profundizar y expandir' : 'realizar'} un análisis profundo del producto: "${name}"${compText}.
Precio Retail ${report ? 'validado' : 'Estimado'}: ${priceText}.${insights}

Genera los siguientes 5 bloques con información detallada, verídica y profunda en español:

1. FRASES TEXTUALES (VERBATIMS): 15 expresiones emocionales reales que dirían los compradores frustrados en foros (Reddit, Amazon, Trustpilot) sobre el problema que este producto resuelve.
2. HISTORIAS DE TERROR: 3 experiencias negativas detalladas con métodos y productos tradicionales anteriores.
3. MECANISMO ÚNICO DE PROBLEMA (UMP): La causa raíz biológica, técnica o física por la cual los métodos convencionales fallan.
4. MECANISMO ÚNICO DE SOLUCIÓN (UMS): La explicación científica o técnica de por qué "${name}" funciona exactamente donde otros fallan.
5. 5 ÁNGULOS DE MARKETING Y COPYWRITING:
   - Ángulo 1: Conspiración del Mercado / Revelación
   - Ángulo 2: Sabiduría Ancestral o Método Tradicional Olvidado
   - Ángulo 3: Frustración Empática Profunda
   - Ángulo 4: Mecanismo Biológico Directo
   - Ángulo 5: Contraste Visual Extremo Antes / Después

Devuelve un informe altamente estructurado, claro y sin introducciones innecesarias.`;

  const step2 = `[FASE 2: CONSTRUCCIÓN DE FICHA AVATAR BRIEF]
Basándote en la investigación previa del producto "${name}", construye la Ficha Psicográfica Completa del Comprador Ideal (Avatar Brief):${insights}

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
Basándote en el producto "${name}" y el avatar psicográfico, diseña la Estrategia de Oferta (Offer Brief):${insights}

1. APILAMIENTO DE LA OFERTA (Offer Stacks): Producto Principal + 3 Bonus Digitales/Físicos de alto valor percibido.
2. ANCLAJE DE PRECIO (Price Anchoring): Precio de Comparación Percibido vs Precio de Venta (${priceText}) demostrando un 50%+ de descuento.
3. INVERSIÓN DE RIESGO (Risk Reversal): Garantía de satisfacción de 30 días sin preguntas con redacción empática.
4. GANCHOS DE URGENCIA Y ESCASEZ LÓGICA: Explicación creíble de por qué el descuento o el stock expira pronto.
5. OBJECCIONES CRÍTICAS & CONTRA-ARGUMENTOS: Las 5 preguntas más difíciles del comprador y sus respuestas persuasivas.`;

  const step4 = `[FASE 4: CREATIVOS PUBLICITARIOS - GUIONES UGC & AD COPY]
Genera los Activos de Publicidad de Conversión para "${name}":${insights}

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
Genera el código de venta y la ficha de producto para "${name}":${insights}

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
Precio Retail Objetivo: ${priceText}.${insights}

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

export function prefillPromptHubFromReport(report) {
  if (!report?.name) return false;
  const pInput = document.getElementById('prompt-product-input');
  const cInput = document.getElementById('prompt-competitor-input');
  const prInput = document.getElementById('prompt-price-input');
  if (pInput) pInput.value = report.name;
  if (cInput) cInput.value = report.competitorUrl || '';
  if (prInput && report.retail) prInput.value = String(parseFloat(report.retail).toFixed(2));
  return true;
}

export function updatePromptHubSourceBadge() {
  const badge = document.getElementById('prompt-hub-source-badge');
  if (!badge) return;
  if (promptHubState.source === 'report' && state.currentReport?.name) {
    badge.classList.remove('hidden');
    badge.textContent = `Prompts enriquecidos con Deep Research: ${state.currentReport.name}`;
  } else {
    badge.classList.remove('hidden');
    badge.textContent = 'Prompts genéricos — funcionan mejor después de un Deep Research';
  }
}

export function renderPromptHubOutput(options = {}) {
  const pInput = document.getElementById('prompt-product-input');
  const cInput = document.getElementById('prompt-competitor-input');
  const prInput = document.getElementById('prompt-price-input');
  const botSelect = document.getElementById('prompt-chatbot-select');

  const useReport = options.useReport !== false && state.currentReport?.name;
  const report = useReport ? state.currentReport : null;
  promptHubState.source = report ? 'report' : 'generic';

  if (report && options.prefill !== false) {
    prefillPromptHubFromReport(report);
  }

  const productName = pInput ? pInput.value.trim() : (report?.name || '');
  const competitorUrl = cInput ? cInput.value.trim() : (report?.competitorUrl || '');
  const targetPrice = prInput ? prInput.value.trim() : (report?.retail ? String(report.retail) : '');
  const chatbotTarget = botSelect ? botSelect.value : 'chatgpt';

  const name = productName || 'Producto Ganador';
  promptHubState.promptData = generateMasterPromptSequence(name, competitorUrl, targetPrice, chatbotTarget, report);

  updatePromptBoxContent();
  updatePromptHubSourceBadge();
  if (promptHubState.hubMode === 'packs') {
    renderVerticalPacksPanel();
  }
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

  document.querySelectorAll('.prompt-tab-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-prompt-step')) || 1;
    btn.classList.toggle('active', s === step);
  });
}

function getPackProductName() {
  const pInput = document.getElementById('prompt-product-input');
  const fromInput = pInput?.value.trim();
  if (fromInput) return fromInput;
  if (state.currentReport?.name) return state.currentReport.name;
  return '';
}

export function renderVerticalPacksPanel() {
  const container = document.getElementById('vertical-packs-panel');
  if (!container) return;

  const pack = getVerticalPackById(promptHubState.activeVerticalId);
  const productName = getPackProductName();

  container.innerHTML = `
    <div class="vertical-packs-intro">
      <p class="vertical-packs-disclaimer">
        <i data-lucide="info"></i>
        ${escapeHtml(pack.framing)}
      </p>
      ${
        state.currentReport?.name
          ? `<p class="vertical-packs-report-note">Tu reporte activo <strong>${escapeHtml(state.currentReport.name)}</strong> enriquece la secuencia maestra arriba. Estos packs son plantillas de arranque.</p>`
          : ''
      }
    </div>
    <div class="vertical-pack-actions">
      <button type="button" class="btn btn-primary btn-glow" id="copy-vertical-pack-btn">
        <i data-lucide="copy"></i> Copiar pack completo
      </button>
    </div>
    <div class="vertical-prompt-list">
      ${pack.prompts
        .map(
          (p, idx) => `
        <article class="vertical-prompt-card" data-prompt-index="${idx}">
          <div class="vertical-prompt-card-header">
            <span class="vertical-prompt-num">${idx + 1}</span>
            <h4>${escapeHtml(p.title)}</h4>
            <button type="button" class="btn btn-secondary btn-sm copy-vertical-prompt-btn" data-prompt-index="${idx}" title="Copiar prompt">
              <i data-lucide="copy"></i> Copiar
            </button>
          </div>
          <pre class="vertical-prompt-body"><code>${escapeHtml(personalizePromptText(p.text, productName, pack.name))}</code></pre>
        </article>`
        )
        .join('')}
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.querySelectorAll('.vertical-pack-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-vertical-id') === pack.id);
  });

  container.querySelector('#copy-vertical-pack-btn')?.addEventListener('click', () => {
    const text = formatPackForCopy(pack, productName);
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Pack "${pack.name}" copiado al portapapeles.`, 'success');
      document.dispatchEvent(new CustomEvent('dropdeep:prompt-copied'));
    });
  });

  container.querySelectorAll('.copy-vertical-prompt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-prompt-index'), 10);
      const prompt = pack.prompts[idx];
      if (!prompt) return;
      const text = personalizePromptText(prompt.text, productName, pack.name);
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Prompt "${prompt.title}" copiado.`, 'success');
        document.dispatchEvent(new CustomEvent('dropdeep:prompt-copied'));
      });
    });
  });
}

export function setPromptHubMode(mode) {
  promptHubState.hubMode = mode;
  const masterSection = document.getElementById('prompt-master-section');
  const packsSection = document.getElementById('prompt-packs-section');
  document.querySelectorAll('.prompt-hub-mode-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-hub-mode') === mode);
  });
  masterSection?.classList.toggle('hidden', mode !== 'master');
  packsSection?.classList.toggle('hidden', mode !== 'packs');
  if (mode === 'packs') renderVerticalPacksPanel();
}

export function setActiveVerticalPack(verticalId) {
  promptHubState.activeVerticalId = verticalId;
  renderVerticalPacksPanel();
}
