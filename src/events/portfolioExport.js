import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { toggleSaveProduct, renderPortfolioList, openProductComparison } from '../ui/portfolio.js';
import {
  exportPortfolioJSON,
  exportReportToCSV,
  exportReportToMarkdown,
  exportCampaignKit,
  exportReportToShopifyCSV,
  exportReportToWooCommerceCSV,
} from '../ui/export.js';
import { switchView } from '../ui/navigation.js';

export function bindPortfolioExportEvents() {
  document.getElementById('save-report-btn').addEventListener('click', toggleSaveProduct);

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (state.currentReport) {
      exportReportToCSV(state.currentReport);
    } else {
      showToast('No hay un reporte activo para exportar.', 'error');
    }
  });

  const shopifyBtn = document.getElementById('export-shopify-csv-btn');
  if (shopifyBtn) {
    shopifyBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToShopifyCSV(state.currentReport);
      } else {
        showToast('No hay un reporte activo para exportar.', 'error');
      }
    });
  }

  const wooBtn = document.getElementById('export-woocommerce-csv-btn');
  if (wooBtn) {
    wooBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToWooCommerceCSV(state.currentReport);
      } else {
        showToast('No hay un reporte activo para exportar.', 'error');
      }
    });
  }

  document.getElementById('export-pdf-btn').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('export-portfolio-btn').addEventListener('click', exportPortfolioJSON);

  const portSearch = document.getElementById('portfolio-search-input');
  const portCat = document.getElementById('portfolio-category-filter');
  if (portSearch) {
    portSearch.addEventListener('input', renderPortfolioList);
  }
  if (portCat) {
    portCat.addEventListener('change', renderPortfolioList);
  }

  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', openProductComparison);
  }

  const closeCompBtn = document.getElementById('close-comparator-btn');
  if (closeCompBtn) {
    closeCompBtn.addEventListener('click', () => {
      switchView('portfolio-view');
    });
  }

  const exportMDBtn = document.getElementById('export-markdown-btn');
  if (exportMDBtn) {
    exportMDBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToMarkdown(state.currentReport);
      } else {
        showToast('No hay un reporte activo para exportar.', 'error');
      }
    });
  }

  const exportCampaignKitBtn = document.getElementById('export-campaign-kit-btn');
  if (exportCampaignKitBtn) {
    exportCampaignKitBtn.addEventListener('click', () => {
      exportCampaignKit(state.currentReport);
    });
  }
}
