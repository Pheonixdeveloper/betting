// ========================================
// EARN10X - Main Application Controller
// ========================================

import { UserManager } from './modules/user.js';
import { WalletManager } from './modules/wallet.js';
import { ToastManager } from './modules/toast.js';
import { AdminController } from './modules/admin.js';
import { HomePage } from './pages/home.js';
import { DragonTigerGame } from './games/dragon-tiger.js';
import { TeenPattiGame } from './games/teen-patti.js';
import { AviatorGame } from './games/aviator.js';
import { ColorGame } from './games/color-game.js';
import { RouletteGame } from './games/roulette.js';
import { WalletPage } from './pages/wallet.js';
import { ProfilePage } from './pages/profile.js';
import { HistoryPage } from './pages/history.js';
import { CasinoPage } from './pages/casino.js';
import { AdminDashboardPage } from './pages/admin-dashboard.js';

export class App {
  constructor() {
    this.currentPage = 'home';
    this.userManager = new UserManager();
    this.walletManager = new WalletManager();
    this.toastManager = new ToastManager();
    this.adminController = new AdminController(this);
    this.currentGame = null;
  }

  init() {
    this.setupLoader();
    this.setupClock();
    this.setupNavigation();
    this.setupModals();
    this.setupAuth();
    this.setupSidebar();
    this.setupSearch();
    this.updateAuthUI();
    this.navigateTo('home');
  }

