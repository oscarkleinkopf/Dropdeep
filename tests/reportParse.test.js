import { describe, expect, it } from 'vitest';
import {
  applyStepToReport,
  assembleCopilotReport,
  parseAndValidateStep,
  parseResearchJson,
  validateStepPayload,
} from '../src/research/reportParse.js';
import { COPILOT_STEPS } from '../src/research/reportSchema.js';

describe('parseResearchJson', () => {
  it('parses plain JSON objects', () => {
    const parsed = parseResearchJson('{"name":"Cable mag","demographics":{"who":"x"}}');
    expect(parsed.name).toBe('Cable mag');
  });

  it('strips markdown fences before parsing', () => {
    const raw = '```json\n{"name":"Producto","headlines":["A"]}\n```';
    expect(parseResearchJson(raw).name).toBe('Producto');
  });

  it('throws on empty paste', () => {
    expect(() => parseResearchJson('   ')).toThrow(/vacía/i);
  });
});

describe('validateStepPayload', () => {
  it('rejects non-objects', () => {
    expect(() => validateStepPayload(COPILOT_STEPS.BASE_REPORT, [])).toThrow(/objeto JSON/i);
  });

  it('requires name or demographics for BASE_REPORT', () => {
    expect(() => validateStepPayload(COPILOT_STEPS.BASE_REPORT, { cost: 10 })).toThrow(
      /name|demographics/i
    );
  });

  it('accepts BASE_REPORT with demographics', () => {
    expect(validateStepPayload(COPILOT_STEPS.BASE_REPORT, { demographics: { who: 'x' } })).toBe(
      true
    );
  });

  it('requires general object for AVATAR_BRIEF', () => {
    expect(() => validateStepPayload(COPILOT_STEPS.AVATAR_BRIEF, { age: 30 })).toThrow(/general/i);
  });

  it('requires adCopy or headlines for ALL_IN_ONE after base fields', () => {
    expect(() =>
      validateStepPayload(COPILOT_STEPS.ALL_IN_ONE, { name: 'X' })
    ).toThrow(/adCopy|headlines/i);
  });

  it('accepts express ALL_IN_ONE payload', () => {
    expect(
      validateStepPayload(COPILOT_STEPS.ALL_IN_ONE, {
        name: 'X',
        demographics: { who: 'y' },
        headlines: ['Hook'],
      })
    ).toBe(true);
  });
});

describe('applyStepToReport + assembleCopilotReport', () => {
  it('applies BASE_REPORT fields and nested demographics from the step payload', () => {
    const next = applyStepToReport(
      { demographics: { who: 'old', belief: 'keep' }, name: 'A' },
      COPILOT_STEPS.BASE_REPORT,
      { demographics: { who: 'new', belief: 'updated' }, cost: 12 }
    );
    expect(next.demographics.who).toBe('new');
    expect(next.demographics.belief).toBe('updated');
    expect(next.cost).toBe(12);
    expect(next.name).toBe('A');
  });

  it('stores AVATAR_BRIEF under avatarBrief', () => {
    const next = applyStepToReport({}, COPILOT_STEPS.AVATAR_BRIEF, {
      general: { age: '30' },
    });
    expect(next.avatarBrief.general.age).toBe('30');
  });

  it('marks express mode when assembling with _fastMarketing', () => {
    const report = assembleCopilotReport(
      {
        name: 'Widget',
        demographics: { who: 'buyer' },
        _fastMarketing: { headlines: ['H1'], adCopy: { facebook: [], tiktok: [] } },
      },
      { fastMode: false, expressMode: true, competitorUrl: '', productName: 'Widget' }
    );
    expect(report._researchMode).toBe('express');
    expect(report._source).toBe('copilot');
    expect(report._fastMarketing).toBeUndefined();
  });
});

describe('parseAndValidateStep', () => {
  it('parses markdown + validates in one call', () => {
    const parsed = parseAndValidateStep(
      COPILOT_STEPS.FAST_MARKETING,
      '```json\n{"adCopy":{"facebook":["a"],"tiktok":[]}}\n```'
    );
    expect(parsed.adCopy.facebook).toEqual(['a']);
  });
});
