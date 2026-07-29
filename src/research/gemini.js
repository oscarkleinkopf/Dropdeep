import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { cleanAndParseJSON } from '../utils/json.js';
import { openDeepResearchReport } from '../ui/report.js';
import { isGeminiGroundingEnabled } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled, createProxyGenerativeModel } from './geminiProxy.js';
import { classifyGeminiError } from './errors.js';
import {
  startResearchSession,
  cancelResearchSession,
  throwIfAborted,
  isResearchAborted,
} from './researchSession.js';
import { persistResearchReport } from './historySync.js';
import { openSettingsModal } from '../ui/geminiKeyBanner.js';

const TRANSIENT_MAX_RETRIES = 2;

export async function generateContentWithRetry(
  modelInstance,
  requestPayload,
  addLog,
  stepName,
  maxRetries = TRANSIENT_MAX_RETRIES,
  fallbackModelInstance = null,
  fallbackPayload = null,
  abortSignal = null
) {
  let attempt = 0;
  let delay = 3000; // start with 3s delay
  let currentModel = modelInstance;
  let currentPayload = requestPayload;
  let usingFallback = false;

  while (attempt < maxRetries) {
    throwIfAborted(abortSignal);
    try {
      attempt++;
      const result = await currentModel.generateContent(currentPayload);
      return result;
    } catch (error) {
      throwIfAborted(abortSignal);
      console.error(`Error en ${stepName} (Intento ${attempt}/${maxRetries}):`, error);
      
      const errMsg = String(error.message || error).toLowerCase();
      
      // Chequear si es un error de API Key no válida
      const isInvalidKey = errMsg.includes('api key not valid') || 
                           errMsg.includes('api_key_invalid') || 
                           errMsg.includes('invalid api key') ||
                           errMsg.includes('key is invalid');
                           
      // Si la clave no es válida, no reintentamos (es un error de configuración del usuario)
      if (isInvalidKey) {
        throw error;
      }

      const isQuotaError = errMsg.includes('quota') || 
                           errMsg.includes('429') || 
                           errMsg.includes('limit') || 
                           errMsg.includes('exhausted');

      const isPolicyOrRecitation = !isQuotaError && (
                                   errMsg.includes('recitation') || 
                                   errMsg.includes('safety') || 
                                   errMsg.includes('block') || 
                                   errMsg.includes('violat')
                                   );

      if (attempt < maxRetries) {
        // Fallback a modelo sin búsqueda si el principal tiene búsqueda y ya falló al menos 2 veces,
        // o si falló inmediatamente debido a políticas de recitación/bloqueo de búsqueda web.
        if (fallbackModelInstance && !usingFallback && (attempt >= 2 || isPolicyOrRecitation)) {
          usingFallback = true;
          currentModel = fallbackModelInstance;
          currentPayload = fallbackPayload;
          const blockReason = isPolicyOrRecitation ? "por filtro de seguridad o derechos de autor (RECITATION)" : "por saturación o error del buscador";
          addLog(`⚠️ [Intento ${attempt}/${maxRetries}] ${stepName} falló ${blockReason}. Activando fallback: Desactivando búsqueda web de Google y reintentando...`, 'warning');
        } else {
          const reasonMsg = isPolicyOrRecitation ? "filtro de recitación/seguridad" : "saturación de la API (Error 503/429/De red)";
          addLog(`⚠️ [Intento ${attempt}/${maxRetries}] ${stepName} falló por ${reasonMsg}. Reintentando en ${(delay/1000).toFixed(1)}s...`, 'warning');
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

function renderResearchErrorUI(modal, output, fill, label, error, productName, apiKey, modelName, competitorUrl) {
  const classified = classifyGeminiError(error);
  addLogTerminal(output, `❌ ${classified.title}`, 'warning');
  addLogTerminal(output, classified.message, 'warning');

  if (classified.type === 'quota') {
    addLogTerminal(output, 'Espera 1–2 minutos antes de reintentar o cambia de modelo en Ajustes.', 'info');
  } else if (classified.type === 'proxy_daily_quota') {
    addLogTerminal(output, 'Pega tu clave Gemini gratis en AI Studio o vuelve mañana para más créditos proxy.', 'info');
  } else if (classified.type === 'invalid_key') {
    addLogTerminal(output, 'Abre Ajustes → pega una clave válida de Google AI Studio.', 'info');
  } else if (classified.type === 'proxy') {
    addLogTerminal(output, 'Si el proxy falla, desactiva VITE_GEMINI_PROXY o configura BYOK en Ajustes.', 'info');
  } else if (classified.type === 'parse') {
    addLogTerminal(output, 'Tip: Gemini 2.5 Flash suele dar JSON más estable para reportes largos.', 'info');
  }

  const actionContainer = document.createElement('div');
  actionContainer.className = 'terminal-error-actions';
  actionContainer.style.marginTop = '1rem';
  actionContainer.style.display = 'flex';
  actionContainer.style.flexWrap = 'wrap';
  actionContainer.style.gap = '0.5rem';

  if (classified.actions.includes('settings')) {
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'btn btn-primary';
    settingsBtn.textContent = 'Abrir Ajustes';
    settingsBtn.onclick = () => openSettingsModal();
    actionContainer.appendChild(settingsBtn);
  }

  if (classified.actions.includes('retry')) {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-secondary';
    retryBtn.textContent = 'Reintentar';
    retryBtn.onclick = () => {
      modal.classList.add('hidden');
      runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
    };
    actionContainer.appendChild(retryBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-secondary';
  closeBtn.textContent = 'Cerrar';
  closeBtn.onclick = () => modal.classList.add('hidden');
  actionContainer.appendChild(closeBtn);

  output.appendChild(actionContainer);
  output.scrollTop = output.scrollHeight;
  fill.style.backgroundColor = 'var(--accent-red)';
  label.textContent = classified.title;
}

function addLogTerminal(output, text, type = 'info') {
  const line = document.createElement('div');
  line.className = `term-line ${type}`;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// RUN REAL LIVE RESEARCH WITH GOOGLE GEMINI API
export async function runRealResearchSequence(productName, apiKey, modelName, competitorUrl = '') {
  const modal = document.getElementById('terminal-modal');
  const output = document.getElementById('terminal-output');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  const cancelBtn = document.getElementById('terminal-cancel-btn');
  const closeHint = document.getElementById('terminal-close-hint');

  const abortSignal = startResearchSession(productName, competitorUrl);

  modal.classList.remove('hidden');
  output.innerHTML = '';
  fill.style.width = '0%';
  fill.style.backgroundColor = 'var(--accent-cyan)';
  if (closeHint) {
    closeHint.innerHTML = '<i data-lucide="info"></i> Usa <strong>Cancelar investigación</strong> para detener la ejecución de forma segura.';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  const onCancel = () => {
    cancelResearchSession(true);
    addLogTerminal(output, '⏹ Investigación cancelada por el usuario.', 'warning');
    label.textContent = 'Cancelado';
    fill.style.backgroundColor = 'var(--accent-amber)';
  };
  if (cancelBtn) {
    cancelBtn.onclick = onCancel;
    cancelBtn.classList.remove('hidden');
  }

  const addLog = (text, type = 'info') => {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  const isGroundingEnabled = isGeminiGroundingEnabled();

  addLog(`🚀 INICIANDO INVESTIGACIÓN EN VIVO CON GOOGLE GEMINI (${modelName.toUpperCase()})...`, 'header-line');
  if (isGroundingEnabled) {
    addLog(`📡 Búsqueda en Google Search Grounding ACTIVADA. Buscando en foros, Amazon y Reddit...`, 'info');
  } else {
    addLog(`📡 Búsqueda en Google Search Grounding DESACTIVADA. Utilizando base de conocimiento del modelo...`, 'info');
  }
  if (competitorUrl) {
    addLog(`🔗 URL de Competidor provista: "${competitorUrl}". Analizando ganchos y ángulos del competidor...`, 'info');
  }
  fill.style.width = '5%';
  label.textContent = "Estableciendo conexión con Gemini...";

  try {
    let modelWithSearch;
    let modelWithoutSearch;
    const useProxy = isGeminiProxyEnabled() || apiKey === 'proxy';

    if (useProxy) {
      addLog(`🔐 Usando proxy seguro Supabase (clave Gemini en servidor)...`, 'info');
      modelWithSearch = createProxyGenerativeModel({ model: modelName, useSearch: isGroundingEnabled });
      modelWithoutSearch = createProxyGenerativeModel({ model: modelName, useSearch: false });
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
    
      // Configure dynamic search tools depending on model version (1.5 uses googleSearchRetrieval, 2.x/2.5 uses googleSearch)
      let tools = [];
      if (isGroundingEnabled) {
        if (modelName.startsWith('gemini-2') || modelName.startsWith('gemini-exp') || modelName.includes('2.0') || modelName.includes('2.5')) {
          tools.push({ googleSearch: {} });
        } else {
          tools.push({ googleSearchRetrieval: {} });
        }
      }

      // Configure model instances
      modelWithSearch = genAI.getGenerativeModel({
        model: modelName,
        tools: tools.length > 0 ? tools : undefined
      });

      modelWithoutSearch = genAI.getGenerativeModel({
        model: modelName
      });
    }

    // STEP 1: Copywriting Deep Research Report
    addLog(`[1/4] [RUN] Generando Reporte de Copywriting para '${productName.toUpperCase()}'...`, 'info');
    if (isGroundingEnabled) {
      addLog(`🔍 Realizando búsquedas en Google Search por competidores, reviews de Amazon y dolores en Reddit...`, 'info');
    } else {
      addLog(`🔍 Analizando el mercado de '${productName}' basándose en datos internos...`, 'info');
    }
    fill.style.width = '20%';
    label.textContent = "Generando Reporte de Copywriting (Paso 1 de 4)...";

    let competitorContext = '';
    if (competitorUrl) {
      competitorContext = `Además, el usuario ha proporcionado la siguiente URL de un competidor directo: "${competitorUrl}". 
Por favor, investiga o deduce la estrategia de esa URL mediante búsquedas y extrae qué ganchos, ganchos visuales y ángulos creativos utiliza.`;
    }

    const prompt1 = `Realiza una investigación de mercado profunda en español utilizando Google Search sobre el producto: "${productName}". 
${competitorContext}
Debes actuar como un Investigador de Mercado de Élite y un Redactor de Respuesta Directa. 
Busca activamente proveedores de dropshipping reales para este producto en internet (como AliExpress, Alibaba, CJ Dropshipping, Zendrop, etc.) y extrae sus precios reales.
Devuelve un objeto JSON con el siguiente esquema exacto (rellena cada campo con información detallada, real y verídica basada en los resultados de búsqueda de internet sobre este tipo de producto).
IMPORTANTE: Estima el precio de venta sugerido (retail) y el costo del proveedor (cost) basándote en los datos reales que encuentres de los proveedores de dropshipping. No uses los números del ejemplo, calcúlalos matemáticamente de forma congruente (margin = retail - cost, roi = Math.round((margin / cost) * 100)):
{
  "name": "${productName}",
  "categoryId": "beauty|pet|health|home|tech|general",
  "cost": 12.5,
  "retail": 39.9,
  "margin": 27.4,
  "roi": 219,
  "shipping": 8,
  "sales": 2500,
  "saturation": 28,
  "trend": "+120%",
  "suppliers": [
    {
      "platform": "AliExpress | CJ Dropshipping | Alibaba | Zendrop | Otro",
      "name": "Nombre o razón social del proveedor real de dropshipping encontrado",
      "price": 10.5,
      "shippingCost": 3.5,
      "shippingTime": "8-12",
      "link": "Enlace URL directo del producto o URL de búsqueda directa en esa plataforma"
    }
  ],
  "demographics": {
    "who": "...",
    "attitudes": "...",
    "dreams": "...",
    "defeats": "...",
    "outsideForces": "...",
    "prejudices": "...",
    "belief": "..."
  },
  "solutions": {
    "current": "...",
    "experience": "...",
    "likes": "...",
    "dislikes": "...",
    "horrorStories": ["...", "...", "..."],
    "skepticism": "..."
  },
  "secrets": {
    "historical": "...",
    "conspiracy": "...",
    "mechanismProblem": "...",
    "mechanismSolution": "..."
  },
  "eden": {
    "goldenAge": "...",
    "corruptor": "...",
    "contrast": "..."
  },
  "verbatims": [
    "Frase 1", "Frase 2", "Frase 3", "Frase 4", "Frase 5", "Frase 6", "Frase 7", "Frase 8", "Frase 9", "Frase 10", "Frase 11", "Frase 12", "Frase 13", "Frase 14", "Frase 15"
  ],
  "angles": [
    { "title": "1. Conspiración", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "2. Sabiduría Antigua", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "3. Frustración Empática", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "4. Mecanismo Biológico Simple", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "5. Contraste Ancestral", "narrative": "...", "hook": "...", "headline": "..." }
  ]
}
No agregues comentarios ni bloques de código markdown, devuelve sólo el JSON en texto plano.
IMPORTANTE: Para evitar bloqueos por derechos de autor o recitación de fuentes (error RECITATION), no copies textualmente textos largos ni reseñas de Amazon, Reddit o competidores. Sintetiza, resume y parafrasea toda la información obtenida en tus propias palabras en español original.`;

    const payload1 = { contents: [{ role: "user", parts: [{ text: prompt1 }] }] };

    const payload1NoSearch = {
      contents: [{ role: "user", parts: [{ text: prompt1 }] }]
    };

    const result1 = await generateContentWithRetry(
      modelWithSearch, 
      payload1, 
      addLog, 
      "Paso 1 (Reporte de Copywriting)", 
      TRANSIENT_MAX_RETRIES, 
      modelWithoutSearch, 
      payload1NoSearch,
      abortSignal
    );

    throwIfAborted(abortSignal);

    const text1 = result1.response.text();
    let report;
    try {
      const parsedReport = cleanAndParseJSON(text1);
      const defaultReport = {
        name: productName,
        categoryId: "general",
        cost: 10.0,
        retail: 29.9,
        margin: 19.9,
        roi: 199,
        shipping: 10,
        sales: 1000,
        saturation: 30,
        trend: "+50%",
        suppliers: [
          {
            platform: "AliExpress",
            name: "Generic Supplier",
            price: 10.0,
            shippingCost: 3.0,
            shippingTime: "10-15",
            link: "https://aliexpress.com"
          }
        ],
        demographics: {
          who: "Público interesado en soluciones prácticas y eficientes.",
          attitudes: "Valoran la conveniencia, el precio justo y la calidad del material.",
          dreams: "Tener una solución cómoda y duradera para su día a día.",
          defeats: "Frustración con productos de baja calidad o que se dañan rápido.",
          outsideForces: "La rutina acelerada y la falta de tiempo libre.",
          prejudices: "Temor a que el producto no cumpla con las expectativas anunciadas.",
          belief: "Existe un método accesible que resolverá mi necesidad principal."
        },
        solutions: {
          current: "Métodos convencionales e incómodos.",
          experience: "Es tedioso, requiere demasiado esfuerzo y no es constante.",
          likes: "Es lo que todos conocen.",
          dislikes: "Es ineficiente, caro y desgastante a largo plazo.",
          horrorStories: [
            "Compré una alternativa barata que se rompió al tercer día de uso.",
            "El envío tardó más de un mes y el producto llegó defectuoso."
          ],
          skepticism: "¿Realmente funciona tan rápido como dicen en la publicidad?"
        },
        secrets: {
          historical: "Soluciones similares se han usado de forma rústica por décadas.",
          conspiracy: "Las marcas corporativas prefieren vender consumibles recurrentes.",
          mechanismProblem: "Falla por no atacar la raíz del problema.",
          mechanismSolution: "Su diseño dinámico y materiales ergonómicos de última generación."
        },
        eden: {
          goldenAge: "Realizar actividades cotidianas sin ninguna limitación física o mental.",
          corruptor: "El sedentarismo y las malas posturas frente a pantallas modernas.",
          contrast: "Liberación y bienestar inmediato frente a la fatiga anterior."
        },
        verbatims: [
          "Ojalá hubiera encontrado esto antes, me ha ahorrado mucho tiempo.",
          "Estaba harto de probar de todo sin ver ningún resultado real.",
          "Es increíblemente cómodo y práctico para usar en cualquier lugar."
        ],
        angles: [
          {
            title: "1. La Verdad Oculta del Bienestar",
            narrative: "Descubre por qué las grandes empresas prefieren venderte soluciones temporales.",
            hook: "¿Sabías que los métodos tradicionales están diseñados para fallar?",
            headline: "El Secreto Mejor Guardado para un Día sin Fatiga"
          },
          {
            title: "2. El Método del Esfuerzo Cero",
            narrative: "Una solución que trabaja en segundo plano mientras tú te enfocas en lo importante.",
            hook: "Deja de esforzarte de más con alternativas que no funcionan.",
            headline: "Máximo Confort con el Mínimo Esfuerzo Diario"
          }
        ]
      };

      report = {
        ...defaultReport,
        ...parsedReport,
        demographics: { ...defaultReport.demographics, ...(parsedReport.demographics || {}) },
        solutions: { ...defaultReport.solutions, ...(parsedReport.solutions || {}) },
        secrets: { ...defaultReport.secrets, ...(parsedReport.secrets || {}) },
        eden: { ...defaultReport.eden, ...(parsedReport.eden || {}) }
      };

      addLog(`✅ [SUCCESS] Paso 1 completado. Recibido JSON estructurado del reporte.`, 'success');
      
      const metadata = result1.response.candidates?.[0]?.groundingMetadata;
      if (metadata && metadata.groundingChunks) {
        addLog(`🔗 Páginas web consultadas para esta investigación:`, 'info');
        metadata.groundingChunks.forEach(chunk => {
          if (chunk.web?.uri) {
            addLog(`   * ${chunk.web.title || chunk.web.uri} -> ${chunk.web.uri}`, 'success');
          }
        });
      }
    } catch (e) {
      throw new Error("El reporte de copywriting no pudo ser parseado como un objeto válido: " + e.message);
    }

    fill.style.width = '40%';
    label.textContent = "Compilando Ficha Avatar Brief (Paso 2 de 4)...";

    // STEP 2: Avatar Brief (no search grounding needed)
    addLog(`[2/4] [RUN] Generando Ficha psicográfica Avatar Brief...`, 'info');
    const prompt2 = `Basándote en el siguiente reporte de investigación previa: ${JSON.stringify(report)}, genera la ficha Avatar Brief detallada en español. 
Devuelve un objeto JSON con el siguiente esquema exacto:
{
  "general": {
    "age": "...",
    "gender": "...",
    "location": "...",
    "income": "...",
    "background": "...",
    "identities": "..."
  },
  "painPoints": {
    "p1": { "name": "...", "list": ["...", "...", "..."] },
    "p2": { "name": "...", "list": ["...", "...", "..."] },
    "p3": { "name": "...", "list": ["...", "...", "..."] }
  },
  "goals": {
    "short": ["...", "...", "..."],
    "long": ["...", "...", "..."]
  },
  "emotionalDrivers": ["...", "...", "..."],
  "quotes": {
    "general": ["...", "...", "..."],
    "pain": ["...", "...", "..."],
    "mindset": ["...", "...", "..."],
    "emotional": ["...", "...", "..."],
    "responses": ["...", "...", "..."],
    "success": ["...", "...", "..."]
  },
  "fears": ["...", "...", "..."],
  "insights": ["...", "...", "..."],
  "journey": {
    "awareness": "...",
    "frustración": "...",
    "desesperación": "...",
    "alivio": "..."
  }
}
Retorna solo el JSON en texto plano.`;

    const payload2 = {
      contents: [{ role: "user", parts: [{ text: prompt2 }] }]
    };

    const result2 = await generateContentWithRetry(modelWithoutSearch, payload2, addLog, "Paso 2 (Avatar Brief)", TRANSIENT_MAX_RETRIES, null, null, abortSignal);

    throwIfAborted(abortSignal);

    const text2 = result2.response.text();
    let avatarBrief;
    try {
      avatarBrief = cleanAndParseJSON(text2);
      addLog(`✅ [SUCCESS] Paso 2 completado. Ficha de Avatar estructurada con éxito.`, 'success');
    } catch (e) {
      addLog(`⚠️ Fallo al parsear Avatar Brief, usando plantilla de contingencia...`, 'warning');
      avatarBrief = {
        general: {
          age: "25-45 años",
          gender: "Mixto",
          location: "Zonas urbanas",
          income: "Medio",
          background: "Profesional o estudiante con estilo de vida dinámico.",
          identities: "Buscador de practicidad y eficiencia."
        },
        painPoints: {
          p1: { name: "Incomodidad Física", list: ["Fatiga acumulada", "Tensión constante", "Falta de descanso real"] },
          p2: { name: "Estrés y Frustración", list: ["Pérdida de energía", "Sensación de estancamiento", "Preocupación diaria"] },
          p3: { name: "Limitación Social", list: ["Menor productividad", "Afecta la interacción con otros", "Incomodidad en público"] }
        },
        goals: {
          short: ["Alivio inmediato de la tensión", "Mayor comodidad al trabajar", "Sensación de bienestar al final del día"],
          long: ["Adoptar un estilo de vida más saludable", "Evitar problemas futuros", "Optimizar el rendimiento general"]
        },
        emotionalDrivers: ["Sentirse con más energía", "No depender de medicamentos", "Evitar el desgaste prematuro"],
        quotes: {
          general: ["Necesito algo que funcione ya.", "He intentado de todo y nada sirve."],
          pain: ["Me duele estar sentado todo el día.", "Siento que me canso muy rápido."],
          mindset: ["Espero que esto valga la pena.", "No confío mucho en la publicidad."],
          emotional: ["Me frustra no poder rendir bien.", "Quiero sentirme libre de molestias."],
          responses: ["Me pareció excelente desde el primer uso.", "Muy recomendado."],
          success: ["Por fin algo que de verdad funciona.", "Gran alivio en poco tiempo."]
        },
        fears: ["Que el dolor empeore", "Gastar dinero en vano", "Efectos secundarios negativos"],
        insights: ["La constancia es la clave del bienestar", "El diseño ergonómico marca la diferencia"],
        journey: {
          awareness: "Descubre que tiene un problema crónico de tensión.",
          frustración: "Prueba métodos tradicionales y no obtiene resultados duraderos.",
          desesperación: "Busca activamente alternativas en foros y reseñas.",
          alivio: "Prueba el producto y experimenta una mejora significativa."
        }
      };
    }

    fill.style.width = '60%';
    label.textContent = "Diseñando Arquitectura de Oferta (Paso 3 de 4)...";

    // STEP 3: Offer Brief (no search grounding needed)
    addLog(`[3/4] [RUN] Generando Offer Brief de marketing...`, 'info');
    const prompt3 = `Basándote en la investigación previa y en el avatar brief: ${JSON.stringify(report)} y ${JSON.stringify(avatarBrief)}, genera el Offer Brief detallado en español.
Devuelve un objeto JSON con el siguiente esquema exacto:
{
  "names": ["Nombre 1", "Nombre 2", "Nombre 3"],
  "awareness": "...",
  "sophistication": "...",
  "bigIdea": "...",
  "metaphor": "...",
  "ump": "...",
  "ums": "...",
  "guru": "...",
  "discovery": "...",
  "product": "...",
  "headlines": ["...", "...", "..."],
  "objections": [
    "Objeción 1 (Respuesta: ...)",
    "Objeción 2 (Respuesta: ...)",
    "Objeción 3 (Respuesta: ...)",
    "Objeción 4 (Respuesta: ...)"
  ],
  "beliefs": ["...", "...", "..."],
  "funnel": "...",
  "domains": ["...", "...", "..."],
  "swipes": ["...", "...", "..."],
  "otherNotes": "..."
}
Retorna solo el JSON en texto plano.`;

    const payload3 = {
      contents: [{ role: "user", parts: [{ text: prompt3 }] }]
    };

    const result3 = await generateContentWithRetry(modelWithoutSearch, payload3, addLog, "Paso 3 (Offer Brief)", TRANSIENT_MAX_RETRIES, null, null, abortSignal);

    throwIfAborted(abortSignal);

    const text3 = result3.response.text();
    let offerBrief;
    try {
      offerBrief = cleanAndParseJSON(text3);
      addLog(`✅ [SUCCESS] Paso 3 completado. Ficha de Oferta de marketing lista.`, 'success');
    } catch (e) {
      addLog(`⚠️ Fallo al parsear Offer Brief, usando plantilla de contingencia...`, 'warning');
      offerBrief = {
        names: [`Smart ${report.name}`, `${report.name} Pro`, `Ergo ${report.name}`],
        awareness: "Nivel 2: Consciente del problema pero no de la solución.",
        sophistication: "Nivel 3: El mercado ya ha visto muchas promesas similares.",
        bigIdea: "El alivio dinámico y activo que se adapta al movimiento natural de tu cuerpo.",
        metaphor: "Es como tener un masajista o terapeuta personal de bolsillo.",
        ump: "El Mecanismo de Solución que distribuye la presión de forma inteligente.",
        ums: "El Mecanismo de Dolor por el sedentarismo y la inmovilidad prolongada.",
        guru: "Un especialista en ergonomía y diseño funcional de productos.",
        discovery: "Descubierto al analizar por qué los soportes rígidos tradicionales causan más fatiga.",
        product: report.name,
        headlines: [
          "El fin de la tensión acumulada al trabajar",
          "Comodidad garantizada desde el primer día",
          "La solución ergonómica que tu cuerpo estaba pidiendo"
        ],
        objections: [
          "¿Sirve para cualquier contextura física? (Respuesta: Sí, es totalmente ajustable).",
          "¿Es incómodo de usar bajo la ropa? (Respuesta: No, tiene un diseño ultra-delgado y transpirable)."
        ],
        beliefs: [
          "Los métodos rígidos tradicionales no solucionan la raíz del problema.",
          "Un soporte dinámico y activo es la única forma de aliviar la tensión diaria."
        ],
        funnel: "Embudo de video corto (UGC) -> Landing Page de alta conversión -> Shopify Checkout",
        domains: ["compra-dropdeep.com", "tienda-ergo.com"],
        swipes: ["Anuncio con gancho de dolor físico", "Anuncio de demostración visual de alivio"],
        otherNotes: "Enfocar el marketing en el beneficio inmediato y en el derribo de objeciones sobre rigidez."
      };
    }

    fill.style.width = '80%';
    label.textContent = "Generando Activos Creativos y Landing Page (Paso 4 de 4)...";

    // STEP 4: Activos Creativos (UGC y Landing Page HTML/Tailwind)
    addLog(`[4/4] [RUN] Generando Activos de Creatividad, Scripts UGC y Landing Page...`, 'info');
    const prompt4 = `Basándote en la investigación, el avatar y la oferta previos: ${JSON.stringify(report)}, ${JSON.stringify(avatarBrief)} y ${JSON.stringify(offerBrief)}, genera los activos creativos detallados en español para el producto "${productName}".
Si se especificó una URL de competidor ("${competitorUrl}"), incluye un análisis comparativo de ganchos contra ellos.
Devuelve un objeto JSON con el siguiente esquema exacto:
{
  "ugcScripts": [
    {
      "title": "Script 1: Gancho de Curiosidad (30 seg)",
      "duration": "30 segundos",
      "scenes": [
        { "time": "0:00-0:05", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:05-0:15", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:15-0:30", "visual": "...", "audio": "...", "text": "..." }
      ]
    },
    {
      "title": "Script 2: Enfoque de Dolor Empático (45 seg)",
      "duration": "45 segundos",
      "scenes": [
        { "time": "0:00-0:10", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:10-0:25", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:25-0:45", "visual": "...", "audio": "...", "text": "..." }
      ]
    },
    {
      "title": "Script 3: Explicación de Mecanismo UMS vs UMP (60 seg)",
      "duration": "60 segundos",
      "scenes": [
        { "time": "0:00-0:15", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:15-0:35", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:35-0:60", "visual": "...", "audio": "...", "text": "..." }
      ]
    }
  ],
  "landingPage": {
    "outline": [
      { "title": "Sección 1: Hero de Alta Conversión", "desc": "..." },
      { "title": "Sección 2: Mapeo del Problema (UMP)", "desc": "..." },
      { "title": "Sección 3: Presentación de la Solución (UMS)", "desc": "..." },
      { "title": "Sección 4: Prueba Social y Testimonios", "desc": "..." },
      { "title": "Sección 5: FAQs y Derribo de Objeciones", "desc": "..." },
      { "title": "Sección 6: Garantía y Cierre", "desc": "..." }
    ],
    "html": "..."
  },
  "competitorAnalysis": {
    "competitorsGanchos": ["Gancho de competidor 1", "Gancho de competidor 2", "Gancho de competidor 3"],
    "ourGanchos": ["Gancho propio diferenciador 1", "Gancho propio diferenciador 2", "Gancho propio diferenciador 3"],
    "weaknesses": "...",
    "differentiation": "..."
  }
}
En el campo \"html\", escribe un código HTML5 completo (de principio a fin, autocontenido) utilizando Tailwind CSS mediante script de CDN que tenga una tipografía elegante, estructura de ventas premium optimizada con un diseño responsivo de alta gama y todo el copy persuasivo listo de acuerdo a la investigación del producto y objeciones de la oferta.
IMPORTANTE: Asegúrate de que el JSON sea estrictamente válido. En el string del campo "html", debes escapar correctamente todas las comillas dobles internas como \\" y los saltos de línea como \\n. No introduzcas saltos de línea reales dentro de las comillas dobles del JSON.
Retorna solo el JSON en texto plano sin bloques de código markdown.`;

    const payload4 = {
      contents: [{ role: "user", parts: [{ text: prompt4 }] }]
    };

    const result4 = await generateContentWithRetry(modelWithoutSearch, payload4, addLog, "Paso 4 (Activos Creativos)", TRANSIENT_MAX_RETRIES, null, null, abortSignal);

    throwIfAborted(abortSignal);

    const text4 = result4.response.text();
    let creatives;
    try {
      creatives = cleanAndParseJSON(text4);
      addLog(`✅ [SUCCESS] Paso 4 completado. Activos creativos y scripts UGC listos.`, 'success');
    } catch (e) {
      addLog(`⚠️ Fallo al parsear Creativos, usando plantilla de contingencia...`, 'warning');
      creatives = {
        ugcScripts: [
          {
            title: "Script 1: Gancho de Curiosidad (30 seg)",
            duration: "30 segundos",
            scenes: [
              { time: "0:00-0:05", visual: "Persona mostrando frustración al intentar resolver su dolor diario.", audio: "¿Sigues intentando aliviar la fatiga con métodos que no sirven? Presta atención.", text: "¡ATENCIÓN!" },
              { time: "0:05-0:15", visual: "Muestra de forma estética y en primer plano el producto.", audio: "Este dispositivo utiliza un mecanismo ergonómico activo que libera la tensión en segundos.", text: "LA SOLUCIÓN" },
              { time: "0:15-0:30", visual: "Demostración de uso cómodo del producto mientras trabaja en su laptop.", audio: "Úsalo mientras trabajas o descansas. Haz clic abajo para conseguir el tuyo con 50% de descuento.", text: "OFERTA 50%" }
            ]
          },
          {
            title: "Script 2: Enfoque de Dolor Empático (45 seg)",
            duration: "45 segundos",
            scenes: [
              { time: "0:00-0:10", visual: "Persona masajeando su espalda con gesto de molestia crónica.", audio: "Sé exactamente cómo se siente llegar al final del día con esa tensión insoportable en el cuerpo.", text: "TENSION DIARIA" },
              { time: "0:10-0:25", visual: "Presentación del producto colocándose con facilidad.", audio: "Pero desde que probé este soporte dinámico, mi día a día ha cambiado por completo. Distribuye la presión de forma automática.", text: "ALIVIO ACTIVO" },
              { time: "0:25-0:45", visual: "Persona sonriendo y estirándose libre de molestias.", audio: "No dejes que la rigidez limite tu rendimiento. Pruébalo hoy mismo sin riesgos con nuestra garantía de 30 días.", text: "GARANTÍA 30 DÍAS" }
            ]
          },
          {
            title: "Script 3: Explicación de Mecanismo UMS vs UMP (60 seg)",
            duration: "60 segundos",
            scenes: [
              { time: "0:00-0:15", visual: "Diagrama visual o demostración de por qué los soportes rígidos comprimen el cuerpo.", audio: "La mayoría de soportes tradicionales fallan porque son rígidos y fuerzan una postura artificial que causa más cansancio.", text: "EL ERROR RÍGIDO" },
              { time: "0:15-0:35", visual: "Demostración cercana del material flexible y de los puntos de presión ajustables del producto.", audio: "Este innovador sistema utiliza un soporte flexible inteligente que reacciona a tus movimientos naturales, liberando la tensión.", text: "SOPORTE INTELIGENTE" },
              { time: "0:35-0:60", visual: "Persona trabajando feliz, terminando el día llena de energía.", audio: "El resultado es un alivio activo continuo y duradero. Haz clic ahora y únete a la revolución ergonómica.", text: "ÚNETE HOY" }
            ]
          }
        ],
        landingPage: {
          outline: [
            { title: "Sección 1: Hero de Alta Conversión", desc: "Titular impactante enfocado en el alivio inmediato + subheader explicativo del UMP + botón de CTA llamativo." },
            { title: "Sección 2: Mapeo del Problema (UMP)", desc: "Explicación del dolor físico, emocional y social del cliente ideal mediante verbatims del mercado." },
            { title: "Sección 3: Presentación de la Solución (UMS)", desc: "Presentación del producto y explicación científica del mecanismo de soporte dinámico." },
            { title: "Sección 4: Prueba Social y Testimonios", desc: "Reseñas reales de clientes detallando el antes y el después con un contraste extremo." },
            { title: "Sección 5: FAQs y Derribo de Objeciones", desc: "Preguntas frecuentes resolviendo dudas sobre adaptabilidad, durabilidad y lavado." },
            { title: "Sección 6: Garantía y Cierre", desc: "Garantía de reembolso de 30 días + oferta limitada con cuenta regresiva." }
          ],
          html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <title>${report.name} - Confort Ergonómico Premium</title>
            </head>
            <body class="bg-slate-950 text-white font-sans">
              <div class="max-w-4xl mx-auto px-6 py-12 text-center">
                <span class="text-cyan-400 font-mono text-sm uppercase tracking-widest">Oferta Exclusiva de Lanzamiento</span>
                <h1 class="text-4xl md:text-6xl font-extrabold mt-4 mb-6 leading-tight">${report.name}</h1>
                <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-8">El primer sistema de soporte dinámico activo que libera la tensión diaria y se adapta al movimiento natural de tu cuerpo.</p>
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto">
                  <div class="text-3xl font-bold text-emerald-400 mb-2">${parseFloat(report.retail || 29.9).toFixed(2)} USD</div>
                  <div class="text-sm text-slate-400 line-through mb-6">${(parseFloat(report.retail || 29.9) * 2).toFixed(2)} USD</div>
                  <a href="#comprar" class="block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition duration-300">OBTENER 50% DE DESCUENTO AHORA</a>
                </div>
              </div>
            </body>
            </html>
          `
        },
        competitorAnalysis: {
          competitorsGanchos: ["Soportes rígidos que causan dolor", "Fajas pesadas imposibles de ocultar", "Sin garantía de satisfacción"],
          ourGanchos: ["Soporte dinámico flexible activo", "Diseño ultra-delgado invisible bajo la ropa", "30 días de prueba 100% libre de riesgo"],
          weaknesses: "Falta de adaptabilidad al movimiento y telas calurosas.",
          differentiation: "Destacar el alivio cómodo y activo en el día a día sin rigidez."
        }
      };
    }

    // STEP 5: Marketing Assets (Email Sequence + Ad Copy + Shopify Description)
    addLog(`[5/5] [RUN] Generando secuencias de correo, anuncios y ficha de Shopify...`, 'info');
    fill.style.width = '90%';
    label.textContent = "Generando Materiales de Marketing (Paso 5 de 5)...";

    const prompt5 = `Basándote en la investigación previa de este producto: "${productName}", el avatar: ${JSON.stringify(avatarBrief)}, y la oferta: ${JSON.stringify(offerBrief)}, genera los materiales de marketing en el idioma: "${state.outputLanguage || 'es'}".
    Devuelve un objeto JSON con el siguiente esquema exacto:
    {
      "emailSequence": [
        {
          "subject": "Asunto atractivo del correo 1",
          "preview": "Texto de previsualización corto",
          "body": "Cuerpo completo del correo (usa saltos de línea \\n, saluda al avatar, enfócate en su dolor, presenta la solución de forma emotiva, usa el mecanismo UMS, termina con un CTA claro)."
        },
        ... hasta 5 correos (Secuencia: Bienvenida → Dolor/Educación → Mecanismo/Prueba Social → Oferta Limitada → Último Recordatorio)
      ],
      "adCopy": {
        "facebook": [
          {
            "primaryText": "Texto principal persuasivo para el post",
            "headline": "Titular llamativo de alta conversión",
            "description": "Descripción secundaria corta"
          },
          ... 3 variantes
        ],
        "tiktok": [
          {
            "hook": "Gancho verbal inicial intrigante para los primeros 3 segundos",
            "body": "Desarrollo corto y dinámico para el video",
            "cta": "Llamado a la acción (ej: Haz clic abajo)"
          },
          ... 3 variantes
        ]
      },
      "shopifyDescription": {
        "title": "Título del Producto optimizado para conversiones",
        "metaDescription": "Meta descripción optimizada para SEO (máx 155 caracteres)",
        "body": "Descripción detallada del producto en formato HTML estructurado (usa etiquetas <p>, <h3>, <ul>, <li> para organizar los beneficios clave, cómo funciona y especificaciones técnicas de forma profesional y visualmente limpia)",
        "faq": [
          { "q": "Pregunta frecuente 1 basada en objeciones", "a": "Respuesta clara derribando la objeción" },
          ... 3 preguntas
        ]
      }
    }
    Retorna solo el JSON en texto plano sin bloques de código markdown ni explicaciones adicionales.`;

    const payload5 = {
      contents: [{ role: "user", parts: [{ text: prompt5 }] }]
    };

    const result5 = await generateContentWithRetry(modelWithoutSearch, payload5, addLog, "Paso 5 (Marketing Assets)", TRANSIENT_MAX_RETRIES, null, null, abortSignal);
    throwIfAborted(abortSignal);
    const text5 = result5.response.text();
    let marketingAssets;
    try {
      marketingAssets = cleanAndParseJSON(text5);
      addLog(`✅ [SUCCESS] Paso 5 completado. Materiales de marketing y correos listos.`, 'success');
    } catch (e) {
      addLog(`⚠️ Fallo al parsear Marketing Assets, usando plantilla de contingencia...`, 'warning');
      marketingAssets = {
        emailSequence: [
          {
            subject: "Bienvenido a la revolución del confort",
            preview: "Descubre cómo empezar hoy mismo...",
            body: `Hola,\n\nGracias por confiar en nosotros. Sabemos que la tensión diaria acumulada puede arruinar tu productividad y descanso.\n\nPor eso diseñamos ${report.name}, para ofrecerte un soporte activo inteligente que reacciona a cada uno de tus movimientos.\n\nDescubre más y obtén un 50% de descuento exclusivo en nuestra tienda.`
          },
          {
            subject: "El error que estás cometiendo con los soportes rígidos",
            preview: "Por qué causan más dolor...",
            body: `Hola de nuevo,\n\nLa mayoría de las personas cometen el error de comprar soportes rígidos tradicionales.\n\nEstos fuerzan una postura artificial e inmovilizan los músculos, causando mayor cansancio a largo plazo.\n\nNuestro sistema dinámico y adaptable es la alternativa científica que tu cuerpo necesita.`
          }
        ],
        adCopy: {
          facebook: [
            {
              primaryText: "Dile adiós a la tensión acumulada al trabajar. Conoce el primer soporte dinámico que se adapta a tu cuerpo en tiempo real.",
              headline: "Alivio y Comodidad Activa al Instante",
              description: "50% de descuento especial y garantía de satisfacción de 30 días."
            }
          ],
          tiktok: [
            {
              hook: "El secreto que los expertos en ergonomía no querían que supieras.",
              body: "Soporte dinámico ajustable para aliviar la fatiga en segundos.",
              cta: "Comprar con 50% Descuento"
            }
          ]
        },
        shopifyDescription: {
          title: report.name,
          metaDescription: `Consigue tu ${report.name} con un 50% de descuento especial de lanzamiento. Comodidad ergonómica garantizada en tu día a día.`,
          body: `
            <h3>Comodidad y Alivio Activo en Segundos</h3>
            <p>${report.name} está diseñado con la última tecnología ergonómica ajustable para brindar un confort inmediato y continuo.</p>
            <h3>Beneficios Clave:</h3>
            <ul>
              <li><strong>Soporte Dinámico Inteligente:</strong> Se adapta al contorno natural y al movimiento de tu cuerpo.</li>
              <li><strong>Materiales Ultra-Resistentes y Transpirables:</strong> Ideal para uso prolongado en la oficina o en casa.</li>
              <li><strong>Diseño Invisible:</strong> Llévalo debajo de tu ropa de manera discreta.</li>
            </ul>
          `,
          faq: [
            { q: "¿Sirve para todas las edades?", a: "Sí, su diseño totalmente ajustable y ergonómico se adapta a cualquier contextura física." },
            { q: "¿Qué garantía tiene?", a: "Ofrecemos 30 días de garantía total. Si no estás satisfecho, te devolvemos el dinero." }
          ]
        }
      };
    }

    throwIfAborted(abortSignal);

    // Consolidated final report object
    const finalReport = {
      ...report,
      avatarBrief,
      offerBrief,
      ugcScripts: creatives.ugcScripts,
      landingPage: creatives.landingPage,
      competitorAnalysis: creatives.competitorAnalysis,
      emailSequence: marketingAssets.emailSequence,
      adCopy: marketingAssets.adCopy,
      shopifyDescription: marketingAssets.shopifyDescription,
      competitorUrl: competitorUrl
    };

    state.currentReport = finalReport;
    addLog(`🎉 COMPILANDO REPORTE COMPLETO EN LA INTERFAZ DE USUARIO...`, 'header-line');
    fill.style.width = '100%';
    label.textContent = "Completado.";
    if (cancelBtn) cancelBtn.classList.add('hidden');

    persistResearchReport(finalReport).catch(() => { /* offline */ });

    setTimeout(() => {
      if (isResearchAborted(abortSignal)) return;
      modal.classList.add('hidden');
      openDeepResearchReport(finalReport);
    }, 1000);

  } catch (error) {
    if (isResearchAborted(abortSignal)) {
      if (cancelBtn) cancelBtn.classList.add('hidden');
      return;
    }
    if (cancelBtn) cancelBtn.classList.add('hidden');
    renderResearchErrorUI(modal, output, fill, label, error, productName, apiKey, modelName, competitorUrl);
  }
}

export function sanitizeReport(report) {
  if (!report) return {};
  
  const sanitized = {
    name: report.name || "Producto Sin Nombre",
    categoryId: report.categoryId || "general",
    cost: typeof report.cost === 'number' ? report.cost : (parseFloat(report.cost) || 10.0),
    retail: typeof report.retail === 'number' ? report.retail : (parseFloat(report.retail) || 29.9),
    margin: typeof report.margin === 'number' ? report.margin : (parseFloat(report.margin) || 19.9),
    roi: typeof report.roi === 'number' ? report.roi : (parseInt(report.roi) || 199),
    shipping: typeof report.shipping === 'number' ? report.shipping : (parseInt(report.shipping) || 10),
    saturation: typeof report.saturation === 'number' ? report.saturation : (parseInt(report.saturation) || 30),
    trend: report.trend || "+50%",
    suppliers: report.suppliers || [],
    demographics: {
      who: report.demographics?.who || "Público interesado.",
      belief: report.demographics?.belief || "Hay una solución.",
      dreams: report.demographics?.dreams || "",
      defeats: report.demographics?.defeats || "",
      outsideForces: report.demographics?.outsideForces || "",
      prejudices: report.demographics?.prejudices || ""
    },
    solutions: {
      current: report.solutions?.current || "",
      experience: report.solutions?.experience || "",
      likes: report.solutions?.likes || "",
      dislikes: report.solutions?.dislikes || "",
      skepticism: report.solutions?.skepticism || "",
      horrorStories: report.solutions?.horrorStories || []
    },
    secrets: {
      historical: report.secrets?.historical || "",
      conspiracy: report.secrets?.conspiracy || "",
      mechanismProblem: report.secrets?.mechanismProblem || "",
      mechanismSolution: report.secrets?.mechanismSolution || ""
    },
    eden: {
      goldenAge: report.eden?.goldenAge || "",
      corruptor: report.eden?.corruptor || "",
      contrast: report.eden?.contrast || ""
    },
    verbatims: report.verbatims || [],
    angles: report.angles || [],
    avatarBrief: {
      general: {
        age: report.avatarBrief?.general?.age || "25-45 años",
        gender: report.avatarBrief?.general?.gender || "Mixto",
        location: report.avatarBrief?.general?.location || "Zonas urbanas",
        income: report.avatarBrief?.general?.income || "Medio",
        background: report.avatarBrief?.general?.background || "Profesional o estudiante.",
        identities: report.avatarBrief?.general?.identities || "Buscador de practicidad."
      },
      painPoints: {
        p1: {
          name: report.avatarBrief?.painPoints?.p1?.name || "Incomodidad Física",
          list: report.avatarBrief?.painPoints?.p1?.list || ["Fatiga acumulada"]
        },
        p2: {
          name: report.avatarBrief?.painPoints?.p2?.name || "Estrés y Frustración",
          list: report.avatarBrief?.painPoints?.p2?.list || ["Pérdida de energía"]
        },
        p3: {
          name: report.avatarBrief?.painPoints?.p3?.name || "Limitación Social",
          list: report.avatarBrief?.painPoints?.p3?.list || ["Menor productividad"]
        }
      },
      goals: {
        short: report.avatarBrief?.goals?.short || ["Alivio inmediato"],
        long: report.avatarBrief?.goals?.long || ["Estilo de vida saludable"]
      },
      emotionalDrivers: report.avatarBrief?.emotionalDrivers || ["Sentirse mejor"],
      quotes: {
        general: report.avatarBrief?.quotes?.general || [],
        pain: report.avatarBrief?.quotes?.pain || [],
        mindset: report.avatarBrief?.quotes?.mindset || [],
        emotional: report.avatarBrief?.quotes?.emotional || [],
        responses: report.avatarBrief?.quotes?.responses || [],
        success: report.avatarBrief?.quotes?.success || []
      },
      fears: report.avatarBrief?.fears || [],
      insights: report.avatarBrief?.insights || [],
      journey: {
        awareness: report.avatarBrief?.journey?.awareness || "Conciencia inicial",
        frustración: report.avatarBrief?.journey?.frustración || "Frustración acumulada",
        desesperación: report.avatarBrief?.journey?.desesperación || "Desesperación",
        alivio: report.avatarBrief?.journey?.alivio || "Alivio final"
      }
    },
    offerBrief: {
      names: report.offerBrief?.names || [report.name],
      awareness: report.offerBrief?.awareness || "Nivel 2",
      sophistication: report.offerBrief?.sophistication || "Nivel 3",
      bigIdea: report.offerBrief?.bigIdea || "Solución ergonómica",
      metaphor: report.offerBrief?.metaphor || "Como tu propio masajista",
      ump: report.offerBrief?.ump || "El error tradicional",
      ums: report.offerBrief?.ums || "La adaptabilidad dinámica",
      guru: report.offerBrief?.guru || "Especialista en ergonomía",
      discovery: report.offerBrief?.discovery || "Investigación activa",
      product: report.offerBrief?.product || report.name,
      headlines: report.offerBrief?.headlines || [report.name],
      objections: report.offerBrief?.objections || [],
      beliefs: report.offerBrief?.beliefs || [],
      funnel: report.offerBrief?.funnel || "Landing page",
      domains: report.offerBrief?.domains || [],
      swipes: report.offerBrief?.swipes || [],
      otherNotes: report.offerBrief?.otherNotes || ""
    },
    ugcScripts: report.ugcScripts || [],
    landingPage: {
      outline: report.landingPage?.outline || [],
      html: report.landingPage?.html || ""
    },
    competitorAnalysis: {
      competitorsGanchos: report.competitorAnalysis?.competitorsGanchos || [],
      ourGanchos: report.competitorAnalysis?.ourGanchos || [],
      weaknesses: report.competitorAnalysis?.weaknesses || "",
      differentiation: report.competitorAnalysis?.differentiation || ""
    },
    emailSequence: report.emailSequence || [],
    adCopy: {
      facebook: report.adCopy?.facebook || [],
      tiktok: report.adCopy?.tiktok || []
    },
    shopifyDescription: {
      title: report.shopifyDescription?.title || report.name,
      metaDescription: report.shopifyDescription?.metaDescription || "",
      body: report.shopifyDescription?.body || "",
      faq: report.shopifyDescription?.faq || []
    },
    competitorUrl: report.competitorUrl || ""
  };
  
  return sanitized;
}
