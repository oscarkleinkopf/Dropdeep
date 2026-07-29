import { state } from './state.js';
import { showToast } from './utils/toast.js';
import { switchView } from './ui/navigation.js';
import { runDeepResearchSequence, runPendingSimulation } from './research/flow.js';
import { switchReportTab } from './ui/report.js';
import { toggleSaveProduct, renderPortfolioList, openProductComparison } from './ui/portfolio.js';
import { exportPortfolioJSON, exportReportToCSV, exportReportToMarkdown } from './ui/export.js';
import { promptHubState, renderPromptHubOutput, updatePromptBoxContent } from './ui/promptHub.js';
import { runCompetitorStoreScan, renderMetaHiddenInterests } from './ui/spy.js';
import { initGeminiKeyBanner, onGeminiKeySaved, openSettingsModal, populateSettingsForm, saveSettingsFromForm } from './ui/geminiKeyBanner.js';
import { updateOnboardingPanel } from './ui/onboarding.js';
import { isAuthConfigured, isAuthenticated } from './auth/auth.js';
import { openAuthModal } from './ui/authModal.js';
import { upsertProfilePrefs } from './auth/profile.js';

export function setupEventListeners() {
  initGeminiKeyBanner(runPendingSimulation);

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
      runDeepResearchSequence(query, competitorUrl);
    }
  });

  // Suggestion Tags
  document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      const query = e.target.textContent;
      document.getElementById('search-input').value = query;
      const competitorUrl = document.getElementById('competitor-input') ? document.getElementById('competitor-input').value.trim() : '';
      runDeepResearchSequence(query, competitorUrl);
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

  // PDF Export Button
  document.getElementById('export-pdf-btn').addEventListener('click', () => {
    window.print();
  });

  // Export Portfolio JSON
  document.getElementById('export-portfolio-btn').addEventListener('click', exportPortfolioJSON);

  // Subtab switching in Espionaje Competitivo
  const subtabCompBtn = document.getElementById('subtab-competitor-btn');
  const subtabMetaBtn = document.getElementById('subtab-meta-btn');
  const subtabCompPanel = document.getElementById('subtab-competitor-panel');
  const subtabMetaPanel = document.getElementById('subtab-meta-panel');

  if (subtabCompBtn && subtabMetaBtn) {
    subtabCompBtn.addEventListener('click', () => {
      subtabCompBtn.style.borderColor = "var(--accent-cyan)";
      subtabCompBtn.style.color = "var(--accent-cyan)";
      subtabMetaBtn.style.borderColor = "var(--border-color)";
      subtabMetaBtn.style.color = "var(--text-secondary)";
      subtabCompPanel.classList.remove('hidden');
      subtabMetaPanel.classList.add('hidden');
    });

    subtabMetaBtn.addEventListener('click', () => {
      subtabMetaBtn.style.borderColor = "var(--accent-cyan)";
      subtabMetaBtn.style.color = "var(--accent-cyan)";
      subtabCompBtn.style.borderColor = "var(--border-color)";
      subtabCompBtn.style.color = "var(--text-secondary)";
      subtabMetaPanel.classList.remove('hidden');
      subtabCompPanel.classList.add('hidden');
      renderMetaHiddenInterests();
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
    if (isAuthConfigured && !isAuthenticated()) {
      openAuthModal('login');
      showToast('Inicia sesión para guardar tu clave API.', 'info');
      return;
    }
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

  // Close Terminal Dot listener (to allow canceling/closing terminal)
  const closeTerminalDot = document.getElementById('close-terminal-dot');
  if (closeTerminalDot) {
    closeTerminalDot.addEventListener('click', () => {
      document.getElementById('terminal-modal').classList.add('hidden');
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
      showToast("Prompts maestros generados para " + pName, "success");
    });
  }

  // Prompt Hub Form Generate Button
  const generatePromptsBtn = document.getElementById('generate-prompts-btn');
  if (generatePromptsBtn) {
    generatePromptsBtn.addEventListener('click', () => {
      renderPromptHubOutput();
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
        });
      }
    });
  }
}
