function PaymentsPanel() {
  return `
    <section class="panel">
      <h2>Payments + Wallets</h2>
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
}

module.exports = PaymentsPanel;
