import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { metaHiddenInterestsDatabase } from '../data/metaInterests.js';
import { generateCompetitorStoreAnalysis } from '../data/competitorAnalysis.js';

export function renderCompetitorStoreAnalysis(data) {
  const container = document.getElementById('competitor-analysis-results');
  if (!container) return;

  container.innerHTML = `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); font-weight: 600;">Dominio Analizado</span>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-top: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="globe" style="color: var(--accent-cyan); width: 20px; height: 20px;"></i> ${data.domain}
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.1rem;">Producto Identificado: <strong>${data.productName}</strong></p>
        </div>
        <button type="button" id="import-to-research-btn" class="btn btn-primary btn-glow" data-product-name="${data.productName}" data-url="${data.url}">
          <i data-lucide="sparkles"></i> Importar a Deep Research
        </button>
      </div>

      <!-- Grid of Key Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Plataforma / CMS</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${data.platform.cms}</div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald); margin-top: 0.25rem;">Tema: ${data.platform.theme}</div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Precio PVP Competidor</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-emerald); margin-top: 0.25rem;">${data.pricingStructure.retailPrice}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Costo Est: ${data.pricingStructure.estimatedCost}</div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Margen Estimado</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-violet); margin-top: 0.25rem;">${data.pricingStructure.estimatedMargin}</div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: 0.25rem;">${data.pricingStructure.shippingOffer}</div>
        </div>
      </div>

      <!-- Detail Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
        
        <!-- Card 1: Ganchos & Copywriting -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-cyan);">
            <i data-lucide="zap" style="width: 18px; height: 18px;"></i> Ganchos de Copy Extraídos
          </h4>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Gancho Principal (Hero Hook):</strong><br><span style="color: var(--text-secondary); font-style: italic;">${data.copyHooks.heroHook}</span></p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Mecanismo Único de Dolor (UMP):</strong><br><span style="color: var(--text-secondary);">${data.copyHooks.ump}</span></p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Mecanismo Único de Solución (UMS):</strong><br><span style="color: var(--text-secondary);">${data.copyHooks.ums}</span></p>
          <p style="font-size: 0.85rem;"><strong>Ángulo Ganador:</strong><br><span style="color: var(--accent-amber); font-weight: 600;">${data.copyHooks.angle}</span></p>
        </div>

        <!-- Card 2: Fricción & Quejas de Clientes -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-red);">
            <i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i> Quejas & Oportunidades de Mejora
          </h4>
          <div style="margin-bottom: 1rem;">
            <strong style="font-size: 0.85rem; color: var(--accent-red);">Quejas Principales de sus Compradores:</strong>
            <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.2rem; margin-top: 0.4rem;">
              ${data.customerFriction.complaints.map(c => `<li style="margin-bottom:0.3rem">${c}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="font-size: 0.85rem; color: var(--accent-emerald);">Tus Oportunidades de Diferenciación:</strong>
            <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.2rem; margin-top: 0.4rem;">
              ${data.customerFriction.opportunities.map(o => `<li style="margin-bottom:0.3rem">${o}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Card 3: Pila Tecnológica & Apps -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-violet);">
            <i data-lucide="cpu" style="width: 18px; height: 18px;"></i> Pila Tecnológica & Apps Detectadas
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            ${data.platform.appsDetected.map(app => `<span class="report-badge-status score-viable" style="font-size: 0.75rem;">${app}</span>`).join('')}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            <p style="margin-bottom: 0.3rem;">✓ Meta Pixel Detectado: <strong>${data.platform.pixelDetected ? 'Sí' : 'No'}</strong></p>
            <p style="margin-bottom: 0.3rem;">✓ TikTok Pixel Detectado: <strong>${data.platform.tiktokPixel ? 'Sí' : 'No'}</strong></p>
            <p>✓ Google Analytics 4: <strong>${data.platform.googleAnalytics4 ? 'Sí' : 'No'}</strong></p>
          </div>
        </div>

      </div>
    </div>
  `;

  lucide.createIcons();

  // Bind Import to Research button
  const importBtn = document.getElementById('import-to-research-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const pName = importBtn.getAttribute('data-product-name');
      const pUrl = importBtn.getAttribute('data-url');
      switchView('dashboard-view');
      const searchInput = document.getElementById('search-input');
      const competitorInput = document.getElementById('competitor-input');
      if (searchInput) searchInput.value = pName;
      if (competitorInput) competitorInput.value = pUrl;
      showToast(`Producto "${pName}" listo para investigar en el Dashboard.`, "success");
    });
  }
}

