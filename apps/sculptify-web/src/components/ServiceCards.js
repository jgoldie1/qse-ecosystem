const Card = require('../../../../shared/components/Card');

function ServiceCards() {
  const services = [
    { title: 'Body Sculpting', text: 'Wellness contour planning and sessions.' },
    { title: 'Massage Therapy', text: 'Therapeutic recovery and care.' },
    { title: 'Reiki', text: 'Energy balancing support.' },
    { title: 'Acupuncture', text: 'Holistic treatment options.' },
    { title: 'Acupressure', text: 'Virtual and in-person techniques.' }
  ];

  return `<div class="cards">${services.map(Card).join('')}</div>`;
}

module.exports = ServiceCards;
