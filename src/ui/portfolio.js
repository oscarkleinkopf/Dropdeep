import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import { openDeepResearchReport } from './report.js';
import { calculateProductScore } from '../research/scoring.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';

export function updatePortfolioBadge() {
  const badge = document.getElementById('portfolio-count');
  if (state.portfolio.length > 0) {
    badge.textContent = state.portfolio.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

export function toggleSaveProduct() {
  const report = state.currentReport;
  if (!report) return;

  const index = state.portfolio.findIndex(p => p.name.toLowerCase() === report.name.toLowerCase());
  const saveBtn = document.getElementById('save-report-btn');
  const saveText = document.getElementById('save-btn-text');
  const heartIcon = document.getElementById('save-heart-icon');

  if (index > -1) {
    // Remove from portfolio
    state.portfolio.splice(index, 1);
    saveBtn.classList.remove('saved');
    saveText.textContent = "Guardar en Portafolio";
    heartIcon.setAttribute('data-lucide', 'heart');
    showToast("Eliminado del portafolio", "info");
  } else {
    // Add to portfolio
    const newItem = {
      id: report.name.toLowerCase().replace(/ /g, '-'),
      name: report.name,
      category: report.categoryId,
      cost: report.cost,
      retail: report.retail,
      margin: report.margin,
      roi: report.roi,
      shipping: report.shipping,
      saturation: report.saturation,
      savedAt: new Date().toLocaleDateString(),
      notes: "",
      fullReport: report
    };
    state.portfolio.push(newItem);
    saveBtn.classList.add('saved');
    saveText.textContent = "Guardado en Portafolio";
    heartIcon.setAttribute('data-lucide', 'check');
    showToast("Producto guardado en tu portafolio", "success");
  }

  // Update storage & badges
  localStorage.setItem('dropdeep_portfolio', JSON.stringify(state.portfolio));
  updatePortfolioBadge();
  renderDashboardStats();
  renderResearchFeed();
  lucide.createIcons();
}

export function updateCompareButtonState() {
  const compareBtn = document.getElementById('compare-btn');
  if (!compareBtn) return;
  state.selectedCompareIds = state.selectedCompareIds || [];
  if (state.selectedCompareIds.length >= 2) {
    compareBtn.classList.remove('hidden');
    compareBtn.textContent = `Comparar (${state.selectedCompareIds.length})`;
  } else {
    compareBtn.classList.add('hidden');
  }
}

export function renderPortfolioList() {
  const container = document.getElementById('portfolio-container');
  const emptyView = document.getElementById('empty-portfolio-view');
  const layout = document.getElementById('portfolio-layout');
  const sidebar = document.getElementById('portfolio-list');

  if (state.portfolio.length === 0) {
    emptyView.classList.remove('hidden');
    layout.classList.add('hidden');
    return;
  }

  emptyView.classList.add('hidden');
  layout.classList.remove('hidden');
  sidebar.innerHTML = '';

  const searchText = (document.getElementById('portfolio-search-input')?.value || '').toLowerCase().trim();
  const selectedCat = document.getElementById('portfolio-category-filter')?.value || '';

  let filtered = state.portfolio;
  if (searchText) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText));
  }
  if (selectedCat) {
    filtered = filtered.filter(p => p.category === selectedCat);
  }

  if (filtered.length === 0) {
    sidebar.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:1.5rem; text-align:center;">No se encontraron productos.</div>';
    return;
  }

  filtered.forEach(item => {
    const activeClass = state.activePortfolioId === item.id ? 'active' : '';
    const isChecked = (state.selectedCompareIds || []).includes(item.id) ? 'checked' : '';
    
    const score = item.fullReport.productScore || calculateProductScore(item.fullReport);
    let scoreColor = 'var(--accent-emerald)';
    if (score < 50) scoreColor = 'var(--accent-red)';
    else if (score < 75) scoreColor = 'var(--accent-amber)';

    const itemContainer = document.createElement('div');
    itemContainer.className = `portfolio-item-container ${activeClass}`;
    itemContainer.style = "display: flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 0.75rem; transition: var(--transition-smooth); cursor: pointer; margin-bottom: 0.25rem;";
    
    itemContainer.innerHTML = `
      <input type="checkbox" class="portfolio-compare-checkbox" data-id="${item.id}" ${isChecked} style="width: 16px; height: 16px; accent-color: var(--accent-cyan); cursor: pointer;">
      <div class="portfolio-item-info" style="flex: 1; display: flex; flex-direction: column; gap: 0.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family: var(--font-display); font-weight:700; color:var(--text-light); font-size:0.85rem">${item.name}</span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: ${scoreColor}; font-weight:700;">${score} pts</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
          <span>Margen: $${item.margin.toFixed(2)}</span>
          <span>ROI: ${item.roi}%</span>
        </div>
      </div>
    `;

    const checkbox = itemContainer.querySelector('.portfolio-compare-checkbox');
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = checkbox.getAttribute('data-id');
      state.selectedCompareIds = state.selectedCompareIds || [];
      if (checkbox.checked) {
        if (!state.selectedCompareIds.includes(id)) {
          state.selectedCompareIds.push(id);
        }
      } else {
        state.selectedCompareIds = state.selectedCompareIds.filter(x => x !== id);
      }
      updateCompareButtonState();
    });

    itemContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('portfolio-compare-checkbox')) return;
      state.activePortfolioId = item.id;
      document.querySelectorAll('.portfolio-item-container').forEach(c => c.classList.remove('active'));
      itemContainer.classList.add('active');
      renderActivePortfolioDetail();
    });

    sidebar.appendChild(itemContainer);
  });

  if (filtered.length > 0) {
    const stillExists = filtered.some(p => p.id === state.activePortfolioId);
    if (!stillExists) {
      state.activePortfolioId = filtered[0].id;
      sidebar.firstElementChild.classList.add('active');
    }
  } else {
    state.activePortfolioId = null;
  }

  renderActivePortfolioDetail();
}

