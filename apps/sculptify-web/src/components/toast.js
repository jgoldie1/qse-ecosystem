/* Sculptify – Toast notification component (ES module) */

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Display a toast notification.
 * @param {string} message     – Text to show
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration    – Milliseconds before the toast fades out
 */
export function showToast(message, type = 'success', duration = 4000) {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  c.appendChild(toast);

  // Trigger CSS transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}
