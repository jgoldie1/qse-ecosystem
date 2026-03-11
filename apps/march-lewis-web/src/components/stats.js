/* March & Lewis — Stats Component */

import { getHealth, fetchJSON } from '../api.js';

const DEFAULT_STATS = [
  { id: 'stat-applications', label: 'Job Applications', value: '0', icon: '📄' },
  { id: 'stat-employers', label: 'Employer Requests', value: '0', icon: '🏢' },
  { id: 'stat-training', label: 'Training Enrollments', value: '0', icon: '🎓' }
];

export function renderStats(stats = DEFAULT_STATS) {
  return `
    <div class="stats container">
      ${stats.map(s => `
        <div class="stat-card" id="${s.id}">
          <span class="stat-icon">${s.icon}</span>
          <span class="stat-number">${s.value}</span>
          <span class="stat-label">${s.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export async function loadStats(containerId = 'stats-placeholder') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const health = await getHealth();
    if (health.status !== 'ok') return;

    const analytics = await fetchJSON('/data/analytics.json').catch(() => null);
    if (analytics && analytics.marchLewis) {
      const ml = analytics.marchLewis;
      const el = (id) => document.getElementById(id);
      const appEl = el('stat-applications');
      const empEl = el('stat-employers');
      const traEl = el('stat-training');
      if (appEl) appEl.querySelector('.stat-number').textContent = ml.jobApplications ?? '—';
      if (empEl) empEl.querySelector('.stat-number').textContent = ml.employerRequests ?? '—';
      if (traEl) traEl.querySelector('.stat-number').textContent = ml.trainingEnrollments ?? '—';
    }
  } catch (_) {
    // silently ignore — stats are supplemental
  }
}
