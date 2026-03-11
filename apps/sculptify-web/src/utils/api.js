const fetchJson = require('../../../../shared/utils/fetchJson');

const SculptifyAPI = {
  getProviders() {
    return fetchJson('/api/sculptify/providers');
  },
  getBookings() {
    return fetchJson('/api/sculptify/bookings');
  },
  createBooking(data) {
    return fetchJson('/api/sculptify/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  getOnboarding() {
    return fetchJson('/api/sculptify/onboarding');
  },
  createOnboarding(data) {
    return fetchJson('/api/sculptify/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  getAvailability() {
    return fetchJson('/api/scheduling/sculptify-availability');
  }
};

module.exports = SculptifyAPI;
