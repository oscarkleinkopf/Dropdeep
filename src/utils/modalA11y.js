/**
 * Modal accessibility: focus trap, Escape to close, aria-modal (T23).
 */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** @type {{ el: HTMLElement, onClose: () => void, previouslyFocused: Element | null }[]} */
const stack = [];

function isVisible(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
  if (el.hidden || el.closest('[hidden]')) return false;
  const style = window.getComputedStyle?.(el);
  if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
  // Prefer layout when available; happy-dom / headless may report 0 rects for static HTML.
  try {
    const rects = el.getClientRects?.();
    if (rects && rects.length === 0 && style?.display && style.display !== 'none') {
      return true;
    }
    if (rects && rects.length === 0) return false;
  } catch {
    /* ignore */
  }
  return true;
}

export function getFocusableElements(root) {
  if (!root) return [];
  return [...root.querySelectorAll(FOCUSABLE)].filter(isVisible);
}

function onKeydown(e) {
  const top = stack[stack.length - 1];
  if (!top) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    top.onClose();
    return;
  }

  if (e.key !== 'Tab') return;
  const nodes = getFocusableElements(top.el);
  if (!nodes.length) {
    e.preventDefault();
    top.el.focus();
    return;
  }
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Bind a11y after showing a modal (remove `hidden`).
 * Returns a release function — call it when the modal hides.
 *
 * @param {HTMLElement | null} el
 * @param {{
 *   onClose: () => void,
 *   initialFocus?: string | HTMLElement | null,
 *   labelledBy?: string,
 *   label?: string,
 * }} opts
 * @returns {() => void}
 */
export function bindModalA11y(el, opts = {}) {
  const { onClose, initialFocus, labelledBy, label } = opts;
  if (!el || typeof onClose !== 'function') return () => {};

  // Drop prior binding for the same element (re-open)
  const existing = stack.findIndex((s) => s.el === el);
  if (existing !== -1) {
    stack.splice(existing, 1);
  }

  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  if (labelledBy) el.setAttribute('aria-labelledby', labelledBy);
  else if (label) el.setAttribute('aria-label', label);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');

  const previouslyFocused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  stack.push({ el, onClose, previouslyFocused });
  if (stack.length === 1) {
    document.addEventListener('keydown', onKeydown, true);
  }

  queueMicrotask(() => {
    let target = null;
    if (typeof initialFocus === 'string') {
      target = el.querySelector(initialFocus);
    } else if (initialFocus instanceof HTMLElement) {
      target = initialFocus;
    }
    if (!target || !isVisible(target)) {
      target = getFocusableElements(el)[0] || el;
    }
    target?.focus?.();
  });

  let released = false;
  return function releaseModalA11y() {
    if (released) return;
    released = true;
    const idx = stack.findIndex((s) => s.el === el);
    if (idx === -1) return;
    const [entry] = stack.splice(idx, 1);
    if (!stack.length) {
      document.removeEventListener('keydown', onKeydown, true);
    }
    if (entry.previouslyFocused && typeof entry.previouslyFocused.focus === 'function') {
      try {
        entry.previouslyFocused.focus();
      } catch {
        /* element may be gone */
      }
    }
  };
}

/** @returns {boolean} */
export function isModalA11yActive(el) {
  return stack.some((s) => s.el === el);
}

/** Exposed for unit tests */
export function __resetModalA11yStackForTests() {
  stack.length = 0;
  document.removeEventListener('keydown', onKeydown, true);
}
