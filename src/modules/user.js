// User Manager - handles authentication and user data with localStorage

export class UserManager {
  constructor() {
    this.storageKey = 'earn10x_user';
    this.usersKey = 'earn10x_users';
    // Admin credentials
    this.ADMIN_USERNAME = 'sunnyojha';
    this.ADMIN_PHONE = '';
    this.ADMIN_PASSWORD = 'sunnyojha123@';
    this.ensureAdminExists();
  }

  // Make sure admin account always exists
  ensureAdminExists() {
    let users = this.getAllUsers();
    // Remove any old admin accounts and re-create with current credentials
    users = users.filter(u => !u.isAdmin);
    users.push({
      id: 'admin_001',
      username: this.ADMIN_USERNAME,
      name: 'Sunny Ojha',
      phone: this.ADMIN_PHONE,
      email: 'admin@earn10x.com',
      password: this.ADMIN_PASSWORD,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      avatar: 'S'
    });

    // Add Demo Users if none exist
    if (users.length === 1) { // Only admin exists
      const demoUsers = [
        {
          id: 'demo_101',
          username: 'rameshkumar',
          name: 'Ramesh Kumar',
          phone: '9876543210',
          password: 'password123',
          mustResetPassword: true,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          avatar: 'R'
        },
        {
          id: 'demo_102',
          username: 'priyah',
          name: 'Priya Sharma',
          phone: '9876543211',
          password: 'password123',
          mustResetPassword: true,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          avatar: 'P'
        },
        {
          id: 'demo_103',
          username: 'ajay_v',
          name: 'Ajay Verma',
          phone: '9876543212',
          password: 'password123',
          mustResetPassword: true,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          avatar: 'A'
        }
      ];
      users.push(...demoUsers);

      // Pre-fill demo wallets
      let walletsData = localStorage.getItem('earn10x_wallets');
      let wallets = walletsData ? JSON.parse(walletsData) : {};
      wallets['demo_101'] = 5000;
      wallets['demo_102'] = 12500;
      wallets['demo_103'] = 500;
      localStorage.setItem('earn10x_wallets', JSON.stringify(wallets));
    }

    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  // Called by admin to create a user account for a player
  adminCreateUser(userData) {
    const users = this.getAllUsers();
    const user = {
      id: Date.now().toString(),
      username: userData.username,
      name: userData.name,
      phone: userData.phone,
      password: userData.password, // This is temporary, admin creates it
      mustResetPassword: true, // Force reset on first login
      isAdmin: false,
      createdAt: new Date().toISOString(),
      avatar: userData.name.charAt(0).toUpperCase()
    };
    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return user;
  }

  login(username, phone, password) {
    const users = this.getAllUsers();
    // Admin can login with just username + password (no phone required)
    const user = users.find(u => {
      if (u.isAdmin && u.username === username && u.password === password) {
        return true;
      }
      return u.username === username && u.phone === phone && u.password === password;
    });
    if (user) {
      this.setCurrentUser(user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn() {
    return !!localStorage.getItem(this.storageKey);
  }

  isAdmin() {
    const user = this.getUser();
    return user && user.isAdmin === true;
  }

  getUser() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  updateUser(updates) {
    const user = this.getUser();
    if (user) {
      Object.assign(user, updates);
      this.setCurrentUser(user);
      // Also update in users list
      const users = this.getAllUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      }
    }
    return user;
  }

  getAllUsers() {
    const data = localStorage.getItem(this.usersKey);
    return data ? JSON.parse(data) : [];
  }

  // Get all non-admin users (players only)
  getAllPlayers() {
    return this.getAllUsers().filter(u => !u.isAdmin);
  }

  // Ban a user
  banUser(userId) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isBanned = true;
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  // Unban a user
  unbanUser(userId) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isBanned = false;
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  // Check if current user is banned
  isBanned() {
    const user = this.getUser();
    if (!user) return false;
    // Re-check from stored user list (admin may have updated)
    const users = this.getAllUsers();
    const fresh = users.find(u => u.id === user.id);
    return fresh ? fresh.isBanned === true : false;
  }
}