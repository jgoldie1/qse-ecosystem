const FormInput = require('../../../../shared/components/FormInput');
const Button = require('../../../../shared/components/Button');

function TherapistOnboardingForm() {
  return `
    <form id="therapistForm" class="form">
      ${FormInput({ name: 'fullName', placeholder: 'Full name' })}
      ${FormInput({ name: 'email', type: 'email', placeholder: 'Email' })}
      ${FormInput({ name: 'phone', placeholder: 'Phone' })}
      ${FormInput({ name: 'serviceSpecialty', placeholder: 'Service specialty' })}
      ${FormInput({ name: 'licenseNumber', placeholder: 'License number' })}
      ${FormInput({ name: 'insuranceProvider', placeholder: 'Insurance provider' })}
      ${Button({ label: 'Submit Onboarding', type: 'submit', variant: 'primary' })}
    </form>
    <div id="therapistResult" class="result"></div>
  `;
}

module.exports = TherapistOnboardingForm;
