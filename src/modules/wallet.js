// Wallet Manager - handles balance, deposits, withdrawals, and transaction history

export class WalletManager {
  constructor() {
    this.balanceKey = 'earn10x_balance';
    this.transactionsKey = 'earn10x_transactions';
  }

  getBalance() {
    const balance = localStorage.getItem(this.balanceKey);
    return balance ? parseFloat(balance) : 0;
  }

  setBalance(amount) {
    localStorage.setItem(this.balanceKey, amount.toFixed(2));
  }

  deposit(amount) {
    const balance = this.getBalance() + amount;
    this.setBalance(balance);
    this.addTransaction({
      type: 'deposit',
      amount: amount,
      description: 'Deposit via UPI',
      timestamp: new Date().toISOString()
    });
    return balance;
  }

  withdraw(amount) {
    const balance = this.getBalance() - amount;
    this.setBalance(balance);
    this.addTransaction({
      type: 'withdraw',
      amount: amount,
      description: 'Withdrawal requested',
      timestamp: new Date().toISOString()
    });
    return balance;
  }

  placeBet(amount, game) {
    const balance = this.getBalance();
    if (amount > balance) return false;
    this.setBalance(balance - amount);
    this.addTransaction({
      type: 'bet',
      amount: amount,
      description: `Bet on ${game}`,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  addWinnings(amount, game) {
    const balance = this.getBalance() + amount;
    this.setBalance(balance);
    this.addTransaction({
      type: 'win',
      amount: amount,
      description: `Won on ${game}`,
      timestamp: new Date().toISOString()
    });
    return balance;
  }

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transactions.unshift({
      id: Date.now().toString(),
      ...transaction
    });
    // Keep last 100 transactions
    if (transactions.length > 100) transactions.pop();
    localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
  }

  getTransactions() {
    const data = localStorage.getItem(this.transactionsKey);
    return data ? JSON.parse(data) : [];
  }
}
