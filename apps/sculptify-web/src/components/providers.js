/* Sculptify – Providers Component */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const SPECIALTY_ICONS = {
  sculpting: '💆',
  nutrition: '🥗',
  training: '🏋️',
  yoga: '🧘',
  massage: '🖐️',
  skincare: '✨'
};

function renderProvider(provider) {
  const icon = SPECIALTY_ICONS[provider.specialty] || '👤';
  return `
    <div class="card provider-card">
      <div class="card-icon">${icon}</div>
      <h3>${provider.name}</h3>
      <p class="provider-specialty">${provider.specialtyLabel || provider.specialty}</p>
      <p>${provider.bio || 'Certified wellness professional.'}</p>
      <a href="#contact" class="btn btn-outline">Book Session</a>
    </div>
  `;
}

/**
 * Fetch providers from /api/providers and render them into #providers-grid.
 */
export async function loadProviders() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="loading">Loading providers…</p>';

  try {
    const providers = await fetchJSON(`${API_BASE}/providers`);
    if (!providers.length) {
      grid.innerHTML = '<p class="loading">No providers available yet.</p>';
      return;
    }
    grid.innerHTML = providers.map(renderProvider).join('');
  } catch {
    grid.innerHTML = '<p class="loading">Could not load providers.</p>';
  }
}
