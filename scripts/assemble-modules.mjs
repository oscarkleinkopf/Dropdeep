import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function readRaw(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';
}

function exportFunctions(code) {
  return code
    .replace(/^(async )?function /gm, 'export $1function ')
    .replace(/^let promptHubState/m, 'export let promptHubState');
}

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\n+$/, '\n'), 'utf8');
  console.log('wrote', rel);
}

// --- state ---
write('state.js', `// Shared application state
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
`);

// --- utils ---
write('utils/toast.js', exportFunctions(readRaw('utils/toast.raw.js')));

write('utils/json.js', exportFunctions(readRaw('utils/json.raw.js')));

write(
  'research/cache.js',
  exportFunctions(readRaw('research/cache.raw.js'))
);

write(
  'research/scoring.js',
  exportFunctions(readRaw('research/scoring.raw.js'))
);

write(
  'ui/navigation.js',
`import { state } from '../state.js';
import { renderPortfolioList } from './portfolio.js';
import { renderMetaHiddenInterests } from './spy.js';

${exportFunctions(readRaw('ui/navigation.raw.js'))}`
);

write(
  'ui/promptHub.js',
`import { state } from '../state.js';

${exportFunctions(readRaw('ui/promptHub.raw.js'))}`
);

write(
  'ui/feed.js',
`import { automatedProducts } from '../data/products.js';
import { runDeepResearchSequence } from '../research/flow.js';

${exportFunctions(readRaw('ui/feed.raw.js'))}`
);

write(
  'ui/charts.js',
`let trendChartInstance = null;
let sentimentChartInstance = null;
let projectionChartInstance = null;

${exportFunctions(readRaw('ui/charts.raw.js'))}`
);

write(
  'ui/export.js',
`import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { calculateProductScore } from '../research/scoring.js';

${exportFunctions(readRaw('ui/export.raw.js'))}`
);

write(
  'ui/portfolio.js',
`import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import { openDeepResearchReport } from './report.js';
import { calculateProductScore } from '../research/scoring.js';

${exportFunctions(readRaw('ui/portfolio.raw.js'))}`
);

write(
  'ui/spy.js',
`import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { metaHiddenInterestsDatabase } from '../data/metaInterests.js';
import { generateCompetitorStoreAnalysis } from '../data/competitorAnalysis.js';

${exportFunctions(readRaw('ui/spy.raw.js'))}`
);

write(
  'research/flow.js',
`import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getCacheEntry } from './cache.js';
import { openDeepResearchReport } from '../ui/report.js';
import { runRealResearchSequence } from './gemini.js';

${exportFunctions(readRaw('research/flow.raw.js'))}`
);

write(
  'research/gemini.js',
`import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { cleanAndParseJSON } from '../utils/json.js';
import { openDeepResearchReport } from '../ui/report.js';
import { runSimulatedResearchSequence } from './flow.js';

${exportFunctions(readRaw('research/gemini.raw.js'))}`
);

// Strip trailing chart comment from report raw
const reportBody = readRaw('ui/report.raw.js')
  .replace(/\n\/\/ Chart\.js - Line Trend Initialization\n?$/, '\n');

write(
  'ui/report.js',
`import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import { setCacheEntry } from '../research/cache.js';
import { calculateProductScore } from '../research/scoring.js';
import { sanitizeReport } from '../research/gemini.js';
import { generateDeepResearchReport } from '../data/reportGenerator.js';
import { generateMasterPromptSequence } from './promptHub.js';
import { runApiResearchDirect } from '../research/flow.js';
import { initTrendChart, initSentimentChart, initProjectionChart } from './charts.js';

${exportFunctions(reportBody)}`
);

write(
  'events.js',
`import { state } from './state.js';
import { showToast } from './utils/toast.js';
import { switchView } from './ui/navigation.js';
import { runDeepResearchSequence } from './research/flow.js';
import { switchReportTab } from './ui/report.js';
import { toggleSaveProduct, renderPortfolioList, openProductComparison } from './ui/portfolio.js';
import { exportPortfolioJSON, exportReportToCSV, exportReportToMarkdown } from './ui/export.js';
import { promptHubState, renderPromptHubOutput, updatePromptBoxContent } from './ui/promptHub.js';
import { runCompetitorStoreScan, renderMetaHiddenInterests } from './ui/spy.js';

${exportFunctions(readRaw('events.raw.js'))}`
);

write(
  'main.js',
`import { renderAutomatedFeed, runTrendScannerSimulation } from './ui/feed.js';
import { updatePortfolioBadge } from './ui/portfolio.js';
import { setupEventListeners } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderAutomatedFeed();
  updatePortfolioBadge();
  setupEventListeners();
  runTrendScannerSimulation();
});
`
);

console.log('Assembly complete');
