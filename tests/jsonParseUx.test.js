import { describe, expect, it } from 'vitest';
import { formatJsonParseError, cleanAndParseJSON } from '../src/utils/json.js';
import {
  parseResearchJson,
  validateStepPayload,
} from '../src/research/reportParse.js';
import { COPILOT_STEPS, getCopilotStepJsonExample } from '../src/research/reportSchema.js';

describe('formatJsonParseError (T06)', () => {
  it('suggests removing markdown fences', () => {
    const msg = formatJsonParseError(new SyntaxError('Unexpected token'), '```json\n{');
    expect(msg).toMatch(/```json/i);
    expect(msg).toMatch(/Reintentar/);
  });

  it('flags truncated JSON', () => {
    const msg = formatJsonParseError(new SyntaxError('Unexpected end of JSON input'), '{');
    expect(msg).toMatch(/truncado/i);
  });
});

describe('cleanAndParseJSON truncation (T06)', () => {
  it('rejects lone opening brace as truncated (not empty object)', () => {
    expect(() => cleanAndParseJSON('{')).toThrow(/truncado/i);
  });
});

describe('parseResearchJson actionable errors', () => {
  it('surfaces truncation tip for incomplete paste', () => {
    expect(() => parseResearchJson('{')).toThrow(/truncado|Reintentar/i);
  });
});

describe('validateStepPayload field tips (T06)', () => {
  it('cites demographics when base report lacks required keys', () => {
    expect(() => validateStepPayload(COPILOT_STEPS.BASE_REPORT, { cost: 10 })).toThrow(
      /demographics\.who|name"|Ver ejemplo/i,
    );
  });
});

describe('getCopilotStepJsonExample', () => {
  it('returns parseable minimal example for express step', () => {
    const raw = getCopilotStepJsonExample(COPILOT_STEPS.ALL_IN_ONE);
    const parsed = JSON.parse(raw);
    expect(validateStepPayload(COPILOT_STEPS.ALL_IN_ONE, parsed)).toBe(true);
  });

  it('returns parseable minimal example for BASE_REPORT', () => {
    const parsed = JSON.parse(getCopilotStepJsonExample(COPILOT_STEPS.BASE_REPORT));
    expect(validateStepPayload(COPILOT_STEPS.BASE_REPORT, parsed)).toBe(true);
  });
});
