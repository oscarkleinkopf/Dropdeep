import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import { setCacheEntry } from '../research/cache.js';
import { calculateProductScore } from '../research/scoring.js';
import { sanitizeReport } from '../research/gemini.js';
import { generateMasterPromptSequence } from './promptHub.js';
import { runApiResearchDirect } from '../research/flow.js';
import { markFirstResearchDone, updateOnboardingPanel } from './onboarding.js';
import { toggleSaveProduct } from './portfolio.js';
import { initTrendChart, initSentimentChart, initProjectionChart } from './charts.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';

export function openDeepResearchReport(productOrReport) {
  if (typeof productOrReport === 'string') {
    showToast('Este reporte requiere investigación en vivo con Gemini.', 'info');
    runApiResearchDirect(productOrReport);
    return;
  }

  markFirstResearchDone();
  updateOnboardingPanel();
  let report = sanitizeReport(productOrReport);
  const loadedFromCache = !!productOrReport._loadedFromCache;

  if (!loadedFromCache) {
    const language = state.outputLanguage || 'es';
    setCacheEntry(report.name, report, language);
  }

  state.currentReport = report;
  
  // Clear search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  // Update Header details
  document.getElementById('report-product-name').textContent = report.name;
  
  // Calculate dynamic Product Score and add badge
  const score = calculateProductScore(report);
  report.productScore = score;

  const titleContainer = document.querySelector('.report-header-title');
  const oldScoreBadge = document.getElementById('report-score-badge');
  if (oldScoreBadge) oldScoreBadge.remove();
  const oldModeBadge = document.getElementById('report-mode-badge');
  if (oldModeBadge) oldModeBadge.remove();

  let badgeClass = 'score-excellent';
  let badgeLabel = 'Excelente';
  if (score < 50) {
    badgeClass = 'score-risky';
    badgeLabel = 'Riesgoso';
  } else if (score < 75) {
    badgeClass = 'score-viable';
    badgeLabel = 'Viable';
  }

  const scoreBadge = document.createElement('span');
  scoreBadge.id = 'report-score-badge';
  scoreBadge.className = `report-badge-status ${badgeClass}`;
  scoreBadge.innerHTML = `Product Score: <strong>${score}/100</strong> (${badgeLabel})`;
  titleContainer.appendChild(scoreBadge);

  if (report._researchMode === 'fast') {
    const modeBadge = document.createElement('span');
    modeBadge.id = 'report-mode-badge';
    modeBadge.className = 'report-badge-status';
    modeBadge.style.marginLeft = '0.5rem';
    modeBadge.textContent = 'Modo Rápido';
    titleContainer.appendChild(modeBadge);
  }

  if (report._source === 'copilot') {
    const copilotBadge = document.createElement('span');
    copilotBadge.id = 'report-source-badge';
    copilotBadge.className = 'report-badge-status';
    copilotBadge.style.marginLeft = '0.5rem';
    copilotBadge.style.borderColor = 'var(--accent-violet)';
    copilotBadge.style.color = 'var(--accent-violet)';
    copilotBadge.textContent = 'Generado en modo copiloto';
    titleContainer.appendChild(copilotBadge);
  }

  if (report.manualEvaluation) {
    const manualBadge = document.createElement('span');
    manualBadge.id = 'report-manual-badge';
    manualBadge.className = 'report-badge-status';
    manualBadge.style.marginLeft = '0.5rem';
    const v = report.manualEvaluation.verdict;
    const color = v === 'Lanzar' ? 'var(--accent-emerald)' : v === 'Validar más' ? 'var(--accent-amber)' : 'var(--accent-red)';
    manualBadge.style.borderColor = color;
    manualBadge.style.color = color;
    manualBadge.textContent = `Evaluación manual: ${v} (${report.manualEvaluation.score}/100)`;
    titleContainer.appendChild(manualBadge);
  }

  const refreshCacheBtn = document.getElementById('refresh-cache-btn');
  if (refreshCacheBtn) {
    if (loadedFromCache) {
      refreshCacheBtn.classList.remove('hidden');
      refreshCacheBtn.onclick = () => {
        runApiResearchDirect(report.name, report.competitorUrl || '');
      };
    } else {
      refreshCacheBtn.classList.add('hidden');
    }
  }

  // Set Save Button state
  const saveBtn = document.getElementById('save-report-btn');
  const saveText = document.getElementById('save-btn-text');
  const heartIcon = document.getElementById('save-heart-icon');
  const isSaved = state.portfolio.some(p => p.name.toLowerCase() === report.name.toLowerCase());
  
  if (isSaved) {
    saveBtn.classList.add('saved');
    saveText.textContent = "Guardado en Portafolio";
    heartIcon.setAttribute('data-lucide', 'check');
  } else {
    saveBtn.classList.remove('saved');
    saveText.textContent = "Guardar en Portafolio";
    heartIcon.setAttribute('data-lucide', 'heart');
  }
  lucide.createIcons();

  // Render Product Snapshot Metrics
  const snapshot = document.getElementById('product-snapshot');
  snapshot.innerHTML = `
    <div class="snapshot-item">
      <div class="snapshot-label">Costo Proveedor</div>
      <div class="snapshot-input-container">
        <span class="snapshot-input-symbol">$</span>
        <input type="number" id="snapshot-cost-input" class="snapshot-input" value="${report.cost.toFixed(2)}" step="0.1" min="0">
      </div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-label">Precio Retail</div>
      <div class="snapshot-input-container">
        <span class="snapshot-input-symbol">$</span>
        <input type="number" id="snapshot-retail-input" class="snapshot-input" value="${report.retail.toFixed(2)}" step="0.1" min="0">
      </div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-label">Margen Neto</div>
      <div class="snapshot-value green" id="snapshot-margin-val">$${report.margin.toFixed(2)}</div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-label">ROI Est.</div>
      <div class="snapshot-value green" id="snapshot-roi-val">${report.roi}%</div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-label">Envío Medio</div>
      <div class="snapshot-input-container">
        <input type="number" id="snapshot-shipping-input" class="snapshot-input" value="${report.shipping}" step="1" min="0" style="width: 50px;">
        <span class="snapshot-input-symbol" style="margin-left: 0.15rem; font-size: 0.75rem; font-family:var(--font-body)">días</span>
      </div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-label">Saturación</div>
      <div class="snapshot-value amber">${report.saturation}%</div>
    </div>
  `;

  // Check if Advanced Profitability Calculator panel exists, if not create it
  let calcPanel = document.getElementById('profitability-calculator');
  if (!calcPanel) {
    calcPanel = document.createElement('div');
    calcPanel.id = 'profitability-calculator';
    calcPanel.className = 'profitability-calculator-panel';
    snapshot.parentNode.insertBefore(calcPanel, snapshot.nextSibling);
  }

  calcPanel.innerHTML = `
    <div class="calc-grid">
      <!-- Column 1: Inputs -->
      <div class="calc-inputs">
        <h4>Calculadora de Ads y Proyecciones</h4>
        <div class="input-row">
          <label>Presupuesto Diario Ads</label>
          <div class="input-with-symbol">
            <span>$</span>
            <input type="number" id="calc-budget-input" value="50" min="0">
          </div>
        </div>
        <div class="input-row">
          <label>CPC Estimado</label>
          <div class="input-with-symbol">
            <span>$</span>
            <input type="number" id="calc-cpc-input" value="0.80" step="0.05" min="0.01">
          </div>
        </div>
        <div class="input-row">
          <label>Tasa Conversión</label>
          <div class="input-with-symbol">
            <input type="number" id="calc-conv-input" value="2.5" step="0.1" min="0.1">
            <span>%</span>
          </div>
        </div>
        <div class="input-row">
          <label>Valor Medio Pedido (AOV)</label>
          <div class="input-with-symbol">
            <span>$</span>
            <input type="number" id="calc-aov-input" value="${report.retail.toFixed(2)}" step="0.1" min="0">
          </div>
        </div>
      </div>

      <!-- Column 2: Results -->
      <div class="calc-results-container">
        <h4>Proyecciones de Rentabilidad</h4>
        <div class="calc-results">
          <div class="calc-metric">
            <span class="calc-metric-label">ROAS Proyectado</span>
            <span class="calc-metric-val cyan" id="calc-roas-val">0.00</span>
          </div>
          <div class="calc-metric">
            <span class="calc-metric-label">Break-Even ROAS</span>
            <span class="calc-metric-val" id="calc-breakeven-val">0.00</span>
          </div>
          <div class="calc-metric">
            <span class="calc-metric-label">CPA Estimado</span>
            <span class="calc-metric-val" id="calc-cpa-val">$0.00</span>
          </div>
          <div class="calc-metric">
            <span class="calc-metric-label">Beneficio Diario</span>
            <span class="calc-metric-val green" id="calc-daily-profit-val">$0.00</span>
          </div>
          <div class="calc-metric" style="grid-column: span 2;">
            <span class="calc-metric-label">Beneficio Mensual Proyectado (30 días)</span>
            <span class="calc-metric-val" id="calc-monthly-profit-val">$0.00</span>
          </div>
        </div>
      </div>

      <!-- Column 3: Mini Chart -->
      <div class="calc-chart-col">
        <h4>Proyección de Retorno a 30 Días</h4>
        <div class="calc-chart-container">
          <canvas id="profit-projection-chart"></canvas>
        </div>
      </div>
    </div>
  `;

  // Bind snapshot recalculation events
  const costInput = document.getElementById('snapshot-cost-input');
  const retailInput = document.getElementById('snapshot-retail-input');
  const shippingInput = document.getElementById('snapshot-shipping-input');
  const marginVal = document.getElementById('snapshot-margin-val');
  const roiVal = document.getElementById('snapshot-roi-val');

  // Calculator inputs
  const budgetInput = document.getElementById('calc-budget-input');
  const cpcInput = document.getElementById('calc-cpc-input');
  const convInput = document.getElementById('calc-conv-input');
  const aovInput = document.getElementById('calc-aov-input');

  // Calculator outputs
  const roasVal = document.getElementById('calc-roas-val');
  const breakevenVal = document.getElementById('calc-breakeven-val');
  const cpaVal = document.getElementById('calc-cpa-val');
  const dailyProfitVal = document.getElementById('calc-daily-profit-val');
  const monthlyProfitVal = document.getElementById('calc-monthly-profit-val');

  const recalculateAdsProfitability = () => {
    const budget = parseFloat(budgetInput.value) || 0;
    const cpc = parseFloat(cpcInput.value) || 0.01;
    const convRate = parseFloat(convInput.value) || 0;
    const aov = parseFloat(aovInput.value) || 0;
    const currentCost = parseFloat(costInput.value) || 0;

    const clicks = budget / cpc;
    const orders = clicks * (convRate / 100);
    const revenue = orders * aov;
    const cogs = orders * currentCost;
    
    const roas = budget > 0 ? (revenue / budget) : 0;
    const cpa = convRate > 0 ? (cpc / (convRate / 100)) : 0;
    
    const marginPerItem = aov - currentCost;
    const breakEvenRoas = marginPerItem > 0 ? (aov / marginPerItem) : 0;

    const dailyProfit = revenue - (cogs + budget);
    const monthlyProfit = dailyProfit * 30;

    roasVal.textContent = roas.toFixed(2);
    if (roas >= breakEvenRoas && roas > 0) {
      roasVal.className = 'calc-metric-val green';
    } else {
      roasVal.className = 'calc-metric-val red';
    }

    breakevenVal.textContent = breakEvenRoas.toFixed(2);
    cpaVal.textContent = `$${cpa.toFixed(2)}`;
    
    dailyProfitVal.textContent = `${dailyProfit >= 0 ? '+' : ''}$${dailyProfit.toFixed(2)}`;
    dailyProfitVal.className = dailyProfit >= 0 ? 'calc-metric-val green' : 'calc-metric-val red';

    monthlyProfitVal.textContent = `${monthlyProfit >= 0 ? '+' : ''}$${monthlyProfit.toFixed(2)}`;
    monthlyProfitVal.className = monthlyProfit >= 0 ? 'calc-metric-val green' : 'calc-metric-val red';

    initProjectionChart(dailyProfit);
  };

  const updateSnapshotCalculations = () => {
    let newCost = parseFloat(costInput.value) || 0;
    let newRetail = parseFloat(retailInput.value) || 0;
    let newShipping = parseInt(shippingInput.value) || 0;

    let newMargin = newRetail - newCost;
    let newRoi = newCost > 0 ? Math.round((newMargin / newCost) * 100) : 0;

    // Update in-memory state
    state.currentReport.cost = newCost;
    state.currentReport.retail = newRetail;
    state.currentReport.shipping = newShipping;
    state.currentReport.margin = Math.round(newMargin * 100) / 100;
    state.currentReport.roi = newRoi;

    // Update labels in real time
    marginVal.textContent = `$${newMargin.toFixed(2)}`;
    roiVal.textContent = `${newRoi}%`;

    // Apply pulse glow effect
    marginVal.classList.remove('glow-update');
    roiVal.classList.remove('glow-update');
    void marginVal.offsetWidth; // force reflow
    marginVal.classList.add('glow-update');
    roiVal.classList.add('glow-update');

    // Update Product Score in header
    const score = calculateProductScore(state.currentReport);
    state.currentReport.productScore = score;
    let badgeClass = 'score-excellent';
    let badgeLabel = 'Excelente';
    if (score < 50) {
      badgeClass = 'score-risky';
      badgeLabel = 'Riesgoso';
    } else if (score < 75) {
      badgeClass = 'score-viable';
      badgeLabel = 'Viable';
    }
    const headerBadge = document.getElementById('report-score-badge');
    if (headerBadge) {
      headerBadge.className = `report-badge-status ${badgeClass}`;
      headerBadge.innerHTML = `Product Score: <strong>${score}/100</strong> (${badgeLabel})`;
    }

    // Trigger ad profitability recalculation
    recalculateAdsProfitability();

    // Regenerate print layout in background
    renderPrintableReport();
  };

  costInput.addEventListener('input', updateSnapshotCalculations);
  retailInput.addEventListener('input', updateSnapshotCalculations);
  shippingInput.addEventListener('input', updateSnapshotCalculations);

  budgetInput.addEventListener('input', recalculateAdsProfitability);
  cpcInput.addEventListener('input', recalculateAdsProfitability);
  convInput.addEventListener('input', recalculateAdsProfitability);
  aovInput.addEventListener('input', recalculateAdsProfitability);

  // Initialize both calculator values and chart
  recalculateAdsProfitability();

  // Render Report Sections in tab contents & build printable container
  renderReportContent();
  renderPrintableReport();

  renderDashboardStats();
  renderResearchFeed();

  // Go to View
  switchView('report-view');
  switchReportTab('section-demographics'); // default tab
  showSaveReportBanner(report, loadedFromCache);
}

