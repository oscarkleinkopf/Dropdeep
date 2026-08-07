import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { runCompetitorStoreScan, renderMetaHiddenInterests } from '../ui/spy.js';
import { showMetaAdsAuditPanel } from '../ui/metaAdsAuditPanel.js';

export function bindSpyEvents() {
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

  const runCompScanBtn = document.getElementById('run-competitor-analysis-btn');
  if (runCompScanBtn) {
    runCompScanBtn.addEventListener('click', () => {
      const urlInput = document.getElementById('competitor-url-analysis-input');
      const url = urlInput ? urlInput.value.trim() : '';
      runCompetitorStoreScan(url);
    });
  }

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
  categoryChips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      categoryChips.forEach((c) => c.classList.remove('active'));
      e.target.classList.add('active');
      const cat = e.target.getAttribute('data-category');
      const query = metaSearchInput ? metaSearchInput.value : '';
      renderMetaHiddenInterests(query, cat);
    });
  });

  const copyMetaBtn = document.getElementById('copy-selected-interests-btn');
  if (copyMetaBtn) {
    copyMetaBtn.addEventListener('click', () => {
      if (state.selectedMetaInterests.length === 0) return;
      const formattedText = state.selectedMetaInterests.join(', ');
      navigator.clipboard.writeText(formattedText).then(() => {
        showToast(`${state.selectedMetaInterests.length} intereses copiados al portapapeles.`, 'success');
      });
    });
  }
}
