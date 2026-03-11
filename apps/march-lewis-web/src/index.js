module.exports = {
  pages: {
    HomePage: require('./pages/HomePage'),
    JobsPage: require('./pages/JobsPage'),
    EmployerIntakePage: require('./pages/EmployerIntakePage'),
    CandidateOnboardingPage: require('./pages/CandidateOnboardingPage'),
    LoginPage: require('./pages/LoginPage'),
    RecruiterDashboardPage: require('./pages/RecruiterDashboardPage'),
    AdminDashboardPage: require('./pages/AdminDashboardPage')
  },
  components: {
    JobList: require('./components/JobList'),
    AdminStats: require('./components/AdminStats')
  },
  forms: {
    EmployerIntakeForm: require('./forms/EmployerIntakeForm'),
    CandidateOnboardingForm: require('./forms/CandidateOnboardingForm')
  },
  utils: {
    api: require('./utils/api')
  }
};
