function ServiceCards() {
  const services = [
    { icon: '💆', title: 'Body Sculpting', description: 'Professional contouring and toning sessions tailored to your goals.' },
    { icon: '🧘', title: 'Massage Therapy', description: 'Therapeutic massage for relaxation, recovery, and pain relief.' },
    { icon: '✨', title: 'Reiki', description: 'Energy healing sessions to restore balance and well-being.' },
    { icon: '📍', title: 'Acupuncture', description: 'Traditional acupuncture for holistic health and pain management.' },
    { icon: '🤲', title: 'Acupressure', description: 'Targeted pressure techniques to relieve tension and promote healing.' },
    { icon: '💻', title: 'Virtual Care', description: 'Remote wellness consultations from the comfort of your home.' }
  ];

  return `
    <div class="cards">
      ${services.map(s => `
        <div class="card">
          <div class="card-icon">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.description}</p>
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = ServiceCards;
