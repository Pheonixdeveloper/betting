// ========================================
// API CLIENT - Connects frontend to backend
// Replaces localStorage with real API calls
// ========================================

const API_BASE = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('earn10x_token');
  }

  // ─── HTTP Helpers ───

  async request(method, endpoint, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        // Server not running - fall back silently
        console.warn('⚠️ API server not running. Using local mode.');
        return null;
      }
      throw err;
    }
  }

  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, body) { return this.request('POST', endpoint, body); }
  patch(endpoint, body) { return this.request('PATCH', endpoint, body); }

  // ─── Auth ───

  async register(name, phone, email, password) {
    const data = await this.post('/auth/register', { name, phone, email, password });
    if (data && data.token) {
      this.token = data.token;
      localStorage.setItem('earn10x_token', data.token);
      localStorage.setItem('earn10x_user', JSON.stringify(data.user));
    }
    return data;
  }

  async login(phone, password) {
    const data = await this.post('/auth/login', { phone, password });
    if (data && data.token) {
      this.token = data.token;
      localStorage.setItem('earn10x_token', data.token);
      localStorage.setItem('earn10x_user', JSON.stringify(data.user));
    }
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('earn10x_token');
    localStorage.removeItem('earn10x_user');
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  // ─── Wallet ───

  async getBalance() {
    const data = await this.get('/wallet/balance');
    return data ? data.balance : null;
  }

  async deposit(amount, description) {
    return this.post('/wallet/deposit', { amount, description });
  }

  async withdraw(amount, method, accountDetails, referenceId, eta) {
    return this.post('/wallet/withdraw', { amount, method, accountDetails, referenceId, eta });
  }

  async getTransactions() {
    const data = await this.get('/wallet/transactions');
    return data ? data.transactions : [];
  }

  // ─── Game ───

  async placeBet(amount, game) {
    return this.post('/game/bet', { amount, game });
  }

  async addWinnings(amount, game) {
    return this.post('/game/win', { amount, game });
  }

  async saveGameResult(game, betAmount, winAmount, result, details) {
    return this.post('/game/history', { game, betAmount, winAmount, result, details });
  }

  async getGameHistory() {
    const data = await this.get('/game/history');
    return data ? data.history : [];
  }

  // ─── Admin ───

  async getUsers() {
    return this.get('/admin/users');
  }

  async getWithdrawRequests() {
    return this.get('/admin/withdrawals');
  }

  async updateWithdrawStatus(id, status) {
    return this.patch(`/admin/withdrawals/${id}`, { status });
  }

  async adminAddBalance(userId, amount) {
    return this.post('/admin/add-balance', { userId, amount });
  }

  // ─── Server Check ───

  async isServerOnline() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient();
