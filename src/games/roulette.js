// Roulette Game
// Algorithm: European roulette with 37 numbers (0-36)
// Bet types: Single number (35:1), Red/Black (1:1), Odd/Even (1:1), 1-18/19-36 (1:1)

export class RouletteGame {
  constructor(container, app, theme = null) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.theme = theme;
    this.isSpinning = false;
    this.selectedBets = [];
    this.history = [];
    this.canvas = null;
    this.ctx = null;
    this.rotation = 0;
    this.animFrame = null;

    // Roulette numbers in wheel order
    this.wheelNumbers = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
      24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];

    this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

    this.render();
  }

  isRed(num) {
    return this.redNumbers.includes(num);
  }

  getColor(num) {
    if (num === 0) return '#22c55e';
    return this.isRed(num) ? '#ef4444' : '#1f2937';
  }

  render() {
    const t = this.theme || {};
    const title = t.title || 'Roulette';
    const subtitle = t.subtitle || 'European Roulette • Single zero • Multiple bet types';
    const headerImg = t.img || '/games/roulette.png';
    const headerBg = t.headerBg || 'linear-gradient(135deg, #1a1a2e, #16213e)';
    const accent = t.accentColor || 'var(--accent)';

    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header" style="background: ${headerBg};">
          <div class="game-header-icon"><img src="${headerImg}" alt="${title}" style="height:60px; border-radius:8px;" /></div>
          <h1 style="background: linear-gradient(to right, #fff, ${accent}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">${title}</h1>
          <p>${subtitle}</p>
        </div>

        ${this.admin.renderGamePanel('roulette')}

        <div class="aviator-history-strip" id="roulette-history-strip">
          ${this.history.length === 0 ? '<span style="color: var(--text-muted); font-size: 0.8rem;">No results yet</span>' :
            this.history.slice(0, 20).map(h => `
              <span class="aviator-history-item" style="background: ${this.getColor(h)}33; color: ${this.getColor(h) === '#1f2937' ? '#ccc' : this.getColor(h)};">${h}</span>
            `).join('')}
        </div>

        <div class="game-container">
          <div class="game-area">
            <div class="roulette-wheel-container">
              <div class="roulette-wheel" id="roulette-wheel-wrapper">
                <div class="roulette-pointer">▼</div>
                <canvas id="roulette-canvas" width="280" height="280"></canvas>
              </div>
              <div id="roulette-result-area"></div>
            </div>

            <!-- Betting Grid -->
            <h3 style="font-family: var(--font-display); font-size: 1rem; color: var(--text-secondary); margin: 1rem 0;">Select Numbers</h3>
            <div class="roulette-bet-grid" id="roulette-grid">
              <div class="roulette-bet-cell green-cell" data-number="0">0</div>
              ${Array.from({length: 36}, (_, i) => {
                const num = i + 1;
                const colorClass = this.isRed(num) ? 'red-cell' : 'black-cell';
                return `<div class="roulette-bet-cell ${colorClass}" data-number="${num}">${num}</div>`;
              }).join('')}
            </div>

            <h3 style="font-family: var(--font-display); font-size: 1rem; color: var(--text-secondary); margin: 1rem 0;">Outside Bets</h3>
            <div class="roulette-outside-bets" id="roulette-outside">
              <button class="roulette-outside-btn" data-bet="red">🔴 Red (1:1)</button>
              <button class="roulette-outside-btn" data-bet="black">⚫ Black (1:1)</button>
              <button class="roulette-outside-btn" data-bet="green">🟢 Green (35:1)</button>
              <button class="roulette-outside-btn" data-bet="odd">Odd (1:1)</button>
              <button class="roulette-outside-btn" data-bet="even">Even (1:1)</button>
              <button class="roulette-outside-btn" data-bet="low">1-18 (1:1)</button>
              <button class="roulette-outside-btn" data-bet="high">19-36 (1:1)</button>
              <button class="roulette-outside-btn" data-bet="first12">1st 12 (2:1)</button>
              <button class="roulette-outside-btn" data-bet="second12">2nd 12 (2:1)</button>
            </div>

            <div id="roulette-selected" style="text-align: center; margin: 1rem 0; font-size: 0.85rem; color: var(--text-secondary);">
              No bets selected
            </div>
            <div id="roulette-game-result"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="roulette-bet-amount" value="100" min="10" max="50000" />
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
              <button class="btn btn-danger btn-sm" id="roulette-clear-btn" style="min-width: 100px;">
                <i class="fas fa-times"></i> Clear
              </button>
              <button class="btn btn-game btn-lg" id="roulette-spin-btn" disabled>
                <i class="fas fa-sync-alt"></i> Spin Roulette
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
                <th>Number</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody id="roulette-history-table">
              <tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding: 2rem;">Spin to see results</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupWheel();
    this.setupEvents();
    this.admin.setupGamePanelEvents('roulette');
  }

  setupWheel() {
    this.canvas = document.getElementById('roulette-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.drawWheel(0);
  }

  drawWheel(rotation) {
    if (!this.ctx) return;
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(cx, cy) - 6;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);

    const segAngle = (Math.PI * 2) / 37;

    this.wheelNumbers.forEach((num, i) => {
      const start = segAngle * i;
      const end = start + segAngle;

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, r, start, end);
      this.ctx.closePath();
      
      // Gradient for each slice to give a 3D effect
      const gradient = this.ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
      if (this.getColor(num) === '#ef4444') {
        gradient.addColorStop(0, '#f87171');
        gradient.addColorStop(1, '#b91c1c');
      } else if (this.getColor(num) === '#1f2937') {
        gradient.addColorStop(0, '#374151');
        gradient.addColorStop(1, '#111827');
      } else {
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#15803d');
      }
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Gold separating lines
      this.ctx.strokeStyle = 'rgba(255,215,0,0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Number text
      this.ctx.save();
      this.ctx.rotate(start + segAngle / 2);
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = 'bold 11px Inter';
      this.ctx.fillStyle = 'white';
      
      // Text drop shadow for realism
      this.ctx.shadowColor = "black";
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(num.toString(), r * 0.85, 0);
      
      this.ctx.restore();
    });

    // Outer rim styling
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.lineWidth = 12;
    const rimGrad = this.ctx.createLinearGradient(-r, -r, r, r);
    rimGrad.addColorStop(0, '#333');
    rimGrad.addColorStop(0.5, '#666');
    rimGrad.addColorStop(1, '#111');
    this.ctx.strokeStyle = rimGrad;
    this.ctx.stroke();

    // Center Hub
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
    
    // Radial glow center
    const centerGrad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 32);
    centerGrad.addColorStop(0, '#ffd700');
    centerGrad.addColorStop(0.5, '#b8860b');
    centerGrad.addColorStop(1, '#000000');
    
    this.ctx.fillStyle = centerGrad;
    this.ctx.fill();
    
    this.ctx.strokeStyle = 'rgba(255,215,0,0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Glossy Overlay effect for the whole wheel
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    const glossGrad = this.ctx.createLinearGradient(-r, -r, r, r);
    glossGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    glossGrad.addColorStop(0.3, 'rgba(255,255,255,0.05)');
    glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
    this.ctx.fillStyle = glossGrad;
    this.ctx.fill();

    // Center text
    this.ctx.font = 'bold 8px Inter';
    this.ctx.fillStyle = '#fff';
    this.ctx.shadowColor = "rgba(0,0,0,0.8)";
    this.ctx.shadowBlur = 2;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('EARN10X', 0, 0);

    this.ctx.restore();
  }

  spin() {
    if (this.isSpinning || this.selectedBets.length === 0) return;

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

    const betAmount = parseFloat(document.getElementById('roulette-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Roulette')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();

    // Register live bet
    const user = this.app.userManager.getUser();
    if (user) {
      const displayBet = this.selectedBets.map(b => b.type === 'number' ? b.value : b.type).join(', ');
      this.app.adminController.addLiveBet('roulette', user.username || user.name, betAmount, displayBet);
    }

    this.isSpinning = true;
    document.getElementById('roulette-spin-btn').disabled = true;
    document.getElementById('roulette-game-result').innerHTML = '';
    document.getElementById('roulette-result-area').innerHTML = '';

    // Determine winning number
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Roulette') <= 2 && this.selectedBets.length > 0) {
      // Pick the first bet the user placed as the target
      const targetBet = this.selectedBets[0];
      if (targetBet.type === 'number') forceWinChoice = targetBet.value;
      else if (targetBet.type === 'red') forceWinChoice = 1; // 1 is Red
      else if (targetBet.type === 'black') forceWinChoice = 2; // 2 is Black
      else if (targetBet.type === 'green') forceWinChoice = 0;
      else if (targetBet.type === 'even') forceWinChoice = 2;
      else if (targetBet.type === 'odd') forceWinChoice = 1;
      else if (targetBet.type === 'low') forceWinChoice = 10;
      else if (targetBet.type === 'high') forceWinChoice = 20;
      else if (targetBet.type === 'first12') forceWinChoice = 5;
      else if (targetBet.type === 'second12') forceWinChoice = 15;
    }

    const numOverride = this.admin.getOverride('roulette');
    const finalWinner = (numOverride !== null && numOverride !== undefined && !isNaN(numOverride)) ? numOverride : forceWinChoice;
    
    let winningNumber;
    if (finalWinner !== null && finalWinner !== undefined) {
      winningNumber = Math.max(0, Math.min(36, parseInt(finalWinner)));
      if (numOverride !== null) this.admin.clearOverride('roulette');
    } else {
      winningNumber = Math.floor(Math.random() * 37);
    }

    // Show admin prediction
    const color = winningNumber === 0 ? 'Green' : this.isRed(winningNumber) ? 'Red' : 'Black';
    this.admin.setPrediction('roulette', `${winningNumber} (${color})`);

    // Find wheel index for this number
    const wheelIndex = this.wheelNumbers.indexOf(winningNumber);
    const segAngle = (Math.PI * 2) / 37;

    // Calculate target rotation
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const targetSegAngle = segAngle * wheelIndex + segAngle / 2;
    const targetRotation = fullSpins * Math.PI * 2 + (Math.PI * 2 - targetSegAngle + Math.PI * 1.5);

    const startRotation = this.rotation;
    const duration = 5000;
    const startTime = Date.now();

    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      this.rotation = startRotation + targetRotation * eased;
      this.drawWheel(this.rotation);

      if (progress < 1) {
        this.animFrame = requestAnimationFrame(animateSpin);
      } else {
        this.resolveResult(winningNumber, betAmount);
      }
    };

    this.animFrame = requestAnimationFrame(animateSpin);
  }

  resolveResult(winningNumber, betAmount) {
    this.isSpinning = false;
    const color = winningNumber === 0 ? 'Green' : this.isRed(winningNumber) ? 'Red' : 'Black';

    // Show result
    document.getElementById('roulette-result-area').innerHTML = `
      <div class="roulette-number-display" style="background: ${this.getColor(winningNumber)}; color: white;">
        ${winningNumber}
      </div>
      <p style="font-weight: 700; color: ${this.getColor(winningNumber) === '#1f2937' ? '#ccc' : this.getColor(winningNumber)};">${color}</p>
    `;

    // Calculate winnings
    let totalWin = 0;
    const wins = [];

    this.selectedBets.forEach(bet => {
      if (bet.type === 'number' && bet.value === winningNumber) {
        totalWin += betAmount * 36; // 35:1 + original
        wins.push(`Number ${bet.value} (35:1)`);
      } else if (bet.type === 'red' && this.isRed(winningNumber) && winningNumber !== 0) {
        totalWin += betAmount * 2;
        wins.push('Red (1:1)');
      } else if (bet.type === 'black' && !this.isRed(winningNumber) && winningNumber !== 0) {
        totalWin += betAmount * 2;
        wins.push('Black (1:1)');
      } else if (bet.type === 'green' && winningNumber === 0) {
        totalWin += betAmount * 36;
        wins.push('Green (35:1)');
      } else if (bet.type === 'odd' && winningNumber !== 0 && winningNumber % 2 !== 0) {
        totalWin += betAmount * 2;
        wins.push('Odd (1:1)');
      } else if (bet.type === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) {
        totalWin += betAmount * 2;
        wins.push('Even (1:1)');
      } else if (bet.type === 'low' && winningNumber >= 1 && winningNumber <= 18) {
        totalWin += betAmount * 2;
        wins.push('1-18 (1:1)');
      } else if (bet.type === 'high' && winningNumber >= 19 && winningNumber <= 36) {
        totalWin += betAmount * 2;
        wins.push('19-36 (1:1)');
      } else if (bet.type === 'first12' && winningNumber >= 1 && winningNumber <= 12) {
        totalWin += betAmount * 3;
        wins.push('1st 12 (2:1)');
      } else if (bet.type === 'second12' && winningNumber >= 13 && winningNumber <= 24) {
        totalWin += betAmount * 3;
        wins.push('2nd 12 (2:1)');
      }
    });

    const resultEl = document.getElementById('roulette-game-result');
    if (totalWin > 0) {
      this.app.walletManager.addWinnings(totalWin, 'Roulette');
      this.app.updateWalletDisplay();
      resultEl.innerHTML = `
        <div class="game-result win">
          🎉 ${winningNumber} ${color}! Won ₹${totalWin.toLocaleString()} on ${wins.join(', ')}
        </div>
      `;
      this.app.toastManager.show(`You won ₹${totalWin.toLocaleString()}!`, 'success');
    } else {
      resultEl.innerHTML = `
        <div class="game-result lose">
          ${winningNumber} ${color}. No winning bets. Lost ₹${betAmount.toLocaleString()}.
        </div>
      `;
    }

    // History
    this.history.unshift(winningNumber);
    this.updateHistory();

    // Clear bets
    this.app.adminController.clearOverride('roulette');
    this.app.adminController.clearLiveBets('roulette');
    this.selectedBets = [];
    this.updateSelectedDisplay();
    document.querySelectorAll('.roulette-bet-cell, .roulette-outside-btn').forEach(el => {
      el.classList.remove('selected');
    });
    document.getElementById('roulette-spin-btn').disabled = true;
  }

  updateHistory() {
    const strip = document.getElementById('roulette-history-strip');
    if (strip) {
      strip.innerHTML = this.history.slice(0, 20).map(h => `
        <span class="aviator-history-item" style="background: ${this.getColor(h)}33; color: ${this.getColor(h) === '#1f2937' ? '#ccc' : this.getColor(h)};">${h}</span>
      `).join('');
    }

    const table = document.getElementById('roulette-history-table');
    if (table) {
      table.innerHTML = this.history.slice(0, 10).map((h, i) => {
        const color = h === 0 ? 'Green' : this.isRed(h) ? 'Red' : 'Black';
        return `
          <tr>
            <td>#${this.history.length - i}</td>
            <td style="font-weight: 700;">${h}</td>
            <td><span style="color: ${this.getColor(h) === '#1f2937' ? '#ccc' : this.getColor(h)}; font-weight: 700;">● ${color}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  updateSelectedDisplay() {
    const el = document.getElementById('roulette-selected');
    if (!el) return;
    if (this.selectedBets.length === 0) {
      el.textContent = 'No bets selected';
      document.getElementById('roulette-spin-btn').disabled = true;
    } else {
      const labels = this.selectedBets.map(b => b.type === 'number' ? `#${b.value}` : b.type);
      el.innerHTML = `<strong style="color: var(--accent);">Bets:</strong> ${labels.join(', ')}`;
      document.getElementById('roulette-spin-btn').disabled = false;
    }
  }

  toggleBet(type, value = null) {
    if (this.isSpinning) return;
    const existing = this.selectedBets.findIndex(b => b.type === type && b.value === value);
    if (existing !== -1) {
      this.selectedBets.splice(existing, 1);
      return false;
    } else {
      this.selectedBets.push({ type, value });
      return true;
    }
  }

  setupEvents() {
    // Number grid
    document.querySelectorAll('.roulette-bet-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const num = parseInt(cell.dataset.number);
        const added = this.toggleBet('number', num);
        cell.classList.toggle('selected', added);
        this.updateSelectedDisplay();
      });
    });

    // Outside bets
    document.querySelectorAll('.roulette-outside-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bet = btn.dataset.bet;
        const added = this.toggleBet(bet);
        btn.classList.toggle('selected', added);
        this.updateSelectedDisplay();
      });
    });

    // Spin
    document.getElementById('roulette-spin-btn').addEventListener('click', () => this.spin());

    // Clear
    document.getElementById('roulette-clear-btn').addEventListener('click', () => {
      this.selectedBets = [];
      document.querySelectorAll('.roulette-bet-cell, .roulette-outside-btn').forEach(el => {
        el.classList.remove('selected');
      });
      this.updateSelectedDisplay();
    });

    // Quick amounts
    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('roulette-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
