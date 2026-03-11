(function () {
  const mount = document.getElementById('sourceApp');
  if (!mount) return;

  mount.innerHTML = `
    <section class="panel">
      <h2>Source Driven Sculptify App</h2>
      <p>Touch-friendly provider editing is enabled below.</p>
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
      <div id="srcProviderList" class="cards"></div>
    </section>
  `;

  const bookingForm = document.getElementById('srcBookingForm');
  const bookingResult = document.getElementById('srcBookingResult');
  const therapistForm = document.getElementById('srcTherapistForm');
  const therapistResult = document.getElementById('srcTherapistResult');
  const providerList = document.getElementById('srcProviderList');

  async function fetchJson(url, options) {
    const response = await fetch(url, options || {});
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.message || 'Request failed');
    return json;
  }

  async function loadProviders() {
    providerList.innerHTML = 'Loading providers...';

    try {
      const [providersJson, availabilityJson] = await Promise.all([
        fetchJson('/api/sculptify/providers'),
        fetchJson('/api/scheduling/sculptify-availability')
      ]);

      const providers = providersJson.providers || [];
      const availability = availabilityJson.availability || [];

      providerList.innerHTML = providers.map((item) => {
        const slot = availability.find(entry =>
          (entry.provider_name || entry.providerName) === item.name
        );

        return `
          <div class="card" data-provider-id="${item.id}">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px;" />` : ''}
            <div class="provider-view">
              <h3>${item.name || ''}</h3>
              <p>${item.specialty || ''}</p>
              <span>${item.mode || ''}</span>
              <p>${item.bio || ''}</p>
              <p>${slot ? `Next slot: ${slot.slot_date || slot.slotDate} ${slot.slot_time || slot.slotTime}` : 'No slot posted yet'}</p>
              <button class="btn secondary provider-edit-btn" type="button">Edit</button>
            </div>
            <form class="form provider-edit-form" style="display:none;">
              <input name="name" value="${item.name || ''}" placeholder="Name" />
              <input name="specialty" value="${item.specialty || ''}" placeholder="Specialty" />
              <input name="mode" value="${item.mode || ''}" placeholder="Mode" />
              <input name="imageUrl" value="${item.image_url || ''}" placeholder="Image URL" />
              <input name="bio" value="${item.bio || ''}" placeholder="Bio" />
              <input name="status" value="${item.status || 'active'}" placeholder="Status" />
              <div class="row">
                <button class="btn primary provider-save-btn" type="submit">Save</button>
                <button class="btn secondary provider-cancel-btn" type="button">Cancel</button>
              </div>
              <div class="result provider-edit-result"></div>
            </form>
          </div>
        `;
      }).join('') || '<div class="card"><p>No providers found.</p></div>';

      wireProviderEditors();
    } catch (error) {
      providerList.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
    }
  }

  function wireProviderEditors() {
    providerList.querySelectorAll('.card[data-provider-id]').forEach((card) => {
      const editBtn = card.querySelector('.provider-edit-btn');
      const cancelBtn = card.querySelector('.provider-cancel-btn');
      const view = card.querySelector('.provider-view');
      const form = card.querySelector('.provider-edit-form');
      const result = card.querySelector('.provider-edit-result');
      const id = card.getAttribute('data-provider-id');

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          view.style.display = 'none';
          form.style.display = 'grid';
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          form.style.display = 'none';
          view.style.display = 'block';
        });
      }

      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          result.textContent = 'Saving...';

          try {
            const data = Object.fromEntries(new FormData(form).entries());
            const json = await fetchJson(`/api/sculptify/providers/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            result.textContent = json.message;
            await loadProviders();
          } catch (error) {
            result.textContent = error.message;
          }
        });
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      bookingResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(bookingForm).entries());
        const json = await fetchJson('/api/sculptify/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
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
        const json = await fetchJson('/api/sculptify/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        therapistResult.textContent = json.message;
        therapistForm.reset();
      } catch (error) {
        therapistResult.textContent = error.message;
      }
    });
  }

  loadProviders();
})();
