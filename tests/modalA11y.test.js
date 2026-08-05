/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetModalA11yStackForTests,
  bindModalA11y,
  getFocusableElements,
} from '../src/utils/modalA11y.js';

beforeEach(() => {
  document.body.innerHTML = `
    <button id="open-btn">Abrir</button>
    <div id="dlg" class="terminal-overlay" role="dialog" aria-modal="true" aria-label="Prueba">
      <button id="first">Primero</button>
      <input id="mid" type="text" />
      <button id="last">Último</button>
    </div>
  `;
  __resetModalA11yStackForTests();
});

afterEach(() => {
  __resetModalA11yStackForTests();
  document.body.innerHTML = '';
});

describe('bindModalA11y (T23)', () => {
  it('lista focusables visibles', () => {
    const dlg = document.getElementById('dlg');
    expect(getFocusableElements(dlg).map((n) => n.id)).toEqual(['first', 'mid', 'last']);
  });

  it('Escape llama onClose', () => {
    const onClose = vi.fn();
    const dlg = document.getElementById('dlg');
    bindModalA11y(dlg, { onClose, initialFocus: '#first' });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Tab desde el último vuelve al primero', () => {
    const dlg = document.getElementById('dlg');
    bindModalA11y(dlg, { onClose: () => {}, initialFocus: '#last' });
    const last = document.getElementById('last');
    last.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement?.id).toBe('first');
  });

  it('release restaura el foco previo', async () => {
    const openBtn = document.getElementById('open-btn');
    openBtn.focus();
    const dlg = document.getElementById('dlg');
    const release = bindModalA11y(dlg, { onClose: () => {}, initialFocus: '#first' });
    await Promise.resolve();
    release();
    expect(document.activeElement).toBe(openBtn);
  });
});
