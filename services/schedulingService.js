const fs = require('fs');
const path = require('path');

const AVAILABILITY_PATH = path.join(__dirname, '../data/availability.json');
const INTERVIEWS_PATH = path.join(__dirname, '../data/interviews.json');

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

async function getAvailability() {
  return loadFile(AVAILABILITY_PATH);
}

async function createAvailability(data) {
  const slots = loadFile(AVAILABILITY_PATH);
  const slot = {
    id: generateId(),
    providerName: data.providerName,
    service: data.service,
    slotDate: data.slotDate,
    slotTime: data.slotTime,
    createdAt: new Date().toISOString()
  };
  slots.push(slot);
  saveFile(AVAILABILITY_PATH, slots);
  return slot;
}

async function getInterviews() {
  return loadFile(INTERVIEWS_PATH);
}

async function createInterview(data) {
  const interviews = loadFile(INTERVIEWS_PATH);
  const interview = {
    id: generateId(),
    candidateName: data.candidateName,
    companyName: data.companyName,
    interviewDate: data.interviewDate,
    interviewTime: data.interviewTime,
    createdAt: new Date().toISOString()
  };
  interviews.push(interview);
  saveFile(INTERVIEWS_PATH, interviews);
  return interview;
}

module.exports = { getAvailability, createAvailability, getInterviews, createInterview };
