// Teen Patti Game
// Algorithm: 3-card poker variant. Hand rankings determine winner.
// Player A vs Player B - bet on which player gets the better hand.

export class TeenPattiGame {
  constructor(container, app, theme = null) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.theme = theme;
    this.isPlaying = false;
    this.history = [];
    this.suits = ['♠', '♥', '♦', '♣'];
    this.suitColors = { '♠': '#fff', '♥': '#ef4444', '♦': '#ef4444', '♣': '#fff' };
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.timer = null;
    this.countdown = 20;
    this.render();
  }

  // Hand rankings (low to high):
  // 0: High Card, 1: Pair, 2: Flush, 3: Sequence (Run), 4: Pure Sequence, 5: Trail (Three of a kind)
  getHandRank(cards) {
    const vals = cards.map(c => c.numericValue).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
    const isSequence = (vals[2] - vals[1] === 1 && vals[1] - vals[0] === 1) ||
                       (vals[0] === 1 && vals[1] === 12 && vals[2] === 13); // A-K-Q
    const isTrail = vals[0] === vals[1] && vals[1] === vals[2];
    const isPair = vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2];

    if (isTrail) return { rank: 5, name: 'Trail', score: 5000 + vals[0] };
    if (isSequence && isFlush) return { rank: 4, name: 'Pure Sequence', score: 4000 + vals[2] };
    if (isSequence) return { rank: 3, name: 'Sequence', score: 3000 + vals[2] };
    if (isFlush) return { rank: 2, name: 'Flush', score: 2000 + vals[2] * 100 + vals[1] * 10 + vals[0] };
    if (isPair) {
      const pairVal = vals[0] === vals[1] ? vals[0] : vals[1] === vals[2] ? vals[1] : vals[0];
      return { rank: 1, name: 'Pair', score: 1000 + pairVal * 10 };
    }
    return { rank: 0, name: 'High Card', score: vals[2] * 100 + vals[1] * 10 + vals[0] };
  }

  drawCard(usedCards) {
    let card;
    do {
      const valueIdx = Math.floor(Math.random() * 13);
      const suit = this.suits[Math.floor(Math.random() * 4)];
      card = {
        value: this.values[valueIdx],
        numericValue: valueIdx + 1,
        suit: suit,
        color: this.suitColors[suit],
        id: `${this.values[valueIdx]}${suit}`
      };
    } while (usedCards.has(card.id));
    usedCards.add(card.id);
    return card;
  }

  drawHand(usedCards) {
    return [this.drawCard(usedCards), this.drawCard(usedCards), this.drawCard(usedCards)];
  }

  render() {
    const t = this.theme || {};
    const title = t.title || 'Teen Patti';
    const subtitle = t.subtitle || 'Classic 3-card game • Bet on Player A or Player B • Best hand wins';
    const headerImg = t.img || '/games/teen-patti.png';
    const headerBg = t.headerBg || 'linear-gradient(135deg, #1a1a2e, #16213e)';
    const accent = t.accentColor || 'var(--accent)';
    const labelA = t.labelA || '🔵 Player A';
    const labelB = t.labelB || '🔴 Player B';

    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header" style="background: ${headerBg};">
          <div class="game-header-icon"><img src="${headerImg}" alt="${title}" style="height:60px; border-radius:8px;" /></div>
          <h1 style="background: linear-gradient(to right, #fff, ${accent}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">${title}</h1>
          <p>${subtitle}</p>
        </div>

        ${this.admin.renderGamePanel('teen-patti')}

        <div class="aviator-history-strip" id="tp-history-strip">
          ${this.history.length === 0 ? '<span style="color: var(--text-muted); font-size: 0.8rem;">No results yet</span>' : 
            this.history.slice(0, 15).map(h => `
              <span class="aviator-history-item ${h.winner === 'A' ? 'high' : 'low'}">${h.winner === 'A' ? '🔵' : '🔴'} Player ${h.winner}</span>
            `).join('')}
        </div>

        <div class="game-container">
          <div class="game-area">
            <div class="game-timer" id="tp-timer">
              <i class="fas fa-clock"></i> Place your bets: <span id="tp-countdown">${this.countdown}s</span>
            </div>

            <div class="tp-hands">
              <div class="tp-hand">
                <div class="tp-hand-label player-a">${labelA}</div>
                <div class="tp-cards-row" id="player-a-cards">
                  <div class="tp-card"><div class="tp-card-back tp-card-back-a">A</div></div>
                  <div class="tp-card"><div class="tp-card-back tp-card-back-a">A</div></div>
                  <div class="tp-card"><div class="tp-card-back tp-card-back-a">A</div></div>
                </div>
                <div class="tp-hand-type" id="player-a-hand">?</div>
              </div>

              <div style="display: flex; align-items: center; font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--accent);">VS</div>

              <div class="tp-hand">
                <div class="tp-hand-label player-b">${labelB}</div>
                <div class="tp-cards-row" id="player-b-cards">
                  <div class="tp-card"><div class="tp-card-back tp-card-back-b">B</div></div>
                  <div class="tp-card"><div class="tp-card-back tp-card-back-b">B</div></div>
                  <div class="tp-card"><div class="tp-card-back tp-card-back-b">B</div></div>
                </div>
                <div class="tp-hand-type" id="player-b-hand">?</div>
              </div>
            </div>

            <div id="tp-result"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="tp-bet-amount" value="100" min="10" max="50000" />
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
              <button class="bet-option-btn tp-bet-a" id="tp-bet-a">
                🔵 Player A (1:1)
              </button>
              <button class="bet-option-btn tp-bet-b" id="tp-bet-b">
                🔴 Player B (1:1)
              </button>
            </div>
          </div>
        </div>

        <div class="game-history">
          <h3><i class="fas fa-history"></i> Recent Results</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Player A</th>
                <th>Player B</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody id="tp-history-table">
              <tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Play a round to see results</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupEvents();
    this.admin.setupGamePanelEvents('teen-patti');
    this.startTimer();
  }

  startTimer() {
    this.countdown = 20;
    this.updateTimerDisplay();
    this.timer = setInterval(() => {
      this.countdown--;
      this.updateTimerDisplay();
      if (this.countdown <= 0) clearInterval(this.timer);
    }, 1000);
  }

  updateTimerDisplay() {
    const el = document.getElementById('tp-countdown');
    if (el) el.textContent = `${this.countdown}s`;
  }

  revealCards(containerId, cards) {
    const container = document.getElementById(containerId);
    const cardEls = container.querySelectorAll('.tp-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        cardEls[i].innerHTML = `
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%; padding:0.2rem;">
            <div style="color: ${card.color}; font-weight: 800; font-family: 'Times New Roman', serif; font-size:1.2rem; line-height:1; text-align:left;">
              ${card.value}
            </div>
            <div style="color: ${card.color}; font-size: 2.8rem; text-align: center; text-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${card.suit}
            </div>
            <div style="color: ${card.color}; font-weight: 800; font-family: 'Times New Roman', serif; font-size:1.2rem; transform: rotate(180deg); line-height:1; text-align:left;">
              ${card.value}
            </div>
          </div>
        `;
        cardEls[i].classList.add('revealed');
        cardEls[i].style.background = '#ffffff';
        cardEls[i].style.color = '#000000';
        cardEls[i].style.border = '1px solid #d1d5db';
        cardEls[i].style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)';
      }, i * 400);
    });
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

    const betAmount = parseFloat(document.getElementById('tp-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Teen Patti')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();
    this.isPlaying = true;
    clearInterval(this.timer);
    document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = true);
    document.getElementById('tp-result').innerHTML = '';

    this.app.toastManager.show(`Bet ₹${betAmount} on Player ${side}`, 'info');

    // Register live bet
    const user = this.app.userManager.getUser();
    if (user) {
      this.app.adminController.addLiveBet('teen-patti', user.username || user.name, betAmount, side);
    }

    // Draw hands - with admin override support
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Teen Patti') <= 2) {
      forceWinChoice = side;
    }
    const override = this.admin.getOverride('teenPatti');
    const finalWinner = override || forceWinChoice;
    
    let handA, handB;
    
    if (finalWinner) {
      // Redraw until desired winner emerges
      let attempts = 0;
      do {
        const usedCards = new Set();
        handA = this.drawHand(usedCards);
        handB = this.drawHand(usedCards);
        const rA = this.getHandRank(handA);
        const rB = this.getHandRank(handB);
        const w = rA.score >= rB.score ? 'A' : 'B';
        attempts++;
        if (w === finalWinner || attempts > 50) break;
      } while (true);
      if (override) this.admin.clearOverride('teenPatti');
    } else {
      const usedCards = new Set();
      handA = this.drawHand(usedCards);
      handB = this.drawHand(usedCards);
    }

    // Show admin prediction
    const pRankA = this.getHandRank(handA);
    const pRankB = this.getHandRank(handB);
    this.admin.setPrediction('teen-patti', `Player ${pRankA.score >= pRankB.score ? 'A' : 'B'} (${pRankA.name} vs ${pRankB.name})`);

    // Reveal cards
    this.revealCards('player-a-cards', handA);
    setTimeout(() => {
      this.revealCards('player-b-cards', handB);
    }, 1400);

    // Evaluate and resolve
    setTimeout(() => {
      const rankA = this.getHandRank(handA);
      const rankB = this.getHandRank(handB);

      document.getElementById('player-a-hand').textContent = rankA.name;
      document.getElementById('player-b-hand').textContent = rankB.name;

      const winner = rankA.score >= rankB.score ? 'A' : 'B';
      let won = side === winner;
      let winAmount = won ? betAmount * 2 : 0;

      if (won) {
        this.app.walletManager.addWinnings(winAmount, 'Teen Patti');
        this.app.updateWalletDisplay();
        document.getElementById('tp-result').innerHTML = `
          <div class="game-result win">
            🎉 Player ${winner} wins with ${winner === 'A' ? rankA.name : rankB.name}! You won ₹${winAmount.toLocaleString()}!
          </div>
        `;
        this.app.toastManager.show(`You won ₹${winAmount.toLocaleString()}!`, 'success');
      } else {
        document.getElementById('tp-result').innerHTML = `
          <div class="game-result lose">
            Player ${winner} wins with ${winner === 'A' ? rankA.name : rankB.name}. You lost ₹${betAmount.toLocaleString()}.
          </div>
        `;
      }

      this.history.unshift({ winner, handA: rankA.name, handB: rankB.name });
      this.updateHistoryDisplays();

      this.app.adminController.clearOverride('teenPatti');
      this.app.adminController.clearLiveBets('teen-patti');
      this.isPlaying = false;
      document.querySelectorAll('.bet-option-btn').forEach(b => b.disabled = false);
      this.startTimer();
    }, 3500);
  }

  updateHistoryDisplays() {
    // Strip
    const strip = document.getElementById('tp-history-strip');
    if (strip) {
      strip.innerHTML = this.history.slice(0, 15).map(h => `
        <span class="aviator-history-item ${h.winner === 'A' ? 'high' : 'low'}">${h.winner === 'A' ? '🔵' : '🔴'} Player ${h.winner}</span>
      `).join('');
    }

    // Table
    const table = document.getElementById('tp-history-table');
    if (table) {
      table.innerHTML = this.history.slice(0, 10).map((h, i) => `
        <tr>
          <td>#${this.history.length - i}</td>
          <td>${h.handA}</td>
          <td>${h.handB}</td>
          <td style="font-weight: 700; color: ${h.winner === 'A' ? '#3b82f6' : '#ef4444'};">Player ${h.winner}</td>
        </tr>
      `).join('');
    }
  }

  setupEvents() {
    document.getElementById('tp-bet-a').addEventListener('click', () => this.placeBet('A'));
    document.getElementById('tp-bet-b').addEventListener('click', () => this.placeBet('B'));

    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('tp-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
