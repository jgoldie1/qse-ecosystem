const providers = [
  { id: 1, name: 'Jordan Lee', specialty: 'Body Sculpting', mode: 'In-Person & Virtual' },
  { id: 2, name: 'Aria Patel', specialty: 'Massage Therapy', mode: 'In-Person' },
  { id: 3, name: 'Marcus Chen', specialty: 'Reiki & Acupuncture', mode: 'Virtual' }
];

const bookings = [];
const onboarding = [];
let bookingCounter = 0;
let onboardingCounter = 0;

function getProviders() {
  return Promise.resolve(providers);
}

function getBookings() {
  return Promise.resolve(bookings);
}

function createBooking(data) {
  const booking = {
    id: ++bookingCounter,
    ...data,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  return Promise.resolve(booking);
}

function getOnboarding() {
  return Promise.resolve(onboarding);
}

function createOnboarding(data) {
  const submission = {
    id: ++onboardingCounter,
    ...data,
    createdAt: new Date().toISOString()
  };
  onboarding.push(submission);
  return Promise.resolve(submission);
}

module.exports = {
  getProviders,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding
};
