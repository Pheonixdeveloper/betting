// ========================================
// DATABASE MODULE - SQLite3
// Stores users, admins, wallets, transactions
// ========================================

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'earn10x.db');

let db;

export function initDatabase() {
  db = new Database(DB_PATH);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      avatar TEXT DEFAULT 'U',
      balance REAL DEFAULT 0.00,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      reference_id TEXT,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game TEXT NOT NULL,
      bet_amount REAL NOT NULL,
      win_amount REAL DEFAULT 0,
      result TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS withdraw_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      account_details TEXT NOT NULL,
      reference_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      eta TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed admin account if not exists
  seedAdmin();

  console.log('✅ Database initialized at', DB_PATH);
  return db;
}

function seedAdmin() {
  const admin = db.prepare('SELECT id FROM users WHERE phone = ?').get('admin');
  if (!admin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, phone, email, password, is_admin, avatar, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('Admin', 'admin', 'admin@earn10x.com', hashedPassword, 1, '👑', 100000);
    console.log('👑 Admin account created (phone: admin, password: admin123)');
  }
}

// ─── User Operations ───

export function createUser(name, phone, email, password) {
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    throw new Error('Phone number already registered');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const avatar = name.charAt(0).toUpperCase();
  
  const result = db.prepare(`
    INSERT INTO users (name, phone, email, password, avatar, balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, phone, email, hashedPassword, avatar, 1000); // ₹1000 welcome bonus

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

  // Log welcome bonus transaction
  addTransaction(user.id, 'deposit', 1000, 'Welcome bonus');

  return sanitizeUser(user);
}

export function loginUser(phone, password) {
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) return null;

  if (!bcrypt.compareSync(password, user.password)) return null;

  // Update last login
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  return sanitizeUser(user);
}

export function getUserById(id) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user ? sanitizeUser(user) : null;
}

export function getAllUsers() {
  const users = db.prepare('SELECT id, name, phone, email, is_admin, balance, created_at, last_login FROM users').all();
  return users;
}

export function updateUserBalance(userId, newBalance) {
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    isAdmin: user.is_admin === 1,
    avatar: user.avatar,
    balance: user.balance,
    createdAt: user.created_at,
    lastLogin: user.last_login
  };
}

// ─── Wallet Operations ───

export function getBalance(userId) {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
  return user ? user.balance : 0;
}

export function deposit(userId, amount, description = 'Deposit') {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found');

  const newBalance = user.balance + amount;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
  addTransaction(userId, 'deposit', amount, description);
  return newBalance;
}

export function withdraw(userId, amount, description = 'Withdrawal') {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found');
  if (user.balance < amount) throw new Error('Insufficient balance');

  const newBalance = user.balance - amount;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
  addTransaction(userId, 'withdraw', amount, description);
  return newBalance;
}

export function placeBet(userId, amount, game) {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found');
  if (user.balance < amount) throw new Error('Insufficient balance');

  const newBalance = user.balance - amount;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
  addTransaction(userId, 'bet', amount, `Bet on ${game}`);
  return newBalance;
}

export function addWinnings(userId, amount, game) {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found');

  const newBalance = user.balance + amount;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
  addTransaction(userId, 'win', amount, `Won on ${game}`);
  return newBalance;
}

// ─── Transaction Operations ───

export function addTransaction(userId, type, amount, description, referenceId = null) {
  const refId = referenceId || `TXN-${Date.now()}`;
  db.prepare(`
    INSERT INTO transactions (user_id, type, amount, description, reference_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, type, amount, description, refId);
}

export function getTransactions(userId, limit = 50) {
  return db.prepare(`
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(userId, limit);
}

// ─── Withdraw Request Operations ───

export function createWithdrawRequest(userId, amount, method, accountDetails, referenceId, eta) {
  db.prepare(`
    INSERT INTO withdraw_requests (user_id, amount, method, account_details, reference_id, eta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, amount, method, JSON.stringify(accountDetails), referenceId, eta);
}

export function getWithdrawRequests(userId = null) {
  if (userId) {
    return db.prepare('SELECT * FROM withdraw_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }
  // Admin: get all
  return db.prepare(`
    SELECT wr.*, u.name as user_name, u.phone as user_phone 
    FROM withdraw_requests wr
    JOIN users u ON wr.user_id = u.id
    ORDER BY wr.created_at DESC
  `).all();
}

export function updateWithdrawStatus(requestId, status) {
  db.prepare(`
    UPDATE withdraw_requests 
    SET status = ?, processed_at = datetime('now')
    WHERE id = ?
  `).run(status, requestId);
}

// ─── Game History ───

export function addGameHistory(userId, game, betAmount, winAmount, result, details = '') {
  db.prepare(`
    INSERT INTO game_history (user_id, game, bet_amount, win_amount, result, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, game, betAmount, winAmount, result, details);
}

export function getGameHistory(userId, limit = 50) {
  return db.prepare(`
    SELECT * FROM game_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(userId, limit);
}

export { db };
