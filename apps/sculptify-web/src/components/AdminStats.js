function AdminStats(stats = {}) {
  const items = [
    { label: 'Appointments', value: stats.appointments || 0 },
    { label: 'Providers', value: stats.providers || 0 },
    { label: 'Sessions This Month', value: stats.sessionsThisMonth || 0 },
    { label: 'Revenue', value: stats.revenue ? `$${stats.revenue}` : '$0' }
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
