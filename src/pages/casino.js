// Casino Page - All games listing with realistic images

export class CasinoPage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    const games = [
      { id: 'dragon-tiger', title: 'Dragon Tiger', img: '/games/dragon-tiger.png', desc: 'Simple & fast card game. Bet on Dragon or Tiger!', gradient: 'linear-gradient(135deg, #dc2626, #1e40af)', payout: '1:1' },
      { id: 'teen-patti', title: 'Teen Patti', img: '/games/teen-patti.png', desc: 'Classic Indian card game. Best 3-card hand wins!', gradient: 'linear-gradient(135deg, #7c3aed, #db2777)', payout: '1:1' },
      { id: 'aviator', title: 'Aviator', img: '/games/aviator.png', desc: 'Cash out before the plane flies away!', gradient: 'linear-gradient(135deg, #0f172a, #dc2626)', payout: 'Up to 100x' },
      { id: 'color-game', title: 'Color Game', img: '/games/color-game.png', desc: 'Pick a color and watch the wheel spin!', gradient: 'linear-gradient(135deg, #22c55e, #3b82f6, #ef4444)', payout: '2x-6x' },
      { id: 'roulette', title: 'Roulette', img: '/games/roulette.png', desc: 'Classic casino roulette with multiple bet types.', gradient: 'linear-gradient(135deg, #1a1a2e, #0f3460)', payout: 'Up to 36x' },
      { id: 'andar-bahar', title: 'Andar Bahar', img: '/games/andar-bahar.png', desc: 'Traditional Indian card game. Pick Andar or Bahar!', gradient: 'linear-gradient(135deg, #e65100, #f57c00)', payout: '1.9x' },
      { id: 'baccarat', title: 'Baccarat', img: '/games/baccarat.png', desc: 'Premium table game. Player vs Banker.', gradient: 'linear-gradient(135deg, #1b5e20, #388e3c)', payout: '1:1 / 8:1' },
    ];

    this.container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <div class="game-header-icon"><i class="fas fa-gamepad" style="font-size: 2.5rem; color: var(--accent);"></i></div>
          <h1>All Games</h1>
          <p>Choose your favorite game and start winning</p>
        </div>
        <div class="games-grid">
          ${games.map(g => `
            <div class="game-card" data-game="${g.id}" style="cursor:pointer;">
              <div class="game-card-image" style="position: relative; overflow: hidden; height: 180px;">
                <img src="${g.img}" alt="${g.title}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.4s ease;" loading="lazy" />
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
