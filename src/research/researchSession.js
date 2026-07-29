/** Tracks in-flight Deep Research so UI can cancel safely. */

let abortController = null;
let activeProductName = '';
let activeCompetitorUrl = '';

export function startResearchSession(productName, competitorUrl = '') {
  cancelResearchSession(false);
  abortController = new AbortController();
  activeProductName = productName;
  activeCompetitorUrl = competitorUrl;
  return abortController.signal;
}

export function cancelResearchSession(userInitiated = true) {
  if (abortController) {
    abortController.abort(userInitiated ? 'user_cancel' : 'replaced');
    abortController = null;
  }
}

export function getActiveResearchContext() {
  return {
    productName: activeProductName,
    competitorUrl: activeCompetitorUrl,
  };
}

export function isResearchAborted(signal) {
  return signal?.aborted === true;
}

export function throwIfAborted(signal) {
  if (isResearchAborted(signal)) {
    throw new Error('Investigación cancelada por el usuario');
  }
}
