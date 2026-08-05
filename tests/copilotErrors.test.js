/**
 * T17 — copiloto paste errors aligned with classifyGeminiError parse typing.
 */
import { describe, expect, it } from 'vitest';
import { classifyCopilotPasteError, classifyGeminiError } from '../src/research/errors.js';

describe('classifyCopilotPasteError (T17)', () => {
  it('marca JSON inválido/truncado como parse con título unificado', () => {
    const msg =
      'JSON inválido o truncado. Quita bloques ```json y pega solo el objeto. Reintentar.';
    const c = classifyCopilotPasteError(msg);
    expect(c.type).toBe('parse');
    expect(c.title).toMatch(/JSON ilegible|ilegible/i);
    expect(c.message).toBe(msg);
    expect(c.hint).toMatch(/ejemplo/i);
  });

  it('alineado con tipo parse de classifyGeminiError', () => {
    const api = classifyGeminiError(new Error('Unexpected token in JSON'));
    expect(api.type).toBe('parse');
    const copiloto = classifyCopilotPasteError('Unexpected token — JSON inválido');
    expect(copiloto.type).toBe('parse');
  });

  it('no reescribe tips de validación estructural (T06)', () => {
    const msg =
      'Falta el reporte base: se espera al menos "name" o "demographics" (p. ej. demographics.who). Abre «Ver ejemplo de JSON».';
    const c = classifyCopilotPasteError(msg);
    expect(c.type).toBe('validation');
    expect(c.message).toBe(msg);
    expect(c.title).toMatch(/incompleto|incorrecto/i);
  });

  it('vacío → empty', () => {
    const c = classifyCopilotPasteError('');
    expect(c.type).toBe('empty');
    expect(c.message).toMatch(/Pega la respuesta/i);
  });
});
