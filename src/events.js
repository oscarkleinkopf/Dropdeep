import { state } from './state.js';
import { showToast } from './utils/toast.js';
import { switchView } from './ui/navigation.js';
import { runResearchDirect, runCopilotResearch, runManualEvaluationFlow } from './research/flow.js';
import { switchReportTab } from './ui/report.js';
import { toggleSaveProduct, renderPortfolioList, openProductComparison } from './ui/portfolio.js';
import { exportPortfolioJSON, exportReportToCSV, exportReportToMarkdown, exportCampaignKit, exportReportToShopifyCSV, exportReportToWooCommerceCSV } from './ui/export.js';
import {
  promptHubState,
  renderPromptHubOutput,
  updatePromptBoxContent,
  setPromptHubMode,
  setActiveVerticalPack,
} from './ui/promptHub.js';
import { runCompetitorStoreScan, renderMetaHiddenInterests } from './ui/spy.js';
import { showMetaAdsAuditPanel } from './ui/metaAdsAuditPanel.js';
import { initGeminiKeyBanner, onGeminiKeySaved, openSettingsModal, populateSettingsForm, saveSettingsFromForm } from './ui/geminiKeyBanner.js';
import { updateOnboardingPanel, markPromptHubDone } from './ui/onboarding.js';
import { upsertProfilePrefs } from './auth/profile.js';
import { cancelResearchSession } from './research/researchSession.js';

