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
    const wallet = getOrCreate(userId);
    wallet.balance += Number(amount);
    wallet.transactions.push({
      type: 'earn',
      amount: Number(amount),
      reason: reason || 'reward',
      timestamp: new Date().toISOString()
    });
    return wallet;
  },

  transfer({ fromUserId, toUserId, amount, currency }) {
    const from = getOrCreate(fromUserId);
    const to = getOrCreate(toUserId);
    const amt = Number(amount);

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
