// Wallet Page

export class WalletPage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    const balance = this.app.walletManager.getBalance();
    const transactions = this.app.walletManager.getTransactions();

    this.container.innerHTML = `
      <div class="wallet-page">
        <div class="wallet-balance-card">
          <div class="wallet-balance-label">Total Balance</div>
          <div class="wallet-balance-value">₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="wallet-actions">
            <button class="btn btn-game btn-lg" id="wallet-deposit-btn"><i class="fas fa-plus-circle"></i> Deposit</button>
            <button class="btn btn-outline btn-lg" id="wallet-withdraw-btn" style="border-color: white; color: white;"><i class="fas fa-money-bill-wave"></i> Withdraw</button>
          </div>
        </div>

        <div class="wallet-transactions">
          <h3><i class="fas fa-history" style="color: var(--accent);"></i> Transaction History</h3>
          ${transactions.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-receipt"></i>
              <h3>No transactions yet</h3>
              <p>Make your first deposit to start playing!</p>
            </div>
          ` : transactions.slice(0, 20).map(t => `
            <div class="transaction-item">
              <div class="transaction-info">
                <div class="transaction-icon ${t.type}">
                  <i class="fas ${t.type === 'deposit' ? 'fa-arrow-down' : t.type === 'withdraw' ? 'fa-arrow-up' : t.type === 'win' ? 'fa-trophy' : 'fa-dice'}"></i>
                </div>
                <div class="transaction-details">
                  <h4>${t.description}</h4>
                  <span>${new Date(t.timestamp).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div class="transaction-amount ${['deposit', 'win'].includes(t.type) ? 'positive' : 'negative'}">
                ${['deposit', 'win'].includes(t.type) ? '+' : '-'}₹${t.amount.toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('wallet-deposit-btn')?.addEventListener('click', () => {
      this.app.openModal('deposit-modal');
    });

    document.getElementById('wallet-withdraw-btn')?.addEventListener('click', () => {
      this.app.openModal('withdraw-modal');
    });
  }
}
