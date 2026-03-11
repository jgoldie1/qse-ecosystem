(function () {
  const mount = document.getElementById('sourceApp');
  if (!mount) return;

  mount.innerHTML = `
    <section class="panel">
      <h2>Source Driven Sculptify App</h2>
      <p>This section is rendered from the new source file wiring layer.</p>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Booking</h2>
        <form id="srcBookingForm" class="form">
          <input name="fullName" placeholder="Full name" />
          <input name="email" type="email" placeholder="Email" />
          <select name="service">
            <option value="">Choose service</option>
            <option>Body Sculpting</option>
            <option>Massage Therapy</option>
            <option>Reiki</option>
            <option>Acupuncture</option>
            <option>Acupressure</option>
          </select>
          <select name="sessionType">
            <option value="">Session type</option>
            <option>Virtual</option>
            <option>In-Person</option>
          </select>
          <input name="date" type="date" />
          <button type="submit" class="btn primary">Submit Booking</button>
        </form>
        <div id="srcBookingResult" class="result"></div>
      </div>

      <div class="panel">
        <h2>Therapist Onboarding</h2>
        <form id="srcTherapistForm" class="form">
          <input name="fullName" placeholder="Full name" />
          <input name="email" type="email" placeholder="Email" />
          <input name="phone" placeholder="Phone" />
          <input name="serviceSpecialty" placeholder="Service specialty" />
          <input name="licenseNumber" placeholder="License number" />
          <input name="insuranceProvider" placeholder="Insurance provider" />
          <button type="submit" class="btn primary">Submit Onboarding</button>
        </form>
        <div id="srcTherapistResult" class="result"></div>
      </div>
    </section>

    <section class="panel">
      <h2>Providers + Availability</h2>
      <div id="srcProviderList" class="scroll"></div>
    </section>
  `;

  const bookingForm = document.getElementById('srcBookingForm');
  const bookingResult = document.getElementById('srcBookingResult');
  const therapistForm = document.getElementById('srcTherapistForm');
  const therapistResult = document.getElementById('srcTherapistResult');
  const providerList = document.getElementById('srcProviderList');

  async function loadProviders() {
    providerList.innerHTML = 'Loading providers...';
    try {
      const [providersJson, availabilityJson] = await Promise.all([
        window.SculptifyBrowserAPI.getProviders(),
        window.SculptifyBrowserAPI.getAvailability()
      ]);

      const providers = providersJson.providers || [];
      const availability = availabilityJson.availability || [];

      providerList.innerHTML = providers.map((item) => {
        const slot = availability.find(entry =>
          (entry.provider_name || entry.providerName) === item.name
        );

        return `
          <div class="provider">
            <h3>${item.name || ''}</h3>
            <p>${item.specialty || ''}</p>
            <span>${item.mode || ''}</span>
            <p>${slot ? `Next slot: ${slot.slot_date || slot.slotDate} ${slot.slot_time || slot.slotTime}` : 'No slot posted yet'}</p>
          </div>
        `;
      }).join('') || '<div class="card"><p>No providers found.</p></div>';
    } catch (error) {
      providerList.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      bookingResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(bookingForm).entries());
        const json = await window.SculptifyBrowserAPI.createBooking(data);
        bookingResult.textContent = json.message;
        bookingForm.reset();
      } catch (error) {
        bookingResult.textContent = error.message;
      }
    });
  }

  if (therapistForm) {
    therapistForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      therapistResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(therapistForm).entries());
        const json = await window.SculptifyBrowserAPI.createOnboarding(data);
        therapistResult.textContent = json.message;
        therapistForm.reset();
      } catch (error) {
        therapistResult.textContent = error.message;
      }
    });
  }

  loadProviders();
})();
