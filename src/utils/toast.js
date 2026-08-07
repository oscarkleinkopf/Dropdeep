/** Toast con mensaje vía textContent (sin interpolar HTML). */
export function showToast(message, type = 'info') {
  const oldToast = document.querySelector('.toast-notification');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';

  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'x-circle';

  const iconEl = document.createElement('i');
  iconEl.setAttribute('data-lucide', icon);

  const span = document.createElement('span');
  span.textContent = String(message ?? '');

  toast.append(iconEl, span);
  document.body.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
