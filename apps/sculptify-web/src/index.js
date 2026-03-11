module.exports = {
  pages: {
    HomePage: require('./pages/HomePage'),
    ProvidersPage: require('./pages/ProvidersPage'),
    BookingPage: require('./pages/BookingPage'),
    TherapistOnboardingPage: require('./pages/TherapistOnboardingPage'),
    LoginPage: require('./pages/LoginPage'),
    AdminDashboardPage: require('./pages/AdminDashboardPage')
  },
  components: {
    ServiceCards: require('./components/ServiceCards'),
    ProviderList: require('./components/ProviderList'),
    AdminStats: require('./components/AdminStats')
  },
  forms: {
    BookingForm: require('./forms/BookingForm'),
    TherapistOnboardingForm: require('./forms/TherapistOnboardingForm')
  },
  utils: {
    api: require('./utils/api')
  }
};
