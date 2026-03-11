const fs = require('fs');
const path = require('path');

const walletsPath = path.join(__dirname, '..', '..', 'shared', 'config', 'wallets.json');

function readWallets() {
  const raw = fs.readFileSync(walletsPath, 'utf8');
  return JSON.parse(raw);
}

function getPaymentConfig() {
  return {
    ok: true,
    providers: {
      card: ['Stripe-ready', 'Manual card processor placeholder'],
      crypto: ['Polygon-ready', 'Solana-ready']
    },
    wallets: readWallets().wallets
  };
}

function createCheckoutSession(data = {}) {
  return {
    ok: true,
    message: 'Checkout session created',
    session: {
      id: `checkout_${Date.now()}`,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      platform: data.platform || 'general',
      itemType: data.itemType || 'service',
      provider: data.provider || 'card-stub',
      status: 'pending'
    }
  };
}

function createPaymentIntent(data = {}) {
  return {
    ok: true,
    message: 'Payment intent created',
    intent: {
      id: `intent_${Date.now()}`,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      method: data.method || 'card',
      status: 'requires_confirmation'
    }
  };
}

function createCryptoPayment(data = {}) {
  return {
    ok: true,
    message: 'Crypto payment request created',
    payment: {
      id: `crypto_${Date.now()}`,
      amount: data.amount || 0,
      token: data.token || 'USDC',
      chain: data.chain || 'Polygon',
      wallet: data.wallet || 'All American Marketplace Wallet',
      status: 'awaiting_wallet_confirmation'
    }
  };
}

module.exports = {
  getPaymentConfig,
  createCheckoutSession,
  createPaymentIntent,
  createCryptoPayment
};
