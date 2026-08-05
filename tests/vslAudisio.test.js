import { describe, expect, it } from 'vitest';
import {
  AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
  AUDISIO_MIN_LAUNCH_VIDEOS,
  AUDISIO_VSL_DURATION_MAX_SEC,
  AUDISIO_VSL_DURATION_MIN_SEC,
} from '../src/config/audisioRules.js';
import {
  buildVslLaunchMarkdown,
  checklistStorageKey,
  formatVslScriptCopy,
  generateVslScripts,
  getLaunchChecklistItems,
  getProductionSpecs,
} from '../src/research/vslAudisio.js';

describe('generateVslScripts', () => {
  it('returns 3 Hook→Body→CTA scripts with Audisio duration hints', () => {
    const scripts = generateVslScripts({
      name: 'Collar LED Pet',
      retail: 29.99,
      avatarBrief: { painPoints: { p1: { name: 'paseos nocturnos inseguros' } } },
      offerBrief: { ums: 'luz visible a 200 m' },
    });
    expect(scripts).toHaveLength(3);
    expect(scripts.map((s) => s.id)).toEqual(['pain', 'proof', 'offer']);
    scripts.forEach((s) => {
      expect(s.hook.length).toBeGreaterThan(5);
      expect(s.body).toMatch(/Collar LED Pet/);
      expect(s.cta.toLowerCase()).toMatch(/compr|pide|envío/);
      expect(s.durationHint).toContain(String(AUDISIO_VSL_DURATION_MIN_SEC));
      expect(s.durationHint).toContain(String(AUDISIO_VSL_DURATION_MAX_SEC));
    });
  });

  it('falls back when report fields are missing', () => {
    const scripts = generateVslScripts({});
    expect(scripts[0].hook).toMatch(/PRODUCTO|problema/i);
    expect(formatVslScriptCopy(scripts[0])).toContain('HOOK');
    expect(formatVslScriptCopy(scripts[0])).toContain('ElevenLabs');
  });
});

describe('production specs & checklist', () => {
  it('exposes CapCut / Canva / voice specs', () => {
    const specs = getProductionSpecs();
    expect(specs.capcut).toMatch(/Montserrat/);
    expect(specs.canva).toMatch(/Poppins/);
    expect(specs.voice).toMatch(/1\.15/);
    expect(specs.disclaimer).toMatch(/Audisio/);
  });

  it('lists launch checklist with video minimum and beginner budget', () => {
    const items = getLaunchChecklistItems();
    expect(items.length).toBeGreaterThanOrEqual(6);
    expect(items.some((i) => i.label.includes(String(AUDISIO_MIN_LAUNCH_VIDEOS)))).toBe(true);
    expect(items.some((i) => i.label.includes(String(AUDISIO_LAUNCH_BUDGET_BEGINNER_USD)))).toBe(
      true,
    );
    expect(checklistStorageKey('Mi Producto')).toMatch(/^dropdeep_vsl_checklist_/);
  });
});

describe('buildVslLaunchMarkdown', () => {
  it('includes scripts and unchecked checklist for campaign kit export', () => {
    const md = buildVslLaunchMarkdown({ name: 'Test SKU', retail: 40 });
    expect(md).toContain('Kit VSL');
    expect(md).toContain('VSL 1');
    expect(md).toContain('- [ ]');
    expect(md).toContain('CapCut');
  });
});
