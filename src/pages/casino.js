// Casino Page - All games listing

export class CasinoPage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    const games = [
      { id: 'dragon-tiger', title: 'Dragon Tiger', emoji: '🐉', desc: 'Simple & fast card game. Bet on Dragon or Tiger!', gradient: 'linear-gradient(135deg, #dc2626, #1e40af)', payout: '1:1' },
      { id: 'teen-patti', title: 'Teen Patti', emoji: '🃏', desc: 'Classic Indian card game. Best 3-card hand wins!', gradient: 'linear-gradient(135deg, #7c3aed, #db2777)', payout: '1:1' },
      { id: 'aviator', title: 'Aviator', emoji: '✈️', desc: 'Cash out before the plane flies away!', gradient: 'linear-gradient(135deg, #0f172a, #dc2626)', payout: 'Up to 100x' },
      { id: 'color-game', title: 'Color Game', emoji: '🎨', desc: 'Pick a color and watch the wheel spin!', gradient: 'linear-gradient(135deg, #22c55e, #3b82f6, #ef4444)', payout: '2x-6x' },
      { id: 'roulette', title: 'Roulette', emoji: '🎰', desc: 'Classic casino roulette with multiple bet types.', gradient: 'linear-gradient(135deg, #1a1a2e, #0f3460)', payout: 'Up to 36x' },
    ];

    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon">🎮</div>
          <h1>All Games</h1>
          <p>Choose your favorite game and start winning</p>
        </div>
        <div class="games-grid">
          ${games.map(g => `
            <div class="game-card" data-game="${g.id}" style="cursor:pointer;">
              <div class="game-card-image" style="background: ${g.gradient}; display: flex; align-items: center; justify-content: center; height: 180px;">
                <span style="font-size: 5rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${g.emoji}</span>
                <div class="game-card-overlay">
                  <div class="game-card-play"><i class="fas fa-play"></i></div>
                </div>
              </div>
              <div class="game-card-info">
                <div class="game-card-title">${g.title}</div>
                <div class="game-card-provider">${g.desc}</div>
                <div class="game-card-players" style="color: var(--accent);"><i class="fas fa-coins"></i> Max Payout: ${g.payout}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        this.app.navigateTo(card.dataset.game);
      });
    });
  }
}
