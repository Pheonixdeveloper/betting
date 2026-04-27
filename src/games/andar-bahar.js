// Andar Bahar Game
// Simple predict game. Admin can override result to Andar or Bahar.

export class AndarBaharGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.isPlaying = false;
    this.history = [];
    this.timer = null;
    this.countdown = 15;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon">🃏</div>
          <h1>Andar Bahar</h1>
          <p>Indian Classic • Bet on Andar or Bahar</p>
        </div>

        ${this.admin.renderGamePanel('andar-bahar')}

        <div class="game-container">
          <div class="game-area" style="text-align: center; padding: 2rem;">
            <div class="game-timer" id="ab-timer" style="margin-bottom: 2rem; font-size: 1.25rem;">
              <i class="fas fa-clock"></i> Place bets: <span id="ab-countdown">${this.countdown}s</span>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
              <div style="padding: 2rem; background: #1e3a8a; border-radius: var(--radius-lg); flex: 1;">
                <h2 style="color: white; margin-bottom: 1rem;">Andar (1.9x)</h2>
                <div id="andar-cards" style="font-size: 3rem;">?</div>
              </div>
              <div style="padding: 2rem; background: #991b1b; border-radius: var(--radius-lg); flex: 1;">
                <h2 style="color: white; margin-bottom: 1rem;">Bahar (1.9x)</h2>
                <div id="bahar-cards" style="font-size: 3rem;">?</div>
              </div>
            </div>

            <div id="ab-result" style="font-size: 1.5rem; font-weight: bold; min-height: 40px;"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="ab-bet-amount" value="100" min="10" />
              </div>
              <div class="bet-quick-buttons">
                <button class="bet-quick" data-amount="50">₹50</button>
                <button class="bet-quick" data-amount="100">₹100</button>
                <button class="bet-quick" data-amount="500">₹500</button>
                <button class="bet-quick" data-amount="1000">₹1K</button>
              </div>
            </div>
            <div class="bet-options">
              <button class="bet-option-btn" id="ab-bet-andar" style="background: #3b82f6; color: white;">Bet Andar</button>
              <button class="bet-option-btn" id="ab-bet-bahar" style="background: #ef4444; color: white;">Bet Bahar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.admin.setupGamePanelEvents('andar-bahar');
    this.startTimer();
  }

  startTimer() {
    this.countdown = 15;
    this.updateTimerDisplay();
    this.timer = setInterval(() => {
      this.countdown--;
      this.updateTimerDisplay();
      if (this.countdown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const el = document.getElementById('ab-countdown');
    if (el) el.textContent = `${this.countdown}s`;
  }

  placeBet(side) {
    if (this.isPlaying) return;

    if (!this.app.userManager.isLoggedIn()) {
      this.app.toastManager.show('Please login to place bets', 'warning');
      this.app.openModal('login-modal');
      return;
    }

    const betAmount = parseFloat(document.getElementById('ab-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Andar Bahar')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();
    this.isPlaying = true;
    clearInterval(this.timer);

    const user = this.app.userManager.getUser();
    if (user) {
      this.app.adminController.addLiveBet('andar-bahar', user.username || user.name, betAmount, side);
    }

    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = true);
    document.getElementById('ab-result').textContent = 'Dealing cards...';
    document.getElementById('andar-cards').textContent = '🃏';
    document.getElementById('bahar-cards').textContent = '🃏';

    this.app.toastManager.show(`Bet ₹${betAmount} on ${side}`, 'info');

    // Admin logic & First 2 games hooking logic
    let winner;
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Andar Bahar') <= 2) {
      forceWinChoice = side;
    }
    const override = this.admin.getOverride('andarBahar');
    const finalWinner = override || forceWinChoice;

    if (finalWinner) {
      winner = finalWinner;
      if (override) this.admin.clearOverride('andarBahar');
    } else {
      winner = Math.random() > 0.5 ? 'Andar' : 'Bahar';
    }

    this.admin.setPrediction('andar-bahar', winner);

    setTimeout(() => {
      this.resolveRound(side, betAmount, winner);
    }, 2000);
  }

  resolveRound(side, betAmount, winner) {
    if (winner === 'Andar') {
      document.getElementById('andar-cards').innerHTML = '✅';
      document.getElementById('bahar-cards').innerHTML = '❌';
    } else {
      document.getElementById('andar-cards').innerHTML = '❌';
      document.getElementById('bahar-cards').innerHTML = '✅';
    }

    if (side === winner) {
      const winAmount = betAmount * 1.9;
      this.app.walletManager.addWinnings(winAmount, 'Andar Bahar');
      this.app.updateWalletDisplay();
      document.getElementById('ab-result').innerHTML = `🎉 You won ₹${winAmount.toFixed(2)}!`;
      document.getElementById('ab-result').style.color = 'var(--success)';
      this.app.toastManager.show(`You won ₹${winAmount.toFixed(2)}!`, 'success');
    } else {
      document.getElementById('ab-result').innerHTML = `${winner} won. You lost.`;
      document.getElementById('ab-result').style.color = 'var(--danger)';
    }

    this.app.adminController.clearOverride('andarBahar');
    this.app.adminController.clearLiveBets('andar-bahar');
    this.isPlaying = false;
    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = false);
    this.startTimer();
  }

  setupEvents() {
    document.getElementById('ab-bet-andar').addEventListener('click', () => this.placeBet('Andar'));
    document.getElementById('ab-bet-bahar').addEventListener('click', () => this.placeBet('Bahar'));

    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('ab-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
