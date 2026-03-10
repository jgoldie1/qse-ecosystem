'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Ensure clean data files before tests run.
// Tests run sequentially via `node --test`; the before hook sets a known baseline
// so each describe block starts with a predictable data state.
const DATA_DIR = path.join(__dirname, '../data');
before(() => {
  fs.writeFileSync(path.join(DATA_DIR, 'tasks.json'), '[]');
  fs.writeFileSync(path.join(DATA_DIR, 'rewards.json'), '[]');
  fs.writeFileSync(path.join(DATA_DIR, 'memberships.json'), '[]');
  fs.writeFileSync(path.join(DATA_DIR, 'analytics.json'), JSON.stringify(
    { sculptify: { appointments: 0, sales: 0, trainingEnrollments: 0 }, marchLewis: { jobApplications: 0, employerRequests: 0, trainingEnrollments: 0 } }, null, 2
  ));
});

// ─── QSE Core ───────────────────────────────────────────────────────────────
describe('qse-core', () => {
  const core = require('../core/qse-core');

  it('getStatus returns expected fields', () => {
    const status = core.getStatus();
    assert.equal(status.name, 'QSE Ecosystem');
    assert.equal(status.version, '1.0.0');
    assert.ok(Array.isArray(status.apps));
    assert.ok(typeof status.uptime === 'number');
    assert.ok(typeof status.timestamp === 'string');
  });

  it('recordEvent increments an existing event counter', () => {
    const before = core.getAnalytics();
    const prev = before.sculptify.appointments;
    const result = core.recordEvent('sculptify', 'appointments');
    assert.equal(result.appointments, prev + 1);
  });

  it('recordEvent initializes a new event key', () => {
    const result = core.recordEvent('sculptify', 'newEventKey');
    assert.equal(result.newEventKey, 1);
  });

  it('recordEvent returns null for unknown app', () => {
    const result = core.recordEvent('unknownApp', 'appointments');
    assert.equal(result, null);
  });
});

// ─── Task Engine ────────────────────────────────────────────────────────────
describe('task-engine', () => {
  const taskEngine = require('../core/task-engine');

  it('creates a task with required fields', () => {
    const task = taskEngine.create({ title: 'Test Task', app: 'sculptify' });
    assert.ok(task.id);
    assert.equal(task.title, 'Test Task');
    assert.equal(task.app, 'sculptify');
    assert.equal(task.status, 'pending');
  });

  it('defaults title to "Untitled Task" when not provided', () => {
    const task = taskEngine.create({});
    assert.equal(task.title, 'Untitled Task');
  });

  it('retrieves all tasks', () => {
    const tasks = taskEngine.getAll();
    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.length >= 2);
  });

  it('updates a task', () => {
    const task = taskEngine.create({ title: 'Update Me' });
    const updated = taskEngine.update(task.id, { status: 'done' });
    assert.equal(updated.status, 'done');
  });

  it('returns null when updating a non-existent task', () => {
    const result = taskEngine.update('does-not-exist', { status: 'done' });
    assert.equal(result, null);
  });

  it('removes a task', () => {
    const task = taskEngine.create({ title: 'Remove Me' });
    const removed = taskEngine.remove(task.id);
    assert.equal(removed.id, task.id);
    assert.equal(taskEngine.remove(task.id), null);
  });
});

