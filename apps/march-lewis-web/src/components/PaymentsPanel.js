function PaymentsPanel() {
  return `
    <section class="panel">
      <h2>Payments + Wallets</h2>
      <div class="grid two">
        <div class="card">
          <h3>Card Checkout</h3>
          <form id="marchCardPaymentForm" class="form">
            <input name="amount" type="number" placeholder="Amount" value="250" />
            <input name="currency" placeholder="Currency" value="USD" />
            <input name="platform" placeholder="Platform" value="march-lewis" />
            <input name="itemType" placeholder="Item type" value="staffing" />
            <button type="submit" class="btn btn-primary">Create Card Checkout</button>
          </form>
          <div id="marchCardPaymentResult" class="result"></div>
        </div>

        <div class="card">
          <h3>Crypto Checkout</h3>
          <form id="marchCryptoPaymentForm" class="form">
            <input name="amount" type="number" placeholder="Amount" value="250" />
            <input name="token" placeholder="Token" value="USDC" />
            <input name="chain" placeholder="Chain" value="Solana" />
            <input name="wallet" placeholder="Wallet" value="Stubbs Wallet" />
            <button type="submit" class="btn btn-secondary">Create Crypto Payment</button>
          </form>
          <div id="marchCryptoPaymentResult" class="result"></div>
        </div>
      </div>

      <div class="panel">
        <h3>Wallet Configuration</h3>
        <div id="marchWalletConfig" class="cards"></div>
      </div>
    </section>
  `;
}

module.exports = PaymentsPanel;
