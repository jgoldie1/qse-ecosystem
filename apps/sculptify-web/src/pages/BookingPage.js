const Header = require('../../../shared/components/Header');
const BookingForm = require('../forms/BookingForm');

function BookingPage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Booking',
        subtitle: 'Create a new wellness appointment'
      })}
      <section class="panel">
        <h2>Book a Session</h2>
        ${BookingForm()}
      </section>
    </div>
  `;
}

module.exports = BookingPage;
