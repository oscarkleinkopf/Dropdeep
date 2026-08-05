import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { metaHiddenInterestsDatabase } from '../data/metaInterests.js';
import { updateGeminiKeyBanner, openSettingsModal } from './geminiKeyBanner.js';
import { getGeminiKey, getGeminiModel } from '../utils/geminiStorage.js';
import { escapeHtml } from '../utils/sanitize.js';
import { getGeminiRoute } from '../config/geminiRoute.js';
import { createProxyGenerativeModel } from '../research/geminiProxy.js';
import { switchView } from './navigation.js';
import { classifyGeminiError } from '../research/errors.js';
import {
  SPY_INFERRED_BANNER,
  SPY_UNVERIFIED_LABEL,
  describeSpyTechSignals,
} from '../research/spyHonest.js';

export { SPY_INFERRED_BANNER, SPY_UNVERIFIED_LABEL, describeSpyTechSignals };

/** Pixel/GA no se escanean del HTML — siempre "No verificado" (T11 Opción A). */

function manualChecklistHtml(url = '') {
  const safeUrl = escapeHtml(url || '');
  return `
    <div class="spy-manual-checklist">
      <h4>Checklist manual (sin API / gratis)</h4>
      <ol>
        <li>${safeUrl ? `Copia o abre: <code class="spy-checklist-url">${safeUrl}</code>` : 'Copia la URL del competidor'}</li>
        <li>Abre la tienda en otra pestaña y anota PVP, envío y gancho del hero</li>
        <li>Usa <strong>Modo Copiloto</strong> o <strong>Evaluación manual</strong> en Inicio con esos datos</li>
      </ol>
      ${
        url
          ? `<button type="button" class="btn btn-secondary btn-sm" id="spy-copy-url-btn" data-url="${safeUrl}"><i data-lucide="copy"></i> Copiar URL</button>`
          : ''
      }
    </div>
  `;
}

function bindSpyCopyUrl(root = document) {
  root.querySelector('#spy-copy-url-btn')?.addEventListener('click', (e) => {
    const u = e.currentTarget.getAttribute('data-url') || '';
    if (!u) return;
    navigator.clipboard.writeText(u).then(
      () => showToast('URL copiada. Ábrela en otra pestaña y anota PVP/gancho.', 'success'),
      () => showToast('No se pudo copiar la URL.', 'error'),
    );
  });
}

