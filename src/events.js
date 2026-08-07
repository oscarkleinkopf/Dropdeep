import { bindNavigationEvents } from './events/navigation.js';
import { bindPortfolioExportEvents } from './events/portfolioExport.js';
import { bindSpyEvents } from './events/spy.js';
import { bindSettingsEvents } from './events/settings.js';
import { bindPromptHubEvents } from './events/promptHub.js';

/** Wire UI event listeners. Split across src/events/* (T66). */
export function setupEventListeners() {
  bindPromptHubEvents();
  bindSettingsEvents();
  bindNavigationEvents();
  bindPortfolioExportEvents();
  bindSpyEvents();
}
