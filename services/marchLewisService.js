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

async function getJobs() {
  const tasks = loadTasks();
  return tasks.filter(t => t.app === 'marchLewis');
}

async function getEmployers() {
  return [
    { id: 'emp-001', name: 'Acme Corp', industry: 'Technology', openRoles: 3 },
    { id: 'emp-002', name: 'BuildRight LLC', industry: 'Construction', openRoles: 5 }
  ];
}

async function getCandidates() {
  return [];
}

module.exports = { getJobs, getEmployers, getCandidates };
