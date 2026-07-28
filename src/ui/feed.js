import { state } from '../state.js';
import { automatedProducts } from '../data/products.js';
import { runDeepResearchSequence } from '../research/flow.js';

export function renderAutomatedFeed() {
  const feed = document.getElementById('automated-feed');
  feed.innerHTML = '';

  automatedProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Saturation and Trend colors
    const saturationColor = product.saturationScore > 50 ? 'red' : 'green';
    
    card.innerHTML = `
      <div class="product-card-badge">${product.trendVelocity} Vel</div>
      <div class="product-card-body">
        <span class="product-card-category">${product.category}</span>
        <h3 class="product-card-title">${product.name}</h3>
        <p class="product-card-desc">${product.description}</p>
        
        <div class="card-stats-table">
          <div class="stats-row">
            <span class="stats-label">Precio Proveedor:</span>
            <span class="stats-val">$${product.supplierPrice.toFixed(2)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Precio Sugerido:</span>
            <span class="stats-val">$${product.retailPrice.toFixed(2)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Margen Neto:</span>
            <span class="stats-val green">$${(product.retailPrice - product.supplierPrice).toFixed(2)} (${Math.round((product.retailPrice - product.supplierPrice)/product.supplierPrice*100)}% ROI)</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Envío Promedio:</span>
            <span class="stats-val">${product.shippingDays} días</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Saturación:</span>
            <span class="stats-val ${saturationColor}">${product.saturationScore}%</span>
          </div>
        </div>
        
        <div class="product-card-footer">
          <button class="btn btn-primary btn-glow run-research-btn" data-product-name="${product.name}">
            <i data-lucide="shield-alert"></i> Deep Research
          </button>
        </div>
      </div>
    `;
    
    feed.appendChild(card);
  });

  // Bind click listeners to research buttons
  feed.querySelectorAll('.run-research-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pName = e.currentTarget.getAttribute('data-product-name');
      runDeepResearchSequence(pName);
    });
  });
}

// Background Simulated Trend Scanner Logs
export function runTrendScannerSimulation() {
  const container = document.getElementById('scanner-logs-container');
  if (!container) return;

  const logs = [
    { text: "Iniciando análisis periódico del mercado global...", type: "system" },
    { text: "Conectando con API de AliExpress, Zendrop y CJ...", type: "system" },
    { text: "Scrapeando foro Reddit r/ecommerce y r/dropshipping...", type: "system" },
    { text: "Encontrado nuevo producto de alta tracción: 'Electric Heated Knee Sleeve' (Tendencia +120%)", type: "find" },
    { text: "Saturación detectada en EE.UU.: 24% | Margen estimado: 74% | Envío: 7 días", type: "find" },
    { text: "Scrapeando TikTok Creative Center por palabras clave de Belleza...", type: "system" },
    { text: "Identificado ángulo ganador: 'Anti-envejecimiento sin inyecciones'", type: "find" },
    { text: "Advertencia: Nivel de quejas de AliExpress para 'Smart Watch Z4' supera 12%. Saltando...", type: "warn" },
    { text: "Escaneando reseñas de Amazon para 'Orthopedic Back Pillow'...", type: "system" },
    { text: "Almacenando perfiles de comprador en base de datos...", type: "system" },
    { text: "Encontrado producto con alta retención: 'Silicone Bath Brush' (Tendencia +65%)", type: "find" }
  ];

  let logIndex = 0;

  function printNextLog() {
    if (state.activeView === 'scanner-view') {
      const log = logs[logIndex % logs.length];
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.className = `log-line ${log.type}`;
      div.innerHTML = `<span style="color:var(--text-muted)">[${time}]</span> ${log.text}`;
      container.appendChild(div);
      
      // Keep only last 20 logs
      while (container.childNodes.length > 20) {
        container.removeChild(container.firstChild);
      }
      container.scrollTop = container.scrollHeight;
    }
    logIndex++;
    setTimeout(runTrendScannerSimulation, 3000 + Math.random() * 3000);
  }

  printNextLog();
}

// ==========================================================================
