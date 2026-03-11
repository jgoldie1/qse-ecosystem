(function () {
  const mount = document.getElementById('paymentsApp');
  if (!mount) return;

  mount.innerHTML = `
    <section class="panel">
      <h2>Sculptify Payments + Wallet Prep</h2>
      <div class="grid two">
        <div class="card">
          <h3>Card Checkout</h3>
          <form id="sculptifyCardPaymentForm" class="form">
            <input name="amount" type="number" placeholder="Amount" value="150" />
            <input name="currency" placeholder="Currency" value="USD" />
            <input name="platform" placeholder="Platform" value="sculptify" />
            <input name="itemType" placeholder="Item type" value="service" />
            <button type="submit" class="btn btn-primary">Create Card Checkout</button>
          </form>
          <div id="sculptifyCardPaymentResult" class="result"></div>
        </div>

        <div class="card">
          <h3>Crypto Checkout</h3>
          <form id="sculptifyCryptoPaymentForm" class="form">
            <input name="amount" type="number" placeholder="Amount" value="150" />
            <input name="token" placeholder="Token" value="USDC" />
            <input name="chain" placeholder="Chain" value="Polygon" />
            <input name="wallet" placeholder="Wallet" value="All American Marketplace Wallet" />
            <button type="submit" class="btn btn-secondary">Create Crypto Payment</button>
          </form>
          <div id="sculptifyCryptoPaymentResult" class="result"></div>
        </div>
      </div>

      <div class="panel">
        <h3>Wallet Configuration</h3>
        <div id="sculptifyWalletConfig" class="cards"></div>
      </div>
    </section>
  `;

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.message || 'Request failed');
    return json;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const cardForm = document.getElementById('sculptifyCardPaymentForm');
  const cryptoForm = document.getElementById('sculptifyCryptoPaymentForm');
  const cardResult = document.getElementById('sculptifyCardPaymentResult');
  const cryptoResult = document.getElementById('sculptifyCryptoPaymentResult');
  const walletConfig = document.getElementById('sculptifyWalletConfig');

  async function loadConfig() {
    walletConfig.innerHTML = 'Loading wallets...';
    try {
      const json = await fetchJson('/api/payments/config');
      walletConfig.innerHTML = (json.wallets || []).map(function (wallet) {
        return '<div class="card"><h3>' + escapeHtml(wallet.name) + '</h3><p>Status: ' + escapeHtml(wallet.status) + '</p><span>Chains: ' + (wallet.chains || []).map(escapeHtml).join(', ') + '</span></div>';
      }).join('');
    } catch (error) {
      walletConfig.innerHTML = '<div class="card"><p>' + escapeHtml(error.message) + '</p></div>';
    }
  }

  if (cardForm) {
    cardForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      cardResult.textContent = 'Creating checkout...';
      try {
        const data = Object.fromEntries(new FormData(cardForm).entries());
        const json = await fetchJson('/api/payments/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        cardResult.textContent = json.message + ': ' + (json.session && json.session.id);
      } catch (error) {
        cardResult.textContent = error.message;
      }
    });
  }

  if (cryptoForm) {
    cryptoForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      cryptoResult.textContent = 'Creating crypto payment...';
      try {
        const data = Object.fromEntries(new FormData(cryptoForm).entries());
        const json = await fetchJson('/api/payments/crypto-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        cryptoResult.textContent = json.message + ': ' + (json.payment && json.payment.id);
      } catch (error) {
        cryptoResult.textContent = error.message;
      }
    });
  }

  loadConfig();
})();
