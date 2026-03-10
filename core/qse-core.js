/**
 * QSE Core - Central registry and utilities for the QSE Ecosystem
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_PATH = path.join(__dirname, '../data/analytics.json');

function loadAnalytics() {
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_PATH, 'utf8'));
  } catch {
    return { sculptify: {}, marchLewis: {} };
  }
}

function saveAnalytics(data) {
  fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(data, null, 2));
}

const core = {
  name: 'QSE Ecosystem',
  version: '1.0.0',
  apps: ['sculptify', 'marchLewis'],

  getAnalytics() {
    return loadAnalytics();
  },

  recordEvent(app, event) {
    const analytics = loadAnalytics();
    if (!analytics[app]) return null;
    if (analytics[app][event] === undefined) {
      analytics[app][event] = 1;
    } else {
      analytics[app][event] += 1;
    }
    saveAnalytics(analytics);
    return analytics[app];
  },

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      apps: this.apps,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = core;
