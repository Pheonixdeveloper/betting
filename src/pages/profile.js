// Profile Page

export class ProfilePage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    const user = this.app.userManager.getUser();
    if (!user) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-lock"></i>
          <h3>Please login to view profile</h3>
          <p>Login or create an account to access your profile.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="profile-page">
        <div class="profile-card">
          <div class="profile-avatar-large">${user.name.charAt(0).toUpperCase()}</div>
          <div class="profile-name">${user.name}</div>
          <div class="profile-phone">${user.phone}</div>
        </div>

        <div class="profile-tabs" style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button class="profile-tab-btn active" id="tab-edit-profile" style="flex:1; padding: 0.75rem; border-radius: var(--radius-sm); border: none; background: var(--primary); color: white; font-weight: 600; cursor: pointer;">Edit Profile</button>
          <button class="profile-tab-btn" id="tab-account-stmt" style="flex:1; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--glass); color: var(--text-primary); font-weight: 600; cursor: pointer;">Account Statement</button>
        </div>

        <div class="profile-form" id="section-edit-profile" style="margin-top: 1rem;">
          <h3 style="font-family: var(--font-display); margin-bottom: 1.25rem; font-size: 1.1rem;">
            <i class="fas fa-user-edit" style="color: var(--accent);"></i> Edit Profile
          </h3>
          <form id="profile-edit-form" class="auth-form">
            <div class="form-group">
              <label><i class="fas fa-user"></i> Full Name</label>
              <input type="text" id="profile-name" value="${user.name}" />
            </div>
            <div class="form-group">
              <label><i class="fas fa-phone"></i> Phone Number</label>
              <input type="tel" id="profile-phone" value="${user.phone}" disabled style="opacity: 0.5;" />
            </div>
            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Email</label>
              <input type="email" id="profile-email" value="${user.email || ''}" />
            </div>
            <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-save"></i> Save Changes</button>
          </form>
        </div>

        <div class="profile-form" id="section-account-stmt" style="display: none; margin-top: 1rem;">
          <h3 style="font-family: var(--font-display); margin-bottom: 1rem; font-size: 1.1rem;">
            <i class="fas fa-file-invoice-dollar" style="color: var(--accent);"></i> Account Statement
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Select a date range to view your credited and debited points history.</p>
          
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="flex: 1;">
              <label style="font-size: 0.8rem; display: block; margin-bottom: 0.25rem;"><i class="fas fa-calendar"></i> From Date</label>
              <input type="date" id="stmt-from-date" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-darker); color: var(--text-primary);" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 0.8rem; display: block; margin-bottom: 0.25rem;"><i class="fas fa-calendar"></i> To Date</label>
              <input type="date" id="stmt-to-date" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-darker); color: var(--text-primary);" />
            </div>
          </div>
          <button id="btn-fetch-stmt" class="btn btn-primary btn-full" style="margin-bottom: 1.5rem;"><i class="fas fa-search"></i> View Statement</button>

          <div id="stmt-results" style="max-height: 400px; overflow-y: auto; display: none;">
            <!-- table injected via JS -->
          </div>
        </div>

      </div>
    `;

    // Tab switching logic
    const tabEdit = document.getElementById('tab-edit-profile');
    const tabStmt = document.getElementById('tab-account-stmt');
    const secEdit = document.getElementById('section-edit-profile');
    const secStmt = document.getElementById('section-account-stmt');

    tabEdit.addEventListener('click', () => {
      tabEdit.style.background = 'var(--primary)';
      tabEdit.style.color = 'white';
      tabEdit.style.border = 'none';
      tabStmt.style.background = 'var(--glass)';
      tabStmt.style.color = 'var(--text-primary)';
      tabStmt.style.border = '1px solid var(--border)';
      
      secEdit.style.display = 'block';
      secStmt.style.display = 'none';
    });

    tabStmt.addEventListener('click', () => {
      tabStmt.style.background = 'var(--primary)';
      tabStmt.style.color = 'white';
      tabStmt.style.border = 'none';
      tabEdit.style.background = 'var(--glass)';
      tabEdit.style.color = 'var(--text-primary)';
      tabEdit.style.border = '1px solid var(--border)';
      
      secStmt.style.display = 'block';
      secEdit.style.display = 'none';
      
      // Auto-set today to the from/to filters if not set
      if (!document.getElementById('stmt-to-date').value) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('stmt-to-date').value = today;
        
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        document.getElementById('stmt-from-date').value = lastMonth.toISOString().split('T')[0];
      }
    });

    // Profile form
    document.getElementById('profile-edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-name').value;
      const email = document.getElementById('profile-email').value;
      this.app.userManager.updateUser({ name, email });
      this.app.updateAuthUI();
      this.app.toastManager.show('Profile updated successfully!', 'success');
    });

    // Account Statement fetch logic
    document.getElementById('btn-fetch-stmt').addEventListener('click', () => {
      const fromDate = document.getElementById('stmt-from-date').value;
      const toDate = document.getElementById('stmt-to-date').value;
      const resultsContainer = document.getElementById('stmt-results');
      
      if (!fromDate || !toDate) {
        this.app.toastManager.show('Please select a valid date range', 'warning');
        return;
      }

      const allTxns = this.app.walletManager.getTransactions(user.id);
      
      // Filter by date range
      const start = new Date(fromDate).getTime();
      // Add 24h to `toDate` to include the whole day
      const end = new Date(toDate).getTime() + 86400000;

      const filteredTxns = allTxns.filter(t => {
        const tTime = new Date(t.timestamp).getTime();
        return tTime >= start && tTime <= end;
      });

      resultsContainer.style.display = 'block';
      
      if (filteredTxns.length === 0) {
        resultsContainer.innerHTML = `<div class="empty-state" style="padding: 2rem 0; border: 1px solid var(--border); border-radius: var(--radius-sm);"><p>No transactions found for this date range.</p></div>`;
        return;
      }

      let totalCredited = 0;
      let totalDebited = 0;
      
      const rows = filteredTxns.map(t => {
        const isCredit = ['deposit', 'win', 'admin_credit'].includes(t.type);
        const amtStr = isCredit ? `+$ ${t.amount.toLocaleString()}` : `-$ ${t.amount.toLocaleString()}`;
        const color = isCredit ? 'var(--success)' : 'var(--danger)';
        const dateObj = new Date(t.timestamp);
        
        if (isCredit) totalCredited += t.amount;
        else totalDebited += t.amount;
        
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${t.description}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${dateObj.toLocaleDateString()} &nbsp; ${dateObj.toLocaleTimeString()}</div>
            </div>
            <div style="font-weight: 700; color: ${color}; font-family: monospace; font-size: 1.1rem;">
              ₹${amtStr.replace('$', '')}
            </div>
          </div>
        `;
      }).join('');

      resultsContainer.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <div style="flex: 1; padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid var(--success); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--success); text-transform: uppercase;">Total Credited</div>
            <div style="font-size: 1.25rem; font-weight: bold; color: var(--success);">₹${totalCredited.toLocaleString()}</div>
          </div>
          <div style="flex: 1; padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--danger); text-transform: uppercase;">Total Debited</div>
            <div style="font-size: 1.25rem; font-weight: bold; color: var(--danger);">₹${totalDebited.toLocaleString()}</div>
          </div>
        </div>
        <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-darker);">
          ${rows}
        </div>
      `;
    });
  }
}
