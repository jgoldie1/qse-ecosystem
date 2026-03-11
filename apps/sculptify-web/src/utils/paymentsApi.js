async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.message || 'Request failed');
  return json;
}

const SculptifyPaymentsAPI = {
  getConfig() {
    return fetchJson('/api/payments/config');
  },
  createCheckoutSession(data) {
    return fetchJson('/api/payments/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  createPaymentIntent(data) {
    return fetchJson('/api/payments/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  createCryptoPayment(data) {
    return fetchJson('/api/payments/crypto-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};

module.exports = SculptifyPaymentsAPI;
