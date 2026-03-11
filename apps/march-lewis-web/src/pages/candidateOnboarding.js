/* March & Lewis — Candidate Onboarding Page Module */
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderCandidateOnboardingForm } from '../forms/candidateOnboardingForm.js';

const STEPS = [
  { icon: '📝', title: 'Complete Your Profile', desc: 'Tell us about your skills, experience, and career goals.' },
  { icon: '✅', title: 'Review & Screening', desc: 'Our recruiters review your profile and may schedule a quick call.' },
  { icon: '🎯', title: 'Job Matching', desc: 'We match you with suitable openings from our employer network.' },
  { icon: '🚀', title: 'Get Placed', desc: 'Interview, receive an offer, and start your new role.' },
];

export function initCandidateOnboardingPage() {
  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="hero" style="padding:50px 0 40px">
        <div class="container">
          <h1 style="font-size:2.4rem">Start Your Career Journey</h1>
          <p>Join thousands of job seekers who found their perfect role through March &amp; Lewis.</p>
        </div>
      </section>

      <section class="section container">
        <!-- Process steps -->
        <h2 style="text-align:center;margin-bottom:32px">How It Works</h2>
        <div class="grid steps-grid" style="margin-bottom:56px">
          ${STEPS.map((s, i) => `
            <div class="card step-card">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span class="step-number">${i + 1}</span>
                <span style="font-size:1.6rem">${s.icon}</span>
              </div>
              <h3>${s.title}</h3>
              <p>${s.desc}</p>
            </div>
          `).join('')}
        </div>

        <!-- Onboarding form -->
        <div id="onboarding-form-container" style="max-width:600px;margin:0 auto"></div>
      </section>
    </main>
  `;

  renderFooter();
  renderCandidateOnboardingForm(document.getElementById('onboarding-form-container'));
}
