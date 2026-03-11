const fs = require('fs');
const path = require('path');

const PROVIDERS_PATH = path.join(__dirname, '../data/sculptify-providers.json');
const BOOKINGS_PATH = path.join(__dirname, '../data/sculptify-bookings.json');
const ONBOARDING_PATH = path.join(__dirname, '../data/sculptify-onboarding.json');

function loadFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function saveFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function getProviders() {
  return loadFile(PROVIDERS_PATH);
}

async function updateProvider(id, data) {
  const providers = loadFile(PROVIDERS_PATH);
  const index = providers.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Provider not found');
  providers[index] = { ...providers[index], ...data, id };
  saveFile(PROVIDERS_PATH, providers);
  return providers[index];
}

async function getBookings() {
  return loadFile(BOOKINGS_PATH);
}

async function createBooking(data) {
  const bookings = loadFile(BOOKINGS_PATH);
  const booking = {
    id: generateId(),
    fullName: data.fullName,
    email: data.email,
    service: data.service,
    sessionType: data.sessionType,
    date: data.date,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  saveFile(BOOKINGS_PATH, bookings);
  return booking;
}

async function getOnboarding() {
  return loadFile(ONBOARDING_PATH);
}

async function createOnboarding(data) {
  const onboarding = loadFile(ONBOARDING_PATH);
  const submission = {
    id: generateId(),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    serviceSpecialty: data.serviceSpecialty,
    licenseNumber: data.licenseNumber || '',
    insuranceProvider: data.insuranceProvider || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  onboarding.push(submission);
  saveFile(ONBOARDING_PATH, onboarding);
  return submission;
}

module.exports = {
  getProviders,
  updateProvider,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding
};
