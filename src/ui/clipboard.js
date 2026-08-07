/** Clipboard helpers with inline button feedback (UI). */

const FEEDBACK_MS = 2000;
const restoreTimers = new WeakMap();

/**
 * Copy `text` to the clipboard and briefly show “¡Copiado!” + green check on the button.
 * Restores the button’s original HTML after 2 seconds.
 *
 * @param {HTMLElement} buttonElement
 * @param {string} text
 * @returns {Promise<boolean>} true if clipboard write succeeded
 */
export async function copyToClipboardWithFeedback(buttonElement, text) {
  if (!buttonElement) return false;

  try {
    await navigator.clipboard.writeText(String(text ?? ''));
  } catch (err) {
    console.error('Fallo al copiar:', err);
    return false;
  }

  const existing = restoreTimers.get(buttonElement);
  if (existing) clearTimeout(existing);

  if (buttonElement.dataset.copyOriginalHtml == null) {
    buttonElement.dataset.copyOriginalHtml = buttonElement.innerHTML;
  }

  buttonElement.classList.add('btn-copy-success');
  buttonElement.setAttribute('aria-live', 'polite');
  buttonElement.innerHTML = `
    <i data-lucide="check" class="btn-copy-check-icon" aria-hidden="true"></i>
    <span>¡Copiado!</span>
  `;

  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

  const timer = setTimeout(() => {
    const original = buttonElement.dataset.copyOriginalHtml;
    if (original != null) {
      buttonElement.innerHTML = original;
      delete buttonElement.dataset.copyOriginalHtml;
    }
    buttonElement.classList.remove('btn-copy-success');
    buttonElement.removeAttribute('aria-live');
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
    restoreTimers.delete(buttonElement);
  }, FEEDBACK_MS);

  restoreTimers.set(buttonElement, timer);
  return true;
}
