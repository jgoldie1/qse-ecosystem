/**
 * Rewards Engine - Issues and tracks rewards for user activity
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/rewards.json');

const REWARD_TYPES = {
  task_complete: { label: 'Task Completed', amount: 10 },
  training_enroll: { label: 'Training Enrolled', amount: 25 },
  referral: { label: 'Referral Bonus', amount: 50 },
  streak: { label: 'Streak Bonus', amount: 15 },
  milestone: { label: 'Milestone Reached', amount: 100 }
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function save(rewards) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(rewards, null, 2));
}

function generateId() {
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const rewardsEngine = {
  getAll() {
    return load();
  },

  getForUser(userId) {
    return load().filter(r => r.userId === userId);
  },

  issue({ userId, type, amount }) {
    const rewards = load();
    const rewardDef = REWARD_TYPES[type] || { label: type, amount: amount || 0 };
    const reward = {
      id: generateId(),
      userId,
      type,
      label: rewardDef.label,
      amount: amount !== undefined ? Number(amount) : rewardDef.amount,
      issuedAt: new Date().toISOString()
    };
    rewards.push(reward);
    save(rewards);
    return reward;
  },

  getRewardTypes() {
    return REWARD_TYPES;
  }
};

module.exports = rewardsEngine;
