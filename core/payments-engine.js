/**
 * Payments Engine - Manages card checkout sessions, crypto payments, and wallet configuration
 */

const wallets = [
  {
    name: 'All American Marketplace Wallet',
    status: 'active',
    chains: ['Polygon', 'Ethereum']
  },
  {
    name: 'Stubbs Wallet',
    status: 'active',
    chains: ['Solana', 'Polygon']
  }
];

let sessionCounter = 1000;
let paymentCounter = 2000;

const paymentsEngine = {
  getConfig() {
    return { wallets };
  },

  createCheckoutSession({ amount, currency, platform, itemType }) {
    if (!amount || !currency) {
      return { success: false, error: 'amount and currency are required' };
    }
    const session = {
      id: `cs_${++sessionCounter}`,
      amount: Number(amount),
      currency,
      platform: platform || 'qse',
      itemType: itemType || 'general',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return { success: true, session };
  },

  createCryptoPayment({ amount, token, chain, wallet }) {
    if (!amount || !token) {
      return { success: false, error: 'amount and token are required' };
    }
    const payment = {
      id: `cp_${++paymentCounter}`,
      amount: Number(amount),
      token,
      chain: chain || 'Polygon',
      wallet: wallet || 'All American Marketplace Wallet',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return { success: true, payment };
  }
};

module.exports = paymentsEngine;