export function renderActivePortfolioDetail() {
  const detailPanel = document.getElementById('portfolio-active-detail');
  const activeItem = state.portfolio.find(p => p.id === state.activePortfolioId);

  if (!activeItem) {
    detailPanel.innerHTML = '<p style="color:var(--text-muted); padding: 2rem; text-align: center;">Selecciona un producto para ver los detalles.</p>';
    return;
  }

  const score = activeItem.fullReport.productScore || calculateProductScore(activeItem.fullReport);
  let scoreColor = 'var(--accent-emerald)';
  if (score < 50) scoreColor = 'var(--accent-red)';
  else if (score < 75) scoreColor = 'var(--accent-amber)';

  const cheaperSupplier = activeItem.fullReport.suppliers && activeItem.fullReport.suppliers.length > 0
    ? activeItem.fullReport.suppliers.reduce((prev, curr) => (prev.price + (prev.shippingCost || 0) < curr.price + (curr.shippingCost || 0) ? prev : curr))
    : null;

  detailPanel.innerHTML = `
    <div class="portfolio-detail-header">
      <div class="portfolio-detail-title">
        <h3 style="display: flex; align-items: center; gap: 0.75rem;">
          ${activeItem.name} 
          <span style="font-family: var(--font-mono); font-size: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 0.15rem 0.4rem; border-radius: 4px; color: ${scoreColor}">${score} pts</span>
        </h3>
        <p>${activeItem.category.toUpperCase()}</p>
      </div>
      <div style="display:flex; gap:0.5rem">
        <button class="btn btn-secondary" id="portfolio-open-report">
          <i data-lucide="file-text"></i> Reabrir Reporte
        </button>
        <button class="btn btn-danger" id="portfolio-delete-item">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>

    <div class="portfolio-detail-grid">
      <div class="portfolio-mini-card">
        <div class="portfolio-mini-label">Costo Proveedor</div>
        <div class="portfolio-mini-val">$${activeItem.cost.toFixed(2)}</div>
      </div>
      <div class="portfolio-mini-card">
        <div class="portfolio-mini-label">Precio de Venta</div>
        <div class="portfolio-mini-val">$${activeItem.retail.toFixed(2)}</div>
      </div>
      <div class="portfolio-mini-card">
        <div class="portfolio-mini-label">ROI Estimado</div>
        <div class="portfolio-mini-val">${activeItem.roi}%</div>
      </div>
      <div class="portfolio-mini-card">
        <div class="portfolio-mini-label">Saturación</div>
        <div class="portfolio-mini-val" style="color: var(--accent-amber)">${activeItem.saturation}%</div>
      </div>
      <div class="portfolio-mini-card" style="grid-column: span 2;">
        <div class="portfolio-mini-label">Proveedor Óptimo</div>
        <div class="portfolio-mini-val" style="font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
          ${cheaperSupplier ? `
            <a href="${cheaperSupplier.link}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; display: flex; align-items: center; gap: 0.25rem;">
              ${cheaperSupplier.platform}: ${cheaperSupplier.name.substring(0, 20)}... <i data-lucide="external-link" style="width: 12px; height: 12px"></i>
            </a>
            <span style="font-size:0.75rem; color:var(--text-muted)">($${cheaperSupplier.price} + $${cheaperSupplier.shippingCost || 0} envío)</span>
          ` : 'Ninguno en la investigación'}
        </div>
      </div>
      <div class="portfolio-mini-card" style="grid-column: span 2;">
        <div class="portfolio-mini-label">Tiempo de Envío Medio</div>
        <div class="portfolio-mini-val" style="font-size: 0.85rem;">
          ${cheaperSupplier ? `${cheaperSupplier.shippingTime} días` : `${activeItem.shipping} días`}
        </div>
      </div>
    </div>

    <div class="portfolio-notes-section">
      <h4><i data-lucide="edit-3" style="width:16px; height:16px"></i> Notas de Planificación y Marketing</h4>
      <textarea class="portfolio-notes-textarea" id="portfolio-notes" placeholder="Añade aquí ideas de campañas, copies rápidos, links de proveedores o metas de ventas para este producto...">${activeItem.notes}</textarea>
    </div>
  `;

  lucide.createIcons();

  // Notes Auto-Save listener
  const notesText = document.getElementById('portfolio-notes');
  notesText.addEventListener('input', (e) => {
    activeItem.notes = e.target.value;
    localStorage.setItem('dropdeep_portfolio', JSON.stringify(state.portfolio));
  });

  // Open Full Report listener
  document.getElementById('portfolio-open-report').addEventListener('click', () => {
    openDeepResearchReport(activeItem.fullReport);
  });

  // Delete Item listener
  document.getElementById('portfolio-delete-item').addEventListener('click', () => {
    const idx = state.portfolio.findIndex(p => p.id === activeItem.id);
    if (idx > -1) {
      state.portfolio.splice(idx, 1);
      localStorage.setItem('dropdeep_portfolio', JSON.stringify(state.portfolio));
      updatePortfolioBadge();
      
      // If we deleted the active item, reset active portfolio ID selection
      if (state.portfolio.length > 0) {
        state.activePortfolioId = state.portfolio[0].id;
      } else {
        state.activePortfolioId = null;
      }
      
      renderPortfolioList();
      showToast("Producto eliminado del portafolio", "info");
    }
  });
}

