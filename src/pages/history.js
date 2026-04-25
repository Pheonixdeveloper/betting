// History Page - Bet history

export class HistoryPage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    const transactions = this.app.walletManager.getTransactions();
    const bets = transactions.filter(t => t.type === 'bet' || t.type === 'win');

    this.container.innerHTML = `
      <div class="wallet-page">
        <div class="game-header">
          <div class="game-header-icon"><i class="fas fa-history"></i></div>
          <h1>Bet History</h1>
          <p>View your complete gaming history</p>
        </div>

        <div class="game-history">
          <h3><i class="fas fa-dice"></i> All Bets & Wins</h3>
          ${bets.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-dice"></i>
              <h3>No bets yet</h3>
              <p>Start playing to see your bet history here!</p>
            </div>
          ` : `
            <table class="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${bets.map(b => `
                  <tr>
                    <td>
                      <span style="color: ${b.type === 'win' ? 'var(--success)' : 'var(--info)'}; font-weight: 700; text-transform: uppercase; font-size: 0.75rem;">
                        ${b.type === 'win' ? '🏆 WIN' : '🎲 BET'}
                      </span>
                    </td>
                    <td>${b.description}</td>
                    <td style="color: ${b.type === 'win' ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                      ${b.type === 'win' ? '+' : '-'}₹${b.amount.toLocaleString()}
                    </td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(b.timestamp).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  }
}
