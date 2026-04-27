export class ColorGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.isSpinning = false;
    this.selectedColor = null;
    this.history = [];
    this.canvas = null;
    this.ctx = null;
    this.rotation = 0;
    this.animFrame = null;

    this.colors = [
      { name: 'Red', hex: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
      { name: 'Green', hex: '#22c55e', gradient: ['#22c55e', '#16a34a'] },
      { name: 'Blue', hex: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
      { name: 'Yellow', hex: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
      { name: 'Purple', hex: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
      { name: 'Orange', hex: '#f97316', gradient: ['#f97316', '#ea580c'] }
    ];

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon">🎨</div>
          <h1>Color Game</h1>
          <p>Pick a color • Spin the wheel • Win 6x your bet!</p>
        </div>

        ${this.admin.renderGamePanel('color-game')}

        <div class="aviator-history-strip" id="color-history-strip">
          ${this.history.length === 0 ? '<span style="color: var(--text-muted); font-size: 0.8rem;">No results yet</span>' :
        this.history.slice(0, 20).map(h => `
              <span class="aviator-history-item" style="background: ${h.hex}22; color: ${h.hex};">● ${h.name}</span>
            `).join('')}
        </div>

        <div class="game-container">
          <div class="game-area">
            <div class="color-wheel-container">
              <div class="color-wheel">
                <div class="color-wheel-pointer">▼</div>
                <canvas id="color-wheel-canvas" width="250" height="250"></canvas>
              </div>

              <div id="color-result-area"></div>
              
              <h3 style="margin: 1rem 0 0.75rem; font-family: var(--font-display); font-size: 1rem; color: var(--text-secondary);">Select a Color</h3>
              <div class="color-options" id="color-options">
                ${this.colors.map(c => `
                  <button class="color-option ${c.name.toLowerCase()}" data-color="${c.name}" ${this.isSpinning ? 'disabled' : ''}>
                    ${c.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <div id="color-game-result"></div>
          </div>

          <div class="game-controls">
            <div class="bet-amount-group">
              <div class="bet-input-wrapper">
                <span>₹</span>
                <input type="number" class="bet-amount-input" id="color-bet-amount" value="100" min="10" max="50000" />
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
              <button class="btn btn-game btn-lg" id="color-spin-btn" disabled>
                <i class="fas fa-sync-alt"></i> Spin the Wheel
              </button>
            </div>
            <p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 0.75rem;">
              Select a color above, then spin! Correct color pays <strong style="color: var(--accent);">6x</strong> your bet.
            </p>
          </div>
        </div>

        <div class="game-history">
          <h3><i class="fas fa-history"></i> Recent Results</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Color</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody id="color-history-table">
              <tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding: 2rem;">Spin to see results</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupWheel();
    this.setupEvents();
    this.admin.setupGamePanelEvents('color-game');
  }

  setupWheel() {
    this.canvas = document.getElementById('color-wheel-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.drawWheel(0);
  }

  drawWheel(rotation) {
    if (!this.ctx) return;
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(cx, cy) - 4;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);

    const segAngle = (Math.PI * 2) / this.colors.length;

    this.colors.forEach((color, i) => {
      const start = segAngle * i;
      const end = start + segAngle;

      // Draw segment
      const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, color.gradient[1]);
      grad.addColorStop(1, color.gradient[0]);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, r, start, end);
      this.ctx.closePath();
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Border
      this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Text
      this.ctx.save();
      this.ctx.rotate(start + segAngle / 2);
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = 'bold 13px Inter';
      this.ctx.fillStyle = 'white';
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(color.name, r * 0.65, 0);
      this.ctx.restore();
    });

    // Center circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fill();
    this.ctx.strokeStyle = 'var(--accent)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.restore();
  }

  spin() {
    if (this.isSpinning || !this.selectedColor) return;

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

    const betAmount = parseFloat(document.getElementById('color-bet-amount').value);
    if (!betAmount || betAmount < 10) {
      this.app.toastManager.show('Minimum bet is ₹10', 'warning');
      return;
    }

    if (!this.app.walletManager.placeBet(betAmount, 'Color Game')) {
      this.app.toastManager.show('Insufficient balance!', 'error');
      return;
    }

    this.app.updateWalletDisplay();

    // Register live bet
    const user = this.app.userManager.getUser();
    if (user) {
      this.app.adminController.addLiveBet('color-game', user.username || user.name, betAmount, this.selectedColor);
    }

    this.isSpinning = true;
    document.getElementById('color-spin-btn').disabled = true;
    document.querySelectorAll('.color-option').forEach(b => b.disabled = true);
    document.getElementById('color-game-result').innerHTML = '';
    document.getElementById('color-result-area').innerHTML = '';

    // Admin logic & First 2 games hooking logic
    let forceWinChoice = null;
    if (user && this.app.walletManager.getGamePlayCount(user.id, 'Color Game') <= 2) {
      forceWinChoice = this.selectedColor;
    }
    const colorOverride = this.admin.getOverride('colorGame') || forceWinChoice;
    
    let winningIndex;
    if (colorOverride) {
      winningIndex = this.colors.findIndex(c => c.name === colorOverride);
      if (winningIndex === -1) winningIndex = Math.floor(Math.random() * this.colors.length);
      if (this.admin.getOverride('colorGame')) this.admin.clearOverride('colorGame');
    } else {
      winningIndex = Math.floor(Math.random() * this.colors.length);
    }
    const winningColor = this.colors[winningIndex];

    // Show admin prediction
    this.admin.setPrediction('color-game', winningColor.name);

    // Calculate target rotation
    const segAngle = (Math.PI * 2) / this.colors.length;
    // Pointer is at top (270 degrees / 3π/2)
    // We want the winning segment to be under the pointer
    const targetSegCenter = segAngle * winningIndex + segAngle / 2;
    // Total rotation: multiple full spins + align winning segment to top
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = fullSpins * Math.PI * 2 + (Math.PI * 2 - targetSegCenter + Math.PI * 1.5);

    const startRotation = this.rotation;
    const totalRotation = targetRotation;
    const duration = 4000;
    const startTime = Date.now();

    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: decelerate
      const eased = 1 - Math.pow(1 - progress, 3);

      this.rotation = startRotation + totalRotation * eased;
      this.drawWheel(this.rotation);

      if (progress < 1) {
        this.animFrame = requestAnimationFrame(animateSpin);
      } else {
        // Spin complete
        this.resolveResult(winningColor, betAmount);
      }
    };

    this.animFrame = requestAnimationFrame(animateSpin);
  }

  resolveResult(winningColor, betAmount) {
    this.isSpinning = false;

    // Show result display
    document.getElementById('color-result-area').innerHTML = `
      <div class="color-result-display" style="background: ${winningColor.hex};">
        <span style="font-weight: 800; color: white;">●</span>
      </div>
      <p style="font-weight: 700; font-size: 1rem; color: ${winningColor.hex};">${winningColor.name}!</p>
    `;

    const won = this.selectedColor === winningColor.name;
    const winAmount = betAmount * 6;

    if (won) {
      this.app.walletManager.addWinnings(winAmount, 'Color Game');
      this.app.updateWalletDisplay();
      document.getElementById('color-game-result').innerHTML = `
        <div class="game-result win">
          🎉 ${winningColor.name}! You won ₹${winAmount.toLocaleString()}!
        </div>
      `;
      this.app.toastManager.show(`You won ₹${winAmount.toLocaleString()}!`, 'success');
    } else {
      document.getElementById('color-game-result').innerHTML = `
        <div class="game-result lose">
          Result: ${winningColor.name}. Your pick: ${this.selectedColor}. Lost ₹${betAmount.toLocaleString()}.
        </div>
      `;
    }

    // Add to history
    this.history.unshift(winningColor);
    this.updateHistory();

    // Reset
    this.app.adminController.clearOverride('colorGame');
    this.app.adminController.clearLiveBets('color-game');
    this.selectedColor = null;
    document.querySelectorAll('.color-option').forEach(b => {
      b.disabled = false;
      b.classList.remove('selected');
    });
    document.getElementById('color-spin-btn').disabled = true;
  }

  updateHistory() {
    const strip = document.getElementById('color-history-strip');
    if (strip) {
      strip.innerHTML = this.history.slice(0, 20).map(h => `
        <span class="aviator-history-item" style="background: ${h.hex}22; color: ${h.hex};">● ${h.name}</span>
      `).join('');
    }

    const table = document.getElementById('color-history-table');
    if (table) {
      table.innerHTML = this.history.slice(0, 10).map((h, i) => `
        <tr>
          <td>#${this.history.length - i}</td>
          <td><span style="color: ${h.hex}; font-weight: 700;">● ${h.name}</span></td>
          <td style="color: var(--text-muted);">Just now</td>
        </tr>
      `).join('');
    }
  }

  setupEvents() {
    // Color selection
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isSpinning) return;
        document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedColor = btn.dataset.color;
        document.getElementById('color-spin-btn').disabled = false;
      });
    });

    // Spin button
    document.getElementById('color-spin-btn').addEventListener('click', () => this.spin());

    // Quick amounts
    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('color-bet-amount').value = btn.dataset.amount;
      });
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
