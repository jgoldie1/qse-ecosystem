const Header = require('../../../shared/components/Header');
const TherapistOnboardingForm = require('../forms/TherapistOnboardingForm');

function TherapistOnboardingPage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Therapist Onboarding',
        subtitle: 'Join Sculptify as a provider'
      })}
      <section class="panel">
        <h2>Onboarding Form</h2>
        ${TherapistOnboardingForm()}
      </section>
    </div>
  `;
}

module.exports = TherapistOnboardingPage;
