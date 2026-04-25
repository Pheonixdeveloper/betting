// ========================================
// ADMIN DASHBOARD PAGE
// Full player management panel for the admin:
// - View all registered players
// - See each player's balance, total bet, total won, profit/loss
// - Credit/debit points to any player
// - Ban/unban players
// ========================================

export class AdminDashboardPage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.selectedUserId = null;
    this.creditAmount = 0;
    this.searchQuery = '';
    this.render();
  }

  getPlayerData() {
    const players = this.app.userManager.getAllPlayers();
    return players.map(p => {
      const stats = this.app.walletManager.getUserStats(p.id);
      return { ...p, ...stats };
    });
  }

  render() {
    const players = this.getPlayerData();
    const totalPlayers = players.length;
    const totalBalance = players.reduce((s, p) => s + p.balance, 0);
    const totalBetAll = players.reduce((s, p) => s + p.totalBet, 0);
    const totalWonAll = players.reduce((s, p) => s + p.totalWon, 0);
    const platformProfit = totalBetAll - totalWonAll;

    this.container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Header -->
        <div class="adm-header">
          <div class="adm-header-left">
            <h1><i class="fas fa-shield-alt"></i> Admin Dashboard</h1>
            <p>Manage players, credits & platform</p>
          </div>
          <div class="adm-header-right">
            <div class="adm-whatsapp-badge">
              <i class="fab fa-whatsapp"></i>
              <span>Players message you on WhatsApp to request credits</span>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="adm-stats-grid">
          <div class="adm-stat-card">
            <div class="adm-stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <i class="fas fa-users"></i>
            </div>
            <div class="adm-stat-info">
              <span class="adm-stat-value">${totalPlayers}</span>
              <span class="adm-stat-label">Total Players</span>
            </div>
          </div>
          <div class="adm-stat-card">
            <div class="adm-stat-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="adm-stat-info">
              <span class="adm-stat-value">₹${totalBalance.toLocaleString('en-IN')}</span>
              <span class="adm-stat-label">Total Balance (All)</span>
            </div>
          </div>
          <div class="adm-stat-card">
            <div class="adm-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
              <i class="fas fa-coins"></i>
            </div>
            <div class="adm-stat-info">
              <span class="adm-stat-value">₹${totalBetAll.toLocaleString('en-IN')}</span>
              <span class="adm-stat-label">Total Bets Placed</span>
            </div>
          </div>
          <div class="adm-stat-card">
            <div class="adm-stat-icon" style="background: linear-gradient(135deg, ${platformProfit >= 0 ? '#22c55e, #16a34a' : '#ef4444, #dc2626'});">
              <i class="fas fa-${platformProfit >= 0 ? 'chart-line' : 'chart-line'}"></i>
            </div>
            <div class="adm-stat-info">
              <span class="adm-stat-value" style="color: ${platformProfit >= 0 ? '#22c55e' : '#ef4444'};">
                ${platformProfit >= 0 ? '+' : '-'}₹${Math.abs(platformProfit).toLocaleString('en-IN')}
              </span>
              <span class="adm-stat-label">Platform Profit</span>
            </div>
          </div>
        </div>

        <!-- Search & Actions -->
        <div class="adm-toolbar">
          <div class="adm-search">
            <i class="fas fa-search"></i>
            <input type="text" id="adm-search-input" placeholder="Search players by name, username or phone..." />
          </div>
          <button class="adm-btn-create" id="adm-create-user-btn" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 6px; font-weight: 600;">
            <i class="fas fa-user-plus"></i> Create User Account
          </button>
          <button class="adm-btn-refresh" id="adm-refresh">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <!-- Live Bets Section -->
        <div class="adm-live-bets" style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: var(--accent);"><i class="fas fa-satellite-dish"></i> Live Bets Monitoring</h3>
          <div class="adm-table-container">
            <table class="adm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Player</th>
                  <th>Game</th>
                  <th>Bet Amount</th>
                  <th>Choice</th>
                  <th>Manipulate Outcome</th>
                </tr>
              </thead>
              <tbody id="adm-live-bets-body">
                ${this.renderLiveBetsRows()}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Players Table -->
        <div class="adm-table-container">
          <table class="adm-table" id="adm-players-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Username</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>Total Bet</th>
                <th>Total Won</th>
                <th>P/L</th>
                <th>Games</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adm-players-body">
              ${this.renderPlayersRows(players)}
            </tbody>
          </table>
          ${players.length === 0 ? `
            <div class="adm-empty">
              <i class="fas fa-user-slash"></i>
              <h3>No Players Yet</h3>
              <p>Players will appear here once they sign up</p>
            </div>
          ` : ''}
        </div>

        <!-- Credit Modal (inline) -->
        <div class="adm-credit-modal" id="adm-credit-modal" style="display: none;">
          <div class="adm-credit-overlay" id="adm-credit-overlay"></div>
          <div class="adm-credit-content">
            <div class="adm-credit-header">
              <h3><i class="fas fa-plus-circle"></i> Credit Points</h3>
              <button class="adm-credit-close" id="adm-credit-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="adm-credit-body">
              <div class="adm-credit-user-info" id="adm-credit-user-info"></div>
              <div class="adm-credit-form">
                <label>Amount to Credit (₹)</label>
                <div class="adm-credit-amount-group">
                  <input type="number" id="adm-credit-amount" placeholder="Enter amount" min="1" />
                </div>
                <div class="adm-credit-quick">
                  <button class="adm-quick-amt" data-amt="100">₹100</button>
                  <button class="adm-quick-amt" data-amt="500">₹500</button>
                  <button class="adm-quick-amt" data-amt="1000">₹1K</button>
                  <button class="adm-quick-amt" data-amt="5000">₹5K</button>
                  <button class="adm-quick-amt" data-amt="10000">₹10K</button>
                  <button class="adm-quick-amt" data-amt="50000">₹50K</button>
                </div>
                <label style="margin-top: 0.75rem;">Note (optional)</label>
                <input type="text" id="adm-credit-note" placeholder="e.g. Payment received via UPI" />
                <div class="adm-credit-actions">
                  <button class="adm-btn-credit" id="adm-submit-credit">
                    <i class="fas fa-plus-circle"></i> Credit Points
                  </button>
                  <button class="adm-btn-debit" id="adm-submit-debit">
                    <i class="fas fa-minus-circle"></i> Debit Points
                  </button>
                </div>
              </div>
            </div>
          </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create User Modal (inline) -->
        <div class="adm-credit-modal" id="adm-create-modal" style="display: none;">
          <div class="adm-credit-overlay" id="adm-create-overlay"></div>
          <div class="adm-credit-content">
            <div class="adm-credit-header">
              <h3><i class="fas fa-user-plus"></i> Create New User</h3>
              <button class="adm-credit-close" id="adm-create-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="adm-credit-body">
              <form id="adm-create-form" class="adm-credit-form">
                <label>Full Name</label>
                <input type="text" id="adm-new-name" placeholder="Enter player name" required style="margin-bottom: 1rem;" />
                
                <label>Username</label>
                <input type="text" id="adm-new-username" placeholder="Choose a username" required style="margin-bottom: 1rem;" />
                
                <label>Phone Number</label>
                <input type="tel" id="adm-new-phone" placeholder="Enter phone number" required style="margin-bottom: 1rem;" />

                <label>Temporary Password</label>
                <input type="text" id="adm-new-password" placeholder="e.g. Pass123" required style="margin-bottom: 1rem;" />

                <div style="font-size: 0.8rem; color: var(--warning); margin-bottom: 1rem;">
                  <i class="fas fa-info-circle"></i> User will be forced to set a new password upon first login.
                </div>

                <div class="adm-credit-actions">
                  <button type="submit" class="adm-btn-credit" style="background: var(--primary);">
                    <i class="fas fa-check"></i> Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    
    // Auto refresh live bets every 3 seconds
    if (this.liveBetsInterval) clearInterval(this.liveBetsInterval);
    this.liveBetsInterval = setInterval(() => {
      const liveBody = document.getElementById('adm-live-bets-body');
      if (liveBody) liveBody.innerHTML = this.renderLiveBetsRows();
      this.setupLiveBetEvents();
    }, 3000);
  }

  renderLiveBetsRows() {
    const bets = this.app.adminController.getLiveBets();
    if (bets.length === 0) {
      return `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No active bets right now</td></tr>`;
    }

    return bets.map(b => {
      let gameName = b.gameId.replace('-', ' ');
      gameName = gameName.charAt(0).toUpperCase() + gameName.slice(1);
      
      // Override properties map to global override state
      const overrideKey = b.gameId === 'dragon-tiger' ? 'dragonTiger' : 
                          b.gameId === 'teen-patti' ? 'teenPatti' : 
                          b.gameId === 'color-game' ? 'colorGame' : 
                          b.gameId === 'aviator' ? 'aviatorCrash' : 
                          b.gameId;

      return `
        <tr>
          <td>${b.time}</td>
          <td><strong>${b.userName}</strong></td>
          <td>${gameName}</td>
          <td>₹${b.amount.toLocaleString('en-IN')}</td>
          <td style="color: var(--accent); font-weight: 600;">${b.choice}</td>
          <td>
            <div class="adm-actions">
              <button class="adm-act-btn adm-act-unban force-win" data-game="${overrideKey}" data-choice="${b.choice}" title="Force Win">
                <i class="fas fa-check"></i>
              </button>
              <button class="adm-act-btn adm-act-ban force-lose" data-game="${overrideKey}" data-choice="${b.choice}" title="Force Lose">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderPlayersRows(players) {
    const query = this.searchQuery.toLowerCase();
    const filtered = query
      ? players.filter(p =>
          p.name.toLowerCase().includes(query) ||
          (p.username && p.username.toLowerCase().includes(query)) ||
          (p.phone && p.phone.toLowerCase().includes(query))
        )
      : players;

    if (filtered.length === 0 && query) {
      return `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-muted);">No players match "${query}"</td></tr>`;
    }

    return filtered.map(p => {
      const pl = p.profitLoss;
      const plColor = pl >= 0 ? '#22c55e' : '#ef4444';
      const plSign = pl >= 0 ? '+' : '-';
      const isBanned = p.isBanned === true;

      return `
        <tr class="${isBanned ? 'adm-row-banned' : ''}">
          <td>
            <div class="adm-player-cell">
              <div class="adm-player-avatar" style="${isBanned ? 'opacity: 0.4;' : ''}">${p.avatar || p.name.charAt(0).toUpperCase()}</div>
              <div>
                <div class="adm-player-name">${p.name}</div>
                <div class="adm-player-date">Joined ${new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </td>
          <td><span class="adm-username">@${p.username || 'N/A'}</span></td>
          <td>${p.phone || '—'}</td>
          <td><strong>₹${p.balance.toLocaleString('en-IN')}</strong></td>
          <td>₹${p.totalBet.toLocaleString('en-IN')}</td>
          <td>₹${p.totalWon.toLocaleString('en-IN')}</td>
          <td style="color: ${plColor}; font-weight: 700;">${plSign}₹${Math.abs(pl).toLocaleString('en-IN')}</td>
          <td>${p.totalGames}</td>
          <td>
            ${isBanned
              ? '<span class="adm-badge adm-badge-banned"><i class="fas fa-ban"></i> Banned</span>'
              : '<span class="adm-badge adm-badge-active"><i class="fas fa-check-circle"></i> Active</span>'
            }
          </td>
          <td>
            <div class="adm-actions">
              <button class="adm-act-btn adm-act-credit" data-uid="${p.id}" data-name="${p.name}" data-username="${p.username || ''}" title="Credit/Debit Points">
                <i class="fas fa-coins"></i>
              </button>
              ${isBanned
                ? `<button class="adm-act-btn adm-act-unban" data-uid="${p.id}" title="Unban User"><i class="fas fa-unlock"></i></button>`
                : `<button class="adm-act-btn adm-act-ban" data-uid="${p.id}" data-name="${p.name}" title="Ban User"><i class="fas fa-ban"></i></button>`
              }
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openCreditModal(userId, userName, username) {
    this.selectedUserId = userId;
    const stats = this.app.walletManager.getUserStats(userId);
    const modal = document.getElementById('adm-credit-modal');
    const info = document.getElementById('adm-credit-user-info');

    info.innerHTML = `
      <div class="adm-credit-player">
        <div class="adm-credit-player-avatar">${userName.charAt(0).toUpperCase()}</div>
        <div>
          <div class="adm-credit-player-name">${userName}</div>
          <div class="adm-credit-player-username">@${username || 'N/A'}</div>
        </div>
      </div>
      <div class="adm-credit-balance">
        <span>Current Balance</span>
        <strong>₹${stats.balance.toLocaleString('en-IN')}</strong>
      </div>
    `;

    document.getElementById('adm-credit-amount').value = '';
    document.getElementById('adm-credit-note').value = '';
    modal.style.display = 'flex';
  }

  closeCreditModal() {
    document.getElementById('adm-credit-modal').style.display = 'none';
    this.selectedUserId = null;
  }

  closeCreateModal() {
    document.getElementById('adm-create-modal').style.display = 'none';
    document.getElementById('adm-create-form').reset();
  }

  refreshTable() {
    const players = this.getPlayerData();
    const body = document.getElementById('adm-players-body');
    if (body) body.innerHTML = this.renderPlayersRows(players);
    this.setupTableEvents();
  }

  setupEvents() {
    // Search
    const searchInput = document.getElementById('adm-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value;
        this.refreshTable();
      });
    }

    // Refresh
    const refreshBtn = document.getElementById('adm-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.render();
        this.app.toastManager.show('Dashboard refreshed', 'info');
      });
    }

    // Credit modal controls
    document.getElementById('adm-credit-close')?.addEventListener('click', () => this.closeCreditModal());
    document.getElementById('adm-credit-overlay')?.addEventListener('click', () => this.closeCreditModal());

    // Quick amounts
    this.container.querySelectorAll('.adm-quick-amt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('adm-credit-amount').value = btn.dataset.amt;
      });
    });

    // Create User Modal
    document.getElementById('adm-create-user-btn')?.addEventListener('click', () => {
      document.getElementById('adm-create-modal').style.display = 'flex';
    });
    
    document.getElementById('adm-create-close')?.addEventListener('click', () => this.closeCreateModal());
    document.getElementById('adm-create-overlay')?.addEventListener('click', () => this.closeCreateModal());

    document.getElementById('adm-create-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('adm-new-username').value;
      const name = document.getElementById('adm-new-name').value;
      const phone = document.getElementById('adm-new-phone').value;
      const password = document.getElementById('adm-new-password').value;

      // Check if username exists
      const existingUsers = this.app.userManager.getAllUsers();
      if (existingUsers.find(u => u.username === username)) {
        this.app.toastManager.show('Username already taken', 'error');
        return;
      }

      this.app.userManager.adminCreateUser({ username, name, phone, password });
      this.app.toastManager.show(`Account created for ${name}!`, 'success');
      this.closeCreateModal();
      this.refreshTable();
    });

    // Submit credit
    document.getElementById('adm-submit-credit')?.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('adm-credit-amount').value);
      const note = document.getElementById('adm-credit-note').value.trim();
      if (!amount || amount <= 0) {
        this.app.toastManager.show('Enter a valid amount', 'error');
        return;
      }
      if (!this.selectedUserId) return;

      this.app.walletManager.adminCredit(amount, this.selectedUserId, note || 'Credited by Admin');
      this.app.toastManager.show(`₹${amount.toLocaleString()} credited successfully!`, 'success');
      this.closeCreditModal();
      this.refreshTable();
    });

    // Submit debit
    document.getElementById('adm-submit-debit')?.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('adm-credit-amount').value);
      const note = document.getElementById('adm-credit-note').value.trim();
      if (!amount || amount <= 0) {
        this.app.toastManager.show('Enter a valid amount', 'error');
        return;
      }
      if (!this.selectedUserId) return;

      this.app.walletManager.adminDebit(amount, this.selectedUserId, note || 'Debited by Admin');
      this.app.toastManager.show(`₹${amount.toLocaleString()} debited successfully!`, 'info');
      this.closeCreditModal();
      this.refreshTable();
    });

    this.setupTableEvents();
  }

  setupTableEvents() {
    // Credit buttons
    this.container.querySelectorAll('.adm-act-credit').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openCreditModal(btn.dataset.uid, btn.dataset.name, btn.dataset.username);
      });
    });

    // Ban buttons
    this.container.querySelectorAll('.adm-act-ban').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm(`Ban player "${btn.dataset.name}"? They won't be able to place bets.`)) {
          this.app.userManager.banUser(btn.dataset.uid);
          this.app.toastManager.show(`${btn.dataset.name} has been banned`, 'warning');
          this.refreshTable();
        }
      });
    });

    // Unban buttons
    this.container.querySelectorAll('.adm-act-unban').forEach(btn => {
      btn.addEventListener('click', () => {
        this.app.userManager.unbanUser(btn.dataset.uid);
        this.app.toastManager.show('Player has been unbanned', 'success');
        this.refreshTable();
      });
    });
  }

  setupLiveBetEvents() {
    this.container.querySelectorAll('.force-win').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        const choice = btn.dataset.choice;
        this.app.adminController.setOverride(game, choice);
        this.app.toastManager.show(`✅ Forced WIN for choice: ${choice}`, 'success');
      });
    });

    this.container.querySelectorAll('.force-lose').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        const choice = btn.dataset.choice;
        
        // Pick an opposing result based on game
        let loseChoice = null;
        if (game === 'dragonTiger') loseChoice = choice === 'Dragon' ? 'Tiger' : 'Dragon';
        if (game === 'teenPatti') loseChoice = choice === 'A' ? 'B' : 'A';
        if (game === 'colorGame') loseChoice = choice === 'Red' ? 'Green' : 'Red';
        if (game === 'aviatorCrash') loseChoice = '1.0'; // instant crash
        if (game === 'roulette') loseChoice = choice === '0' ? '1' : '0';

        this.app.adminController.setOverride(game, loseChoice);
        this.app.toastManager.show(`❌ Forced LOSE for choice: ${choice}`, 'warning');
      });
    });
  }
}