export function openProductComparison() {
  const selectedIds = state.selectedCompareIds || [];
  if (selectedIds.length < 2) return;

  const products = state.portfolio.filter(p => selectedIds.includes(p.id));
  const container = document.getElementById('comparator-grid-container');
  if (!container) return;

  // Let's find the best product by Product Score
  let bestProduct = products[0];
  products.forEach(p => {
    const scoreP = p.fullReport.productScore || calculateProductScore(p.fullReport);
    const scoreBest = bestProduct.fullReport.productScore || calculateProductScore(bestProduct.fullReport);
    if (scoreP > scoreBest) {
      bestProduct = p;
    }
  });

  let tableHeaderCols = '<th>Criterio</th>';
  let scoreCols = '';
  let costCols = '';
  let retailCols = '';
  let marginCols = '';
  let roiCols = '';
  let saturationCols = '';
  let shippingCols = '';
  let supplierCols = '';
  let bestOptionCols = '';

  products.forEach(p => {
    const score = p.fullReport.productScore || calculateProductScore(p.fullReport);
    const isWinner = p.id === bestProduct.id;
    const winnerClass = isWinner ? 'comparator-winner-col' : '';
    const headerClass = isWinner ? 'comparator-winner-header comparator-winner-col' : '';

    tableHeaderCols += `<th class="${headerClass}">${p.name}</th>`;
    
    scoreCols += `<td class="${winnerClass}" style="font-weight:700; font-size:1.1rem">${score}/100</td>`;
    costCols += `<td class="${winnerClass}">$${p.cost.toFixed(2)}</td>`;
    retailCols += `<td class="${winnerClass}">$${p.retail.toFixed(2)}</td>`;
    marginCols += `<td class="${winnerClass}" style="color:var(--accent-emerald); font-weight:600">$${p.margin.toFixed(2)}</td>`;
    roiCols += `<td class="${winnerClass}">${p.roi}%</td>`;
    saturationCols += `<td class="${winnerClass}">${p.saturation}%</td>`;
    shippingCols += `<td class="${winnerClass}">${p.shipping} días</td>`;
    
    const cheaper = p.fullReport.suppliers && p.fullReport.suppliers.length > 0
      ? p.fullReport.suppliers.reduce((prev, curr) => (prev.price + (prev.shippingCost || 0) < curr.price + (curr.shippingCost || 0) ? prev : curr))
      : null;
    
    supplierCols += `<td class="${winnerClass}">
      ${cheaper ? `<span style="color:var(--accent-cyan)">${cheaper.platform}</span> ($${cheaper.price})` : 'N/A'}
    </td>`;

    bestOptionCols += `<td class="${winnerClass}">
      ${isWinner ? '<span class="report-badge-status score-excellent" style="font-size:0.75rem; padding:0.3rem 0.6rem">🏆 MEJOR OPCIÓN</span>' : '<span style="color:var(--text-muted)">-</span>'}
    </td>`;
  });

  container.innerHTML = `
    <table class="comparator-table">
      <thead>
        <tr>${tableHeaderCols}</tr>
      </thead>
      <tbody>
        <tr>
          <td class="comparator-label-col">Product Score</td>
          ${scoreCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Costo de Compra</td>
          ${costCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Precio de Venta</td>
          ${retailCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Margen Neto</td>
          ${marginCols}
        </tr>
        <tr>
          <td class="comparator-label-col">ROI Estimado</td>
          ${roiCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Saturación del Mercado</td>
          ${saturationCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Tiempo de Envío Medio</td>
          ${shippingCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Proveedor más Económico</td>
          ${supplierCols}
        </tr>
        <tr>
          <td class="comparator-label-col">Veredicto</td>
          ${bestOptionCols}
        </tr>
      </tbody>
    </table>
  `;

  switchView('comparator-view');
}

// EXPORT PORTFOLIO JSON FILE
