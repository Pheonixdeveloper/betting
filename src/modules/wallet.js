// Wallet Manager - handles per-user balance, deposits, withdrawals, and transaction history

export class WalletManager {
  constructor() {
    this.walletsKey = 'earn10x_wallets';       // { [userId]: balance }
    this.transactionsKey = 'earn10x_all_txns';  // { [userId]: [...transactions] }
    this._currentUserId = null;

    // Migrate old single-wallet data if exists
    this.migrateOldData();
  }

  // Migrate from old single-wallet to per-user wallet
  migrateOldData() {
    const oldBalance = localStorage.getItem('earn10x_balance');
    const oldTxns = localStorage.getItem('earn10x_transactions');
    if (oldBalance !== null) {
      // Store under a "legacy" key — will be assigned to first user who logs in
      const wallets = this.getAllWallets();
      if (!wallets['_legacy']) {
        wallets['_legacy'] = parseFloat(oldBalance);
        localStorage.setItem(this.walletsKey, JSON.stringify(wallets));
      }
      if (oldTxns) {
        const allTxns = this.getAllTransactions();
        if (!allTxns['_legacy']) {
          allTxns['_legacy'] = JSON.parse(oldTxns);
          localStorage.setItem(this.transactionsKey, JSON.stringify(allTxns));
        }
      }
      localStorage.removeItem('earn10x_balance');
      localStorage.removeItem('earn10x_transactions');
    }
  }

  // Set current user context
  setCurrentUser(userId) {
    this._currentUserId = userId;

    // If legacy data exists and this user has no balance, migrate it
    const wallets = this.getAllWallets();
    if (wallets['_legacy'] !== undefined && wallets[userId] === undefined) {
      wallets[userId] = wallets['_legacy'];
      delete wallets['_legacy'];
      localStorage.setItem(this.walletsKey, JSON.stringify(wallets));

      const allTxns = this.getAllTransactions();
      if (allTxns['_legacy']) {
        allTxns[userId] = allTxns['_legacy'];
        delete allTxns['_legacy'];
        localStorage.setItem(this.transactionsKey, JSON.stringify(allTxns));
      }
    }
  }

  getUserId() {
    return this._currentUserId || '_guest';
  }

  // ── Balance operations ──

  getBalance(userId) {
    const uid = userId || this.getUserId();
    const wallets = this.getAllWallets();
    return wallets[uid] !== undefined ? parseFloat(wallets[uid]) : 0;
  }

  setBalance(amount, userId) {
    const uid = userId || this.getUserId();
    const wallets = this.getAllWallets();
    wallets[uid] = parseFloat(amount.toFixed(2));
    localStorage.setItem(this.walletsKey, JSON.stringify(wallets));
  }

  deposit(amount, userId) {
    const uid = userId || this.getUserId();
    const balance = this.getBalance(uid) + amount;
    this.setBalance(balance, uid);
    this.addTransaction({
      type: 'deposit',
      amount: amount,
      description: 'Deposit via UPI',
      timestamp: new Date().toISOString()
    }, uid);
    return balance;
  }

  // Admin credit — separate description
  adminCredit(amount, userId, adminNote) {
    const balance = this.getBalance(userId) + amount;
    this.setBalance(balance, userId);
    this.addTransaction({
      type: 'admin_credit',
      amount: amount,
      description: adminNote || 'Credited by Admin',
      timestamp: new Date().toISOString()
    }, userId);
    return balance;
  }

  // Admin debit
  adminDebit(amount, userId, adminNote) {
    const balance = this.getBalance(userId) - amount;
    this.setBalance(Math.max(0, balance), userId);
    this.addTransaction({
      type: 'admin_debit',
      amount: amount,
      description: adminNote || 'Debited by Admin',
      timestamp: new Date().toISOString()
    }, userId);
    return Math.max(0, balance);
  }

  withdraw(amount, userId) {
    const uid = userId || this.getUserId();
    const balance = this.getBalance(uid) - amount;
    this.setBalance(balance, uid);
    this.addTransaction({
      type: 'withdraw',
      amount: amount,
      description: 'Withdrawal requested',
      timestamp: new Date().toISOString()
    }, uid);
    return balance;
  }

  placeBet(amount, game, userId) {
    const uid = userId || this.getUserId();
    const balance = this.getBalance(uid);
    if (amount > balance) return false;
    this.setBalance(balance - amount, uid);
    this.addTransaction({
      type: 'bet',
      amount: amount,
      description: `Bet on ${game}`,
      timestamp: new Date().toISOString()
    }, uid);
    return true;
  }

  addWinnings(amount, game, userId) {
    const uid = userId || this.getUserId();
    const balance = this.getBalance(uid) + amount;
    this.setBalance(balance, uid);
    this.addTransaction({
      type: 'win',
      amount: amount,
      description: `Won on ${game}`,
      timestamp: new Date().toISOString()
    }, uid);
    return balance;
  }

  // ── Transaction operations ──

  addTransaction(transaction, userId) {
    const uid = userId || this.getUserId();
    const allTxns = this.getAllTransactions();
    if (!allTxns[uid]) allTxns[uid] = [];
    allTxns[uid].unshift({
      id: Date.now().toString(),
      ...transaction
    });
    // Keep last 200 per user
    if (allTxns[uid].length > 200) allTxns[uid] = allTxns[uid].slice(0, 200);
    localStorage.setItem(this.transactionsKey, JSON.stringify(allTxns));
  }

  getTransactions(userId) {
    const uid = userId || this.getUserId();
    const allTxns = this.getAllTransactions();
    return allTxns[uid] || [];
  }

  // ── Stats for admin ──

  getUserStats(userId) {
    const txns = this.getTransactions(userId);
    let totalBet = 0, totalWon = 0, totalDeposited = 0, totalWithdrawn = 0;
    txns.forEach(t => {
      if (t.type === 'bet') totalBet += t.amount;
      if (t.type === 'win') totalWon += t.amount;
      if (t.type === 'deposit' || t.type === 'admin_credit') totalDeposited += t.amount;
      if (t.type === 'withdraw') totalWithdrawn += t.amount;
    });
    return {
      balance: this.getBalance(userId),
      totalBet,
      totalWon,
      totalDeposited,
      totalWithdrawn,
      profitLoss: totalWon - totalBet,
      totalGames: txns.filter(t => t.type === 'bet').length
    };
  }

  // ── Storage helpers ──

  getAllWallets() {
    const data = localStorage.getItem(this.walletsKey);
    return data ? JSON.parse(data) : {};
  }

  getAllTransactions() {
    const data = localStorage.getItem(this.transactionsKey);
    return data ? JSON.parse(data) : {};
  }
}
