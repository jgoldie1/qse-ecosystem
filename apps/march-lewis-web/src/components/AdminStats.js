function AdminStats(stats = {}) {
  const items = [
    { label: 'Open Jobs', value: stats.openJobs || 0 },
    { label: 'Active Candidates', value: stats.activeCandidates || 0 },
    { label: 'Employers', value: stats.employers || 0 },
    { label: 'Placements This Month', value: stats.placementsThisMonth || 0 }
  ];

  return `
    <div class="stats">
      ${items.map(item => `
        <div class="stat-card">
          <span class="stat-number">${item.value}</span>
          <span class="stat-label">${item.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = AdminStats;
