/* March & Lewis — API client utilities */

export const API_BASE = '/api';

export async function fetchJSON(url, options = {}) {
  const { headers = {}, body, ...rest } = options;
  const fetchOptions = {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  };
  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('ml_session') || 'null');
  } catch {
    return null;
  }
}

export function setSession(data) {
  sessionStorage.setItem('ml_session', JSON.stringify(data));
}

export function clearSession() {
  sessionStorage.removeItem('ml_session');
}
