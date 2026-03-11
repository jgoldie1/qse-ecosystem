/* Sculptify – Stats Component */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Load public analytics stats and populate the hero stat cards.
 * Uses the dedicated /api/stats endpoint which exposes only aggregate counts.
 */
export async function loadStats() {
  try {
    const health = await fetchJSON(`${API_BASE}/health`);
    if (health.status !== 'ok') return;

    const stats = await fetchJSON(`${API_BASE}/stats`).catch(() => null);
    if (stats && stats.sculptify) {
      const s = stats.sculptify;
      const appt = document.querySelector('#stat-appointments .stat-number');
      const sales = document.querySelector('#stat-sales .stat-number');
      const training = document.querySelector('#stat-training .stat-number');
      if (appt) appt.textContent = s.appointments ?? 0;
      if (sales) sales.textContent = s.sales ?? 0;
      if (training) training.textContent = s.trainingEnrollments ?? 0;
    }
  } catch {
    // silently ignore – stats are decorative
  }
}
