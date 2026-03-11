/* March & Lewis — Employer Intake Page Module */
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderEmployerIntakeForm } from '../forms/employerIntakeForm.js';

export function initEmployerIntakePage() {
  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="hero" style="padding:50px 0 40px">
        <div class="container">
          <h1 style="font-size:2.4rem">Hire Smarter, Faster</h1>
          <p>Tell us what you need and our team will source, screen, and present top candidates within days.</p>
        </div>
      </section>

      <section class="section container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start" class="employer-layout">

          <!-- Benefits column -->
          <div>
            <h2 style="margin-bottom:24px">Why March &amp; Lewis?</h2>
            <div style="display:flex;flex-direction:column;gap:20px">
              <div class="benefit-item">
                <div style="font-size:1.8rem;margin-bottom:8px">🔍</div>
                <h3>Pre-Screened Talent Pool</h3>
                <p>Every candidate is vetted, interviewed, and skills-tested before we present them to you.</p>
              </div>
              <div class="benefit-item">
                <div style="font-size:1.8rem;margin-bottom:8px">⚡</div>
                <h3>Fast Placements</h3>
                <p>Most clients receive qualified candidates within 48–72 hours of submitting a request.</p>
              </div>
              <div class="benefit-item">
                <div style="font-size:1.8rem;margin-bottom:8px">📋</div>
                <h3>Managed Staffing</h3>
                <p>From job posting to first-day onboarding, we manage the entire hiring process for you.</p>
              </div>
              <div class="benefit-item">
                <div style="font-size:1.8rem;margin-bottom:8px">📈</div>
                <h3>Workforce Analytics</h3>
                <p>Track hiring trends, retention rates, and workforce performance in one dashboard.</p>
              </div>
              <div class="benefit-item">
                <div style="font-size:1.8rem;margin-bottom:8px">🛡️</div>
                <h3>Guarantee</h3>
                <p>30-day replacement guarantee on all permanent placements — no questions asked.</p>
              </div>
            </div>

            <div class="testimonial" style="margin-top:32px">
              <blockquote>
                &ldquo;March &amp; Lewis placed three qualified candidates within a week. The process was seamless.&rdquo;
              </blockquote>
              <cite>— Sarah T., HR Director, Dallas Healthcare Group</cite>
            </div>
          </div>

          <!-- Form column -->
          <div id="employer-form-container"></div>
        </div>
      </section>
    </main>
  `;

  renderFooter();
  renderEmployerIntakeForm(document.getElementById('employer-form-container'));
}
