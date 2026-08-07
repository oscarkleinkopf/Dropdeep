/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboardWithFeedback } from '../src/ui/clipboard.js';

describe('copyToClipboardWithFeedback', () => {
  let writeText;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.lucide = { createIcons: vi.fn() };
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('copies text and shows ¡Copiado! with check for 2s then restores', async () => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i data-lucide="copy"></i> Copiar Prompt';
    document.body.appendChild(btn);

    const ok = await copyToClipboardWithFeedback(btn, 'hola mundo');
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hola mundo');
    expect(btn.textContent).toContain('¡Copiado!');
    expect(btn.querySelector('[data-lucide="check"]')).toBeTruthy();
    expect(btn.classList.contains('btn-copy-success')).toBe(true);
    expect(lucide.createIcons).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2000);

    expect(btn.innerHTML).toContain('data-lucide="copy"');
    expect(btn.textContent).toContain('Copiar Prompt');
    expect(btn.classList.contains('btn-copy-success')).toBe(false);
  });

  it('returns false and keeps original UI when clipboard fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const btn = document.createElement('button');
    btn.innerHTML = 'Copiar';
    const ok = await copyToClipboardWithFeedback(btn, 'x');
    expect(ok).toBe(false);
    expect(btn.innerHTML).toBe('Copiar');
  });
});
