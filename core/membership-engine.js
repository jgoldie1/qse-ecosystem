/**
 * Membership Engine - Manages subscription tiers for QSE Ecosystem
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/memberships.json');

const TIERS = {
  free: { name: 'Free', price: 0, features: ['Basic access', 'Community forum', '2 courses/month'] },
  pro: { name: 'Pro', price: 19, features: ['Everything in Free', 'Unlimited courses', 'AI coaching', 'Priority support'] },
  elite: { name: 'Elite', price: 49, features: ['Everything in Pro', 'Live coaching sessions', 'Marketplace discount', 'Early access'] }
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function save(memberships) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(memberships, null, 2));
}

const membershipEngine = {
  getTiers() {
    return TIERS;
  },

  getMembership(userId) {
    const memberships = load();
    return memberships.find(m => m.userId === userId) || null;
  },

  subscribe({ userId, tier }) {
    if (!TIERS[tier]) {
      return { success: false, error: `Unknown tier: ${tier}` };
    }
    const memberships = load();
    const existing = memberships.findIndex(m => m.userId === userId);
    const membership = {
      userId,
      tier,
      tierDetails: TIERS[tier],
      subscribedAt: new Date().toISOString(),
      active: true
    };

    if (existing !== -1) {
      memberships[existing] = membership;
    } else {
      memberships.push(membership);
    }
    save(memberships);
    return { success: true, membership };
  }
};

module.exports = membershipEngine;
