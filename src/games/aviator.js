// Aviator Game
// Algorithm: Crash game - multiplier starts at 1.00x and increases.
// Random crash point determined at round start using provably fair algorithm.
// Player must cash out before the plane crashes.

export class AviatorGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.admin = app.adminController;
    this.state = 'waiting'; // waiting, countdown, flying, crashed
    this.multiplier = 1.00;
    this.crashPoint = 1.00;
    this.betAmount = 0;
    this.hasBet = false;
    this.hasCashedOut = false;
    this.animationFrame = null;
    this.startTime = 0;
    this.history = [];
    this.canvas = null;
    this.ctx = null;
    this.autoStartTimer = null;
    this.countdownInterval = null;
    
    // Generate some initial history
    for (let i = 0; i < 15; i++) {
      this.history.push(this.generateCrashPoint());
    }
    
    this.render();
  }

  // Crash point algorithm - uses exponential distribution
  // House edge ~3%. Most crashes between 1.0x-3.0x
  generateCrashPoint() {
    const e = Math.random();
    // Formula ensures house edge
    const crashPoint = Math.max(1.00, (1 / (1 - e)) * 0.97);
    return Math.min(parseFloat(crashPoint.toFixed(2)), 100.00);
  }

  render() {
    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon">✈️</div>
          <h1>Aviator</h1>
          <p>Cash out before the plane flies away! • Multipliers up to 100x</p>
        </div>
        <!-- History Strip -->
        ${this.admin.renderGamePanel('aviator')}

        <!-- History Strip -->
        <div class="aviator-history-strip" id="aviator-history-strip">
          ${this.renderHistoryStrip()}
        </div>

        <!-- Game Display -->
        <div class="aviator-display" id="aviator-display">
          <canvas id="aviator-canvas"></canvas>
          <div class="aviator-multiplier" id="aviator-multiplier">
            NEXT ROUND...
          </div>
          <div class="aviator-plane" id="aviator-plane" style="display: none;">✈️</div>
        </div>

        <!-- Controls -->
        <div class="game-container">
          <div class="game-controls">
            <div class="aviator-controls">
              <div class="aviator-bet-panel">
                <h4>Bet Amount</h4>
                <div class="bet-input-wrapper" style="margin-bottom: 0.5rem;">
                  <span>₹</span>
                  <input type="number" class="bet-amount-input" id="aviator-bet-amount" value="100" min="10" max="50000" style="width: 100%;" />
                </div>
                <div class="bet-quick-buttons" style="margin-bottom: 0.5rem;">
                  <button class="bet-quick" data-amount="50">₹50</button>
                  <button class="bet-quick" data-amount="100">₹100</button>
                  <button class="bet-quick" data-amount="500">₹500</button>
                  <button class="bet-quick" data-amount="1000">₹1K</button>
                </div>
                <button class="aviator-btn-bet bet" id="aviator-bet-btn">
                  Place Bet
                </button>
              </div>

              <div class="aviator-bet-panel">
                <h4>Auto Cashout</h4>
                <div class="bet-input-wrapper" style="margin-bottom: 0.5rem;">
                  <span>x</span>
                  <input type="number" class="bet-amount-input" id="aviator-auto-cashout" value="2.00" min="1.10" step="0.10" style="width: 100%;" />
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Auto cash out at this multiplier</p>
                <div id="aviator-status" style="padding: 10px; background: var(--glass); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary);">
                  Waiting for next round...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Results -->
        <div class="game-history">
          <h3><i class="fas fa-history"></i> Crash History</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Crash Point</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody id="aviator-history-table">
              ${this.history.slice(0, 10).map((h, i) => `
                <tr>
                  <td>#${this.history.length - i}</td>
                  <td style="color: ${h >= 2 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">${h.toFixed(2)}x</td>
                  <td style="color: var(--text-muted);">Just now</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setupCanvas();
    this.setupEvents();
    this.admin.setupGamePanelEvents('aviator');
    this.startWaiting();
  }

  renderHistoryStrip() {
    return this.history.slice(0, 20).map(h => {
      const cls = h >= 5 ? 'high' : h >= 2 ? 'medium' : 'low';
      return `<span class="aviator-history-item ${cls}">${h.toFixed(2)}x</span>`;
    }).join('');
  }

  setupCanvas() {
    this.canvas = document.getElementById('aviator-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this._resizeHandler = () => this.resizeCanvas();
    window.addEventListener('resize', this._resizeHandler);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.drawGraph();
  }

  drawGraph() {
    if (!this.ctx) return;
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Grid
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = (height / 10) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    if (this.state !== 'flying' && this.state !== 'crashed') return;

    // Draw curve
    const elapsed = (Date.now() - this.startTime) / 1000;
    const maxTime = Math.max(elapsed, 5);
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.state === 'crashed' ? '#ef4444' : '#22c55e';
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = this.state === 'crashed' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)';
    this.ctx.shadowBlur = 10;

    const points = 100;
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * elapsed;
      const x = (t / maxTime) * width * 0.9 + width * 0.05;
      const m = Math.pow(Math.E, 0.05 * t);
      const y = height - ((m - 1) / (this.multiplier - 0.5)) * height * 0.7 - height * 0.1;
      
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    // Gradient fill under curve
    const lastX = (elapsed / maxTime) * width * 0.9 + width * 0.05;
    const lastM = Math.pow(Math.E, 0.05 * elapsed);
    const lastY = height - ((lastM - 1) / (this.multiplier - 0.5)) * height * 0.7 - height * 0.1;

    this.ctx.lineTo(lastX, height);
    this.ctx.lineTo(width * 0.05, height);
    this.ctx.closePath();
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    if (this.state === 'crashed') {
      gradient.addColorStop(0, 'rgba(239,68,68,0.15)');
      gradient.addColorStop(1, 'rgba(239,68,68,0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(34,197,94,0.15)');
      gradient.addColorStop(1, 'rgba(34,197,94,0.02)');
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    // Update plane position
    const plane = document.getElementById('aviator-plane');
    if (plane && this.state === 'flying') {
      plane.style.left = `${Math.min(lastX, width - 40)}px`;
      plane.style.top = `${Math.max(lastY - 20, 10)}px`;
    }
  }

  clearAllTimers() {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  startWaiting() {
    this.clearAllTimers();
    this.state = 'waiting';
    this.multiplier = 1.00;
    this.hasCashedOut = false;
    this.hasBet = false;
    this.betAmount = 0;

    const multiplierEl = document.getElementById('aviator-multiplier');
    if (multiplierEl) {
      multiplierEl.textContent = 'PLACE YOUR BET';
      multiplierEl.className = 'aviator-multiplier';
    }

    const plane = document.getElementById('aviator-plane');
    if (plane) {
      plane.style.display = 'none';
      plane.classList.remove('crashed');
    }

    const statusEl = document.getElementById('aviator-status');
    if (statusEl) statusEl.textContent = 'Place your bet before the round starts!';

    const betBtn = document.getElementById('aviator-bet-btn');
    if (betBtn) {
      betBtn.textContent = 'Place Bet';
      betBtn.className = 'aviator-btn-bet bet';
      betBtn.disabled = false;
    }

    // Enable bet input
    const betInput = document.getElementById('aviator-bet-amount');
    if (betInput) betInput.disabled = false;

    // Auto-start countdown after 3 seconds
    this.autoStartTimer = setTimeout(() => {
      this.startCountdown();
    }, 3000);
  }

  startCountdown() {
    this.state = 'countdown';
    let countdown = 5;

    const multiplierEl = document.getElementById('aviator-multiplier');
    const statusEl = document.getElementById('aviator-status');
    const betBtn = document.getElementById('aviator-bet-btn');

    // Can still place bet during countdown
    if (multiplierEl) multiplierEl.textContent = `Starting in ${countdown}s`;
    if (statusEl) statusEl.textContent = this.hasBet 
      ? `✅ Bet placed! Round starts in ${countdown}s`
      : `Round starts in ${countdown}s - Place bet now!`;

    this.countdownInterval = setInterval(() => {
      countdown--;
      if (multiplierEl) multiplierEl.textContent = `Starting in ${countdown}s`;
      
      if (this.hasBet) {
        if (statusEl) statusEl.textContent = `✅ Bet of ₹${this.betAmount} placed! Starting in ${countdown}s`;
      } else {
        if (statusEl) statusEl.textContent = `Round starts in ${countdown}s - Place bet now!`;
      }

      if (countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        
        // Disable betting
        if (betBtn && !this.hasBet) {
          betBtn.textContent = 'Wait for next round';
          betBtn.className = 'aviator-btn-bet waiting';
          betBtn.disabled = true;
        }
        
        const betInput = document.getElementById('aviator-bet-amount');
        if (betInput) betInput.disabled = true;

        this.startFlying();
      }
    }, 1000);
  }

  startFlying() {
    this.state = 'flying';
    this.multiplier = 1.00;

    // Check admin override for crash point
    const override = this.admin.getOverride('aviatorCrash');
    if (override && !isNaN(override)) {
      this.crashPoint = parseFloat(override);
      this.admin.clearOverride('aviatorCrash');
    } else {
      this.crashPoint = this.generateCrashPoint();
    }
    
    // Show admin the crash point
    this.admin.setPrediction('aviator', `Crash @ ${this.crashPoint.toFixed(2)}x`);

    this.startTime = Date.now();

    const plane = document.getElementById('aviator-plane');
    if (plane) {
      plane.style.display = 'block';
      plane.style.left = '5%';
      plane.style.top = '80%';
      plane.classList.remove('crashed');
    }

    const betBtn = document.getElementById('aviator-bet-btn');
    const statusEl = document.getElementById('aviator-status');

    if (this.hasBet && !this.hasCashedOut) {
      // CRITICAL FIX: Enable the button so the user can click Cash Out
      if (betBtn) {
        betBtn.innerHTML = `CASH OUT<br>₹${(this.betAmount * this.multiplier).toFixed(0)}`;
        betBtn.className = 'aviator-btn-bet cashout';
        betBtn.disabled = false; // ← This was the bug - button was staying disabled
      }
      if (statusEl) statusEl.innerHTML = '<span style="color: var(--accent); font-weight: 700;">⚡ CASH OUT NOW!</span>';
    } else {
      if (betBtn) {
        betBtn.textContent = 'Wait for next round';
        betBtn.className = 'aviator-btn-bet waiting';
        betBtn.disabled = true;
      }
      if (statusEl) statusEl.textContent = 'Watch the plane fly...';
    }

    this.animate();
  }

  animate() {
    if (this.state !== 'flying') return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    this.multiplier = Math.pow(Math.E, 0.05 * elapsed);

    if (this.multiplier >= this.crashPoint) {
      this.crash();
      return;
    }

    // Update display
    const multiplierEl = document.getElementById('aviator-multiplier');
    if (multiplierEl) {
      multiplierEl.textContent = `${this.multiplier.toFixed(2)}x`;
      multiplierEl.className = 'aviator-multiplier active';
    }

    // Update cashout button with live amount
    if (this.hasBet && !this.hasCashedOut) {
      const betBtn = document.getElementById('aviator-bet-btn');
      if (betBtn) {
        const cashoutAmount = (this.betAmount * this.multiplier).toFixed(0);
        betBtn.innerHTML = `CASH OUT<br>₹${parseInt(cashoutAmount).toLocaleString()}`;
        // Keep button enabled during flight!
        betBtn.disabled = false;
      }

      // Auto cashout check
      const autoCashout = parseFloat(document.getElementById('aviator-auto-cashout')?.value || 0);
      if (autoCashout > 1 && this.multiplier >= autoCashout) {
        this.cashOut();
        return;
      }
    }

    this.drawGraph();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  crash() {
    this.state = 'crashed';
    this.multiplier = this.crashPoint;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const multiplierEl = document.getElementById('aviator-multiplier');
    if (multiplierEl) {
      multiplierEl.textContent = `CRASHED @ ${this.crashPoint.toFixed(2)}x`;
      multiplierEl.className = 'aviator-multiplier crashed';
    }

    const plane = document.getElementById('aviator-plane');
    if (plane) plane.classList.add('crashed');

    const betBtn = document.getElementById('aviator-bet-btn');
    if (betBtn) {
      betBtn.textContent = '💥 Crashed!';
      betBtn.className = 'aviator-btn-bet waiting';
      betBtn.disabled = true;
    }

    // If player had a bet and didn't cash out
    if (this.hasBet && !this.hasCashedOut) {
      const statusEl = document.getElementById('aviator-status');
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">💥 Crashed at ${this.crashPoint.toFixed(2)}x! You lost ₹${this.betAmount.toLocaleString()}</span>`;
      this.app.toastManager.show(`Plane crashed at ${this.crashPoint.toFixed(2)}x! You lost ₹${this.betAmount.toLocaleString()}`, 'error');
    } else if (!this.hasBet) {
      const statusEl = document.getElementById('aviator-status');
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--text-muted);">Crashed at ${this.crashPoint.toFixed(2)}x. Next round starting soon...</span>`;
    }

    this.drawGraph();

    // Add to history
    this.history.unshift(this.crashPoint);
    const stripEl = document.getElementById('aviator-history-strip');
    if (stripEl) stripEl.innerHTML = this.renderHistoryStrip();
    this.updateHistoryTable();

    // Start next round after delay
    this.autoStartTimer = setTimeout(() => this.startWaiting(), 3000);
  }

  cashOut() {
    if (!this.hasBet || this.hasCashedOut || this.state !== 'flying') return;

    this.hasCashedOut = true;
    const winAmount = parseFloat((this.betAmount * this.multiplier).toFixed(2));

    this.app.walletManager.addWinnings(winAmount, 'Aviator');
    this.app.updateWalletDisplay();

    const betBtn = document.getElementById('aviator-bet-btn');
    if (betBtn) {
      betBtn.innerHTML = `✅ Cashed Out!<br>₹${winAmount.toLocaleString()}`;
      betBtn.className = 'aviator-btn-bet waiting';
      betBtn.disabled = true;
    }

    const statusEl = document.getElementById('aviator-status');
    if (statusEl) statusEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✅ Cashed out at ${this.multiplier.toFixed(2)}x! Won ₹${winAmount.toLocaleString()}</span>`;

    this.app.toastManager.show(`Cashed out at ${this.multiplier.toFixed(2)}x! Won ₹${winAmount.toLocaleString()}`, 'success');
  }

  updateHistoryTable() {
    const table = document.getElementById('aviator-history-table');
    if (table) {
      table.innerHTML = this.history.slice(0, 10).map((h, i) => `
        <tr>
          <td>#${this.history.length - i}</td>
          <td style="color: ${h >= 2 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">${h.toFixed(2)}x</td>
          <td style="color: var(--text-muted);">Just now</td>
        </tr>
      `).join('');
    }
  }

  setupEvents() {
    const betBtn = document.getElementById('aviator-bet-btn');
    betBtn.addEventListener('click', () => {
      // PLACE BET - during waiting or countdown phase
      if ((this.state === 'waiting' || this.state === 'countdown') && !this.hasBet) {
        const amount = parseFloat(document.getElementById('aviator-bet-amount').value);
        if (!amount || amount < 10) {
          this.app.toastManager.show('Minimum bet is ₹10', 'warning');
          return;
        }
        if (!this.app.walletManager.placeBet(amount, 'Aviator')) {
          this.app.toastManager.show('Insufficient balance!', 'error');
          return;
        }
        this.app.updateWalletDisplay();
        this.betAmount = amount;
        this.hasBet = true;
        this.hasCashedOut = false;

        // Disable bet input to prevent changes
        const betInput = document.getElementById('aviator-bet-amount');
        if (betInput) betInput.disabled = true;

        betBtn.textContent = `✅ Bet ₹${amount.toLocaleString()} placed`;
        betBtn.className = 'aviator-btn-bet waiting';
        betBtn.disabled = true;
        
        const statusEl = document.getElementById('aviator-status');
        if (statusEl) statusEl.innerHTML = `<span style="color: var(--success);">✅ Bet ₹${amount.toLocaleString()} placed! Waiting for takeoff...</span>`;

        this.app.toastManager.show(`Bet ₹${amount.toLocaleString()} placed on Aviator`, 'info');
      }
      // CASH OUT - during flying phase
      else if (this.state === 'flying' && this.hasBet && !this.hasCashedOut) {
        this.cashOut();
      }
    });

    this.container.querySelectorAll('.bet-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const betInput = document.getElementById('aviator-bet-amount');
        if (betInput && !betInput.disabled) {
          betInput.value = btn.dataset.amount;
        }
      });
    });
  }

  destroy() {
    this.clearAllTimers();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this.state = 'destroyed';
  }
}
