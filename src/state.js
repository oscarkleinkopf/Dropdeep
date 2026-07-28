// Shared application state
export const state = {
  portfolio: JSON.parse(localStorage.getItem('dropdeep_portfolio')) || [],
  currentReport: null,
  activeView: 'dashboard-view',
  activeReportTab: 'section-demographics',
  activePortfolioId: null,
  scannedQueue: [],
  selectedMetaInterests: [],
  outputLanguage: localStorage.getItem('dropdeep_gemini_language') || 'es'
};
