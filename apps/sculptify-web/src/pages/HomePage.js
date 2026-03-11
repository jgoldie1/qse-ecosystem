const Header = require('../../../shared/components/Header');
const Hero = require('../../../shared/components/Hero');
const Footer = require('../../../shared/components/Footer');
const ServiceCards = require('../components/ServiceCards');

function HomePage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Sculptify Ltd',
        subtitle: 'Wellness and body sculpting platform'
      })}
      ${Hero({
        pill: 'QSE Core Powered',
        title: 'Sculptify Ltd',
        description: 'Wellness, body sculpting, massage, Reiki, acupuncture, acupressure, virtual and in-person care.',
        actions: [
          { label: 'Book Session', href: '#booking', variant: 'primary' },
          { label: 'View Providers', href: '#providers', variant: 'secondary' }
        ]
      })}
      <section class="panel">
        <h2>Services</h2>
        ${ServiceCards()}
      </section>
      ${Footer({ brand: 'Sculptify Ltd' })}
    </div>
  `;
}

module.exports = HomePage;