  // Loader
  setupLoader() {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 1800);
  }

  // Clock
  setupClock() {
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const el = document.getElementById('clock-time');
      if (el) el.textContent = time;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Navigation
  setupNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
      });
    });
  }

  navigateTo(page) {
    // Cleanup current game
    if (this.currentGame && typeof this.currentGame.destroy === 'function') {
      this.currentGame.destroy();
      this.currentGame = null;
    }

    this.currentPage = page;

    // Update nav pills
    document.querySelectorAll('.nav-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.page === page);
    });

    // Close sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Render page
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.className = 'main-content fade-in';

    // Games are visible to all users - auth check happens at bet placement
    // const requiresAuth = ['dragon-tiger', 'teen-patti', 'aviator', 'color-game', 'roulette'];

    switch(page) {
      case 'home':
        new HomePage(mainContent, this);
        break;
      case 'casino':
        new CasinoPage(mainContent, this);
        break;
      case 'dragon-tiger':
        this.currentGame = new DragonTigerGame(mainContent, this);
        break;
      case 'teen-patti':
        this.currentGame = new TeenPattiGame(mainContent, this);
        break;
      case 'aviator':
        this.currentGame = new AviatorGame(mainContent, this);
        break;
      case 'color-game':
        this.currentGame = new ColorGame(mainContent, this);
        break;
      case 'roulette':
        this.currentGame = new RouletteGame(mainContent, this);
        break;
      case 'wallet':
        new WalletPage(mainContent, this);
        break;
      case 'profile':
        new ProfilePage(mainContent, this);
        break;
      case 'history':
        new HistoryPage(mainContent, this);
        break;
      case 'admin-dashboard':
        if (!this.userManager.isAdmin()) {
          this.toastManager.show('Access denied', 'error');
          this.navigateTo('home');
          return;
        }
        new AdminDashboardPage(mainContent, this);
        break;
      default:
        new HomePage(mainContent, this);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Sidebar
  setupSidebar() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const close = document.getElementById('sidebar-close');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    close.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Search
  setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.toLowerCase().trim();
        const games = ['dragon-tiger', 'teen-patti', 'aviator', 'color-game', 'roulette'];
        const match = games.find(g => g.includes(q) || q.includes(g.replace('-', ' ')));
        if (match) {
          this.navigateTo(match);
          input.value = '';
        } else {
          this.toastManager.show('Game not found. Try Dragon Tiger, Teen Patti, Aviator, Color Game, or Roulette', 'info');
        }
      }
    });
  }

  // Modals
  setupModals() {
    // Login modal
    document.getElementById('btn-login').addEventListener('click', () => this.openModal('login-modal'));
    document.getElementById('login-modal-close').addEventListener('click', () => this.closeModal('login-modal'));
    document.getElementById('login-modal').querySelector('.modal-overlay').addEventListener('click', () => this.closeModal('login-modal'));

    // Signup modal
    document.getElementById('btn-signup')?.addEventListener('click', () => this.openModal('signup-modal'));
    document.getElementById('signup-modal-close')?.addEventListener('click', () => this.closeModal('signup-modal'));
    document.getElementById('signup-modal')?.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal('signup-modal'));

    // Reset Password modal
    const cancelReset = () => {
      this.closeModal('reset-modal');
      this.userManager.logout();
      this.toastManager.show('Logged out. Password reset is required to continue.', 'warning');
    };
    document.getElementById('reset-modal-close').addEventListener('click', cancelReset);
    document.getElementById('reset-modal').querySelector('.modal-overlay').addEventListener('click', cancelReset);

    // Switch modals
    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal('login-modal');
      setTimeout(() => this.openModal('signup-modal'), 200);
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal('signup-modal');
      setTimeout(() => this.openModal('login-modal'), 200);
    });

    // Deposit modal
    this.depositAmount = 0;
    this.depositMethod = 'upi';
    this.depositTimerInterval = null;

    document.getElementById('btn-deposit')?.addEventListener('click', () => {
      this.resetDepositFlow();
      this.openModal('deposit-modal');
    });
    document.getElementById('deposit-modal-close')?.addEventListener('click', () => {
      this.closeModal('deposit-modal');
      this.clearDepositTimer();
    });
    document.getElementById('deposit-modal')?.querySelector('.modal-overlay').addEventListener('click', () => {
      this.closeModal('deposit-modal');
      this.clearDepositTimer();
    });

    // Quick amounts
    document.querySelectorAll('.quick-amount').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('deposit-amount').value = btn.dataset.amount;
      });
    });

    // Step 1: Amount form submit → go to step 2
    document.getElementById('deposit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('deposit-amount').value);
      if (!amount || amount < 100) {
        this.toastManager.show('Minimum deposit is ₹100', 'error');
        return;
      }
      this.depositAmount = amount;
      this.depositMethod = document.querySelector('input[name="payment-method"]:checked').value;
      this.goToDepositStep(2);
    });

    // Step 2: Back button
    document.getElementById('deposit-back-btn').addEventListener('click', () => {
      this.clearDepositTimer();
      this.goToDepositStep(1);
    });

    // Step 2: "I've Made the Payment" → go to step 3
    document.getElementById('deposit-paid-btn').addEventListener('click', () => {
      this.clearDepositTimer();
      if (this.depositMethod === 'card') {
        // For card, go straight to processing (step 4)
        this.goToDepositStep(4);
        this.processDeposit();
      } else {
        this.goToDepositStep(3);
      }
    });

    // Step 3: Verify UTR → go to step 4
    document.getElementById('deposit-verify-btn').addEventListener('click', () => {
      const utr = document.getElementById('deposit-utr').value.trim();
      if (!utr) {
        this.toastManager.show('Please enter UTR / Transaction ID', 'warning');
        return;
      }
      this.goToDepositStep(4);
      this.processDeposit();
    });

    // Step 3: Skip UTR (demo mode)
    document.getElementById('deposit-skip-utr').addEventListener('click', () => {
      this.goToDepositStep(4);
      this.processDeposit();
    });

    // Step 4: Done button
    document.getElementById('deposit-done-btn').addEventListener('click', () => {
      this.closeModal('deposit-modal');
      this.resetDepositFlow();
    });

    // Copy UPI ID
    document.getElementById('copy-upi-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText('earn10xpay@ybl').then(() => {
        this.toastManager.show('UPI ID copied!', 'success');
      }).catch(() => {
        this.toastManager.show('Copy manually: earn10xpay@ybl', 'info');
      });
    });

    // Copy bank details
    document.querySelectorAll('.btn-copy-small').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.copy;
        navigator.clipboard.writeText(val).then(() => {
          this.toastManager.show('Copied!', 'success');
        }).catch(() => {
          this.toastManager.show(`Copy: ${val}`, 'info');
        });
      });
    });

    // Withdraw modal
    this.withdrawAmount = 0;
    this.withdrawMethod = 'upi';

    document.getElementById('btn-withdraw')?.addEventListener('click', () => {
      this.resetWithdrawFlow();
      this.openModal('withdraw-modal');
    });
    document.getElementById('withdraw-modal-close')?.addEventListener('click', () => this.closeModal('withdraw-modal'));
    document.getElementById('withdraw-modal')?.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal('withdraw-modal'));

    // Withdraw quick amounts
    document.querySelectorAll('.wd-quick-amount').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.amount;
        if (val === 'all') {
          document.getElementById('withdraw-amount').value = Math.floor(this.walletManager.getBalance());
        } else {
          document.getElementById('withdraw-amount').value = val;
        }
      });
    });

    // Step 1 → Step 2
    document.getElementById('wd-next-step1').addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('withdraw-amount').value);
      const balance = this.walletManager.getBalance();
      if (!amount || amount < 500) {
        this.toastManager.show('Minimum withdrawal is ₹500', 'error');
        return;
      }
      if (amount > balance) {
        this.toastManager.show('Insufficient balance!', 'error');
        return;
      }
      this.withdrawAmount = amount;
      this.withdrawMethod = document.querySelector('input[name="withdraw-method"]:checked').value;
      this.goToWithdrawStep(2);
    });

    // Step 2 Back
    document.getElementById('wd-back-step2').addEventListener('click', () => {
      this.goToWithdrawStep(1);
    });

    // Step 2 Submit
    document.getElementById('wd-submit').addEventListener('click', () => {
      this.goToWithdrawStep(3);
      this.processWithdrawal();
    });

    // Step 3 Done
    document.getElementById('wd-done-btn').addEventListener('click', () => {
      this.closeModal('withdraw-modal');
      this.resetWithdrawFlow();
    });

    // User dropdown
    document.getElementById('user-menu-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('user-dropdown').classList.toggle('active');
    });

    document.addEventListener('click', () => {
      document.getElementById('user-dropdown').classList.remove('active');
    });
  }

  // ─── Deposit Flow Helpers ───

  resetDepositFlow() {
    this.depositAmount = 0;
    this.depositMethod = 'upi';
    this.clearDepositTimer();
    document.getElementById('deposit-amount').value = '';
    document.getElementById('deposit-utr') && (document.getElementById('deposit-utr').value = '');
    
    // Reset steps
    document.querySelectorAll('.deposit-step').forEach(s => {
      s.classList.remove('active', 'completed');
    });
    document.querySelector('.deposit-step[data-step="1"]').classList.add('active');

    // Reset step contents
    document.querySelectorAll('.deposit-step-content').forEach(c => c.classList.remove('active'));
    document.getElementById('deposit-step-1').classList.add('active');

    // Reset step 4
    document.getElementById('deposit-processing').style.display = '';
    document.getElementById('deposit-success').style.display = 'none';
  }

  goToDepositStep(step) {
    // Update step indicators
    document.querySelectorAll('.deposit-step').forEach(s => {
      const sNum = parseInt(s.dataset.step);
      s.classList.remove('active', 'completed');
      if (sNum < step) s.classList.add('completed');
      if (sNum === step) s.classList.add('active');
    });

    // Show/hide step content
    document.querySelectorAll('.deposit-step-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`deposit-step-${step}`).classList.add('active');

    // Populate payment details when entering step 2
    if (step === 2) {
      const amtStr = this.depositAmount.toLocaleString();
      document.getElementById('deposit-pay-amount').textContent = `₹${amtStr}`;
      document.getElementById('upi-exact-amount').textContent = amtStr;
      document.getElementById('bank-amount').textContent = amtStr;

      // Show correct payment method section
      document.getElementById('pay-upi').style.display = this.depositMethod === 'upi' ? '' : 'none';
      document.getElementById('pay-bank').style.display = this.depositMethod === 'bank' ? '' : 'none';
      document.getElementById('pay-card').style.display = this.depositMethod === 'card' ? '' : 'none';

      // Change button text for card
      const paidBtn = document.getElementById('deposit-paid-btn');
      if (this.depositMethod === 'card') {
        paidBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Securely';
      } else {
        paidBtn.innerHTML = '<i class="fas fa-check"></i> I\'ve Made the Payment';
      }

      // Generate QR code for UPI
      if (this.depositMethod === 'upi') {
        this.drawQRCode(this.depositAmount);
      }

      // Start 15 min timer
      this.startDepositTimer();
    }

    // Populate verification details for step 3
    if (step === 3) {
      document.getElementById('verify-amount').textContent = `₹${this.depositAmount.toLocaleString()}`;
      const methodNames = { upi: 'UPI', bank: 'Bank Transfer', card: 'Card' };
      document.getElementById('verify-method').textContent = methodNames[this.depositMethod] || 'UPI';
    }
  }

  processDeposit() {
    // Show processing
    document.getElementById('deposit-processing').style.display = '';
    document.getElementById('deposit-success').style.display = 'none';

    // Simulate processing delay (2-3 seconds)
    const delay = 2000 + Math.random() * 1500;
    setTimeout(() => {
      // Credit the wallet
      this.walletManager.deposit(this.depositAmount);
      this.updateWalletDisplay();

      // Show success
      document.getElementById('deposit-processing').style.display = 'none';
      document.getElementById('deposit-success').style.display = '';
      document.getElementById('deposit-credited-amount').textContent = `₹${this.depositAmount.toLocaleString()}`;
      
      const txnId = 'EARN10X-' + Date.now().toString().slice(-8);
      document.getElementById('deposit-txn-id').textContent = `TXN: ${txnId}`;

      this.toastManager.show(`₹${this.depositAmount.toLocaleString()} deposited successfully!`, 'success');
    }, delay);
  }

  drawQRCode(amount) {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);

    // Generate a realistic-looking QR pattern
    const moduleSize = 5;
    const modules = Math.floor(w / moduleSize);
    const margin = 2;

    // Draw QR-like pattern (simulated)
    ctx.fillStyle = '#000';
    
    // Position detection patterns (3 corners)
    const drawFinderPattern = (x, y) => {
      const s = moduleSize;
      // Outer border
      ctx.fillRect(x * s, y * s, 7 * s, 7 * s);
      ctx.fillStyle = 'white';
      ctx.fillRect((x + 1) * s, (y + 1) * s, 5 * s, 5 * s);
      ctx.fillStyle = '#000';
      ctx.fillRect((x + 2) * s, (y + 2) * s, 3 * s, 3 * s);
    };

    drawFinderPattern(margin, margin);
    drawFinderPattern(modules - 9, margin);
    drawFinderPattern(margin, modules - 9);

    // Random data modules
    const seed = amount * 7919;
    for (let row = margin; row < modules - margin; row++) {
      for (let col = margin; col < modules - margin; col++) {
        // Skip finder patterns
        if ((row < margin + 9 && col < margin + 9) ||
            (row < margin + 9 && col >= modules - 9) ||
            (row >= modules - 9 && col < margin + 9)) continue;

        const hash = ((row * 31 + col * 37 + seed) % 100);
        if (hash < 45) {
          ctx.fillStyle = '#000';
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Center logo area
    const centerX = (w - 36) / 2;
    const centerY = (h - 36) / 2;
    ctx.fillStyle = 'white';
    ctx.fillRect(centerX - 4, centerY - 4, 44, 44);
    ctx.fillStyle = '#0B664B';
    ctx.fillRect(centerX, centerY, 36, 36);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E10X', w / 2, h / 2);
  }

  startDepositTimer() {
    this.clearDepositTimer();
    let seconds = 15 * 60; // 15 minutes
    const timerEl = document.getElementById('deposit-timer-value');

    const update = () => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      if (seconds <= 0) {
        this.clearDepositTimer();
        this.toastManager.show('Payment window expired. Please try again.', 'warning');
        this.resetDepositFlow();
      }
      seconds--;
    };

    update();
    this.depositTimerInterval = setInterval(update, 1000);
  }

  clearDepositTimer() {
    if (this.depositTimerInterval) {
      clearInterval(this.depositTimerInterval);
      this.depositTimerInterval = null;
    }
  }

  // ─── Withdraw Flow Helpers ───

  resetWithdrawFlow() {
    this.withdrawAmount = 0;
    this.withdrawMethod = 'upi';
    document.getElementById('withdraw-amount').value = '';

    // Reset steps
    document.querySelectorAll('.withdraw-step').forEach(s => {
      s.classList.remove('active', 'completed');
    });
    document.querySelector('.withdraw-step[data-step="1"]').classList.add('active');

    // Reset step contents
    document.querySelectorAll('.withdraw-step-content').forEach(c => c.classList.remove('active'));
    document.getElementById('withdraw-step-1').classList.add('active');

    // Reset step 3
    document.getElementById('wd-processing').style.display = '';
    document.getElementById('wd-success').style.display = 'none';

    // Update balance display
    const bal = this.walletManager.getBalance();
    const balEl = document.getElementById('wd-available-balance');
    if (balEl) balEl.textContent = `₹${bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  goToWithdrawStep(step) {
    // Update step indicators
    document.querySelectorAll('.withdraw-step').forEach(s => {
      const sNum = parseInt(s.dataset.step);
      s.classList.remove('active', 'completed');
      if (sNum < step) s.classList.add('completed');
      if (sNum === step) s.classList.add('active');
    });

    // Show/hide step content
    document.querySelectorAll('.withdraw-step-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`withdraw-step-${step}`).classList.add('active');

    // Step 2: populate details
    if (step === 2) {
      const amtStr = this.withdrawAmount.toLocaleString();
      document.getElementById('wd-confirm-amount').textContent = `₹${amtStr}`;
      document.getElementById('wd-summary-amount').textContent = `₹${amtStr}`;
      document.getElementById('wd-summary-total').textContent = `₹${amtStr}`;

      // Show correct detail section
      document.getElementById('wd-details-upi').style.display = this.withdrawMethod === 'upi' ? '' : 'none';
      document.getElementById('wd-details-bank').style.display = this.withdrawMethod === 'bank' ? '' : 'none';
      document.getElementById('wd-details-imps').style.display = this.withdrawMethod === 'imps' ? '' : 'none';
    }
  }

  processWithdrawal() {
    // Show processing
    document.getElementById('wd-processing').style.display = '';
    document.getElementById('wd-success').style.display = 'none';

    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      // Deduct from wallet
      this.walletManager.withdraw(this.withdrawAmount);
      this.updateWalletDisplay();

      // Show success
      document.getElementById('wd-processing').style.display = 'none';
      document.getElementById('wd-success').style.display = '';
      document.getElementById('wd-success-amount').textContent = `₹${this.withdrawAmount.toLocaleString()}`;

      const refId = 'WD-' + Date.now().toString().slice(-8);
      document.getElementById('wd-ref-id').textContent = refId;

      const methodNames = { upi: 'UPI Transfer', bank: 'Bank Transfer (NEFT)', imps: 'IMPS Transfer' };
      document.getElementById('wd-ref-method').textContent = methodNames[this.withdrawMethod] || 'UPI';

      const etas = { upi: 'Within 15 minutes', bank: 'Within 1-24 hours', imps: 'Within 30 minutes' };
      document.getElementById('wd-ref-eta').textContent = etas[this.withdrawMethod] || 'Within 30 minutes';

      this.toastManager.show(`Withdrawal of ₹${this.withdrawAmount.toLocaleString()} submitted!`, 'success');
    }, delay);
  }

  openModal(id) {
    document.getElementById(id).classList.add('active');
    if (id === 'withdraw-modal') {
      this.resetWithdrawFlow();
    }
  }

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  // Auth
  setupAuth() {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const phone = document.getElementById('login-phone').value;
      const password = document.getElementById('login-password').value;

      if (this.userManager.login(username, phone, password)) {
        this.closeModal('login-modal');

        // Check if user needs to reset password (first-time login)
        const user = this.userManager.getUser();
        if (user.mustResetPassword && !user.isAdmin) {
          this.openModal('reset-modal');
          this.toastManager.show('Please set a new password to continue', 'warning');
          return;
        }

        this.updateAuthUI();
        if (this.userManager.isAdmin()) {
          this.toastManager.show('👑 Welcome! Admin + Superuser mode enabled.', 'success');
        } else {
          this.toastManager.show('Welcome back! Login successful.', 'success');
        }
        this.navigateTo(this.currentPage);
      } else {
        this.toastManager.show('Invalid credentials.', 'error');
      }
    });

    // Sign up form
    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value;
      const name = document.getElementById('signup-name').value;
      const phone = document.getElementById('signup-phone').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;

      if (password !== confirm) {
        this.toastManager.show('Passwords do not match', 'error');
        return;
      }

      if (password.length < 6) {
        this.toastManager.show('Password must be at least 6 characters', 'error');
        return;
      }

      if (username.length < 3) {
        this.toastManager.show('Username must be at least 3 characters', 'error');
        return;
      }

      // Check if username is already taken
      const existingUsers = this.userManager.getAllUsers();
      if (existingUsers.find(u => u.username === username)) {
        this.toastManager.show('Username already taken. Choose a different one.', 'error');
        return;
      }

      this.userManager.register({ username, name, phone, email, password });
      this.walletManager.deposit(1000); // Welcome bonus
      this.closeModal('signup-modal');
      this.updateAuthUI();
      this.toastManager.show('Account created! ₹1,000 welcome bonus added!', 'success');
      this.navigateTo(this.currentPage);
    });

    // Password reset form (for first-time users)
    document.getElementById('reset-password-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('reset-new-password').value;
      const confirmPassword = document.getElementById('reset-confirm-password').value;

      if (newPassword !== confirmPassword) {
        this.toastManager.show('Passwords do not match', 'error');
        return;
      }

      if (newPassword.length < 6) {
        this.toastManager.show('Password must be at least 6 characters', 'error');
        return;
      }

      // Update user's password and clear the reset flag
      const user = this.userManager.getUser();
      this.userManager.updateUser({
        password: newPassword,
        mustResetPassword: false
      });

      // Also update in users list
      const users = this.userManager.getAllUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx].password = newPassword;
        users[idx].mustResetPassword = false;
        localStorage.setItem('earn10x_users', JSON.stringify(users));
      }

      this.closeModal('reset-modal');
      this.updateAuthUI();
      this.toastManager.show('Password updated! Welcome to EARN10X.', 'success');
      this.navigateTo(this.currentPage);
    });

    document.getElementById('btn-logout').addEventListener('click', (e) => {
      e.preventDefault();
      this.userManager.logout();
      this.updateAuthUI();
      this.toastManager.show('Logged out successfully', 'info');
      this.navigateTo('home');
    });
  }

  updateAuthUI() {
    const loggedIn = this.userManager.isLoggedIn();
    document.getElementById('logged-out-buttons').style.display = loggedIn ? 'none' : 'flex';
    document.getElementById('logged-in-buttons').style.display = loggedIn ? 'flex' : 'none';

    // Show/hide admin dashboard link in sidebar
    const adminSidebarLink = document.getElementById('admin-sidebar-link');
    if (adminSidebarLink) {
      adminSidebarLink.style.display = (loggedIn && this.userManager.isAdmin()) ? '' : 'none';
    }
    // Show/hide superuser link in sidebar
    const superuserSidebarLink = document.getElementById('superuser-sidebar-link');
    if (superuserSidebarLink) {
      superuserSidebarLink.style.display = (loggedIn && this.userManager.isAdmin()) ? '' : 'none';
    }
    // Show/hide admin dashboard link in dropdown
    const adminDropdownLink = document.getElementById('admin-dropdown-link');
    if (adminDropdownLink) {
      adminDropdownLink.style.display = (loggedIn && this.userManager.isAdmin()) ? '' : 'none';
    }

    if (loggedIn) {
      const user = this.userManager.getUser();
      // Set wallet context to this user
      this.walletManager.setCurrentUser(user.id);

      document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
      
      // Admin badge
      const avatarEl = document.getElementById('user-avatar');
      if (this.userManager.isAdmin()) {
        avatarEl.classList.add('admin-avatar');
        avatarEl.textContent = '👑';
      } else {
        avatarEl.classList.remove('admin-avatar');
      }

      this.updateWalletDisplay();
    }
  }

  updateWalletDisplay() {
    const balance = this.walletManager.getBalance();
    document.getElementById('wallet-amount').textContent = `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
}
