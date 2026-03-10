/**
 * Wallet Engine - Manages user token balances and transfers
 */

const wallets = {};

function getOrCreate(userId) {
  if (!wallets[userId]) {
    wallets[userId] = {
      userId,
      balance: 0,
      currency: 'ASH',
      transactions: [],
      createdAt: new Date().toISOString()
    };
  }
  return wallets[userId];
}

const walletEngine = {
  getWallet(userId) {
    return getOrCreate(userId);
  },

  earn({ userId, amount, reason }) {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return { success: false, error: 'Amount must be a positive number' };
    }
    const wallet = getOrCreate(userId);
    wallet.balance += amt;
    wallet.transactions.push({
      type: 'earn',
      amount: amt,
      reason: reason || 'reward',
      timestamp: new Date().toISOString()
    });
    return wallet;
  },

  transfer({ fromUserId, toUserId, amount, currency }) {
    const from = getOrCreate(fromUserId);
    const to = getOrCreate(toUserId);
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      return { success: false, error: 'Amount must be a positive number' };
    }

    if (fromUserId === toUserId) {
      return { success: false, error: 'Cannot transfer to the same wallet' };
    }

    if (from.balance < amt) {
      return { success: false, error: 'Insufficient balance' };
    }

    from.balance -= amt;
    to.balance += amt;

    const ts = new Date().toISOString();
    from.transactions.push({ type: 'send', amount: amt, to: toUserId, currency, timestamp: ts });
    to.transactions.push({ type: 'receive', amount: amt, from: fromUserId, currency, timestamp: ts });

    return { success: true, from, to };
  }
};

module.exports = walletEngine;
