(function () {
  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || !json.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  window.SculptifyBrowserAPI = {
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
    },
    login(data) {
      return fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    getAdminDashboard(token) {
      return fetchJson('/api/sculptify-admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };
})();
