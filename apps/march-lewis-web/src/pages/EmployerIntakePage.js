const Header = require('../../../shared/components/Header');
const EmployerIntakeForm = require('../forms/EmployerIntakeForm');

function EmployerIntakePage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Employer Intake',
        subtitle: 'Submit a staffing request'
      })}
      <section class="panel">
        <h2>Employer Form</h2>
        ${EmployerIntakeForm()}
      </section>
    </div>
  `;
}

module.exports = EmployerIntakePage;
