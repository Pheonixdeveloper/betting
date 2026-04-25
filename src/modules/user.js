// User Manager - handles authentication and user data with localStorage

export class UserManager {
  constructor() {
    this.storageKey = 'earn10x_user';
    this.usersKey = 'earn10x_users';
    // Admin credentials
    this.ADMIN_PHONE = 'admin';
    this.ADMIN_PASSWORD = 'admin123';
    this.ensureAdminExists();
  }

  // Make sure admin account always exists
  ensureAdminExists() {
    const users = this.getAllUsers();
    const adminExists = users.find(u => u.phone === this.ADMIN_PHONE);
    if (!adminExists) {
      users.push({
        id: 'admin_001',
        name: 'Admin',
        phone: this.ADMIN_PHONE,
        email: 'admin@earn10x.com',
        password: this.ADMIN_PASSWORD,
        isAdmin: true,
        createdAt: new Date().toISOString(),
        avatar: 'A'
      });
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  register(userData) {
    const users = this.getAllUsers();
    const user = {
      id: Date.now().toString(),
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      avatar: userData.name.charAt(0).toUpperCase()
    };
    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.setCurrentUser(user);
    return user;
  }

  login(phone, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.phone === phone && u.password === password);
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
}

