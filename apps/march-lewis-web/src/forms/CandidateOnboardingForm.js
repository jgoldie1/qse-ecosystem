const FormInput = require('../../../../shared/components/FormInput');
const Button = require('../../../../shared/components/Button');

function CandidateOnboardingForm() {
  return `
    <form id="candidateForm" class="form">
      ${FormInput({ name: 'fullName', placeholder: 'Full name' })}
      ${FormInput({ name: 'email', type: 'email', placeholder: 'Email' })}
      ${FormInput({ name: 'phone', placeholder: 'Phone' })}
      ${FormInput({ name: 'workAuthorization', placeholder: 'Work authorization' })}
      ${FormInput({ name: 'availability', placeholder: 'Availability' })}
      ${Button({ label: 'Submit Candidate', type: 'submit', variant: 'primary' })}
    </form>
    <div id="candidateResult" class="result"></div>
  `;
}

module.exports = CandidateOnboardingForm;
