/* Sculptify – Home Page Module */

import { loadStats } from '../components/stats.js';
import { loadCourses } from '../components/courses.js';
import { initChat } from '../components/chat.js';
import { loadProviders } from '../components/providers.js';
import { initBookingForm } from '../forms/booking.js';
import { initOnboardingForm } from '../forms/onboarding.js';

/**
 * Initialise all home-page components and forms.
 */
export function initHomePage() {
  loadStats();
  loadCourses();
  loadProviders();
  initChat();
  initBookingForm();
  initOnboardingForm();
}