function showSaveReportBanner(report, loadedFromCache) {
  const existing = document.getElementById('report-save-banner');
  if (existing) existing.remove();

  const isSaved = state.portfolio.some(p => p.name.toLowerCase() === report.name.toLowerCase());
  if (isSaved || loadedFromCache) return;

  const banner = document.createElement('div');
  banner.id = 'report-save-banner';
  banner.className = 'report-save-banner';
  banner.innerHTML = `
    <div class="report-save-banner-inner">
      <div>
        <strong>Investigación completada</strong>
        <p>Guarda este reporte en tu portafolio para comparar nichos, exportar y sincronizar entre dispositivos.</p>
      </div>
      <div class="report-save-banner-actions">
        <button type="button" class="btn btn-primary btn-glow" id="report-save-banner-btn">
          <i data-lucide="heart"></i> Guardar en Portafolio
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="report-save-banner-dismiss">Ahora no</button>
      </div>
    </div>
  `;

  const reportView = document.getElementById('report-view');
  const headerNav = reportView?.querySelector('.report-header-nav');
  if (headerNav) {
    headerNav.insertAdjacentElement('afterend', banner);
    lucide.createIcons();
    document.getElementById('report-save-banner-btn')?.addEventListener('click', () => {
      toggleSaveProduct();
      banner.remove();
    });
    document.getElementById('report-save-banner-dismiss')?.addEventListener('click', () => banner.remove());
  }
}

// Switch tabs inside the report panel
export function switchReportTab(sectionId) {
  state.activeReportTab = sectionId;
  
  // Update sidebar buttons
  const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
  tabBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-section') === sectionId) {
      btn.classList.add('active');
    }
  });

  // Show only active section
  document.querySelectorAll('.report-section').forEach(sec => {
    sec.classList.add('hidden');
  });
  
  const targetSec = document.getElementById(sectionId);
  if (targetSec) {
    targetSec.classList.remove('hidden');
  }

  // If chart needs re-rendering or setup
  if (sectionId === 'section-secrets') {
    initTrendChart();
  }
  if (sectionId === 'section-solutions') {
    initSentimentChart();
  }
}