// Run Store Scan (Hybrid API + Procedural)
export async function runCompetitorStoreScan(url) {
  if (!url || !url.trim()) {
    showToast("Por favor ingresa una URL válida.", "error");
    return;
  }

  const container = document.getElementById('competitor-analysis-results');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: var(--border-radius-md);">
        <div class="radar-circle" style="width: 60px; height: 60px; margin: 0 auto 1.5rem auto;">
          <div class="radar-sweep"></div>
        </div>
        <h3 style="margin-top: 1rem;">Escaneando URL del Competidor...</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Extrayendo estructura de precios, ganchos de copy y tecnologías instaladas en ${url}</p>
      </div>
    `;
    lucide.createIcons();
  }

  const apiKey = localStorage.getItem('dropdeep_gemini_key');
  let analysisResult;

  if (apiKey) {
    try {
      showToast("Conectando con Gemini API para análisis en vivo...", "info");
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = localStorage.getItem('dropdeep_gemini_model') || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `Analiza la tienda o producto de esta URL: ${url}.
Devuelve un JSON estricto sin markdown adicional con las siguientes claves:
{
  "domain": "dominio extraido",
  "url": "${url}",
  "productName": "Nombre del Producto",
  "platform": {
    "cms": "Shopify / WooCommerce",
    "theme": "Nombre del tema o estilo",
    "appsDetected": ["App1", "App2", "App3"],
    "pixelDetected": true,
    "googleAnalytics4": true,
    "tiktokPixel": true
  },
  "pricingStructure": {
    "retailPrice": "$X USD",
    "estimatedCost": "$Y USD",
    "estimatedMargin": "$Z USD (N% Margen)",
    "shippingOffer": "Estrategia de envío",
    "activeDiscount": "Descuento activo"
  },
  "copyHooks": {
    "heroHook": "Gancho principal",
    "ump": "Mecanismo Único de Dolor",
    "ums": "Mecanismo Único de Solución",
    "angle": "Ángulo publicitario"
  },
  "customerFriction": {
    "complaints": ["Queja 1", "Queja 2"],
    "opportunities": ["Oportunidad 1", "Oportunidad 2"]
  }
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisResult = JSON.parse(cleaned);
      showToast("Análisis en vivo de la tienda competidora completado.", "success");
    } catch (err) {
      console.warn("Fallo el análisis en vivo API, activando motor procedural de contingencia:", err);
      analysisResult = generateCompetitorStoreAnalysis(url);
      showToast("Análisis completado mediante Inteligencia Procedural.", "info");
    }
  } else {
    // Mode Zero-Token Procedural
    analysisResult = generateCompetitorStoreAnalysis(url);
    showToast("Análisis completado en Modo Zero-Token.", "success");
  }

  renderCompetitorStoreAnalysis(analysisResult);
}

// Render Meta Hidden Interests Grid
export function renderMetaHiddenInterests(query = '', category = 'all') {
  const grid = document.getElementById('meta-interests-grid');
  if (!grid) return;

  let filtered = metaHiddenInterestsDatabase;

  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        No se encontraron intereses ocultos para "${query}". Intenta buscar con otro nicho.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isChecked = state.selectedMetaInterests.includes(item.name);
    let satColor = 'score-excellent';
    if (item.saturation === 'Media') satColor = 'score-viable';
    if (item.saturation === 'Alta') satColor = 'score-risky';

    return `
      <div class="product-card" style="position: relative;">
        <div style="position: absolute; top: 1rem; right: 1rem;">
          <input type="checkbox" class="meta-interest-checkbox" data-name="${item.name}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-cyan);">
        </div>
        <div class="product-card-body" style="padding-top: 0.5rem;">
          <span class="product-card-category">${item.category.toUpperCase()}</span>
          <h3 class="product-card-title" style="margin-top: 0.2rem; font-size: 1.1rem; padding-right: 2rem;">${item.name}</h3>
          <p class="product-card-desc" style="font-size: 0.8rem; margin: 0.4rem 0 0.8rem 0;">${item.description}</p>

          <div class="card-stats-table">
            <div class="stats-row">
              <span class="stats-label">Tamaño Audiencia:</span>
              <span class="stats-val" style="font-weight: 700; color: var(--accent-cyan);">${item.audienceSize}</span>
            </div>
            <div class="stats-row">
              <span class="stats-label">Puntaje Afinidad:</span>
              <span class="stats-val green" style="font-weight: 700;">${item.affinityScore}%</span>
            </div>
            <div class="stats-row">
              <span class="stats-label">Saturación:</span>
              <span class="report-badge-status ${satColor}" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">${item.saturation}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind checkbox events
  grid.querySelectorAll('.meta-interest-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const name = e.target.getAttribute('data-name');
      if (e.target.checked) {
        if (!state.selectedMetaInterests.includes(name)) {
          state.selectedMetaInterests.push(name);
        }
      } else {
        state.selectedMetaInterests = state.selectedMetaInterests.filter(n => n !== name);
      }
      updateCopyMetaButton();
    });
  });

  updateCopyMetaButton();
}

export function updateCopyMetaButton() {
  const btn = document.getElementById('copy-selected-interests-btn');
  if (!btn) return;
  const count = state.selectedMetaInterests.length;
  btn.textContent = `Copiar Seleccionados (${count})`;
  btn.disabled = count === 0;
}