// ─── Wallet Engine ──────────────────────────────────────────────────────────
describe('wallet-engine', () => {
  const walletEngine = require('../core/wallet-engine');

  it('creates a wallet for a new user', () => {
    const wallet = walletEngine.getWallet('test-user-1');
    assert.equal(wallet.userId, 'test-user-1');
    assert.equal(wallet.balance, 0);
    assert.equal(wallet.currency, 'ASH');
  });

  it('earns coins and updates balance', () => {
    const wallet = walletEngine.earn({ userId: 'test-user-2', amount: 50, reason: 'test' });
    assert.equal(wallet.balance, 50);
    assert.equal(wallet.transactions.length, 1);
    assert.equal(wallet.transactions[0].type, 'earn');
  });

  it('rejects zero or negative amounts on earn', () => {
    const zeroResult = walletEngine.earn({ userId: 'test-user-2', amount: 0 });
    assert.equal(zeroResult.success, false);
    const negResult = walletEngine.earn({ userId: 'test-user-2', amount: -10 });
    assert.equal(negResult.success, false);
  });

  it('transfers coins between wallets', () => {
    walletEngine.earn({ userId: 'sender', amount: 100 });
    const result = walletEngine.transfer({ fromUserId: 'sender', toUserId: 'receiver', amount: 40 });
    assert.equal(result.success, true);
    assert.equal(result.from.balance, 60);
    assert.equal(result.to.balance, 40);
  });

  it('rejects transfer with insufficient balance', () => {
    const result = walletEngine.transfer({ fromUserId: 'broke-user', toUserId: 'receiver', amount: 9999 });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('balance'));
  });

  it('rejects transfer with negative amount', () => {
    const result = walletEngine.transfer({ fromUserId: 'sender', toUserId: 'receiver', amount: -5 });
    assert.equal(result.success, false);
  });

  it('rejects transfer to the same wallet', () => {
    walletEngine.earn({ userId: 'self-user', amount: 50 });
    const result = walletEngine.transfer({ fromUserId: 'self-user', toUserId: 'self-user', amount: 10 });
    assert.equal(result.success, false);
  });
});

// ─── Rewards Engine ─────────────────────────────────────────────────────────
describe('rewards-engine', () => {
  const rewardsEngine = require('../core/rewards-engine');

  it('issues a reward with known type', () => {
    const reward = rewardsEngine.issue({ userId: 'u1', type: 'task_complete' });
    assert.equal(reward.type, 'task_complete');
    assert.equal(reward.amount, 10);
    assert.equal(reward.userId, 'u1');
    assert.ok(reward.id);
  });

  it('issues a reward with custom amount', () => {
    const reward = rewardsEngine.issue({ userId: 'u1', type: 'referral', amount: 999 });
    assert.equal(reward.amount, 999);
  });

  it('retrieves rewards for a specific user', () => {
    const rewards = rewardsEngine.getForUser('u1');
    assert.ok(rewards.length >= 2);
    assert.ok(rewards.every(r => r.userId === 'u1'));
  });
});

// ─── Membership Engine ───────────────────────────────────────────────────────
describe('membership-engine', () => {
  const membershipEngine = require('../core/membership-engine');

  it('returns available tiers', () => {
    const tiers = membershipEngine.getTiers();
    assert.ok(tiers.free);
    assert.ok(tiers.pro);
    assert.ok(tiers.elite);
  });

  it('subscribes a user to a tier', () => {
    const result = membershipEngine.subscribe({ userId: 'member-1', tier: 'pro' });
    assert.equal(result.success, true);
    assert.equal(result.membership.tier, 'pro');
  });

  it('rejects an unknown tier', () => {
    const result = membershipEngine.subscribe({ userId: 'member-1', tier: 'diamond' });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('Unknown tier'));
  });

  it('retrieves a user membership', () => {
    const membership = membershipEngine.getMembership('member-1');
    assert.equal(membership.tier, 'pro');
  });

  it('returns null for a user without membership', () => {
    const membership = membershipEngine.getMembership('no-membership-user');
    assert.equal(membership, null);
  });
});

