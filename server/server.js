// ========================================
// EARN10X - API Server
// Express + SQLite + JWT Auth
// ========================================

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  initDatabase,
  createUser,
  loginUser,
  getUserById,
  getAllUsers,
  getBalance,
  deposit,
  withdraw,
  placeBet,
  addWinnings,
  getTransactions,
  createWithdrawRequest,
  getWithdrawRequests,
  updateWithdrawStatus,
  addGameHistory,
  getGameHistory
} from './database.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'earn10x_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// ─── Auth Middleware ───

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── Auth Routes ───

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = createUser(name, phone, email || '', password);
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      success: true, 
      message: 'Account created! ₹1,000 welcome bonus added!',
      user, 
      token 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const user = loginUser(phone, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      success: true,
      message: user.isAdmin ? '👑 Welcome Admin! God mode enabled.' : 'Welcome back! Login successful.',
      user, 
      token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── Wallet Routes ───

// Get balance
app.get('/api/wallet/balance', authMiddleware, (req, res) => {
  const balance = getBalance(req.userId);
  res.json({ balance });
});

// Deposit
app.post('/api/wallet/deposit', authMiddleware, (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const newBalance = deposit(req.userId, amount, description || 'Deposit');
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Withdraw
app.post('/api/wallet/withdraw', authMiddleware, (req, res) => {
  try {
    const { amount, method, accountDetails, referenceId, eta } = req.body;
    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum withdrawal is ₹500' });
    }

    const newBalance = withdraw(req.userId, amount, `Withdrawal via ${method || 'UPI'}`);
    
    // Create withdraw request record
    createWithdrawRequest(
      req.userId, 
      amount, 
      method || 'upi', 
      accountDetails || {}, 
      referenceId || `WD-${Date.now()}`,
      eta || 'Within 30 minutes'
    );

    res.json({ success: true, balance: newBalance, referenceId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get transactions
app.get('/api/wallet/transactions', authMiddleware, (req, res) => {
  const transactions = getTransactions(req.userId);
  res.json({ transactions });
});

// ─── Game Routes ───

// Place bet
app.post('/api/game/bet', authMiddleware, (req, res) => {
  try {
    const { amount, game } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    const newBalance = placeBet(req.userId, amount, game);
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add winnings
app.post('/api/game/win', authMiddleware, (req, res) => {
  try {
    const { amount, game } = req.body;
    const newBalance = addWinnings(req.userId, amount, game);
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Save game result
app.post('/api/game/history', authMiddleware, (req, res) => {
  try {
    const { game, betAmount, winAmount, result, details } = req.body;
    addGameHistory(req.userId, game, betAmount, winAmount || 0, result, details || '');
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get game history
app.get('/api/game/history', authMiddleware, (req, res) => {
  const history = getGameHistory(req.userId);
  res.json({ history });
});

// ─── Admin Routes ───

// Get all users
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = getAllUsers();
  res.json({ users });
});

// Get all withdraw requests
app.get('/api/admin/withdrawals', authMiddleware, adminMiddleware, (req, res) => {
  const requests = getWithdrawRequests();
  res.json({ requests });
});

// Update withdraw request status
app.patch('/api/admin/withdrawals/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    updateWithdrawStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Add balance to any user
app.post('/api/admin/add-balance', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { userId, amount } = req.body;
    const newBalance = deposit(userId || req.userId, amount, 'Admin deposit');
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'EARN10X API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎰 ═══════════════════════════════════════`);
  console.log(`   EARN10X API Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Database: SQLite (earn10x.db)`);
  console.log(`═══════════════════════════════════════════`);
  console.log(`\n📋 Admin Credentials:`);
  console.log(`   Phone: admin`);
  console.log(`   Password: admin123`);
  console.log(`\n🔗 API Endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/wallet/balance`);
  console.log(`   POST /api/wallet/deposit`);
  console.log(`   POST /api/wallet/withdraw`);
  console.log(`   GET  /api/wallet/transactions`);
  console.log(`   POST /api/game/bet`);
  console.log(`   POST /api/game/win`);
  console.log(`   GET  /api/admin/users`);
  console.log(`   GET  /api/admin/withdrawals`);
  console.log(`\n`);
});
