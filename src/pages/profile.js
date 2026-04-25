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

        <div class="profile-form">
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
      </div>
    `;

    document.getElementById('profile-edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-name').value;
      const email = document.getElementById('profile-email').value;
      this.app.userManager.updateUser({ name, email });
      this.app.updateAuthUI();
      this.app.toastManager.show('Profile updated successfully!', 'success');
    });
  }
}
