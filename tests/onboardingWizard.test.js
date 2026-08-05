/**
 * T13/T14 — onboarding copiloto path + wizard CTAs / borrador.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => {
      memory.set(key, String(value));
    },
    removeItem: (key) => {
      memory.delete(key);
    },
  });
  vi.stubGlobal('document', {
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
  });
  vi.resetModules();
});

describe('T13 research path default + setResearchPath', () => {
  it('default es copiloto', async () => {
    const { getResearchPath, RESEARCH_PATH_COPILOT, setResearchPath, RESEARCH_PATH_API } =
      await import('../src/config/researchPath.js');
    expect(getResearchPath()).toBe(RESEARCH_PATH_COPILOT);
    setResearchPath(RESEARCH_PATH_API);
    expect(getResearchPath()).toBe(RESEARCH_PATH_API);
    setResearchPath(RESEARCH_PATH_COPILOT);
    expect(getResearchPath()).toBe(RESEARCH_PATH_COPILOT);
  });

  it('focusCopilotSearch fuerza ruta copiloto', async () => {
    const { setResearchPath, RESEARCH_PATH_API, getResearchPath, RESEARCH_PATH_COPILOT } =
      await import('../src/config/researchPath.js');
    setResearchPath(RESEARCH_PATH_API);

    const { focusCopilotSearch } = await import('../src/ui/onboarding.js');
    focusCopilotSearch();
    expect(getResearchPath()).toBe(RESEARCH_PATH_COPILOT);
  });
});

describe('T14 wizard needs name + draft helper', () => {
  it('wizardNeedsProductName', async () => {
    const { wizardNeedsProductName, isPortfolioDraft } = await import(
      '../src/ui/firstProductWizard.js'
    );
    expect(wizardNeedsProductName('')).toBe(true);
    expect(wizardNeedsProductName('   ')).toBe(true);
    expect(wizardNeedsProductName('Rodillo jade')).toBe(false);
    expect(isPortfolioDraft({ fullReport: { _isDraft: true } })).toBe(true);
    expect(isPortfolioDraft({ fullReport: {} })).toBe(false);
  });
});
