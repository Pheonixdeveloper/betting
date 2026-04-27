// Home Page

export class HomePage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    this.container.innerHTML = `


      <!-- Marquee -->
      <div class="marquee-bar">
        <div class="marquee-content" id="marquee-content">
          <span class="marquee-item"><i class="fas fa-trophy"></i> Ravi won ₹45,000 in Aviator!</span>
          <span class="marquee-item"><i class="fas fa-star"></i> Priya won ₹12,500 in Dragon Tiger!</span>
          <span class="marquee-item"><i class="fas fa-gem"></i> Amit won ₹78,000 in Teen Patti!</span>
          <span class="marquee-item"><i class="fas fa-fire"></i> Sneha won ₹22,000 in Color Game!</span>
          <span class="marquee-item"><i class="fas fa-crown"></i> Raj won ₹55,000 in Roulette!</span>
          <span class="marquee-item"><i class="fas fa-bolt"></i> VIP Bonus: Get 200% on first deposit!</span>
          <span class="marquee-item"><i class="fas fa-trophy"></i> Ravi won ₹45,000 in Aviator!</span>
          <span class="marquee-item"><i class="fas fa-star"></i> Priya won ₹12,500 in Dragon Tiger!</span>
          <span class="marquee-item"><i class="fas fa-gem"></i> Amit won ₹78,000 in Teen Patti!</span>
          <span class="marquee-item"><i class="fas fa-fire"></i> Sneha won ₹22,000 in Color Game!</span>
          <span class="marquee-item"><i class="fas fa-crown"></i> Raj won ₹55,000 in Roulette!</span>
          <span class="marquee-item"><i class="fas fa-bolt"></i> VIP Bonus: Get 200% on first deposit!</span>
        </div>
      </div>



      <!-- Popular Games -->
      <div class="section-header">
        <h2 class="section-title"><i class="fas fa-fire"></i> Popular Games</h2>
        <a href="#" class="section-link" data-page="casino">View All <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="games-grid" id="games-grid">
        ${this.renderGameCards()}
      </div>



      <!-- Live Winners -->
      <div class="section-header">
        <h2 class="section-title"><i class="fas fa-trophy"></i> Recent Winners</h2>
      </div>
      <div class="game-history">
        <table class="history-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Game</th>
              <th>Bet</th>
              <th>Win</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody id="live-winners-body">
            ${this.renderLiveWinners()}
          </tbody>
        </table>
      </div>
    `;

    this.setupEvents();
    this.createParticles();
  }

  renderGameCards() {
    const games = [
      {
        id: 'dragon-tiger',
        title: 'Dragon Tiger',
        provider: 'Global Live',
        players: Math.floor(Math.random() * 500) + 200,
        emoji: '🐉',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #1e40af 100%)',
        badge: 'LIVE'
      },
      {
        id: 'teen-patti',
        title: 'Teen Patti',
        provider: 'Global Cards',
        players: Math.floor(Math.random() * 400) + 150,
        emoji: '🃏',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
        badge: 'HOT'
      },
      {
        id: 'aviator',
        title: 'Aviator',
        provider: 'Global Crash',
        players: Math.floor(Math.random() * 800) + 400,
        emoji: '<img src="/plane.png" style="height:4rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));" />',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #dc2626 100%)',
        badge: 'POPULAR'
      },
      {
        id: 'color-game',
        title: 'Color Game',
        provider: 'Global Colors',
        players: Math.floor(Math.random() * 300) + 100,
        emoji: '🎨',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 50%, #ef4444 100%)',
        badge: 'NEW'
      },
      {
        id: 'roulette',
        title: 'Roulette',
        provider: 'Global Table',
        players: Math.floor(Math.random() * 350) + 200,
        emoji: '🎰',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        badge: 'CLASSIC'
      },
      {
        id: 'andar-bahar',
        title: 'Andar Bahar',
        provider: 'Global Live',
        players: Math.floor(Math.random() * 1500) + 800,
        emoji: '⭐',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #991b1b 100%)',
        badge: 'HOT'
      },
      {
        id: 'baccarat',
        title: 'Baccarat',
        provider: 'Global Table',
        players: Math.floor(Math.random() * 800) + 300,
        emoji: '🏦',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
        badge: 'PREMIUM'
      }
    ];

    return games.map(game => `
      <div class="game-card" data-game="${game.id}">
        <div class="game-card-image" style="background: ${game.gradient}; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 4rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${game.emoji}</span>
          <span class="game-card-badge live">${game.badge}</span>
          <div class="game-card-overlay">
            <div class="game-card-play"><i class="fas fa-play"></i></div>
          </div>
        </div>
        <div class="game-card-info">
          <div class="game-card-title">${game.title}</div>
          <div class="game-card-provider">${game.provider}</div>
          <div class="game-card-players"><i class="fas fa-users"></i> ${game.players} playing now</div>
        </div>
      </div>
    `).join('');
  }

  renderLiveWinners() {
    const names = ['Ravi K.', 'Priya M.', 'Amit S.', 'Sneha R.', 'Raj P.', 'Neha G.', 'Vikram T.', 'Anita B.'];
    const games = ['Dragon Tiger', 'Teen Patti', 'Aviator', 'Color Game', 'Roulette'];
    
    return Array.from({length: 8}, (_, i) => {
      const bet = Math.floor(Math.random() * 5000) + 500;
      const multiplier = (Math.random() * 5 + 1).toFixed(1);
      const win = Math.floor(bet * multiplier);
      const mins = Math.floor(Math.random() * 30) + 1;
      return `
        <tr>
          <td><strong>${names[i]}</strong></td>
          <td>${games[Math.floor(Math.random() * games.length)]}</td>
          <td>₹${bet.toLocaleString()}</td>
          <td style="color: var(--success); font-weight: 700;">₹${win.toLocaleString()}</td>
          <td>${mins}m ago</td>
        </tr>
      `;
    }).join('');
  }

  createParticles() {
    // Particles removed for a cleaner minimal look
  }

  setupEvents() {
    // Game cards
    this.container.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        this.app.navigateTo(card.dataset.game);
      });
    });

    // Category icons
    this.container.querySelectorAll('.category-icon').forEach(icon => {
      icon.addEventListener('click', () => {
        this.app.navigateTo(icon.dataset.game);
      });
    });

    // Hero buttons
    const playNow = this.container.querySelector('#hero-play-now');
    if (playNow) {
      playNow.addEventListener('click', () => this.app.navigateTo('casino'));
    }

    const heroSignup = this.container.querySelector('#hero-signup');
    if (heroSignup) {
      heroSignup.addEventListener('click', () => {
        if (this.app.userManager.isLoggedIn()) {
          this.app.navigateTo('casino');
        } else {
          this.app.openModal('signup-modal');
        }
      });
    }

    // Section links
    this.container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo(link.dataset.page);
      });
    });
  }
}