// ─── Training Engine ─────────────────────────────────────────────────────────
describe('training-engine', () => {
  const trainingEngine = require('../core/training-engine');

  it('returns all courses', () => {
    const courses = trainingEngine.getCourses();
    assert.ok(courses.length > 0);
  });

  it('filters courses by app', () => {
    const courses = trainingEngine.getCourses({ app: 'sculptify' });
    assert.ok(courses.every(c => c.app === 'sculptify' || c.app === 'general'));
  });

  it('enrolls a user in a course', () => {
    const result = trainingEngine.enroll('student-1', 'c1');
    assert.equal(result.success, true);
    assert.equal(result.enrollment.courseId, 'c1');
  });

  it('prevents duplicate enrollment', () => {
    const result = trainingEngine.enroll('student-1', 'c1');
    assert.equal(result.success, false);
    assert.ok(result.error.includes('enrolled'));
  });

  it('returns an error for a non-existent course', () => {
    const result = trainingEngine.enroll('student-1', 'invalid-id');
    assert.equal(result.success, false);
  });

  it('returns progress for an enrolled user', () => {
    const progress = trainingEngine.getProgress('student-1');
    assert.ok(Array.isArray(progress));
    assert.ok(progress.length >= 1);
  });
});

// ─── Marketplace Engine ──────────────────────────────────────────────────────
describe('marketplace-engine', () => {
  const marketplaceEngine = require('../core/marketplace-engine');

  it('returns all available listings', () => {
    const listings = marketplaceEngine.getListings();
    assert.ok(listings.length > 0);
    assert.ok(listings.every(l => l.available));
  });

  it('filters listings by app', () => {
    const listings = marketplaceEngine.getListings({ app: 'sculptify' });
    assert.ok(listings.every(l => l.app === 'sculptify'));
  });

  it('adds a new listing', () => {
    const listing = marketplaceEngine.addListing({ title: 'New Service', app: 'general', price: 30 });
    assert.equal(listing.title, 'New Service');
    assert.ok(listing.id.startsWith('m'));
  });

  it('gets a listing by id', () => {
    const listing = marketplaceEngine.getById('m1');
    assert.equal(listing.id, 'm1');
  });

  it('returns null for a non-existent listing', () => {
    const listing = marketplaceEngine.getById('does-not-exist');
    assert.equal(listing, null);
  });
});

// ─── AI Coach ────────────────────────────────────────────────────────────────
describe('ai-coach', () => {
  const aiCoach = require('../core/ai-coach');

  it('responds to a goal-related message', () => {
    const res = aiCoach.respond({ message: 'I need help setting a goal' });
    assert.ok(res.reply.toLowerCase().includes('goal') || res.reply.length > 0);
  });

  it('responds with motivational tips when asked', () => {
    const res = aiCoach.respond({ message: 'I need motivation' });
    assert.ok(typeof res.reply === 'string' && res.reply.length > 0);
  });

  it('returns a default reply for unrecognized input', () => {
    const res = aiCoach.respond({ message: 'xyzzy' });
    assert.ok(typeof res.reply === 'string' && res.reply.length > 0);
  });

  it('returns motivational tips list', () => {
    const tips = aiCoach.getMotivationalTips();
    assert.ok(Array.isArray(tips));
    assert.ok(tips.length > 0);
  });
});

// ─── Streaming Engine ────────────────────────────────────────────────────────
describe('streaming-engine', () => {
  const streamingEngine = require('../core/streaming-engine');

  it('returns all content', () => {
    const content = streamingEngine.getContent({});
    assert.ok(content.length > 0);
  });

  it('filters content by app', () => {
    const content = streamingEngine.getContent({ app: 'sculptify' });
    assert.ok(content.every(c => c.app === 'sculptify'));
  });

  it('gets content by id', () => {
    const item = streamingEngine.getById('s1');
    assert.equal(item.id, 's1');
  });

  it('returns null for non-existent content', () => {
    const item = streamingEngine.getById('does-not-exist');
    assert.equal(item, null);
  });

  it('adds new content with a unique id', () => {
    const item1 = streamingEngine.addContent({ title: 'Content A', app: 'general' });
    const item2 = streamingEngine.addContent({ title: 'Content B', app: 'general' });
    assert.notEqual(item1.id, item2.id);
    assert.equal(item1.title, 'Content A');
  });
});