export function setupEventListeners() {
  document.addEventListener('dropdeep:prompt-copied', () => {
    markPromptHubDone();
    updateOnboardingPanel();
  });
  initGeminiKeyBanner();

  // Navigation Routing
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switchView(target);
    });
  });

  // Logo button returns to dashboard
  document.getElementById('logo-btn').addEventListener('click', () => {
    switchView('dashboard-view');
  });

  // Empty portfolio CTA → dashboard search
  document.getElementById('empty-portfolio-cta')?.addEventListener('click', () => {
    switchView('dashboard-view');
    document.getElementById('search-input')?.focus();
  });

  // Spy empty state → dashboard
  document.getElementById('spy-empty-dashboard-cta')?.addEventListener('click', () => {
    switchView('dashboard-view');
  });

  // Custom Search Form Submit
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    const competitorUrl = document.getElementById('competitor-input') ? document.getElementById('competitor-input').value.trim() : '';
    if (query) {
      runResearchDirect(query, competitorUrl);
    }
  });

  document.getElementById('manual-eval-cta-btn')?.addEventListener('click', () => {
    const query = document.getElementById('search-input')?.value.trim() || '';
    runManualEvaluationFlow(query);
  });

  // Suggestion Tags
  document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      const query = e.target.textContent;
      document.getElementById('search-input').value = query;
      const competitorUrl = document.getElementById('competitor-input') ? document.getElementById('competitor-input').value.trim() : '';
      runResearchDirect(query, competitorUrl);
    });
  });

  // Report Back Button
  document.getElementById('close-report-btn').addEventListener('click', () => {
    switchView('dashboard-view');
  });

  // Report Tab Switching (Sidebar)
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.sidebar-tab-btn');
    if (tabBtn) {
      const targetSection = tabBtn.getAttribute('data-section');
      switchReportTab(targetSection);
    }
  });

  // Save to Portfolio Button
  document.getElementById('save-report-btn').addEventListener('click', toggleSaveProduct);

  // CSV Export Button
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (state.currentReport) {
      exportReportToCSV(state.currentReport);
    } else {
      showToast("No hay un reporte activo para exportar.", "error");
    }
  });

  // Shopify CSV Export Button
  const shopifyBtn = document.getElementById('export-shopify-csv-btn');
  if (shopifyBtn) {
    shopifyBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToShopifyCSV(state.currentReport);
      } else {
        showToast("No hay un reporte activo para exportar.", "error");
      }
    });
  }

  // WooCommerce CSV Export Button
  const wooBtn = document.getElementById('export-woocommerce-csv-btn');
  if (wooBtn) {
    wooBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToWooCommerceCSV(state.currentReport);
      } else {
        showToast("No hay un reporte activo para exportar.", "error");
      }
    });
  }

  // PDF Export Button
  document.getElementById('export-pdf-btn').addEventListener('click', () => {
    window.print();
  });

  // Export Portfolio JSON
  document.getElementById('export-portfolio-btn').addEventListener('click', exportPortfolioJSON);

  // Subtab switching in Espionaje Competitivo
  const subtabCompBtn = document.getElementById('subtab-competitor-btn');
  const subtabMetaBtn = document.getElementById('subtab-meta-btn');
  const subtabAuditBtn = document.getElementById('subtab-meta-audit-btn');
  const subtabCompPanel = document.getElementById('subtab-competitor-panel');
  const subtabMetaPanel = document.getElementById('subtab-meta-panel');
  const subtabAuditPanel = document.getElementById('subtab-meta-audit-panel');

  const styleSpySubtab = (activeBtn) => {
    [subtabCompBtn, subtabMetaBtn, subtabAuditBtn].forEach((btn) => {
      if (!btn) return;
      const on = btn === activeBtn;
      btn.style.borderColor = on ? 'var(--accent-cyan)' : 'var(--border-color)';
      btn.style.color = on ? 'var(--accent-cyan)' : 'var(--text-secondary)';
    });
    subtabCompPanel?.classList.toggle('hidden', activeBtn !== subtabCompBtn);
    subtabMetaPanel?.classList.toggle('hidden', activeBtn !== subtabMetaBtn);
    subtabAuditPanel?.classList.toggle('hidden', activeBtn !== subtabAuditBtn);
  };

  if (subtabCompBtn && subtabMetaBtn) {
    subtabCompBtn.addEventListener('click', () => styleSpySubtab(subtabCompBtn));

    subtabMetaBtn.addEventListener('click', () => {
      styleSpySubtab(subtabMetaBtn);
      renderMetaHiddenInterests();
    });
  }

  if (subtabAuditBtn) {
    subtabAuditBtn.addEventListener('click', () => {
      styleSpySubtab(subtabAuditBtn);
      showMetaAdsAuditPanel();
    });
  }

  // Competitor URL Scan Button
  const runCompScanBtn = document.getElementById('run-competitor-analysis-btn');
  if (runCompScanBtn) {
    runCompScanBtn.addEventListener('click', () => {
      const urlInput = document.getElementById('competitor-url-analysis-input');
      const url = urlInput ? urlInput.value.trim() : '';
      runCompetitorStoreScan(url);
    });
  }

  // Meta Hidden Interests Search Input & Category Chips
  const metaSearchInput = document.getElementById('meta-interest-search-input');
  if (metaSearchInput) {
    metaSearchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      const activeChip = document.querySelector('#meta-category-chips .tag-chip.active');
      const cat = activeChip ? activeChip.getAttribute('data-category') : 'all';
      renderMetaHiddenInterests(query, cat);
    });
  }

  const categoryChips = document.querySelectorAll('#meta-category-chips .tag-chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      categoryChips.forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      const cat = e.target.getAttribute('data-category');
      const query = metaSearchInput ? metaSearchInput.value : '';
      renderMetaHiddenInterests(query, cat);
    });
  });

  // Copy Selected Meta Interests Button
  const copyMetaBtn = document.getElementById('copy-selected-interests-btn');
  if (copyMetaBtn) {
    copyMetaBtn.addEventListener('click', () => {
      if (state.selectedMetaInterests.length === 0) return;
      const formattedText = state.selectedMetaInterests.join(', ');
      navigator.clipboard.writeText(formattedText).then(() => {
        showToast(`${state.selectedMetaInterests.length} intereses copiados al portapapeles.`, "success");
      });
    });
  }

  // Settings Modal Open/Close & Form Handler
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsDot = document.getElementById('close-settings-dot');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsForm = document.getElementById('settings-form');
  populateSettingsForm();

  settingsBtn.addEventListener('click', () => {
    populateSettingsForm();
    openSettingsModal();
  });

  const closeSettings = () => {
    settingsModal.classList.add('hidden');
  };
  closeSettingsDot.addEventListener('click', closeSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const saved = saveSettingsFromForm();
    if (saved) {
      state.outputLanguage = saved.lang;
      upsertProfilePrefs({
        model: saved.model,
        language: saved.lang,
        grounding: saved.grounding,
      }).catch(() => { /* offline / table not migrated yet */ });
      showToast("Configuración de API guardada correctamente.", "success");
      onGeminiKeySaved();
      closeSettings();
    }
  });

  // Portfolio search and category filters
  const portSearch = document.getElementById('portfolio-search-input');
  const portCat = document.getElementById('portfolio-category-filter');
  if (portSearch) {
    portSearch.addEventListener('input', renderPortfolioList);
  }
  if (portCat) {
    portCat.addEventListener('change', renderPortfolioList);
  }

  // Compare Button
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', openProductComparison);
  }

  // Close Comparator View Button
  const closeCompBtn = document.getElementById('close-comparator-btn');
  if (closeCompBtn) {
    closeCompBtn.addEventListener('click', () => {
      switchView('portfolio-view');
    });
  }

  // Export Markdown Button
  const exportMDBtn = document.getElementById('export-markdown-btn');
  if (exportMDBtn) {
    exportMDBtn.addEventListener('click', () => {
      if (state.currentReport) {
        exportReportToMarkdown(state.currentReport);
      } else {
        showToast("No hay un reporte activo para exportar.", "error");
      }
    });
  }

  const exportCampaignKitBtn = document.getElementById('export-campaign-kit-btn');
  if (exportCampaignKitBtn) {
    exportCampaignKitBtn.addEventListener('click', () => {
      exportCampaignKit(state.currentReport);
    });
  }

  // Prompt Hub mode tabs (master vs vertical packs)
  document.querySelectorAll('.prompt-hub-mode-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.getAttribute('data-hub-mode') || 'master';
      setPromptHubMode(mode);
      if (mode === 'packs') {
        markPromptHubDone();
        updateOnboardingPanel();
      }
    });
  });

  document.querySelectorAll('.vertical-pack-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const verticalId = tab.getAttribute('data-vertical-id');
      if (verticalId) setActiveVerticalPack(verticalId);
    });
  });

  // Close Terminal Dot listener (hide modal only — use Cancel to abort API)
  const closeTerminalDot = document.getElementById('close-terminal-dot');
  if (closeTerminalDot) {
    closeTerminalDot.addEventListener('click', () => {
      document.getElementById('terminal-modal').classList.add('hidden');
    });
  }

  const terminalCancelBtn = document.getElementById('terminal-cancel-btn');
  if (terminalCancelBtn) {
    terminalCancelBtn.addEventListener('click', () => {
      cancelResearchSession(true);
    });
  }

  // Quick Prompt Button on Dashboard Search Form
  const quickPromptBtn = document.getElementById('quick-prompt-btn');
  if (quickPromptBtn) {
    quickPromptBtn.addEventListener('click', () => {
      const searchInput = document.getElementById('search-input');
      const compInput = document.getElementById('competitor-input');
      const pName = searchInput ? searchInput.value.trim() : '';
      const cUrl = compInput ? compInput.value.trim() : '';

      if (!pName) {
        showToast("Ingresa el nombre del producto primero.", "info");
        if (searchInput) searchInput.focus();
        return;
      }

      // Populate Prompt Hub form
      const hubProductInput = document.getElementById('prompt-product-input');
      const hubCompInput = document.getElementById('prompt-competitor-input');
      if (hubProductInput) hubProductInput.value = pName;
      if (hubCompInput) hubCompInput.value = cUrl;

      // Switch view & generate
      switchView('prompt-hub-view');

      renderPromptHubOutput();
      markPromptHubDone();
      updateOnboardingPanel();
      showToast("Prompts maestros generados para " + pName, "success");
    });
  }

  // Prompt Hub Form Generate Button
  const generatePromptsBtn = document.getElementById('generate-prompts-btn');
  if (generatePromptsBtn) {
    generatePromptsBtn.addEventListener('click', () => {
      renderPromptHubOutput();
      markPromptHubDone();
      updateOnboardingPanel();
      showToast("Secuencia de prompts actualizada", "success");
    });
  }

  // Prompt Hub Step Tabs
  const promptTabBtns = document.querySelectorAll('.prompt-tab-btn');
  promptTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      promptTabBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const step = parseInt(e.currentTarget.getAttribute('data-prompt-step')) || 1;
      promptHubState.activeStep = step;
      updatePromptBoxContent();
    });
  });

  // Copy Single Prompt Button
  const copySinglePromptBtn = document.getElementById('copy-single-prompt-btn');
  if (copySinglePromptBtn) {
    copySinglePromptBtn.addEventListener('click', () => {
      if (!promptHubState.promptData) {
        renderPromptHubOutput();
      }
      const activeText = promptHubState.promptData['step' + promptHubState.activeStep];
      if (activeText) {
        navigator.clipboard.writeText(activeText).then(() => {
          showToast(`Prompt de la Fase ${promptHubState.activeStep} copiado al portapapeles.`, "success");
          markPromptHubDone();
          updateOnboardingPanel();
        });
      }
    });
  }

  // Copy All Prompts Button
  const copyAllPromptsBtn = document.getElementById('copy-all-prompts-btn');
  if (copyAllPromptsBtn) {
    copyAllPromptsBtn.addEventListener('click', () => {
      if (!promptHubState.promptData) {
        renderPromptHubOutput();
      }
      const allText = promptHubState.promptData.allInOne;
      if (allText) {
        navigator.clipboard.writeText(allText).then(() => {
          showToast("Mega System Prompt Completo (All-in-One) copiado al portapapeles.", "success");
          markPromptHubDone();
          updateOnboardingPanel();
        });
      }
    });
  }
}
