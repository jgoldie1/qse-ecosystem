/* Sculptify – shared API utilities (ES module) */

const API_BASE = '/api';

/**
 * Perform a fetch and parse JSON, throwing on HTTP errors.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * POST JSON to a URL.
 * @param {string} url
 * @param {object} data
 */
export function post(url, data) {
  return fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * PUT JSON to a URL.
 * @param {string} url
 * @param {object} data
 */
export function put(url, data) {
  return fetchJSON(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * DELETE a resource by URL.
 * @param {string} url
 */
export function del(url) {
  return fetchJSON(url, { method: 'DELETE' });
}

/** Structured API helpers keyed by domain */
export const api = {
  health: {
    status: () => fetchJSON(`${API_BASE}/health`)
  },

  tasks: {
    list: () => fetchJSON(`${API_BASE}/tasks`),
    create: (data) => post(`${API_BASE}/tasks`, data),
    update: (id, data) => put(`${API_BASE}/tasks/${id}`, data),
    remove: (id) => del(`${API_BASE}/tasks/${id}`)
  },

  training: {
    courses: () => fetchJSON(`${API_BASE}/training/courses`),
    enroll: (userId, courseId) => post(`${API_BASE}/training/enroll`, { userId, courseId }),
    progress: (userId) => fetchJSON(`${API_BASE}/training/progress/${userId}`)
  },

  memberships: {
    tiers: () => fetchJSON(`${API_BASE}/memberships/tiers`),
    user: (userId) => fetchJSON(`${API_BASE}/memberships/user/${userId}`),
    subscribe: (userId, tier) => post(`${API_BASE}/memberships/subscribe`, { userId, tier })
  },

  rewards: {
    list: () => fetchJSON(`${API_BASE}/rewards`),
    user: (userId) => fetchJSON(`${API_BASE}/rewards/user/${userId}`)
  },

  streaming: {
    content: () => fetchJSON(`${API_BASE}/streaming/content`)
  },

  ai: {
    coach: (message, context = 'sculptify') =>
      post(`${API_BASE}/ai/coach`, { message, context }),
    tips: () => fetchJSON(`${API_BASE}/ai/coach/tips`)
  }
};
