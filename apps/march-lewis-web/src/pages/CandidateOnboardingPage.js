const Header = require('../../../shared/components/Header');
const CandidateOnboardingForm = require('../forms/CandidateOnboardingForm');

function CandidateOnboardingPage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Candidate Onboarding',
        subtitle: 'Join the workforce marketplace'
      })}
      <section class="panel">
        <h2>Candidate Form</h2>
        ${CandidateOnboardingForm()}
      </section>
    </div>
  `;
}

module.exports = CandidateOnboardingPage;
