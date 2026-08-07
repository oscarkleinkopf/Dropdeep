import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import {
  initGeminiKeyBanner,
  onGeminiKeySaved,
  openSettingsModal,
  closeSettingsModal,
  populateSettingsForm,
  saveSettingsFromForm,
} from '../ui/geminiKeyBanner.js';
import { upsertProfilePrefs } from '../auth/profile.js';
import { cancelResearchSession } from '../research/researchSession.js';
import { hideTerminalModal } from '../research/gemini.js';

export function bindSettingsEvents() {
  initGeminiKeyBanner();
  populateSettingsForm();

  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsDot = document.getElementById('close-settings-dot');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsForm = document.getElementById('settings-form');

  settingsBtn.addEventListener('click', () => {
    populateSettingsForm();
    openSettingsModal();
  });

  const closeSettings = () => {
    closeSettingsModal();
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
      showToast('Configuración de API guardada correctamente.', 'success');
      onGeminiKeySaved();
      closeSettings();
    }
  });

  const closeTerminalDot = document.getElementById('close-terminal-dot');
  if (closeTerminalDot) {
    closeTerminalDot.addEventListener('click', () => {
      hideTerminalModal();
    });
  }

  const terminalCancelBtn = document.getElementById('terminal-cancel-btn');
  if (terminalCancelBtn) {
    terminalCancelBtn.addEventListener('click', () => {
      cancelResearchSession(true);
    });
  }
}
