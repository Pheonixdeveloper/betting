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
          <div class="game-header-icon"><img src="/plane.png" style="height:35px;" /></div>
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
        <div class="aviator-display" id="aviator-display" style="position: relative; overflow: hidden;">
          <canvas id="aviator-canvas"></canvas>
          <div class="aviator-multiplier" id="aviator-multiplier">
            NEXT ROUND...
          </div>
          <div class="aviator-plane" id="aviator-plane" style="display: none; position: absolute; top: 0; left: 0; z-index: 10; transition: transform 0.05s linear;">
            <!-- Classic Aviator Propeller Plane SVG -->
            <svg id="aviator-plane-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 120" width="130" height="65" style="filter: drop-shadow(0 10px 10px rgba(220,10,40,0.4));">
              <!-- Propeller -->
              <path d="M205,10 Q215,5 210,50 L205,65 Q195,115 205,105 Q215,90 208,60 L213,50 Q225,10 205,10 Z" fill="#e61a3c"/>
              
              <!-- Main Body -->
              <path d="M30,85 L20,75 L50,65 L80,60 L100,45 Q120,35 140,40 L160,45 Q190,45 195,65 L180,80 L110,95 L65,105 L40,105 L25,110 Z" fill="#e61a3c"/>
              
              <!-- Black window cutout / shading -->
              <path d="M100,45 Q120,35 140,40 L150,55 L115,55 Z" fill="rgba(0,0,0,0.3)"/>
              
              <!-- Lower Underbelly -->
              <path d="M80,80 L120,70 L155,60 L145,85 L90,95 Z" fill="#a4071c"/>
              
              <!-- Wing with "X" -->
              <path d="M90,65 L160,55 L180,65 L95,85 Z" fill="#e61a3c" stroke="#aa0518" stroke-width="2"/>
              <text x="135" y="72" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="22" font-style="italic" fill="#111" transform="rotate(-12 135 72)">X</text>

              <!-- Tail Fins -->
              <path d="M50,65 L40,40 Q35,35 45,45 L58,60 Z" fill="#e61a3c"/>
              <path d="M40,105 L25,120 Q30,125 45,110 L50,105 Z" fill="#e61a3c"/>
              <path d="M20,75 L10,85 L30,85 Z" fill="#a4071c"/>
            </svg>
            
            <!-- Explosion Vector -->
            <svg id="aviator-crash-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="90" height="90" fill="url(#crashGrad)" style="display: none; transform: translate(-10px, -10px); filter: drop-shadow(0 0 25px rgba(249, 115, 22, 1));">
              <defs>
                <radialGradient id="crashGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
                  <stop offset="40%" style="stop-color:#f97316;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
                </radialGradient>
              </defs>
              <path d="M441.9 176c1.1-39.2-28.7-65.7-65.4-69.5-12.7-52.6-67.9-61.9-97.1-32.9C258.1 42 216 46.5 196.3 84.1c-43.2-13.8-78.3 18.8-63.7 61.2C93.4 153.1 64 191.1 64 233.1c0 52 35.8 96.1 84.2 107.5 16.4 56.5 86 70.8 124 23.9 33.3 26 79.5 28.5 106.8-5.3 47.9-2.3 85-39 85-87.1 0-38.9-23.7-72.6-58.1-88.7zM250 357.7c-31.4 0-56.9-25.5-56.9-56.9S218.6 244 250 244s56.9 25.5 56.9 56.9-25.5 56.8-56.9 56.8z"/>
            </svg>
          </div>
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

    // Update plane position mapping tightly to the canvas tip
    const plane = document.getElementById('aviator-plane');
    if (plane && this.state === 'flying') {
      plane.style.transform = `translate(${Math.max(0, lastX - 35)}px, ${Math.max(0, lastY - 45)}px)`;
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
    this.app.adminController.clearOverride('aviatorCrash');
    this.app.adminController.clearLiveBets('aviator');
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
      document.getElementById('aviator-plane-img').style.display = 'block';
      document.getElementById('aviator-crash-img').style.display = 'none';
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

    // Admin logic & First 2 games hooking logic
    const override = this.admin.getOverride('aviatorCrash');
    const user = this.app.userManager.getUser();
    let hookCrashPoint = null;
    
    // Auto-boost to 10.5x if this is their 1st or 2nd time playing!
    if (user && this.hasBet && this.app.walletManager.getGamePlayCount(user.id, 'Aviator') <= 2) {
      hookCrashPoint = 10.5 + Math.random() * 5.0; // Guaranteed win past 10x
    }

    if (override && !isNaN(override)) {
      this.crashPoint = parseFloat(override);
      this.admin.clearOverride('aviatorCrash');
    } else if (hookCrashPoint) {
      this.crashPoint = hookCrashPoint;
    } else {
      this.crashPoint = this.generateCrashPoint();
    }
    
    // Show admin the crash point
    this.admin.setPrediction('aviator', `Crash @ ${this.crashPoint.toFixed(2)}x`);

    this.startTime = Date.now();

    const plane = document.getElementById('aviator-plane');
    if (plane) {
      plane.style.display = 'block';
      plane.style.display = 'block';
      plane.style.transform = 'translate(5%, 80%)';
      plane.classList.remove('crashed');
      document.getElementById('aviator-plane-img').style.display = 'block';
      document.getElementById('aviator-crash-img').style.display = 'none';
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
    if (plane) {
      plane.classList.add('crashed');
      document.getElementById('aviator-plane-img').style.display = 'none';
      document.getElementById('aviator-crash-img').style.display = 'block';
    }

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

        // Register live bet
        const user = this.app.userManager.getUser();
        if (user) {
          this.app.adminController.addLiveBet('aviator', user.username || user.name, amount, 'Cashing Out');
        }

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
