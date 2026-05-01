// Baccarat Game
// Superuser controls can override to Player, Banker, or Tie.

export class BaccaratGame {
  constructor(container, app, theme = null) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.theme = theme;
    this.isPlaying = false;
    this.history = [];
    this.timer = null;
    this.countdown = 15;
    this.render();
  }

  render() {
    const t = this.theme || {};
    const title = t.title || 'Baccarat';
    const subtitle = t.subtitle || 'Premium Table Game • Player vs Banker';
    const headerImg = t.img || '/games/baccarat.png';
    const headerBg = t.headerBg || 'linear-gradient(135deg, #1a1a2e, #16213e)';
    const accent = t.accentColor || 'var(--accent)';

    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header" style="background: ${headerBg};">
          <div class="game-header-icon"><img src="${headerImg}" alt="${title}" style="height:60px; border-radius:8px;" /></div>
          <h1 style="background: linear-gradient(to right, #fff, ${accent}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">${title}</h1>
          <p>${subtitle}</p>
        </div>

        ${this.admin.renderGamePanel('baccarat')}

        <div class="game-container">
          <div class="game-area" style="text-align: center; padding: 2rem;">
            <div class="game-timer" id="bac-timer" style="margin-bottom: 2rem; font-size: 1.25rem;">
              <i class="fas fa-clock"></i> Place bets: <span id="bac-countdown">${this.countdown}s</span>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
              <div style="padding: 2rem; background: rgba(59,130,246,0.1); border: 1px solid #3b82f6; border-radius: var(--radius-lg); flex: 1;">
                <h2 style="color: #3b82f6; margin-bottom: 1rem;">Player (1:1)</h2>
                <div id="player-cards" style="font-size: 3rem;">🃏</div>
              </div>
              <div style="padding: 2rem; background: rgba(34,197,94,0.1); border: 1px solid #22c55e; border-radius: var(--radius-lg); flex: 0.5;">
                <h2 style="color: #22c55e; margin-bottom: 1rem;">Tie (8:1)</h2>
                <div id="tie-cards" style="font-size: 3rem;">🤝</div>
              </div>
              <div style="padding: 2rem; background: rgba(239,68,68,0.1); border: 1px solid #ef4444; border-radius: var(--radius-lg); flex: 1;">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">Banker (0.95:1)</h2>
                <div id="banker-cards" style="font-size: 3rem;">🃏</div>
              </div>
            </div>

            <div id="bac-result" style="font-size: 1.5rem; font-weight: bold; min-height: 40px;"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="bac-bet-amount" value="100" min="10" />
              </div>
              <div class="bet-quick-buttons">
                <button class="bet-quick" data-amount="50">₹50</button>
                <button class="bet-quick" data-amount="100">₹100</button>
                <button class="bet-quick" data-amount="500">₹500</button>
                <button class="bet-quick" data-amount="1000">₹1K</button>
              </div>
            </div>
            <div class="bet-options" style="display: flex; gap: 1rem;">
              <button class="bet-option-btn" id="bac-bet-player" style="background: #3b82f6; color: white; flex: 1;">Player</button>
              <button class="bet-option-btn" id="bac-bet-tie" style="background: #22c55e; color: white; flex: 1;">Tie</button>
              <button class="bet-option-btn" id="bac-bet-banker" style="background: #ef4444; color: white; flex: 1;">Banker</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.admin.setupGamePanelEvents('baccarat');
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
    const el = document.getElementById('bac-countdown');
    if (el) el.textContent = `${this.countdown}s`;
  }

  placeBet(side) {
    if (this.isPlaying) return;

    if (!this.app.userManager.isLoggedIn()) {
      this.app.toastManager.show('Please login to place bets', 'warning');
      this.app.openModal('login-modal');
      return;
    }

    const betAmount = parseFloat(document.getElementById('bac-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Baccarat')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();
    this.isPlaying = true;
    clearInterval(this.timer);

    const user = this.app.userManager.getUser();
    if (user) {
      this.app.adminController.addLiveBet('baccarat', user.username || user.name, betAmount, side);
    }

    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = true);
    document.getElementById('bac-result').textContent = 'Dealing natural...';

    this.app.toastManager.show(`Bet ₹${betAmount} on ${side}`, 'info');

    // Admin logic & First 2 games hooking logic
    let winner;
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Baccarat') <= 2) {
      forceWinChoice = side;
    }
    const override = this.admin.getOverride('baccarat');
    const finalWinner = override || forceWinChoice;

    if (finalWinner) {
      winner = finalWinner;
      if (override) this.admin.clearOverride('baccarat');
    } else {
      const rand = Math.random();
      if (rand < 0.45) winner = 'Player';
      else if (rand < 0.90) winner = 'Banker';
      else winner = 'Tie';
    }

    this.admin.setPrediction('baccarat', winner);

    setTimeout(() => {
      this.resolveRound(side, betAmount, winner);
    }, 2500);
  }

  resolveRound(side, betAmount, winner) {
    let winAmount = 0;
    
    if (side === winner) {
      if (winner === 'Player') winAmount = betAmount * 2;
      else if (winner === 'Banker') winAmount = betAmount * 1.95;
      else if (winner === 'Tie') winAmount = betAmount * 9;
      
      this.app.walletManager.addWinnings(winAmount, 'Baccarat');
      document.getElementById('bac-result').innerHTML = `🎉 ${winner} wins! You won ₹${winAmount.toFixed(2)}!`;
      document.getElementById('bac-result').style.color = 'var(--success)';
      this.app.toastManager.show(`You won ₹${winAmount.toFixed(2)}!`, 'success');
    } else {
      document.getElementById('bac-result').innerHTML = `${winner} wins. You lost.`;
      document.getElementById('bac-result').style.color = 'var(--danger)';
    }

    this.app.updateWalletDisplay();

    this.app.adminController.clearOverride('baccarat');
    this.app.adminController.clearLiveBets('baccarat');
    this.isPlaying = false;
    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = false);
    this.startTimer();
  }

  setupEvents() {
    document.getElementById('bac-bet-player').addEventListener('click', () => this.placeBet('Player'));
    document.getElementById('bac-bet-banker').addEventListener('click', () => this.placeBet('Banker'));
    document.getElementById('bac-bet-tie').addEventListener('click', () => this.placeBet('Tie'));

    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('bac-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