// RENDER TAB VIEWPORT CONTENT
export function renderReportContent() {
  const container = document.getElementById('report-content-container');
  const report = state.currentReport;
  
  container.innerHTML = `
    <!-- SECTION 1: DEMOGRAPHICS & PSYCHOGRAPHICS -->
    <section id="section-demographics" class="report-section">
      <h2>01. Perfil Demográfico y Psicografía Profunda</h2>
      <p class="report-section-desc">Entendiendo la mente del comprador ideal, sus creencias y narrativas de vida.</p>
      
      <h3>1. Ficha del Cliente Ideal</h3>
      <div class="card-stats-table" style="background: var(--bg-secondary); border-radius: var(--border-radius-md); padding: 1rem; margin-bottom: 2rem;">
        <div class="stats-row"><span class="stats-label">Quién es (Target):</span><span class="stats-val" style="width:70%; text-align:right">${report.demographics.who}</span></div>
        <div class="stats-row"><span class="stats-label">Creencia de Vida:</span><span class="stats-val" style="width:70%; text-align:right; font-style:italic">"${report.demographics.belief}"</span></div>
      </div>
      
      <h3>2. Desglose Psicológico Profundo</h3>
      <h4>Esperanzas y Sueños (Hopes & Dreams)</h4>
      <p>${report.demographics.dreams}</p>
      
      <h4>Victorias y Fracasos Anteriores (Victories & Defeats)</h4>
      <p>${report.demographics.defeats}</p>
      
      <h4>Fuerzas Externas Culpables (Scapegoats)</h4>
      <p>${report.demographics.outsideForces}</p>
      
      <h4>Prejuicios y Señales Tribales</h4>
      <p>${report.demographics.prejudices}</p>
    </section>

    <!-- SECTION 2: SOLUTIONS & REVIEWS -->
    <section id="section-solutions" class="report-section hidden">
      <h2>02. Soluciones Existentes y Análisis de Reseñas</h2>
      <p class="report-section-desc">Mapeo de la competencia, quejas recurrentes e historias de terror reales.</p>
      
      <h3>1. Soluciones que ya usan</h3>
      <p><strong>Alternativas comunes:</strong> ${report.solutions.current}</p>
      <p><strong>Experiencia del usuario:</strong> ${report.solutions.experience}</p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin: 2rem 0;">
        <div style="background:rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius:12px; padding:1.25rem;">
          <h4 style="color:var(--accent-emerald); margin-top:0"><i data-lucide="thumbs-up"></i> Lo que Aman (Likes)</h4>
          <p style="font-size:0.85rem; line-height:1.5; color:var(--text-secondary)">${report.solutions.likes}</p>
        </div>
        <div style="background:rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius:12px; padding:1.25rem;">
          <h4 style="color:var(--accent-red); margin-top:0"><i data-lucide="thumbs-down"></i> Lo que Detestan (Dislikes)</h4>
          <p style="font-size:0.85rem; line-height:1.5; color:var(--text-secondary)">${report.solutions.dislikes}</p>
        </div>
      </div>

      <h3>2. Desglose de Sentimiento (Reseñas de Competencia)</h3>
      <div class="report-chart-container">
        <canvas id="sentiment-chart-canvas"></canvas>
      </div>

      <h3>3. Historias de Terror de Clientes (Horror Stories)</h3>
      <p>Utiliza estas narrativas en tu copy para generar empatía y disuadir del uso de productos de la competencia:</p>
      ${report.solutions.horrorStories.map(story => `
        <div class="story-blockquote">${story}</div>
      `).join('')}
    </section>

    <!-- SECTION 3: CURIOSITY & MECHANISMS -->
    <section id="section-secrets" class="report-section hidden">
      <h2>03. Curiosidades y Mecanismos Únicos</h2>
      <p class="report-section-desc">Historias de supresión y la causa raíz física detrás del problema del cliente.</p>
      
      <h3>1. Intentos Históricos y Supresión (Nikola Tesla / WWII Style)</h3>
      <p><strong>Intentos del Pasado:</strong> ${report.secrets.historical}</p>
      <p><strong>Narrativa de Supresión:</strong> ${report.secrets.conspiracy}</p>
      
      <h3>2. Gráfico de Búsqueda y Tendencias (Interés 12 Meses)</h3>
      <p>Volumen de interés recopilado de foros e búsquedas globales de Google Trends en los últimos 12 meses:</p>
      <div class="report-chart-container">
        <canvas id="trend-chart-canvas"></canvas>
      </div>

      <h3>3. Los Dos Mecanismos Críticos</h3>
      <div class="angle-box">
        <div class="angle-header" style="color:var(--accent-red)"><i data-lucide="alert-octagon"></i> El Mecanismo Único del Problema</div>
        <div class="angle-desc">${report.secrets.mechanismProblem}</div>
      </div>
      <div class="angle-box" style="border-left-color: var(--accent-emerald)">
        <div class="angle-header" style="color:var(--accent-emerald)"><i data-lucide="check-circle2"></i> El Mecanismo Único de la Solución</div>
        <div class="angle-desc">${report.secrets.mechanismSolution}</div>
      </div>
    </section>

    <!-- SECTION 4: THE FALL FROM EDEN -->
    <section id="section-eden" class="report-section hidden">
      <h2>04. La Caída del Edén y la Corrupción Moderna</h2>
      <p class="report-section-desc">Cómo la sociedad y la codicia moderna arruinaron un equilibrio biológico natural.</p>
      
      <h3>1. La Época Dorada (El Edén)</h3>
      <p>${report.eden.goldenAge}</p>
      
      <h3>2. El Agente Corruptor</h3>
      <p>${report.eden.corruptor}</p>
      
      <h3>3. El Contraste Ancestral</h3>
      <p>${report.eden.contrast}</p>
    </section>

    <!-- SECTION 5: VERBATIMS SWIPE FILE -->
    <section id="section-verbatims" class="report-section hidden">
      <h2>05. Swipe File de Frases Textuales (Foros y Reseñas)</h2>
      <p class="report-section-desc">Frases reales de personas sufriendo en internet. Cópialas tal cual para usarlas en tus titulares y correos.</p>
      
      <div class="verbatim-list">
        ${report.verbatims.map((quote, idx) => `
          <div class="verbatim-card">
            <span class="quotes">"</span>${quote}<span class="quotes">"</span>
            <span class="verbatim-meta">User Forum Extract #${idx+1} | Tono: Emocional Crítico</span>
            <button class="btn-copy-clipboard" data-copy='${quote.replace(/'/g, "&apos;")}' title="Copiar Frase">
              <i data-lucide="copy" style="width:14px; height:14px"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 6: MARKETING ANGLES & HOOKS -->
    <section id="section-angles" class="report-section hidden">
      <h2>06. Ángulos de Marketing y Ganchos Persuasivos</h2>
      <p class="report-section-desc">5 enfoques estratégicos para estructurar tus embudos de ventas, landings y anuncios.</p>
      
      <div class="angles-container">
        ${report.angles.map((angle, idx) => `
          <div class="angle-box">
            <div class="angle-header">${angle.title}</div>
            <div class="angle-desc"><strong>Estrategia de Embudo:</strong> ${angle.narrative}</div>
            
            <div class="copy-block">
              <span class="copy-label">TikTok / Instagram Ad Hook (Gancho)</span>
              <div class="copy-text">"${angle.hook}"</div>
              <button class="btn-copy-clipboard" data-copy='${angle.hook.replace(/'/g, "&apos;")}' title="Copiar Gancho">
                <i data-lucide="copy" style="width:14px; height:14px"></i>
              </button>
            </div>
            
            <div class="copy-block" style="margin-top:0.75rem">
              <span class="copy-label">Titular Altamente Persuasivo (Landing / Email)</span>
              <div class="copy-text">"${angle.headline}"</div>
              <button class="btn-copy-clipboard" data-copy='${angle.headline.replace(/'/g, "&apos;")}' title="Copiar Titular">
                <i data-lucide="copy" style="width:14px; height:14px"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 7: AVATAR BRIEF -->
    <section id="section-avatar-brief" class="report-section hidden">
      <h2>07. Avatars Brief</h2>
      <p class="report-section-desc">Ficha psicográfica y mapa emocional completo del cliente ideal para briefs de marketing.</p>
      
      <h3>🔍 Información Demográfica y General</h3>
      <div class="card-stats-table" style="background:var(--bg-secondary); border-radius:12px; padding:1.25rem; margin-bottom:2rem;">
        <div class="stats-row"><span class="stats-label">Rango de edad:</span><span class="stats-val">${report.avatarBrief.general.age}</span></div>
        <div class="stats-row"><span class="stats-label">Género:</span><span class="stats-val">${report.avatarBrief.general.gender}</span></div>
        <div class="stats-row"><span class="stats-label">Ubicación:</span><span class="stats-val">${report.avatarBrief.general.location}</span></div>
        <div class="stats-row"><span class="stats-label">Ingresos mensuales:</span><span class="stats-val">${report.avatarBrief.general.income}</span></div>
        <div class="stats-row"><span class="stats-label">Antecedentes profesionales:</span><span class="stats-val" style="width:60%; text-align:right">${report.avatarBrief.general.background}</span></div>
        <div class="stats-row"><span class="stats-label">Identidades típicas:</span><span class="stats-val" style="width:60%; text-align:right">${report.avatarBrief.general.identities}</span></div>
      </div>

      <h3>🚩 Desafíos Clave y Puntos de Dolor</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:1.25rem; margin-bottom:2rem">
        <div class="angle-box" style="margin-bottom:0; border-left-color:var(--accent-red)">
          <div class="angle-header" style="font-size:0.95rem">${report.avatarBrief.painPoints.p1.name}</div>
          <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-secondary); line-height:1.5">
            ${report.avatarBrief.painPoints.p1.list.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="angle-box" style="margin-bottom:0; border-left-color:var(--accent-amber)">
          <div class="angle-header" style="font-size:0.95rem">${report.avatarBrief.painPoints.p2.name}</div>
          <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-secondary); line-height:1.5">
            ${report.avatarBrief.painPoints.p2.list.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="angle-box" style="margin-bottom:0; border-left-color:var(--accent-violet)">
          <div class="angle-header" style="font-size:0.95rem">${report.avatarBrief.painPoints.p3.name}</div>
          <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-secondary); line-height:1.5">
            ${report.avatarBrief.painPoints.p3.list.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h3>🌟 Metas y Aspiraciones</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:2rem">
        <div style="background:rgba(16, 185, 129, 0.03); border:1px solid rgba(16, 185, 129, 0.1); padding:1.25rem; border-radius:12px">
          <h4 style="color:var(--accent-emerald); margin-top:0">Metas a Corto Plazo</h4>
          <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-secondary); line-height:1.6">
            ${report.avatarBrief.goals.short.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>
        <div style="background:rgba(6, 182, 212, 0.03); border:1px solid rgba(6, 182, 212, 0.1); padding:1.25rem; border-radius:12px">
          <h4 style="color:var(--accent-cyan); margin-top:0">Aspiraciones a Largo Plazo</h4>
          <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-secondary); line-height:1.6">
            ${report.avatarBrief.goals.long.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h3>🧠 Impulsores Emocionales e Ideas Psicológicas</h3>
      <ul style="padding-left:1.2rem; line-height:1.6; margin-bottom:2rem">
        ${report.avatarBrief.emotionalDrivers.map(driver => `<li>${driver}</li>`).join('')}
      </ul>

      <h3>💬 Testimonios y Citas Directas (Voz del Cliente)</h3>
      
      <h4 style="color:var(--accent-cyan)">Citas Generales</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
        ${report.avatarBrief.quotes.general.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h4 style="color:var(--accent-red)">Puntos de Dolor y Frustración</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
        ${report.avatarBrief.quotes.pain.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary); border-left-color:var(--accent-red)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h4 style="color:var(--accent-violet)">Citas de Mentalidad</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
        ${report.avatarBrief.quotes.mindset.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary); border-left-color:var(--accent-violet)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h4 style="color:var(--accent-amber)">Estado Emocional y Motivadores Personales</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
        ${report.avatarBrief.quotes.emotional.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary); border-left-color:var(--accent-amber)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h4 style="color:var(--text-secondary)">Respuestas Emocionales ante Dificultades</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
        ${report.avatarBrief.quotes.responses.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary); border-left-color:var(--text-muted)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h4 style="color:var(--accent-emerald)">Motivación y Urgencia en el Éxito</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:2rem">
        ${report.avatarBrief.quotes.success.map(q => `<div class="verbatim-card" style="font-family:inherit; color:var(--text-primary); border-left-color:var(--accent-emerald)"><span class="quotes">"</span>${q}<span class="quotes">"</span></div>`).join('')}
      </div>

      <h3>🚩 Miedos Emocionales Clave y Frustraciones Profundas</h3>
      <ul style="padding-left:1.2rem; line-height:1.6; margin-bottom:2rem">
        ${report.avatarBrief.fears.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <h3>🧠 Insights Emocionales y Psicográficos</h3>
      <ul style="padding-left:1.2rem; line-height:1.6; margin-bottom:2rem">
        ${report.avatarBrief.insights.map(i => `<li>${i}</li>`).join('')}
      </ul>

      <h3>📌 Viaje Emocional Típico del Comprador</h3>
      <div style="display:flex; flex-direction:column; gap:1.25rem; position:relative; padding-left:1.5rem; border-left:2px solid var(--border-color); margin:1.5rem 0">
        <div>
          <strong style="color:var(--accent-cyan)">Conciencia:</strong>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.25rem">${report.avatarBrief.journey.awareness}</p>
        </div>
        <div>
          <strong style="color:var(--accent-red)">Frustración:</strong>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.25rem">${report.avatarBrief.journey.frustración}</p>
        </div>
        <div>
          <strong style="color:var(--accent-amber)">Desesperación y Búsqueda de Soluciones:</strong>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.25rem">${report.avatarBrief.journey.desesperación}</p>
        </div>
        <div>
          <strong style="color:var(--accent-emerald)">Alivio y Compromiso:</strong>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.25rem">${report.avatarBrief.journey.alivio}</p>
        </div>
      </div>
    </section>

    <!-- SECTION 8: OFFER BRIEF -->
    <section id="section-offer-brief" class="report-section hidden">
      <h2>08. Offer Brief</h2>
      <p class="report-section-desc">Estructuración de la oferta, posicionamiento competitivo, ganchos lógicos y manejo de objeciones.</p>
      
      <h3>📋 Estructura General de Posicionamiento</h3>
      <div class="card-stats-table" style="background:var(--bg-secondary); border-radius:12px; padding:1.25rem; margin-bottom:2rem">
        <div class="stats-row"><span class="stats-label">Posibles Nombres:</span><span class="stats-val">${report.offerBrief.names.join(', ')}</span></div>
        <div class="stats-row"><span class="stats-label">Nivel de Consciencia:</span><span class="stats-val">${report.offerBrief.awareness}</span></div>
        <div class="stats-row"><span class="stats-label">Etapa de Sofisticación:</span><span class="stats-val">${report.offerBrief.sophistication}</span></div>
        <div class="stats-row"><span class="stats-label">Gran Idea (Big Idea):</span><span class="stats-val" style="width:65%; text-align:right">${report.offerBrief.bigIdea}</span></div>
        <div class="stats-row"><span class="stats-label">Metáfora:</span><span class="stats-val" style="width:65%; text-align:right; font-style:italic">"${report.offerBrief.metaphor}"</span></div>
        <div class="stats-row"><span class="stats-label">Guía / Gurú:</span><span class="stats-val">${report.offerBrief.guru}</span></div>
      </div>

      <h3>💡 Mecanismos y Narrativa</h3>
      <h4>Posible UMP (Mecanismo Único del Problema)</h4>
      <p style="background:rgba(239, 68, 68, 0.02); border:1px solid rgba(239, 68, 68, 0.1); padding:1rem; border-radius:8px">${report.offerBrief.ump}</p>
      
      <h4>Posible UMS (Mecanismo Único de la Solución)</h4>
      <p style="background:rgba(16, 185, 129, 0.02); border:1px solid rgba(16, 185, 129, 0.1); padding:1rem; border-radius:8px">${report.offerBrief.ums}</p>
      
      <h4>Historia de Descubrimiento (Discovery Story)</h4>
      <p>${report.offerBrief.discovery}</p>

      <h4>Producto (Definición de Oferta)</h4>
      <p>${report.offerBrief.product}</p>

      <h3>✍️ Ideas de Titulares y Subtítulos Persuasivos</h3>
      <div class="verbatim-list">
        ${report.offerBrief.headlines.map((headline, idx) => `
          <div class="verbatim-card" style="font-family:inherit; border-left-color:var(--accent-violet); color:var(--text-light)">
            <strong>Titular Sugerido #${idx+1}:</strong><br>
            <span style="font-size:1.05rem; display:block; margin-top:0.3rem">"${headline}"</span>
            <button class="btn-copy-clipboard" data-copy='${headline.replace(/'/g, "&apos;")}' title="Copiar Titular">
              <i data-lucide="copy" style="width:14px; height:14px"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <h3>🚫 Objeciones y Respuestas de Derribo</h3>
      <div style="display:flex; flex-direction:column; gap:1rem; margin:1.5rem 0">
        ${report.offerBrief.objections.map(obj => {
          const parts = obj.split(' (Respuesta: ');
          const q = parts[0];
          const a = parts[1] ? parts[1].replace(')', '') : '';
          return `
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px">
              <strong style="color:var(--accent-amber); display:block; margin-bottom:0.4rem">❓ ${q}</strong>
              <span style="font-size:0.9rem; color:var(--text-secondary); line-height:1.5; display:block">👉 ${a}</span>
            </div>
          `;
        }).join('')}
      </div>

      <h3>⛓️ Cadenas de Creencias (Belief Chains)</h3>
      <p>Lo que el prospecto necesita creer obligatoriamente para estar listo para comprar:</p>
      <ol style="padding-left:1.5rem; line-height:1.8; margin-bottom:2rem; color:var(--text-secondary)">
        ${report.offerBrief.beliefs.map(b => `<li>${b}</li>`).join('')}
      </ol>

      <h3>📐 Arquitectura del Embudo (Funnel Architecture) & Dominios</h3>
      <p><strong>Diseño de Embudo Recomendado:</strong> ${report.offerBrief.funnel}</p>
      <p style="margin-bottom:2rem"><strong>Dominios Potenciales Disponibles:</strong> <code>${report.offerBrief.domains.join(' | ')}</code></p>

      <h3>✍️ Ejemplos y Swipes Ganadores (Copy Swipes)</h3>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:2rem">
        ${report.offerBrief.swipes ? report.offerBrief.swipes.map(s => `
          <div class="verbatim-card" style="font-family:inherit; color:var(--text-primary)">
            <span class="quotes">"</span>${s}<span class="quotes">"</span>
            <button class="btn-copy-clipboard" data-copy='${s.replace(/'/g, "&apos;")}' title="Copiar Frase">
              <i data-lucide="copy" style="width:14px; height:14px"></i>
            </button>
          </div>
        `).join('') : '<p style="color:var(--text-secondary)">Sin ejemplos de swipes.</p>'}
      </div>

      <h3>📝 Otras Notas de la Oferta</h3>
      <p style="background:rgba(255,255,255,0.01); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px; color:var(--text-secondary); line-height:1.6; font-size:0.9rem">${report.offerBrief.otherNotes || 'Sin notas adicionales.'}</p>
    </section>

    <!-- SECTION 9: UGC SCRIPTS -->
    <section id="section-ugc-scripts" class="report-section hidden">
      <h2>09. Guiones de Video UGC (TikTok / Instagram Reels)</h2>
      <p class="report-section-desc">Estructuras listas para enviar a creadores de contenido o grabar tú mismo. Enfocadas en retención y conversión.</p>
      
      <div class="ugc-container">
        ${report.ugcScripts.map((script, idx) => `
          <div class="ugc-script-card">
            <div class="ugc-header">
              <span class="ugc-title">${script.title}</span>
              <span class="ugc-duration"><i data-lucide="clock" style="width:12px; height:12px; display:inline; vertical-align:middle; margin-right:4px"></i>${script.duration}</span>
            </div>
            <div class="ugc-scenes-list">
              ${script.scenes.map(scene => `
                <div class="ugc-scene">
                  <div class="scene-time">${scene.time}</div>
                  <div class="scene-body">
                    <div class="scene-visual">${scene.visual}</div>
                    <div class="scene-audio">Voz en Off: "${scene.audio}"</div>
                    <div class="scene-text">Texto en Pantalla: [${scene.text}]</div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:1rem">
              <button class="btn btn-secondary btn-copy-clipboard" data-copy="${script.scenes.map(s => `[${s.time}] Visual: ${s.visual}\nAudio: ${s.audio}\nTexto: ${s.text}`).join('\n\n')}" style="padding:0.4rem 0.8rem; font-size:0.75rem">
                <i data-lucide="copy" style="width:12px; height:12px"></i> Copiar Guion Completo
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 10: LANDING GENERATOR -->
    <section id="section-landing-generator" class="report-section hidden">
      <h2>10. Generador de Estructuras de Landing Pages</h2>
      <p class="report-section-desc">Descarga o copia la estructura HTML/Tailwind CSS optimizada para dispositivos móviles con todo el copy persuasivo listo.</p>
      
      <div class="landing-generator-container">
        <div class="landing-preview-split">
          <!-- Left Panel: Code editor -->
          <div class="code-editor-panel">
            <div class="editor-header">
              <span class="editor-title"><i data-lucide="code" style="width:14px; height:14px; display:inline; margin-right:4px"></i>index.html (Tailwind CSS)</span>
              <div class="editor-actions">
                <button class="btn btn-primary" id="copy-html-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem">
                  <i data-lucide="copy" style="width:12px; height:12px"></i> Copiar Código
                </button>
                <button class="btn btn-glow btn-primary" id="download-html-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem; background:linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))">
                  <i data-lucide="download" style="width:12px; height:12px"></i> Descargar HTML
                </button>
              </div>
            </div>
            <textarea class="editor-textarea" id="landing-html-code" readonly>${report.landingPage.html}</textarea>
          </div>
          
          <!-- Right Panel: Visual Outline -->
          <div class="visual-outline-panel">
            <h3 style="font-family:var(--font-display); margin-bottom:1.5rem; color:var(--text-light); font-size:1.1rem"><i data-lucide="list-checks" style="width:18px; height:18px; display:inline; margin-right:6px; vertical-align:middle"></i>Arquitectura de Secciones (Funnel)</h3>
            <div class="outline-list">
              ${report.landingPage.outline.map((out, idx) => `
                <div class="outline-section-item">
                  <div class="outline-section-title">${idx + 1}. ${out.title}</div>
                  <div class="outline-section-desc">${out.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 11: AB TESTING SIMULATOR -->
    <section id="section-ab-testing" class="report-section hidden">
      <h2>11. Simulador Científico de A/B Testing</h2>
      <p class="report-section-desc">Compara dos variaciones de titulares persuasivos. El simulador calculará la relevancia psicográfica contra el avatar ideal para predecir el CTR.</p>
      
      <div class="ab-testing-container">
        <div class="ab-form-row">
          <div class="ab-input-group">
            <label class="ab-input-label" for="ab-headline-a">Titular Alternativa A (Ej. Enfocado en el Dolor)</label>
            <input type="text" class="ab-input-field" id="ab-headline-a" value="${report.offerBrief.headlines[0] || ''}">
          </div>
          <div class="ab-input-group">
            <label class="ab-input-label" for="ab-headline-b">Titular Alternativa B (Ej. Enfocado en el Mecanismo Único)</label>
            <input type="text" class="ab-input-field" id="ab-headline-b" value="${report.offerBrief.headlines[1] || ''}">
          </div>
        </div>
        
        <div style="display:flex; justify-content:center">
          <button class="btn btn-primary btn-glow" id="run-ab-sim-btn" style="padding:0.75rem 2.5rem; font-size:0.95rem">
            <i data-lucide="play" style="width:16px; height:16px"></i> Simular CTR de Campaña
          </button>
        </div>
        
        <!-- Results container (hidden by default until run) -->
        <div id="ab-results-panel" class="hidden" style="animation: fadeIn 0.4s ease-out forwards">
          <div class="ab-results-grid">
            <!-- Variant A Card -->
            <div class="ab-result-card" id="card-variant-a">
              <span class="ab-badge variant-a">VARIACIÓN A</span>
              <h4 style="color:var(--text-light); margin-top:1.5rem; font-size:0.95rem; line-height:1.4" id="res-title-a">"..."</h4>
              <div class="ab-ctr-box" style="margin: 1rem 0">
                <span class="ab-ctr-val" id="ctr-val-a" style="color:var(--accent-cyan)">0.0%</span>
                <span style="font-size:0.8rem; color:var(--text-secondary)">CTR Est.</span>
              </div>
              <div class="ab-metrics-bars">
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Alineación de Dolor</span><span id="score-label-pain-a">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-pain-a" style="width:0%"></div></div>
                </div>
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Claridad del Mecanismo (UMS)</span><span id="score-label-ums-a">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-ums-a" style="width:0%"></div></div>
                </div>
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Factor de Intriga</span><span id="score-label-intrigue-a">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-intrigue-a" style="width:0%"></div></div>
                </div>
              </div>
            </div>
            
            <!-- Variant B Card -->
            <div class="ab-result-card" id="card-variant-b">
              <span class="ab-badge variant-b">VARIACIÓN B</span>
              <h4 style="color:var(--text-light); margin-top:1.5rem; font-size:0.95rem; line-height:1.4" id="res-title-b">"..."</h4>
              <div class="ab-ctr-box" style="margin: 1rem 0">
                <span class="ab-ctr-val" id="ctr-val-b" style="color:var(--accent-violet)">0.0%</span>
                <span style="font-size:0.8rem; color:var(--text-secondary)">CTR Est.</span>
              </div>
              <div class="ab-metrics-bars">
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Alineación de Dolor</span><span id="score-label-pain-b">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-pain-b" style="width:0%"></div></div>
                </div>
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Claridad del Mecanismo (UMS)</span><span id="score-label-ums-b">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-ums-b" style="width:0%"></div></div>
                </div>
                <div class="metric-bar-group">
                  <div class="metric-bar-label"><span>Factor de Intriga</span><span id="score-label-intrigue-b">0%</span></div>
                  <div class="metric-bar-track"><div class="metric-bar-fill" id="bar-intrigue-b" style="width:0%"></div></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ab-analysis-box">
            <h4 style="color:var(--accent-emerald); display:flex; align-items:center; gap:0.5rem; margin-top:0"><i data-lucide="award"></i> Veredicto y Recomendación de Optimización</h4>
            <p id="ab-verdict-text" style="font-size:0.9rem; line-height:1.6; color:var(--text-secondary); margin-bottom:0">...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 12: COMPETITOR ANALYSIS -->
    <section id="section-competitor-analysis" class="report-section hidden">
      <h2>12. Inteligencia de Competidores y Ganchos de Desvío</h2>
      <p class="report-section-desc">Mapeo del mercado competitivo y las defensas del consumidor para desviar la atención hacia tu producto.</p>
      
      <div class="competitor-comparison-table">
        <div class="competitor-card-grid">
          <!-- Competitor Ganchos Card -->
          <div class="comp-card competitor">
            <div class="comp-card-title" style="color:var(--accent-red)"><i data-lucide="shield-x"></i> Ganchos Saturados del Competidor</div>
            <div class="comp-list">
              ${report.competitorAnalysis.competitorsGanchos.map(g => `
                <div class="comp-list-item">
                  <i data-lucide="x" style="color:var(--accent-red); width:16px; height:16px; margin-top:2px"></i>
                  <span>${g}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Our Ganchos Card -->
          <div class="comp-card our-product">
            <div class="comp-card-title" style="color:var(--accent-emerald)"><i data-lucide="shield-check"></i> Nuestros Ganchos de Desvío</div>
            <div class="comp-list">
              ${report.competitorAnalysis.ourGanchos.map(g => `
                <div class="comp-list-item">
                  <i data-lucide="check" style="color:var(--accent-emerald); width:16px; height:16px; margin-top:2px"></i>
                  <span>${g}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:12px; padding:1.25rem">
          <h4 style="color:var(--text-light); margin-top:0; font-family:var(--font-display); font-size:1rem"><i data-lucide="help-circle" style="width:16px; height:16px; display:inline; margin-right:6px; vertical-align:middle"></i>Debilidades Clave del Competidor</h4>
          <p style="font-size:0.85rem; line-height:1.5; color:var(--text-secondary)">${report.competitorAnalysis.weaknesses}</p>
        </div>
        
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:12px; padding:1.25rem">
          <h4 style="color:var(--text-light); margin-top:0; font-family:var(--font-display); font-size:1rem"><i data-lucide="zap" style="color:var(--accent-cyan); width:16px; height:16px; display:inline; margin-right:6px; vertical-align:middle"></i>Estrategia de Diferenciación Propuesta</h4>
          <p style="font-size:0.85rem; line-height:1.5; color:var(--text-secondary)">${report.competitorAnalysis.differentiation}</p>
        </div>
      </div>
    </section>

    <!-- SECTION 13: RECOMMENDED SUPPLIERS -->
    <section id="section-suppliers" class="report-section hidden">
      <h2>13. Proveedores Recomendados (Dropshipping)</h2>
      <p class="report-section-desc">Proveedores reales extraídos de búsquedas de mercado en plataformas de Dropshipping (AliExpress, CJ Dropshipping, Alibaba, etc.) con sus precios de coste y tiempos de envío.</p>
      
      <div class="suppliers-grid">
        ${report.suppliers && report.suppliers.length > 0 ? report.suppliers.map(sup => {
          const badgeClass = sup.platform.toLowerCase().replace(/\s/g, '');
          return `
            <div class="supplier-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                <span class="supplier-platform-badge ${badgeClass}">${sup.platform}</span>
                <span style="font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-mono)"><i data-lucide="truck" style="width:12px; height:12px; display:inline; vertical-align:middle; margin-right:3px"></i>${sup.shippingTime} días</span>
              </div>
              
              <h4 style="margin:0 0 0.5rem 0; font-family:var(--font-display); color:var(--text-light); font-size:1.05rem; line-height:1.4; font-weight:600">${sup.name}</h4>
              
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; background:rgba(0,0,0,0.15); padding:0.75rem; border-radius:8px; font-size:0.8rem; margin:1rem 0; font-family:var(--font-mono)">
                <div>Costo Prod: <strong style="color:var(--accent-emerald); font-size:0.9rem">$${parseFloat(sup.price).toFixed(2)}</strong></div>
                <div>Envío Est: <strong style="color:var(--accent-cyan); font-size:0.9rem">$${parseFloat(sup.shippingCost).toFixed(2)}</strong></div>
              </div>
              
              <div style="margin-top:auto; padding-top:0.75rem">
                <a href="${sup.link}" target="_blank" class="btn btn-primary" style="display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.5rem; font-size:0.8rem; text-decoration:none; background:linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))">
                  <i data-lucide="external-link" style="width:12px; height:12px"></i> Ver en Proveedor
                </a>
              </div>
            </div>
          `;
        }).join('') : `<p style="color:var(--text-secondary)">No se encontraron proveedores recomendados para este producto.</p>`}
      </div>
    </section>

    <!-- SECTION 14: EMAIL NURTURE SEQUENCE -->
    <section id="section-email-sequence" class="report-section hidden">
      <h2>14. Secuencia Automatizada de Emails (Nurturing)</h2>
      <p class="report-section-desc">Secuencia de 5 correos automatizados diseñados para educar, generar confianza y convertir prospectos fríos en compradores.</p>
      
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary" id="copy-all-emails-btn" style="border-color: var(--accent-violet); color: var(--accent-violet);">
          <i data-lucide="copy"></i> Copiar Secuencia Completa
        </button>
      </div>

      <div class="emails-container" style="display: flex; flex-direction: column; gap: 1rem;">
        ${report.emailSequence && report.emailSequence.length > 0 ? report.emailSequence.map((email, idx) => {
          const emailNum = idx + 1;
          const fullEmailText = `Asunto: ${email.subject}\nPrevisualización: ${email.preview}\n\n${email.body}`;
          return `
            <div class="email-card">
              <div class="email-header-info">
                <div class="email-header-row">
                  <span class="email-header-label">Correo #${emailNum}:</span>
                  <span class="email-header-val" style="font-weight: 700; color: var(--accent-cyan);">${email.subject}</span>
                </div>
                <div class="email-header-row">
                  <span class="email-header-label">Preview:</span>
                  <span class="email-header-val" style="color: var(--text-muted); font-style: italic;">${email.preview}</span>
                </div>
              </div>
              <div class="email-body-content">${email.body}</div>
              <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                <button class="btn btn-secondary btn-copy-clipboard" data-copy="${encodeURIComponent(fullEmailText)}">
                  <i data-lucide="copy"></i> Copiar Correo
                </button>
              </div>
            </div>
          `;
        }).join('') : '<p style="color:var(--text-secondary)">No se ha generado la secuencia de correos para este producto.</p>'}
      </div>
    </section>

    <!-- SECTION 15: AD COPY META & TIKTOK -->
    <section id="section-ad-copy" class="report-section hidden">
      <h2>15. Copys de Anuncios (Meta Ads & TikTok Ads)</h2>
      <p class="report-section-desc">Variantes de copies listos para testear campañas de tráfico pago en Facebook/Instagram y videos virales en TikTok.</p>
      
      <h3 style="color: var(--accent-cyan); font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Meta Ads (Facebook / Instagram)</h3>
      <div class="ad-copy-grid" style="margin-bottom: 2.5rem;">
        ${report.adCopy && report.adCopy.facebook && report.adCopy.facebook.length > 0 ? report.adCopy.facebook.map((ad, idx) => {
          const adNum = idx + 1;
          const fullAdText = `Texto Principal:\n${ad.primaryText}\n\nTitular: ${ad.headline}\nDescripción: ${ad.description}`;
          return `
            <div class="ad-copy-card">
              <div class="ad-copy-header">
                <span style="font-family: var(--font-mono); font-weight:700;">Variante #${adNum}</span>
                <span class="ad-copy-platform facebook">FACEBOOK / INSTAGRAM</span>
              </div>
              <div class="ad-copy-body">
                <div style="margin-bottom:0.5rem"><strong>Texto Principal:</strong><br><span style="color:var(--text-secondary)">${ad.primaryText}</span></div>
                <div style="margin-bottom:0.5rem"><strong>Titular:</strong><br><span style="color:var(--accent-cyan); font-weight:600">${ad.headline}</span></div>
                <div><strong>Descripción:</strong><br><span style="color:var(--text-muted)">${ad.description}</span></div>
              </div>
              <div style="display:flex; justify-content:flex-end; margin-top:auto;">
                <button class="btn btn-secondary btn-copy-clipboard" data-copy="${encodeURIComponent(fullAdText)}">
                  <i data-lucide="copy"></i> Copiar Anuncio
                </button>
              </div>
            </div>
          `;
        }).join('') : '<p style="color:var(--text-secondary)">No se han generado copys para Meta Ads.</p>'}
      </div>

      <h3 style="color: var(--accent-pink); font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">TikTok Ads (Spark Ads / Organic)</h3>
      <div class="ad-copy-grid">
        ${report.adCopy && report.adCopy.tiktok && report.adCopy.tiktok.length > 0 ? report.adCopy.tiktok.map((ad, idx) => {
          const adNum = idx + 1;
          const fullAdText = `Gancho (Hook):\n"${ad.hook}"\n\nCuerpo (Body):\n"${ad.body}"\n\nCTA Overlay: ${ad.cta}`;
          return `
            <div class="ad-copy-card">
              <div class="ad-copy-header">
                <span style="font-family: var(--font-mono); font-weight:700;">Variante #${adNum}</span>
                <span class="ad-copy-platform tiktok">TIKTOK ADS</span>
              </div>
              <div class="ad-copy-body">
                <div style="margin-bottom:0.5rem; background:rgba(236,72,153,0.05); padding:0.5rem; border-radius:4px; border-left: 3px solid var(--accent-pink)">
                  <strong>Gancho (0-3s Hook):</strong><br>
                  <span style="color:var(--text-light); font-style:italic">"${ad.hook}"</span>
                </div>
                <div style="margin-bottom:0.5rem"><strong>Desarrollo del Video (Body):</strong><br><span style="color:var(--text-secondary)">${ad.body}</span></div>
                <div><strong>Llamado a la Acción (CTA):</strong><br><span style="color:var(--accent-cyan); font-weight:600">${ad.cta}</span></div>
              </div>
              <div style="display:flex; justify-content:flex-end; margin-top:auto;">
                <button class="btn btn-secondary btn-copy-clipboard" data-copy="${encodeURIComponent(fullAdText)}">
                  <i data-lucide="copy"></i> Copiar Variante
                </button>
              </div>
            </div>
          `;
        }).join('') : '<p style="color:var(--text-secondary)">No se han generado copys para TikTok.</p>'}
      </div>
    </section>

    <!-- SECTION 16: SHOPIFY PRODUCT PAGE -->
    <section id="section-shopify-description" class="report-section hidden">
      <h2>16. Ficha de Producto para Shopify / WooCommerce</h2>
      <p class="report-section-desc">Título, meta descripción SEO y descripción HTML estructurada con preguntas frecuentes lista para copiar y pegar en tu tienda.</p>
      
      <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-bottom: 1.5rem;">
        <button class="btn btn-secondary btn-copy-clipboard" data-copy="${encodeURIComponent(report.shopifyDescription ? `Título: ${report.shopifyDescription.title}\nMeta Description: ${report.shopifyDescription.metaDescription}\n\nDescripción HTML:\n${report.shopifyDescription.body}` : '')}">
          <i data-lucide="copy"></i> Copiar Datos
        </button>
        <button class="btn btn-secondary" id="download-shopify-html-btn" style="border-color: var(--accent-cyan); color: var(--accent-cyan);">
          <i data-lucide="download"></i> Descargar HTML Ficha
        </button>
      </div>

      ${report.shopifyDescription ? `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:1.25rem">
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:0.25rem">TÍTULO SEO OPTIMIZADO:</div>
            <div style="font-weight:700; color:var(--text-light); font-size:1.1rem">${report.shopifyDescription.title}</div>
          </div>
          
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:1.25rem">
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:0.25rem">META DESCRIPTION (SEO - MAX 155 CHARS):</div>
            <div style="color:var(--text-secondary); font-size:0.9rem">${report.shopifyDescription.metaDescription}</div>
          </div>

          <div style="margin-top:1rem">
            <div style="font-size:0.8rem; color:var(--text-secondary); font-family:var(--font-display); text-transform:uppercase; margin-bottom:0.5rem">Previsualización de la Tienda (Shopify Preview)</div>
            <div class="shopify-preview-container">
              <div class="shopify-title-preview">${report.shopifyDescription.title}</div>
              <div class="shopify-price-preview">
                $${report.retail.toFixed(2)}
                <span class="shopify-price-compare">$${(report.retail * 2 - 0.01).toFixed(2)}</span>
                <span style="font-size:0.75rem; background:#fee2e2; color:#b91c1c; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700">50% OFF</span>
              </div>
              
              <div class="shopify-body-preview">
                ${report.shopifyDescription.body}
                
                <h3>Preguntas Frecuentes (FAQ)</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                  ${report.shopifyDescription.faq && report.shopifyDescription.faq.length > 0 ? report.shopifyDescription.faq.map(item => `
                    <div class="shopify-faq-item">
                      <div class="shopify-faq-q">❓ ${item.q}</div>
                      <div class="shopify-faq-a">${item.a}</div>
                    </div>
                  `).join('') : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : '<p style="color:var(--text-secondary)">No se ha generado la ficha de Shopify.</p>'}
    </section>

    <!-- SECTION 17: CUSTOMER JOURNEY MAP -->
    <section id="section-customer-journey" class="report-section hidden">
      <h2>17. Mapa Visual del Customer Journey (Embudo)</h2>
      <p class="report-section-desc">Mapeo del embudo completo de conversión del cliente. Haz clic en cada nodo del flujo para ver los ganchos y copys clave de cada etapa.</p>
      
      <div class="journey-flow-container">
        <svg class="journey-svg-canvas" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--accent-cyan)" />
              <stop offset="100%" stop-color="var(--accent-violet)" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <path d="M 50,100 L 225,100 L 400,100 L 575,100 L 750,100" fill="none" stroke="url(#glow-grad)" stroke-width="4" filter="url(#glow-filter)" />
          
          <g class="journey-node" style="cursor:pointer" onclick="window.selectJourneyNode('ad')">
            <circle cx="50" cy="100" r="16" fill="var(--bg-primary)" stroke="var(--accent-cyan)" stroke-width="3" />
            <text x="50" y="145" fill="var(--text-light)" font-size="11" text-anchor="middle" font-family="var(--font-display)">1. Anuncio (Ad)</text>
            <circle cx="50" cy="100" r="6" fill="var(--accent-cyan)" />
          </g>
          
          <g class="journey-node" style="cursor:pointer" onclick="window.selectJourneyNode('landing')">
            <circle cx="225" cy="100" r="16" fill="var(--bg-primary)" stroke="var(--accent-cyan)" stroke-width="3" />
            <text x="225" y="145" fill="var(--text-light)" font-size="11" text-anchor="middle" font-family="var(--font-display)">2. Landing Page</text>
            <circle cx="225" cy="100" r="6" fill="var(--accent-cyan)" />
          </g>
          
          <g class="journey-node" style="cursor:pointer" onclick="window.selectJourneyNode('checkout')">
            <circle cx="400" cy="100" r="16" fill="var(--bg-primary)" stroke="var(--accent-violet)" stroke-width="3" />
            <text x="400" y="145" fill="var(--text-light)" font-size="11" text-anchor="middle" font-family="var(--font-display)">3. Pago (Checkout)</text>
            <circle cx="400" cy="100" r="6" fill="var(--accent-violet)" />
          </g>
          
          <g class="journey-node" style="cursor:pointer" onclick="window.selectJourneyNode('upsell')">
            <circle cx="575" cy="100" r="16" fill="var(--bg-primary)" stroke="var(--accent-violet)" stroke-width="3" />
            <text x="575" y="145" fill="var(--text-light)" font-size="11" text-anchor="middle" font-family="var(--font-display)">4. Oferta (Upsell)</text>
            <circle cx="575" cy="100" r="6" fill="var(--accent-violet)" />
          </g>
          
          <g class="journey-node" style="cursor:pointer" onclick="window.selectJourneyNode('email')">
            <circle cx="750" cy="100" r="16" fill="var(--bg-primary)" stroke="var(--accent-violet)" stroke-width="3" />
            <text x="750" y="145" fill="var(--text-light)" font-size="11" text-anchor="middle" font-family="var(--font-display)">5. Email Flow</text>
            <circle cx="750" cy="100" r="6" fill="var(--accent-violet)" />
          </g>
        </svg>

        <div class="journey-tooltip-card" id="journey-node-details">
          <h4 id="journey-detail-title">Haz clic en un nodo del embudo anterior</h4>
          <p id="journey-detail-desc">Selecciona cualquiera de las etapas para ver los detalles estratégicos y copys clave recomendados para este producto.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 18: MOCKUP PROMPTS -->
    <section id="section-mockup-prompts" class="report-section hidden">
      <h2>18. Panel de Generación de Mockups (Prompts IA)</h2>
      <p class="report-section-desc">Instrucciones y prompts listos para copiar y pegar en generadores de imágenes (Midjourney, DALL-E, Leonardo AI) para crear imágenes premium de este producto.</p>
      
      <div style="background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
        <i data-lucide="sparkles" style="color: var(--accent-violet); width: 24px; height: 24px; flex-shrink:0;"></i>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">
          💡 <strong>Instrucciones:</strong> Copia cualquiera de los siguientes prompts optimizados y pégalos en tu generador de imágenes favorito (como Midjourney con el parámetro <code>--ar 16:9</code> o DALL-E 3) para crear creativos de publicidad premium.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="prompt-card">
          <h4 style="color: var(--text-light); font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.25rem; font-weight:600">1. Fondo Blanco Comercial (E-Commerce Studio)</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Ideal para imágenes de producto en tu página de Shopify.</p>
          <div class="prompt-code">A professional studio product shot of "${report.name}", modern minimalist design, clean white background, soft studio lighting, high detail, sharp focus, 8k resolution, photorealistic.</div>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary btn-copy-clipboard" data-copy="A professional studio product shot of &quot;${report.name}&quot;, modern minimalist design, clean white background, soft studio lighting, high detail, sharp focus, 8k resolution, photorealistic.">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
        </div>

        <div class="prompt-card">
          <h4 style="color: var(--text-light); font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.25rem; font-weight:600">2. Foto de Estilo de Vida (Lifestyle Scenario)</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Muestra el producto en un contexto de uso real y estético.</p>
          <div class="prompt-code">A modern aesthetic lifestyle photograph of "${report.name}" being used in a cozy modern home environment, warm natural lighting through a window, blurred background, premium vibes, cinematic look, 35mm lens, photorealistic.</div>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary btn-copy-clipboard" data-copy="A modern aesthetic lifestyle photograph of &quot;${report.name}&quot; being used in a cozy modern home environment, warm natural lighting through a window, blurred background, premium vibes, cinematic look, 35mm lens, photorealistic.">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
        </div>

        <div class="prompt-card">
          <h4 style="color: var(--text-light); font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.25rem; font-weight:600">3. Diseño de Empaque Premium (Premium Branding)</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Diseños conceptuales para cajas y marca propia (Brand Building).</p>
          <div class="prompt-code">Elegant packaging design concept box for "${report.name}", gold foil accents, matte texture finish, luxurious brand styling, clean luxury aesthetics, mock-up presentation on dark marble surface, soft focus, dramatic lighting.</div>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary btn-copy-clipboard" data-copy="Elegant packaging design concept box for &quot;${report.name}&quot;, gold foil accents, matte texture finish, luxurious brand styling, clean luxury aesthetics, mock-up presentation on dark marble surface, soft focus, dramatic lighting.">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
        </div>

        <div class="prompt-card">
          <h4 style="color: var(--text-light); font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.25rem; font-weight:600">4. Estilo Orgánico de Redes Sociales (UGC Style)</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Foto orgánica tipo selfie o tomada por un cliente real en casa.</p>
          <div class="prompt-code">A casual smartphone photo of "${report.name}" sitting on a bathroom counter or vanity table, slightly messy aesthetic, real consumer photography style, soft natural overhead light, unedited, authentic look.</div>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary btn-copy-clipboard" data-copy="A casual smartphone photo of &quot;${report.name}&quot; sitting on a bathroom counter or vanity table, slightly messy aesthetic, real consumer photography style, soft natural overhead light, unedited, authentic look.">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 19: MASTER PROMPTS FOR EXTERNAL CHATBOTS -->
    <section id="section-master-prompts" class="report-section hidden">
      <h2>19. Prompts Maestros para Chatbots Exteriores (Zero-Token)</h2>
      <p class="report-section-desc">Copia estos prompts estructurados y pégalos en ChatGPT, Claude 3.5, Gemini Web o DeepSeek para profundizar aún más en la investigación de este producto sin consumir tokens de API.</p>

      <div style="background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <i data-lucide="sparkles" style="color: var(--accent-cyan); width: 24px; height: 24px; flex-shrink:0;"></i>
          <div>
            <h4 style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Secuencia de Prompts para ${report.name}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">Prompts contextualizados listos para tu chatbot favorito.</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="https://chatgpt.com" target="_blank" rel="noopener" class="launch-btn brand-chatgpt"><i data-lucide="external-link"></i> ChatGPT</a>
          <a href="https://claude.ai" target="_blank" rel="noopener" class="launch-btn brand-claude"><i data-lucide="external-link"></i> Claude.ai</a>
          <a href="https://chat.deepseek.com" target="_blank" rel="noopener" class="launch-btn brand-deepseek"><i data-lucide="external-link"></i> DeepSeek</a>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div class="prompt-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="color: var(--accent-cyan); font-family: var(--font-display); font-size: 0.95rem; margin:0; font-weight:600">FASE 1: Investigación Psicográfica & Verbatims</h4>
            <button class="btn btn-secondary btn-sm btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step1)}">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Genera 15 verbatims de dolor, historias de terror y 5 ángulos creativos de marketing.</p>
          <div class="prompt-code" style="max-height: 120px; overflow-y: auto;">${generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step1}</div>
        </div>

        <div class="prompt-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="color: var(--accent-violet); font-family: var(--font-display); font-size: 0.95rem; margin:0; font-weight:600">FASE 2: Ficha Avatar Brief</h4>
            <button class="btn btn-secondary btn-sm btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step2)}">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Construye el mapa psicográfico P1, P2, P3, culpables externos y creencia fundamental.</p>
          <div class="prompt-code" style="max-height: 120px; overflow-y: auto;">${generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step2}</div>
        </div>

        <div class="prompt-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="color: var(--accent-amber); font-family: var(--font-display); font-size: 0.95rem; margin:0; font-weight:600">FASE 3: Offer Brief & Apilamiento</h4>
            <button class="btn btn-secondary btn-sm btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step3)}">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Diseña la oferta irresistible, 3 bonus exclusivos, anclaje de precio y garantía.</p>
          <div class="prompt-code" style="max-height: 120px; overflow-y: auto;">${generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step3}</div>
        </div>

        <div class="prompt-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="color: var(--accent-emerald); font-family: var(--font-display); font-size: 0.95rem; margin:0; font-weight:600">FASE 4: Guiones UGC & Ad Copy Matrix</h4>
            <button class="btn btn-secondary btn-sm btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step4)}">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Produce 3 guiones de video TikTok/Reels con escenas y 3 variantes de anuncios Meta.</p>
          <div class="prompt-code" style="max-height: 120px; overflow-y: auto;">${generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step4}</div>
        </div>

        <div class="prompt-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="color: #a78bfa; font-family: var(--font-display); font-size: 0.95rem; margin:0; font-weight:600">FASE 5: Landing Page HTML5 & Shopify</h4>
            <button class="btn btn-secondary btn-sm btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step5)}">
              <i data-lucide="copy"></i> Copiar Prompt
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Genera el código HTML autocontenido de la landing page con Tailwind CSS.</p>
          <div class="prompt-code" style="max-height: 120px; overflow-y: auto;">${generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').step5}</div>
        </div>

        <div style="margin-top: 0.5rem; text-align: center;">
          <button class="btn btn-primary btn-glow btn-copy-clipboard" data-copy="${encodeURIComponent(generateMasterPromptSequence(report.name, report.competitorUrl || '', report.retail || '').allInOne)}" style="padding: 0.75rem 1.5rem;">
            <i data-lucide="copy"></i> Copiar Mega System Prompt Completo (All-in-One)
          </button>
        </div>
      </div>
    </section>
  `;

  // Bind clipboard copies
  container.querySelectorAll('.btn-copy-clipboard').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rawText = e.currentTarget.getAttribute('data-copy');
      let text = rawText;
      try {
        if (rawText.includes('%')) {
          text = decodeURIComponent(rawText);
        }
      } catch (err) {
        text = rawText;
      }
      navigator.clipboard.writeText(text).then(() => {
        showToast("Copiado al portapapeles con éxito", "success");
      }).catch(err => {
        console.error("Fallo al copiar: ", err);
        showToast("Error al copiar al portapapeles.", "error");
      });
    });
  });

  // Bind copy all emails
  const copyAllEmailsBtn = container.querySelector('#copy-all-emails-btn');
  if (copyAllEmailsBtn) {
    copyAllEmailsBtn.addEventListener('click', () => {
      if (report.emailSequence && report.emailSequence.length > 0) {
        const fullSequenceText = report.emailSequence.map((e, idx) => `====================\nEMAIL #${idx+1}: ${e.subject}\n====================\nPreview: ${e.preview}\n\n${e.body}`).join('\n\n');
        navigator.clipboard.writeText(fullSequenceText).then(() => {
          showToast("Secuencia completa copiada al portapapeles.", "success");
        });
      }
    });
  }

  // Bind shopify html download
  const downloadShopifyBtn = container.querySelector('#download-shopify-html-btn');
  if (downloadShopifyBtn && report.shopifyDescription) {
    downloadShopifyBtn.addEventListener('click', () => {
      const code = `<h1>${report.shopifyDescription.title}</h1>\n\n${report.shopifyDescription.body}\n\n<h2>Preguntas Frecuentes</h2>\n` + 
        report.shopifyDescription.faq.map(f => `<p><strong>P: ${f.q}</strong><br>R: ${f.a}</p>`).join('\n');
      const blob = new Blob([code], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopify-description-${report.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Descarga de archivo HTML iniciada.", "success");
    });
  }

  // Define selectJourneyNode function
  window.selectJourneyNode = (nodeType) => {
    const details = document.getElementById('journey-node-details');
    const title = document.getElementById('journey-detail-title');
    const desc = document.getElementById('journey-detail-desc');
    if (!details || !title || !desc) return;

    let nodeTitle = '';
    let nodeDesc = '';

    if (nodeType === 'ad') {
      nodeTitle = 'Etapa 1: Anuncio Publicitario (Ad)';
      const firstTikTok = report.adCopy?.tiktok?.[0] || { hook: '¡Gancho viral!', body: 'Mira esto...' };
      const firstFb = report.adCopy?.facebook?.[0] || { primaryText: 'Consigue el tuyo hoy...' };
      nodeDesc = `El cliente potencial es interrumpido en redes sociales. 
        <br><br><strong>Gancho TikTok Recomendado:</strong> "${firstTikTok.hook}"
        <br><br><strong>Texto Principal Facebook Recomendado:</strong> "${firstFb.primaryText}"`;
    } else if (nodeType === 'landing') {
      nodeTitle = 'Etapa 2: Página de Ventas (Landing Page)';
      nodeDesc = `El cliente llega buscando respuestas. Se presenta el dolor mediante el Mecanismo Único de Dolor (UMP) y se valida con testimonios reales. 
        <br><br><strong>Gran Idea de la Oferta:</strong> "${report.offerBrief?.bigIdea || 'Diferenciación única'}"
        <br><br><strong>Mecanismo de Solución (UMS):</strong> "${report.secrets?.mechanismSolution || 'Resolución del dolor'}"`;
    } else if (nodeType === 'checkout') {
      nodeTitle = 'Etapa 3: Pago (Checkout)';
      nodeDesc = `El cliente está a punto de comprar pero tiene objeciones sobre el precio o el envío.
        <br><br><strong>Objeción Crítica:</strong> "${report.offerBrief?.objections?.[0] || '¿Llegará rápido?'}"
        <br><br><strong>Precio de Venta Sugerido:</strong> $${report.retail.toFixed(2)}`;
    } else if (nodeType === 'upsell') {
      nodeTitle = 'Etapa 4: Oferta Posterior (Upsell)';
      nodeDesc = `Inmediatamente después del pago, se le ofrece un producto complementario o paquete de mayor volumen para disparar el Ticket Medio (AOV).
        <br><br><strong>Estrategia de Oferta:</strong> Ofrecer un pack familiar de 2x o 3x unidades de ${report.name} con un 65% de descuento adicional.`;
    } else if (nodeType === 'email') {
      nodeTitle = 'Etapa 5: Fidelización por Correo (Email Sequence)';
      const firstEmail = report.emailSequence?.[0] || { subject: 'Bienvenido...' };
      nodeDesc = `Se activa una secuencia automatizada de correos para asegurar que no cancelen el pedido, aumentar el valor de vida del cliente (LTV) y ofrecer ventas cruzadas.
        <br><br><strong>Asunto del Primer Correo:</strong> "${firstEmail.subject}"`;
    }

    title.innerHTML = nodeTitle;
    desc.innerHTML = nodeDesc;
    
    // Apply temporary green glow
    details.classList.remove('glow-update');
    void details.offsetWidth;
    details.classList.add('glow-update');
  };

  // Bind HTML Copy Button
  const copyHtmlBtn = container.querySelector('#copy-html-btn');
  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener('click', () => {
      const code = container.querySelector('#landing-html-code').value;
      navigator.clipboard.writeText(code).then(() => {
        showToast("Código HTML copiado al portapapeles", "success");
      });
    });
  }

  // Bind HTML Download Button
  const downloadHtmlBtn = container.querySelector('#download-html-btn');
  if (downloadHtmlBtn) {
    downloadHtmlBtn.addEventListener('click', () => {
      const code = container.querySelector('#landing-html-code').value;
      const blob = new Blob([code], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.toLowerCase().replace(/ /g, '-')}_landing.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Archivo HTML descargado correctamente", "success");
    });
  }

  // Bind A/B Simulator Button
  const runAbSimBtn = container.querySelector('#run-ab-sim-btn');
  if (runAbSimBtn) {
    runAbSimBtn.addEventListener('click', () => {
      const headlineA = container.querySelector('#ab-headline-a').value.trim();
      const headlineB = container.querySelector('#ab-headline-b').value.trim();

      if (!headlineA || !headlineB) {
        showToast("Por favor, introduce ambos titulares para realizar la simulación.", "error");
        return;
      }

      // Show results panel
      const resultsPanel = container.querySelector('#ab-results-panel');
      resultsPanel.classList.remove('hidden');

      // Update text in result cards
      container.querySelector('#res-title-a').textContent = `"${headlineA}"`;
      container.querySelector('#res-title-b').textContent = `"${headlineB}"`;

      // Simular scores heurísticos
      const evaluateHeadline = (headline, baseType) => {
        const text = headline.toLowerCase();
        let painScore = 40 + Math.floor(Math.random() * 40);
        let umsScore = 30 + Math.floor(Math.random() * 50);
        let intrigueScore = 40 + Math.floor(Math.random() * 45);

        // Heurísticas básicas de copy
        // 1. Alineación de dolor
        if (text.includes('dolor') || text.includes('sufre') || text.includes('cansado') || text.includes('harto') || text.includes('odias') || text.includes('pánico') || text.includes('miedo')) {
          painScore += 15;
        }
        // 2. Mecanismo único
        if (text.includes('secreto') || text.includes('por qué') || text.includes('cómo') || text.includes('ciencia') || text.includes('mecanismo') || text.includes('flujo') || text.includes('linfático') || text.includes('descompresión') || text.includes('biológico')) {
          umsScore += 15;
        }
        // 3. Intriga
        if (headline.includes('?') || text.includes('revela') || text.includes('oculta') || text.includes('no quieren') || text.includes('mito')) {
          intrigueScore += 15;
        }

        // Cap scores to 100
        painScore = Math.min(painScore, 98);
        umsScore = Math.min(umsScore, 97);
        intrigueScore = Math.min(intrigueScore, 99);

        // Calculate predicted CTR based on scores (CTR normal en ads va de 1% a 5.5% para buenas campañas)
        const ctrBase = 1.2;
        const ctrMultiplier = (painScore * 0.4 + umsScore * 0.45 + intrigueScore * 0.15) / 100;
        const ctr = Math.round((ctrBase + ctrMultiplier * 3.8) * 100) / 100;

        return { painScore, umsScore, intrigueScore, ctr };
      };

      const resA = evaluateHeadline(headlineA, 'pain');
      const resB = evaluateHeadline(headlineB, 'ums');

      // Ensure they are slightly different if randomized identical
      if (resA.ctr === resB.ctr) resB.ctr += 0.15;

      // Animate progress bars and values
      setTimeout(() => {
        // Variant A UI
        container.querySelector('#ctr-val-a').textContent = `${resA.ctr.toFixed(2)}%`;
        container.querySelector('#score-label-pain-a').textContent = `${resA.painScore}%`;
        container.querySelector('#bar-pain-a').style.width = `${resA.painScore}%`;
        container.querySelector('#score-label-ums-a').textContent = `${resA.umsScore}%`;
        container.querySelector('#bar-ums-a').style.width = `${resA.umsScore}%`;
        container.querySelector('#score-label-intrigue-a').textContent = `${resA.intrigueScore}%`;
        container.querySelector('#bar-intrigue-a').style.width = `${resA.intrigueScore}%`;

        // Variant B UI
        container.querySelector('#ctr-val-b').textContent = `${resB.ctr.toFixed(2)}%`;
        container.querySelector('#score-label-pain-b').textContent = `${resB.painScore}%`;
        container.querySelector('#bar-pain-b').style.width = `${resB.painScore}%`;
        container.querySelector('#score-label-ums-b').textContent = `${resB.umsScore}%`;
        container.querySelector('#bar-ums-b').style.width = `${resB.umsScore}%`;
        container.querySelector('#score-label-intrigue-b').textContent = `${resB.intrigueScore}%`;
        container.querySelector('#bar-intrigue-b').style.width = `${resB.intrigueScore}%`;

        // Verdict logic
        const winnerCardA = container.querySelector('#card-variant-a');
        const winnerCardB = container.querySelector('#card-variant-b');
        winnerCardA.classList.remove('winner');
        winnerCardB.classList.remove('winner');

        let verdict = "";
        if (resA.ctr > resB.ctr) {
          winnerCardA.classList.add('winner');
          verdict = `🏆 <strong>Variante A gana con un CTR estimado del ${resA.ctr.toFixed(2)}%</strong> (frente al ${resB.ctr.toFixed(2)}% de la Variante B). Su fuerza reside en que apela directamente al dolor profundo del avatar ("${report.avatarBrief.painPoints.p1.name}"). El prospecto siente empatía instantánea. Para optimizarlo aún más, intenta inyectar el mecanismo único (UMS) al final del titular como una solución lógica e inevitable.`;
        } else {
          winnerCardB.classList.add('winner');
          verdict = `🏆 <strong>Variante B gana con un CTR estimado del ${resB.ctr.toFixed(2)}%</strong> (frente al ${resA.ctr.toFixed(2)}% de la Variante A). Su gancho es superior porque introduce un Mecanismo Único de la Solución (UMS) claro. El mercado está sofisticado y cansado de falsas promesas; al explicar *por qué* esto funciona biológicamente de manera diferente, el escepticismo disminuye sustancialmente y aumenta el deseo.`;
        }

        container.querySelector('#ab-verdict-text').innerHTML = verdict;
        lucide.createIcons();
        showToast("Simulación de CTR finalizada", "success");
      }, 300);
    });
  }

  lucide.createIcons();
}

// RENDER THE HIDDEN PRINT VIEW CONTAINING ALL SECTIONS SEQUENTIALLY
export function renderPrintableReport() {
  const printContainer = document.getElementById('print-report-container');
  const report = state.currentReport;

  printContainer.innerHTML = `
    <!-- PAGE 1: COVER -->
    <div class="print-page cover-page">
      <div class="cover-title">REPORTE DE INVESTIGACIÓN PROFUNDA</div>
      <div style="font-size: 24pt; font-weight: bold; margin-bottom: 0.5cm;">${report.name.toUpperCase()}</div>
      <div class="cover-subtitle">Informe de Inteligencia de Mercado, Copywriting Persuasivo y Análisis de Viabilidad para Dropshipping</div>
      
      <div class="cover-meta">
        <div>
          <strong>GENERADO POR</strong><br>DropDeep Intelligence Engine
        </div>
        <div>
          <strong>FECHA</strong><br>${new Date().toLocaleDateString()}
        </div>
        <div>
          <strong>CATEGORÍA</strong><br>${report.categoryId.toUpperCase()}
        </div>
      </div>
    </div>

    <!-- PAGE 2: DEMOGRAPHICS -->
    <div class="print-page">
      <h1>01. Demografía y Psicografía Profunda</h1>
      <h2>Perfil Detallado de la Audiencia Target</h2>
      <p>La investigación profunda de mercado ha mapeado la identidad y el estado mental del comprador ideal de ${report.name}. Este grupo de personas comparte un conjunto consistente de miedos y esperanzas.</p>
      
      <h3>Ficha Psicográfica</h3>
      <p><strong>Quién es el cliente:</strong> ${report.demographics.who}</p>
      <p><strong>Filosofía / Creencia central:</strong> "${report.demographics.belief}"</p>
      
      <h3>Análisis Psicográfico Detallado</h3>
      <p><strong>Hopes & Dreams (Esperanzas):</strong> ${report.demographics.dreams}</p>
      <p><strong>Victories & Defeats (Victorias y Fracos):</strong> ${report.demographics.defeats}</p>
      <p><strong>Scapegoats (Culpables externos):</strong> ${report.demographics.outsideForces}</p>
      <p><strong>Prejuicios y Alineaciones Tribales:</strong> ${report.demographics.prejudices}</p>
    </div>

    <!-- PAGE 3: SOLUTIONS & REVIEWS -->
    <div class="print-page">
      <h1>02. Soluciones Existentes y Sentimiento de Mercado</h1>
      <h2>Evaluación de Alternativas de Competidores</h2>
      <p>El mercado ya está utilizando otras vías alternativas para solucionar este problema. Sin embargo, el nivel de insatisfacción reportado es sumamente útil para posicionar nuestra oferta.</p>
      
      <h3>Soluciones y Puntos de Fricción</h3>
      <p><strong>Qué están usando:</strong> ${report.solutions.current}</p>
      <p><strong>La Experiencia de Uso Común:</strong> ${report.solutions.experience}</p>
      <p><strong>Lo que Aman:</strong> ${report.solutions.likes}</p>
      <p><strong>Lo que Detestan:</strong> ${report.solutions.dislikes}</p>
      <p><strong>Scepticism (Escepticismo del Mercado):</strong> ${report.solutions.skepticism}</p>

      <h3>Historias de Terror Identificadas en el Mercado</h3>
      ${report.solutions.horrorStories.map(story => `
        <div class="print-blockquote">${story}</div>
      `).join('')}
    </div>

    <!-- PAGE 4: SECRETS & EDEN -->
    <div class="print-page">
      <h1>03. Curiosidades, Mecanismos y la Caída del Edén</h1>
      <h2>La Raíz Histórica y Biológica del Dolor</h2>
      
      <h3>1. Sabiduría Antigua y Supresión Industrial</h3>
      <p><strong>Intentos del Pasado:</strong> ${report.secrets.historical}</p>
      <p><strong>Narrativa de Supresión:</strong> ${report.secrets.conspiracy}</p>
      
      <h3>2. Los Mecanismos de Acción</h3>
      <p><strong>El Mecanismo Único del Problema:</strong> ${report.secrets.mechanismProblem}</p>
      <p><strong>El Mecanismo Único de la Solución (Cura):</strong> ${report.secrets.mechanismSolution}</p>
      
      <h3>3. La Caída del Edén</h3>
      <p><strong>El Edén Original:</strong> ${report.eden.goldenAge}</p>
      <p><strong>El Agente Corruptor:</strong> ${report.eden.corruptor}</p>
      <p><strong>El Contraste Ancestral:</strong> ${report.eden.contrast}</p>
    </div>

    <!-- PAGE 5: VERBATIMS SWIPE FILE -->
    <div class="print-page">
      <h1>04. Swipe File de Frases Textuales de Foros</h1>
      <h2>La Voz Literal del Consumidor</h2>
      <p>A continuación se consolidan las expresiones exactas del mercado en foros de discusión y reseñas. Estas frases demuestran el nivel de lectura promedio (7º grado) y el lenguaje cargado emocionalmente que debe usarse en la redacción de correos y anuncios.</p>
      
      <div class="print-verbatim-list">
        ${report.verbatims.map(quote => `
          <div class="print-verbatim">"${quote}"</div>
        `).join('')}
      </div>
    </div>

    <!-- PAGE 6: COPYWRITING ANGLES -->
    <div class="print-page">
      <h1>05. Ángulos de Marketing y Copywriting Ganadores</h1>
      <h2>5 Estructuras de Ventas Altamente Persuasivas</h2>
      <p>Basados en toda la investigación anterior, se proponen 5 ángulos creativos diseñados para capturar la atención en las redes sociales y convertirlos en ventas en la landing page.</p>
      
      ${report.angles.map(angle => `
        <div class="print-angle">
          <div class="print-angle-title">${angle.title}</div>
          <p><strong>Estrategia de Ángulo:</strong> ${angle.narrative}</p>
          <div class="print-angle-copy">
            <strong>GANCHO (HOOK):</strong> "${angle.hook}"
          </div>
          <div class="print-angle-copy" style="margin-top:0.2cm">
            <strong>TITULAR DE VENTAS:</strong> "${angle.headline}"
          </div>
        </div>
      `).join('')}
    </div>

    <!-- PAGE 7: AVATAR BRIEF -->
    <div class="print-page">
      <h1>06. Avatars Brief (Psicología Detallada)</h1>
      <h2>Perfil Emocional Consolidado</h2>
      <p><strong>Edad:</strong> ${report.avatarBrief.general.age} | <strong>Género:</strong> ${report.avatarBrief.general.gender} | <strong>Ingresos:</strong> ${report.avatarBrief.general.income}</p>
      <p><strong>Ubicación:</strong> ${report.avatarBrief.general.location}</p>
      <p><strong>Antecedentes:</strong> ${report.avatarBrief.general.background}</p>
      <p><strong>Identidad:</strong> ${report.avatarBrief.general.identities}</p>

      <h3>Desafíos y Puntos de Dolor</h3>
      <p><strong>1. ${report.avatarBrief.painPoints.p1.name}:</strong></p>
      <ul>${report.avatarBrief.painPoints.p1.list.map(s => `<li>${s}</li>`).join('')}</ul>
      <p><strong>2. ${report.avatarBrief.painPoints.p2.name}:</strong></p>
      <ul>${report.avatarBrief.painPoints.p2.list.map(s => `<li>${s}</li>`).join('')}</ul>
      <p><strong>3. ${report.avatarBrief.painPoints.p3.name}:</strong></p>
      <ul>${report.avatarBrief.painPoints.p3.list.map(s => `<li>${s}</li>`).join('')}</ul>

      <h3>Metas y Impulsores</h3>
      <p><strong>Metas Corto Plazo:</strong> ${report.avatarBrief.goals.short.join(', ')}</p>
      <p><strong>Aspiraciones Largo Plazo:</strong> ${report.avatarBrief.goals.long.join(', ')}</p>
      <p><strong>Impulsor Emocional Clave:</strong> ${report.avatarBrief.emotionalDrivers[0]}</p>
      <p><strong>Miedos Profundos:</strong> ${report.avatarBrief.fears.join(' | ')}</p>

      <h3>El Viaje Emocional</h3>
      <p><strong>Conciencia:</strong> ${report.avatarBrief.journey.awareness}</p>
      <p><strong>Frustración:</strong> ${report.avatarBrief.journey.frustración}</p>
      <p><strong>Desesperación:</strong> ${report.avatarBrief.journey.desesperación}</p>
      <p><strong>Alivio:</strong> ${report.avatarBrief.journey.alivio}</p>
    </div>

    <!-- PAGE 8: OFFER BRIEF -->
    <div class="print-page">
      <h1>07. Offer Brief (Estructuración de Oferta)</h1>
      <h2>Posicionamiento y Objeciones del Producto</h2>
      <p><strong>Nivel Consciencia:</strong> ${report.offerBrief.awareness} | <strong>Sofisticación:</strong> ${report.offerBrief.sophistication}</p>
      <p><strong>Gran Idea:</strong> ${report.offerBrief.bigIdea}</p>
      <p><strong>Metáfora:</strong> "${report.offerBrief.metaphor}"</p>
      <p><strong>Guía / Gurú:</strong> ${report.offerBrief.guru}</p>

      <h3>Mecanismos de Acción</h3>
      <p><strong>UMP (Mecanismo Problema):</strong> ${report.offerBrief.ump}</p>
      <p><strong>UMS (Mecanismo Solución):</strong> ${report.offerBrief.ums}</p>
      
      <h3>Titular de Ventas Recomendado</h3>
      <div class="print-blockquote">"${report.offerBrief.headlines[0]}"</div>

      <h3>Manejo de Objeciones</h3>
      ${report.offerBrief.objections.map(obj => {
        const parts = obj.split(' (Respuesta: ');
        return `<p><strong>P: ${parts[0]}</strong><br>R: ${parts[1] ? parts[1].replace(')', '') : ''}</p>`;
      }).join('')}

      <h3>Funnel & Dominios</h3>
      <p><strong>Embudo:</strong> ${report.offerBrief.funnel}</p>
      <p><strong>Dominios:</strong> ${report.offerBrief.domains.join(' | ')}</p>

      <h3>Ejemplos y Swipes Ganadores (Copy Swipes)</h3>
      <ul>
        ${report.offerBrief.swipes ? report.offerBrief.swipes.map(s => `<li>"${s}"</li>`).join('') : '<li>Sin ejemplos de swipes</li>'}
      </ul>

      <h3>Otras Notas de la Oferta</h3>
      <p>${report.offerBrief.otherNotes || 'Sin notas adicionales.'}</p>
    </div>

    <!-- PAGE 9: UGC SCRIPTS -->
    <div class="print-page">
      <h1>08. Guiones de Video UGC (TikTok / Instagram Reels)</h1>
      <h2>Material de Marketing y Anuncios de Video</h2>
      <p>A continuación se presentan los guiones publicitarios recomendados para campañas de video UGC enfocadas en compra por impulso:</p>
      
      ${report.ugcScripts.map((script, idx) => `
        <div class="print-angle" style="margin-bottom: 0.5cm">
          <div class="print-angle-title">${script.title} (${script.duration})</div>
          ${script.scenes.map(s => `
            <p style="font-size: 9pt; margin-bottom: 0.15cm">
              <strong>[${s.time}]</strong><br>
              <span style="color: #666666">Visual: ${s.visual}</span><br>
              <span>Audio: "${s.audio}"</span><br>
              <span style="font-family: Courier, monospace; font-size: 8.5pt">Texto: [${s.text}]</span>
            </p>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <!-- PAGE 10: COMPETITORS AND LANDING ARCHITECTURE -->
    <div class="print-page">
      <h1>09. Análisis de Competidores y Embudo de Conversión</h1>
      <h2>Estrategia de Diferenciación y Landing Page</h2>
      
      <h3>Análisis de Ganchos (Diferenciación)</h3>
      <p><strong>Ganchos Saturados de la Competencia:</strong></p>
      <ul>
        ${report.competitorAnalysis.competitorsGanchos.map(g => `<li>${g}</li>`).join('')}
      </ul>
      <p><strong>Nuestros Ganchos de Desvío:</strong></p>
      <ul>
        ${report.competitorAnalysis.ourGanchos.map(g => `<li>${g}</li>`).join('')}
      </ul>

      <p><strong>Debilidades del Competidor:</strong> ${report.competitorAnalysis.weaknesses}</p>
      <p><strong>Nuestra Propuesta:</strong> ${report.competitorAnalysis.differentiation}</p>

      <h3>Arquitectura de Secciones del Embudo</h3>
      <div class="print-verbatim-list">
        ${report.landingPage.outline.map((out, idx) => `
          <div class="print-verbatim" style="margin-bottom: 0.2cm">
            <strong>${idx+1}. ${out.title}</strong><br>
            <span>${out.desc}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- PAGE 11: RECOMMENDED SUPPLIERS -->
    <div class="print-page">
      <h1>10. Proveedores Recomendados para Dropshipping</h1>
      <h2>Proveedores de Origen y Métricas de Costes</h2>
      <p>A continuación se listan los proveedores recomendados obtenidos a partir de la investigación en vivo de la IA y búsquedas directas en internet:</p>
      
      <div class="print-verbatim-list">
        ${report.suppliers && report.suppliers.length > 0 ? report.suppliers.map((sup, idx) => `
          <div class="print-verbatim" style="margin-bottom: 0.4cm; page-break-inside: avoid;">
            <strong>${idx+1}. ${sup.name} (${sup.platform})</strong><br>
            <span>Costo Producto: $${parseFloat(sup.price).toFixed(2)} | Costo Envío: $${parseFloat(sup.shippingCost).toFixed(2)}</span><br>
            <span>Tiempo de Entrega Promedio: ${sup.shippingTime} días</span><br>
            <span style="font-size: 8.5pt; color: #666666; word-break: break-all;">Enlace Proveedor: ${sup.link}</span>
          </div>
        `).join('') : '<p>No hay proveedores disponibles.</p>'}
      </div>
    </div>

    <!-- PAGE 12: EMAIL SEQUENCE -->
    <div class="print-page">
      <h1>11. Secuencias de Email Marketing</h1>
      <h2>Emails de Adoctrinamiento y Conversión</h2>
      <p>A continuación se listan los correos generados para la secuencia automatizada de nurturing:</p>
      
      <div class="print-verbatim-list">
        ${report.emailSequence && report.emailSequence.length > 0 ? report.emailSequence.map((email, idx) => `
          <div class="print-verbatim" style="margin-bottom: 0.5cm; page-break-inside: avoid;">
            <strong>Correo #${idx+1}: ${email.subject}</strong><br>
            <span style="font-size: 8.5pt; color: #666666">Previsualización: ${email.preview}</span><br><br>
            <span style="font-size: 9pt; white-space: pre-line;">${email.body}</span>
          </div>
        `).join('') : '<p>No hay correos disponibles.</p>'}
      </div>
    </div>

    <!-- PAGE 13: AD COPIES -->
    <div class="print-page">
      <h1>12. Creativos de Anuncios y Copys de Redes Sociales</h1>
      <h2>Copys Publicitarios para Meta Ads y TikTok</h2>
      
      <h3>Variantes Meta Ads (Facebook / Instagram)</h3>
      <div class="print-verbatim-list" style="margin-bottom: 0.5cm">
        ${report.adCopy && report.adCopy.facebook ? report.adCopy.facebook.map((ad, idx) => `
          <div class="print-verbatim" style="margin-bottom: 0.4cm; page-break-inside: avoid;">
            <strong>Anuncio #${idx+1} (Meta)</strong><br>
            <span><strong>Principal:</strong> ${ad.primaryText}</span><br>
            <span><strong>Titular:</strong> ${ad.headline}</span><br>
            <span><strong>Descripción:</strong> ${ad.description}</span>
          </div>
        `).join('') : '<p>No hay copys de Meta disponibles.</p>'}
      </div>

      <h3>Variantes TikTok Ads</h3>
      <div class="print-verbatim-list">
        ${report.adCopy && report.adCopy.tiktok ? report.adCopy.tiktok.map((ad, idx) => `
          <div class="print-verbatim" style="margin-bottom: 0.4cm; page-break-inside: avoid;">
            <strong>Anuncio #${idx+1} (TikTok)</strong><br>
            <span><strong>Gancho:</strong> "${ad.hook}"</span><br>
            <span><strong>Cuerpo:</strong> ${ad.body}</span><br>
            <span><strong>CTA Overlay:</strong> ${ad.cta}</span>
          </div>
        `).join('') : '<p>No hay copys de TikTok disponibles.</p>'}
      </div>
    </div>

    <!-- PAGE 14: SHOPIFY PRODUCT PAGE -->
    <div class="print-page">
      <h1>13. Ficha de Shopify e Información de SEO</h1>
      <h2>Título, Meta Descripción y Ficha de Ventas</h2>
      
      ${report.shopifyDescription ? `
        <div class="print-verbatim-list">
          <div class="print-verbatim" style="margin-bottom: 0.4cm;">
            <strong>Título de Producto Sugerido:</strong> ${report.shopifyDescription.title}<br>
            <strong>Meta Descripción SEO:</strong> ${report.shopifyDescription.metaDescription}
          </div>
          
          <h3>Ficha de Descripción de Producto (HTML Preview):</h3>
          <div style="font-size: 9pt; border: 1px solid #cccccc; padding: 0.3cm; border-radius: 4px; background: #fafafa; color: #111111;">
            ${report.shopifyDescription.body}
          </div>

          <h3>Preguntas Frecuentes (FAQ):</h3>
          ${report.shopifyDescription.faq.map(item => `
            <p style="font-size: 9pt"><strong>P: ${item.q}</strong><br>R: ${item.a}</p>
          `).join('')}
        </div>
      ` : '<p>No hay ficha de Shopify disponible.</p>'}
    </div>
  `;
}