export function renderCompetitorStoreAnalysis(data) {
  const container = document.getElementById('competitor-analysis-results');
  if (!container) return;

  const d = (v) => escapeHtml(v);
  const tech = describeSpyTechSignals(data.platform || {});

  container.innerHTML = `
    <div class="spy-analysis-wrap" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
      <div class="spy-honest-banner" role="status">
        <i data-lucide="info" style="width:16px;height:16px;flex-shrink:0"></i>
        <span>${escapeHtml(SPY_INFERRED_BANNER)}</span>
        <span class="spy-inferred-badge">Inferido por IA</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); font-weight: 600;">Dominio analizado (inferido)</span>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-top: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="globe" style="color: var(--accent-cyan); width: 20px; height: 20px;"></i> ${d(data.domain)}
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.1rem;">Producto identificado: <strong>${d(data.productName)}</strong></p>
        </div>
        <button type="button" id="import-to-research-btn" class="btn btn-primary btn-glow" data-product-name="${d(data.productName)}" data-url="${d(data.url)}">
          <i data-lucide="sparkles"></i> Importar a Deep Research
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Plataforma / CMS <span class="spy-inferred-chip">inferido</span></div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${d(tech.cms)}</div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald); margin-top: 0.25rem;">Tema: ${d(tech.theme)}</div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Precio PVP competidor <span class="spy-inferred-chip">inferido</span></div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-emerald); margin-top: 0.25rem;">${d(data.pricingStructure?.retailPrice)}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Costo est.: ${d(data.pricingStructure?.estimatedCost)}</div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Margen estimado <span class="spy-inferred-chip">inferido</span></div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-violet); margin-top: 0.25rem;">${d(data.pricingStructure?.estimatedMargin)}</div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: 0.25rem;">${d(data.pricingStructure?.shippingOffer)}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-cyan);">
            <i data-lucide="zap" style="width: 18px; height: 18px;"></i> Ganchos de copy (inferidos)
          </h4>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Gancho principal (Hero Hook):</strong><br><span style="color: var(--text-secondary); font-style: italic;">${d(data.copyHooks?.heroHook)}</span></p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Mecanismo único de dolor (UMP):</strong><br><span style="color: var(--text-secondary);">${d(data.copyHooks?.ump)}</span></p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Mecanismo único de solución (UMS):</strong><br><span style="color: var(--text-secondary);">${d(data.copyHooks?.ums)}</span></p>
          <p style="font-size: 0.85rem;"><strong>Ángulo:</strong><br><span style="color: var(--accent-amber); font-weight: 600;">${d(data.copyHooks?.angle)}</span></p>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-red);">
            <i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i> Quejas y oportunidades (inferidas)
          </h4>
          <div style="margin-bottom: 1rem;">
            <strong style="font-size: 0.85rem; color: var(--accent-red);">Quejas materiales (hipótesis IA):</strong>
            <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.2rem; margin-top: 0.4rem;">
              ${(data.customerFriction?.complaints || []).map((c) => `<li style="margin-bottom:0.3rem">${d(c)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="font-size: 0.85rem; color: var(--accent-emerald);">Oportunidades de diferenciación:</strong>
            <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.2rem; margin-top: 0.4rem;">
              ${(data.customerFriction?.opportunities || []).map((o) => `<li style="margin-bottom:0.3rem">${d(o)}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--accent-violet);">
            <i data-lucide="cpu" style="width: 18px; height: 18px;"></i> Pila tecnológica
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            ${
              tech.appsDetected.length
                ? tech.appsDetected
                    .map(
                      (app) =>
                        `<span class="report-badge-status score-viable" style="font-size: 0.75rem;">${d(app)} <span class="spy-inferred-chip">inferido</span></span>`,
                    )
                    .join('')
                : `<span class="spy-unverified">${escapeHtml(SPY_UNVERIFIED_LABEL)}</span>`
            }
          </div>
          <div class="spy-tech-unverified" style="font-size: 0.8rem; color: var(--text-secondary);">
            <p style="margin-bottom: 0.3rem;">Meta Pixel: <strong class="spy-unverified">${escapeHtml(tech.metaPixel)}</strong></p>
            <p style="margin-bottom: 0.3rem;">TikTok Pixel: <strong class="spy-unverified">${escapeHtml(tech.tiktokPixel)}</strong></p>
            <p style="margin-bottom: 0.3rem;">Google Analytics 4: <strong class="spy-unverified">${escapeHtml(tech.googleAnalytics4)}</strong></p>
            <p class="spy-tech-note">${escapeHtml(tech.disclaimer)}</p>
          </div>
        </div>
      </div>

      ${manualChecklistHtml(data.url || '')}
    </div>
  `;

  lucide.createIcons();
  bindSpyCopyUrl(container);

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
      showToast(`Producto "${pName}" listo para investigar en el Dashboard.`, 'success');
    });
  }
}

