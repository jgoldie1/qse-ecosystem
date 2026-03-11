const Header = require('../../../shared/components/Header');
const Hero = require('../../../shared/components/Hero');
const Footer = require('../../../shared/components/Footer');

function HomePage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'March & Lewis Staffing',
        subtitle: 'Staffing, recruiting, and workforce marketplace'
      })}
      ${Hero({
        pill: 'QSE Workforce Platform',
        title: 'March & Lewis Staffing',
        description: 'Staffing, recruiting, onboarding, workforce management, and training.',
        actions: [
          { label: 'Browse Jobs', href: '#jobs', variant: 'primary' },
          { label: 'Employer Intake', href: '#employer', variant: 'secondary' }
        ]
      })}
      ${Footer({ brand: 'March & Lewis Staffing' })}
    </div>
  `;
}

module.exports = HomePage;
