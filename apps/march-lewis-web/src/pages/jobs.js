/**
 * jobs page module – loads and renders open positions from the API
 */
import { jobCard } from '../components/jobCard.js';

export async function loadJobs(apiBase) {
  const grid = document.getElementById('jobs-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${apiBase}/march-lewis/jobs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs = await res.json();

    if (!jobs.length) {
      grid.innerHTML = '<p class="loading">No open positions at this time.</p>';
      return;
    }
    grid.innerHTML = jobs.map(jobCard).join('');
  } catch {
    grid.innerHTML = '<p class="loading">Could not load positions.</p>';
  }
}
