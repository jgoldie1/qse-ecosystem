const FormInput = require('../../../../shared/components/FormInput');
const FormSelect = require('../../../../shared/components/FormSelect');
const Button = require('../../../../shared/components/Button');

function EmployerIntakeForm() {
  return `
    <form id="employerForm" class="form">
      ${FormInput({ name: 'companyName', placeholder: 'Company name' })}
      ${FormInput({ name: 'hiringManager', placeholder: 'Hiring manager' })}
      ${FormInput({ name: 'email', type: 'email', placeholder: 'Business email' })}
      ${FormSelect({ name: 'positionType', options: [
        { value: '', label: 'Open position type' },
        'Full-Time',
        'Part-Time',
        'Contract',
        'Temporary'
      ]})}
      ${Button({ label: 'Submit Intake', type: 'submit', variant: 'primary' })}
    </form>
    <div id="employerResult" class="result"></div>
  `;
}

module.exports = EmployerIntakeForm;
