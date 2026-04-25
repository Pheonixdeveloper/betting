// ========================================
// ADMIN CONTROLLER
// Provides admin with full game control:
// - View next outcome before it happens
// - Force specific results
// - Adjust win probability
// - Unlimited balance
// ========================================

export class AdminController {
  constructor(app) {
    this.app = app;
    this.enabled = false;
    
    // Admin game overrides
    this.overrides = {
      // Dragon Tiger: 'dragon' | 'tiger' | 'tie' | null (random)
      dragonTiger: null,
      // Teen Patti: 'A' | 'B' | null
      teenPatti: null,
      // Aviator: specific crash point or null
      aviatorCrash: null,
      // Color Game: 'Red' | 'Green' | 'Blue' | 'Yellow' | 'Purple' | 'Orange' | null
      colorGame: null,
      // Roulette: specific number (0-36) or null
      roulette: null,
      // Global win probability multiplier (1 = normal, higher = more wins)
      winBoost: 1
    };

    // Predicted next outcomes (shown to admin before reveal)
    this.predictions = {
      dragonTiger: null,
      teenPatti: null,
      aviatorCrash: null,
      colorGame: null,
      roulette: null
    };
  }

  isActive() {
    return this.app.userManager.isAdmin();
  }

  // Get the override for a specific game, or null if no override
  getOverride(game) {
    if (!this.isActive()) return null;
    return this.overrides[game];
  }

  // Set an override for next round
  setOverride(game, value) {
    this.overrides[game] = value;
  }

  // Clear override after it's been used
  clearOverride(game) {
    this.overrides[game] = null;
  }

  // Set a prediction (for display in admin panel)
  setPrediction(game, value) {
    this.predictions[game] = value;
    this.updatePredictionDisplay(game, value);
  }

