import { showToast } from '../utils/toast.js';
import { switchView } from '../ui/navigation.js';
import {
  promptHubState,
  renderPromptHubOutput,
  updatePromptBoxContent,
  setPromptHubMode,
  setActiveVerticalPack,
} from '../ui/promptHub.js';
import { updateOnboardingPanel, markPromptHubDone } from '../ui/onboarding.js';

export function bindPromptHubEvents() {
  document.addEventListener('dropdeep:prompt-copied', () => {
    markPromptHubDone();
    updateOnboardingPanel();
  });

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

  const quickPromptBtn = document.getElementById('quick-prompt-btn');
  if (quickPromptBtn) {
    quickPromptBtn.addEventListener('click', () => {
      const searchInput = document.getElementById('search-input');
      const compInput = document.getElementById('competitor-input');
      const pName = searchInput ? searchInput.value.trim() : '';
      const cUrl = compInput ? compInput.value.trim() : '';

      if (!pName) {
        showToast('Ingresa el nombre del producto primero.', 'info');
        if (searchInput) searchInput.focus();
        return;
      }

      const hubProductInput = document.getElementById('prompt-product-input');
      const hubCompInput = document.getElementById('prompt-competitor-input');
      if (hubProductInput) hubProductInput.value = pName;
      if (hubCompInput) hubCompInput.value = cUrl;

      switchView('prompt-hub-view');

      renderPromptHubOutput();
      markPromptHubDone();
      updateOnboardingPanel();
      showToast('Prompts maestros generados para ' + pName, 'success');
    });
  }

  const generatePromptsBtn = document.getElementById('generate-prompts-btn');
  if (generatePromptsBtn) {
    generatePromptsBtn.addEventListener('click', () => {
      renderPromptHubOutput();
      markPromptHubDone();
      updateOnboardingPanel();
      showToast('Secuencia de prompts actualizada', 'success');
    });
  }

  const promptTabBtns = document.querySelectorAll('.prompt-tab-btn');
  promptTabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      promptTabBtns.forEach((b) => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const step = parseInt(e.currentTarget.getAttribute('data-prompt-step'), 10) || 1;
      promptHubState.activeStep = step;
      updatePromptBoxContent();
    });
  });

  const copySinglePromptBtn = document.getElementById('copy-single-prompt-btn');
  if (copySinglePromptBtn) {
    copySinglePromptBtn.addEventListener('click', () => {
      if (!promptHubState.promptData) {
        renderPromptHubOutput();
      }
      const activeText = promptHubState.promptData['step' + promptHubState.activeStep];
      if (activeText) {
        navigator.clipboard.writeText(activeText).then(() => {
          showToast(`Prompt de la Fase ${promptHubState.activeStep} copiado al portapapeles.`, 'success');
          markPromptHubDone();
          updateOnboardingPanel();
        });
      }
    });
  }

  const copyAllPromptsBtn = document.getElementById('copy-all-prompts-btn');
  if (copyAllPromptsBtn) {
    copyAllPromptsBtn.addEventListener('click', () => {
      if (!promptHubState.promptData) {
        renderPromptHubOutput();
      }
      const allText = promptHubState.promptData.allInOne;
      if (allText) {
        navigator.clipboard.writeText(allText).then(() => {
          showToast('Mega System Prompt Completo (All-in-One) copiado al portapapeles.', 'success');
          markPromptHubDone();
          updateOnboardingPanel();
        });
      }
    });
  }
}
