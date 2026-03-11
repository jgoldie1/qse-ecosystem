const FormInput = require('../../../../shared/components/FormInput');
const FormSelect = require('../../../../shared/components/FormSelect');
const Button = require('../../../../shared/components/Button');

function BookingForm() {
  return `
    <form id="bookingForm" class="form">
      ${FormInput({ name: 'fullName', placeholder: 'Full name' })}
      ${FormInput({ name: 'email', type: 'email', placeholder: 'Email' })}
      ${FormSelect({ name: 'service', options: [
        { value: '', label: 'Choose service' },
        'Body Sculpting',
        'Massage Therapy',
        'Reiki',
        'Acupuncture',
        'Acupressure'
      ]})}
      ${FormSelect({ name: 'sessionType', options: [
        { value: '', label: 'Session type' },
        'Virtual',
        'In-Person'
      ]})}
      ${FormInput({ name: 'date', type: 'date' })}
      ${Button({ label: 'Submit Booking', type: 'submit', variant: 'primary' })}
    </form>
    <div id="bookingResult" class="result"></div>
  `;
}

module.exports = BookingForm;
