require('dotenv').config();

const { init: initAuth } = require('../server/services/authService');
const { init: initSculptify } = require('../server/services/sculptifyService');
const { init: initMarchLewis } = require('../server/services/marchLewisService');

async function migrate() {
  console.log('Running database migrations...');
  await initAuth();
  console.log('  ✓ users table');
  await initSculptify();
  console.log('  ✓ providers, bookings, onboarding tables');
  await initMarchLewis();
  console.log('  ✓ jobs, employers, candidates tables');
  console.log('Migrations complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
