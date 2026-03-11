/**
 * Payments Engine - Processes payments and manages payment records
 */

const walletEngine = require('./wallet-engine');

const payments = [];

function generateId() {
  const ts = Date.now().toString(36);
  const rand1 = Math.random().toString(36).slice(2);
  const rand2 = Math.random().toString(36).slice(2);
  return 'pay' + ts + rand1 + rand2;
}

const paymentsEngine = {
  /**
   * Process a payment between two users using their ASH wallets.
   */
  processPayment({ fromUserId, toUserId, amount, description }) {
    const amt = Number(amount);
    if (!fromUserId || !toUserId || !amt || amt <= 0) {
      return { success: false, error: 'fromUserId, toUserId, and a positive amount are required' };
    }

    const result = walletEngine.transfer({ fromUserId, toUserId, amount: amt });
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const payment = {
      id: generateId(),
      fromUserId,
      toUserId,
      amount: amt,
      currency: 'ASH',
      description: description || 'payment',
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    payments.push(payment);
    return { success: true, payment };
  },

  /**
   * Retrieve all payments.
   */
  getAll() {
    return payments;
  },

  /**
   * Retrieve payments for a specific user (sent or received).
   */
  getForUser(userId) {
    return payments.filter(p => p.fromUserId === userId || p.toUserId === userId);
  }
};

module.exports = paymentsEngine;
