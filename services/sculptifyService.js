const fs = require('fs');
const path = require('path');

const TASKS_PATH = path.join(__dirname, '../data/tasks.json');

function loadTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

async function getProviders() {
  return [
    { id: 'prov-001', name: 'Studio A', specialty: 'Body Sculpting', active: true },
    { id: 'prov-002', name: 'Studio B', specialty: 'Nutrition Coaching', active: true }
  ];
}

async function getBookings() {
  const tasks = loadTasks();
  return tasks.filter(t => t.app === 'sculptify');
}

async function getOnboarding() {
  return [];
}

module.exports = { getProviders, getBookings, getOnboarding };