function renderSpyUnavailable(reason, detail = '', url = '') {
  const container = document.getElementById('competitor-analysis-results');
  if (!container) return;

  container.innerHTML = `
    <div class="spy-empty-state" style="border-style: solid; border-color: var(--border-color);">
      <div class="spy-honest-banner spy-honest-banner-compact" role="status">
        <i data-lucide="info" style="width:16px;height:16px;flex-shrink:0"></i>
        <span>${escapeHtml(SPY_INFERRED_BANNER)}</span>
      </div>
      <i data-lucide="clock" class="spy-empty-icon"></i>
      <h3>Espionaje de tienda: requiere Gemini</h3>
      <p>${escapeHtml(reason)}</p>
      ${detail ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem">${escapeHtml(detail)}</p>` : ''}
      <div style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-top:1rem">
        <button type="button" class="btn btn-primary btn-glow" id="spy-open-settings-btn">
          <i data-lucide="settings"></i> Abrir Ajustes
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="spy-empty-dashboard-cta">
          <i data-lucide="layout-dashboard"></i> Volver a Inicio
        </button>
      </div>
      ${manualChecklistHtml(url)}
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:1rem; max-width:520px; margin-inline:auto">
        No inventamos datos de tienda. El escaneo con fuente verificada (HTML/Shopify) está en backlog; hoy el análisis con API es inferido por Gemini.
      </p>
    </div>
  `;
  lucide.createIcons();
  bindSpyCopyUrl(container);
  document.getElementById('spy-open-settings-btn')?.addEventListener('click', openSettingsModal);
  document.getElementById('spy-empty-dashboard-cta')?.addEventListener('click', () =>
    switchView('dashboard-view'),
  );
}

export function renderSpyEmptyState() {
  const container = document.getElementById('competitor-analysis-results');
  if (!container) return;
  const urlInput = document.getElementById('competitor-url-analysis-input');
  const url = urlInput?.value?.trim() || '';
  container.innerHTML = `
    <div class="spy-empty-state">
      <div class="spy-honest-banner spy-honest-banner-compact" role="status">
        <i data-lucide="info" style="width:16px;height:16px;flex-shrink:0"></i>
        <span>${escapeHtml(SPY_INFERRED_BANNER)}</span>
      </div>
      <i data-lucide="globe" class="spy-empty-icon"></i>
      <h3>Ingresa una URL de competidor para analizarla con Gemini</h3>
      <p>Requiere clave Gemini (BYOK) o proxy Supabase. Sin API no mostramos datos simulados. Pixel/GA siempre aparecen como <strong>No verificado</strong>.</p>
      ${manualChecklistHtml(url)}
      <button type="button" class="btn btn-secondary btn-sm" id="spy-empty-dashboard-cta">
        <i data-lucide="layout-dashboard"></i> Volver a Inicio
      </button>
    </div>
  `;
  lucide.createIcons();
  bindSpyCopyUrl(container);
  document.getElementById('spy-empty-dashboard-cta')?.addEventListener('click', () =>
    switchView('dashboard-view'),
  );
}

// Run Store Scan (live Gemini only — no mock fallback)
export async function runCompetitorStoreScan(url) {
  if (!url || !url.trim()) {
    showToast('Por favor ingresa una URL válida.', 'error');
    return;
  }

  const container = document.getElementById('competitor-analysis-results');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: var(--border-radius-md);">
        <div class="radar-circle" style="width: 60px; height: 60px; margin: 0 auto 1.5rem auto;">
          <div class="radar-sweep"></div>
        </div>
        <h3 style="margin-top: 1rem;">Analizando URL del competidor…</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Inferencia con Gemini en vivo (no es un scraper HTML) — ${escapeHtml(url)}</p>
        <p class="spy-honest-banner spy-honest-banner-compact" style="margin:1rem auto 0; max-width:480px; text-align:left">${escapeHtml(SPY_INFERRED_BANNER)}</p>
      </div>
    `;
    lucide.createIcons();
  }

  const route = getGeminiRoute();
  const useProxy = route === 'proxy';
  const apiKey = route === 'byok' ? getGeminiKey() : null;

  if (route === 'none') {
    updateGeminiKeyBanner();
    renderSpyUnavailable(
      'Configura tu clave Gemini en Ajustes o activa el proxy Supabase para analizar URLs con IA.',
      'Sin API puedes usar el checklist manual gratis (copiar URL → visitar tienda → Copiloto / Evaluación manual).',
      url,
    );
    showToast('Espionaje con IA requiere Gemini (BYOK o proxy). Usa el checklist manual gratis.', 'info');
    return;
  }

  try {
    showToast(
      useProxy ? 'Analizando vía proxy seguro (inferido por IA)…' : 'Conectando con Gemini BYOK (inferido por IA)…',
      'info',
    );
    const modelName = getGeminiModel();
    const model = useProxy
      ? createProxyGenerativeModel({ model: modelName, useSearch: false })
      : new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelName });

    const prompt = `Analiza la tienda o producto de esta URL: ${url}.
Importante: NO inventes detección verificada de Meta Pixel, TikTok Pixel ni Google Analytics.
Devuelve un JSON estricto sin markdown adicional con las siguientes claves:
{
  "domain": "dominio extraido",
  "url": "${url}",
  "productName": "Nombre del Producto",
  "platform": {
    "cms": "Shopify / WooCommerce / desconocido",
    "theme": "Nombre del tema o estilo (hipótesis)",
    "appsDetected": ["App1", "App2"]
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

    const res = await model.generateContent(
      useProxy ? { contents: [{ role: 'user', parts: [{ text: prompt }] }] } : prompt,
    );
    const text = res.response.text();
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysisResult = JSON.parse(cleaned);
    showToast('Análisis inferido por IA listo — verifica visitando la tienda.', 'success');
    renderCompetitorStoreAnalysis(analysisResult);
  } catch (err) {
    const classified = classifyGeminiError(err);
    renderSpyUnavailable(classified.message, classified.title, url);
    showToast(classified.title, 'error');
  }
}

// Render Meta Hidden Interests Grid
export function renderMetaHiddenInterests(query = '', category = 'all') {
  const grid = document.getElementById('meta-interests-grid');
  if (!grid) return;

  let filtered = metaHiddenInterestsDatabase;

  if (category && category !== 'all') {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        No se encontraron intereses ocultos para "${escapeHtml(query)}". Intenta buscar con otro nicho.
      </div>
    `;
    return;
  }

  const disclaimer = document.getElementById('meta-interests-disclaimer');
  if (disclaimer) disclaimer.classList.remove('hidden');

  grid.innerHTML = filtered
    .map((item) => {
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
    })
    .join('');

  grid.querySelectorAll('.meta-interest-checkbox').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const name = e.target.getAttribute('data-name');
      if (e.target.checked) {
        if (!state.selectedMetaInterests.includes(name)) {
          state.selectedMetaInterests.push(name);
        }
      } else {
        state.selectedMetaInterests = state.selectedMetaInterests.filter((n) => n !== name);
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