  updatePredictionDisplay(game, value) {
    const el = document.getElementById(`admin-predict-${game}`);
    if (el && value !== null) {
      el.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value);
      el.style.color = 'var(--accent)';
    } else if (el) {
      el.textContent = 'Random';
      el.style.color = 'var(--text-muted)';
    }
  }

  // Render admin panel for a specific game page
  renderGamePanel(game) {
    if (!this.isActive()) return '';

    const panels = {
      'dragon-tiger': this.dragonTigerPanel(),
      'teen-patti': this.teenPattiPanel(),
      'aviator': this.aviatorPanel(),
      'color-game': this.colorGamePanel(),
      'roulette': this.roulettePanel()
    };

    return `
      <div class="admin-game-panel" id="admin-game-panel">
        <div class="admin-panel-header">
          <span><i class="fas fa-crown"></i> ADMIN CONTROL</span>
          <button class="admin-toggle-btn" id="admin-panel-toggle">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        <div class="admin-panel-body" id="admin-panel-body">
          <div class="admin-prediction">
            <span class="admin-label">Next Outcome:</span>
            <span class="admin-value" id="admin-predict-${game}">Random</span>
          </div>
          ${panels[game] || ''}
          <div class="admin-action-row" style="margin-top: 0.75rem;">
            <label class="admin-label">Win Boost:</label>
            <select id="admin-win-boost" class="admin-select">
              <option value="1" ${this.overrides.winBoost === 1 ? 'selected' : ''}>Normal (1x)</option>
              <option value="2" ${this.overrides.winBoost === 2 ? 'selected' : ''}>2x Wins</option>
              <option value="5" ${this.overrides.winBoost === 5 ? 'selected' : ''}>5x Wins</option>
              <option value="10" ${this.overrides.winBoost === 10 ? 'selected' : ''}>Always Win</option>
            </select>
          </div>
          <div class="admin-action-row">
            <button class="admin-btn admin-btn-add" id="admin-add-balance">
              <i class="fas fa-plus"></i> +₹10,000
            </button>
            <button class="admin-btn admin-btn-clear" id="admin-clear-override">
              <i class="fas fa-times"></i> Clear Override
            </button>
          </div>
        </div>
      </div>
    `;
  }

  dragonTigerPanel() {
    return `
      <div class="admin-action-row">
        <label class="admin-label">Force Result:</label>
        <div class="admin-btn-group">
          <button class="admin-btn admin-btn-force" data-game="dragonTiger" data-val="dragon">🐉 Dragon</button>
          <button class="admin-btn admin-btn-force" data-game="dragonTiger" data-val="tiger">🐯 Tiger</button>
          <button class="admin-btn admin-btn-force" data-game="dragonTiger" data-val="tie">🤝 Tie</button>
        </div>
      </div>
    `;
  }

  teenPattiPanel() {
    return `
      <div class="admin-action-row">
        <label class="admin-label">Force Winner:</label>
        <div class="admin-btn-group">
          <button class="admin-btn admin-btn-force" data-game="teenPatti" data-val="A">🔵 Player A</button>
          <button class="admin-btn admin-btn-force" data-game="teenPatti" data-val="B">🔴 Player B</button>
        </div>
      </div>
    `;
  }

  aviatorPanel() {
    return `
      <div class="admin-action-row">
        <label class="admin-label">Force Crash At:</label>
        <div class="admin-btn-group">
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="1.10">1.10x</button>
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="1.50">1.50x</button>
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="2.00">2.00x</button>
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="5.00">5.00x</button>
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="10.00">10x</button>
          <button class="admin-btn admin-btn-force" data-game="aviatorCrash" data-val="50.00">50x</button>
        </div>
      </div>
    `;
  }

  colorGamePanel() {
    return `
      <div class="admin-action-row">
        <label class="admin-label">Force Color:</label>
        <div class="admin-btn-group">
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Red" style="background:#ef4444;">Red</button>
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Green" style="background:#22c55e;">Green</button>
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Blue" style="background:#3b82f6;">Blue</button>
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Yellow" style="background:#f59e0b;">Yellow</button>
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Purple" style="background:#8b5cf6;">Purple</button>
          <button class="admin-btn admin-btn-force" data-game="colorGame" data-val="Orange" style="background:#f97316;">Orange</button>
        </div>
      </div>
    `;
  }

  roulettePanel() {
    return `
      <div class="admin-action-row">
        <label class="admin-label">Force Number:</label>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <input type="number" id="admin-roulette-number" min="0" max="36" placeholder="0-36" class="admin-input" style="width: 80px;" />
          <button class="admin-btn admin-btn-force" data-game="roulette" data-val="custom" id="admin-roulette-set">Set</button>
          <button class="admin-btn admin-btn-force" data-game="roulette" data-val="0" style="background:#22c55e;">0</button>
          <button class="admin-btn admin-btn-force" data-game="roulette" data-val="7" style="background:#ef4444;">7</button>
          <button class="admin-btn admin-btn-force" data-game="roulette" data-val="17" style="background:#1f2937;">17</button>
          <button class="admin-btn admin-btn-force" data-game="roulette" data-val="36" style="background:#ef4444;">36</button>
        </div>
      </div>
    `;
  }

  // Setup event listeners for admin controls inside game pages
  setupGamePanelEvents(gameKey) {
    if (!this.isActive()) return;

    // Toggle panel
    const toggleBtn = document.getElementById('admin-panel-toggle');
    const body = document.getElementById('admin-panel-body');
    if (toggleBtn && body) {
      toggleBtn.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
      });
    }

    // Force result buttons
    document.querySelectorAll('.admin-btn-force').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        let val = btn.dataset.val;

        // Special case for roulette custom number
        if (game === 'roulette' && val === 'custom') {
          const input = document.getElementById('admin-roulette-number');
          val = input ? input.value : null;
        }

        if (game === 'aviatorCrash' || game === 'roulette') {
          val = parseFloat(val);
        }

        if (val !== null && val !== undefined && val !== '') {
          this.setOverride(game, val);
          this.app.toastManager.show(`🔧 Admin: Next ${game} result forced to: ${val}`, 'info');

          // Highlight active button
          document.querySelectorAll(`.admin-btn-force[data-game="${game}"]`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    // Win boost
    const winBoostSelect = document.getElementById('admin-win-boost');
    if (winBoostSelect) {
      winBoostSelect.addEventListener('change', () => {
        this.overrides.winBoost = parseInt(winBoostSelect.value);
        this.app.toastManager.show(`🔧 Admin: Win boost set to ${winBoostSelect.value}x`, 'info');
      });
    }

    // Add balance
    const addBalBtn = document.getElementById('admin-add-balance');
    if (addBalBtn) {
      addBalBtn.addEventListener('click', () => {
        this.app.walletManager.deposit(10000);
        this.app.updateWalletDisplay();
        this.app.toastManager.show('🔧 Admin: ₹10,000 added to wallet', 'success');
      });
    }

    // Clear overrides
    const clearBtn = document.getElementById('admin-clear-override');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.overrides.dragonTiger = null;
        this.overrides.teenPatti = null;
        this.overrides.aviatorCrash = null;
        this.overrides.colorGame = null;
        this.overrides.roulette = null;
        document.querySelectorAll('.admin-btn-force').forEach(b => b.classList.remove('active'));
        const predictEl = document.querySelector('.admin-value');
        if (predictEl) {
          predictEl.textContent = 'Random';
          predictEl.style.color = 'var(--text-muted)';
        }
        this.app.toastManager.show('🔧 Admin: All overrides cleared', 'info');
      });
    }
  }
}
