// Home Page - ALL Panel Style with Full Game Grid + Realistic Images

export class HomePage {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- Live Match Ticker -->
      <div class="match-ticker">
        <div class="match-ticker-inner" id="match-ticker-inner">
          ${this.renderMatchTicker()}
        </div>
      </div>

      <!-- Casino Games Grid -->
      <div class="casino-grid">
        ${this.renderGameCards()}
      </div>
    `;

    this.setupEvents();
  }

  renderMatchTicker() {
    const matches = [
      'Mumbai Indians v Sunrisers Hyder...',
      'Multan Sultans v Hyderabad Kings...',
      'M Kostyuk v L Noskova',
      'Atletico Madrid v Arsenal',
      'Fils v Lehecka'
    ];
    return matches.map(m => `
      <div class="ticker-match">
        <i class="fas fa-tv" style="color:#4caf50;margin-right:4px;font-size:0.6rem;"></i>
        ${m}
      </div>
    `).join('');
  }

  renderGameCards() {
    // Image mapping for game categories
    const gameImages = {
      'matka': '/games/matka.png',
      'teen-patti': '/games/teen-patti.png',
      'roulette': '/games/roulette.png',
      'dragon-tiger': '/games/dragon-tiger.png',
      'aviator': '/games/aviator.png',
      'color-game': '/games/color-game.png',
      'andar-bahar': '/games/andar-bahar.png',
      'baccarat': '/games/baccarat.png',
      'poker': '/games/poker.png',
      'lucky7': '/games/lucky7.png',
      'dice': '/games/dice.png',
      'cricket': '/games/cricket.png',
      'lottery': '/games/lottery.png',
      'bollywood': '/games/bollywood.png',
      'football': '/games/football.png',
    };

    const games = [
      // Row 1
      { id: 'matka', title: 'Matka Market', img: 'matka', bg: 'linear-gradient(135deg, #0d1b2a, #1b3a4b)' },
      { id: 'vip-teenpatti-1day', title: 'V VIP Teenpatti 1-Day', img: 'teen-patti', bg: 'linear-gradient(135deg, #1a0033, #4a0072)' },
      { id: 'dolidana', title: 'Doli Dana Live', img: 'color-game', bg: 'linear-gradient(135deg, #1a237e, #0d47a1)' },
      { id: 'mogambo', title: 'Mogambo', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #004d40, #00695c)' },
      { id: '2020-teenpatti-vip', title: '20-20 Teenpatti VIP1', img: 'teen-patti', bg: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
      { id: 'lucky6', title: 'Lucky 6', img: 'lucky7', bg: 'linear-gradient(135deg, #1b5e20, #2e7d32)' },
      { id: 'beach-roulette', title: 'Beach Roulette', img: 'roulette', bg: 'linear-gradient(135deg, #0277bd, #0288d1)' },
      { id: 'roulette', title: 'Roulette', img: 'roulette', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
      { id: 'golden-roulette', title: 'Golden Roulette', img: 'roulette', bg: 'linear-gradient(135deg, #b8860b, #daa520)' },
      { id: 'teenpatti-poison-1day', title: 'Teenpatti Poison One Day', img: 'teen-patti', bg: 'linear-gradient(135deg, #311b92, #4527a0)' },

      // Row 2
      { id: 'unique-teenpatti', title: 'Unique Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #004d40, #00796b)' },
      { id: 'teenpatti-poison-2020', title: 'Teenpatti Poison 20-20', img: 'teen-patti', bg: 'linear-gradient(135deg, #1b5e20, #388e3c)' },
      { id: 'unlimited-joker-2020', title: 'Unlimited Joker 20-20', img: 'poker', bg: 'linear-gradient(135deg, #880e4f, #ad1457)' },
      { id: 'teenpatti-joker-2020', title: 'Teenpatti Joker 20-20', img: 'teen-patti', bg: 'linear-gradient(135deg, #4a148c, #6a1b9a)' },
      { id: 'unlimited-joker-1day', title: 'Unlimited Joker Oneday', img: 'poker', bg: 'linear-gradient(135deg, #263238, #37474f)' },
      { id: '2020-teenpatti-c', title: '20-20 Teenpatti C', img: 'teen-patti', bg: 'linear-gradient(135deg, #0d47a1, #1976d2)' },
      { id: 'bollywood-casino', title: 'Bollywood Casino 2', img: 'bollywood', bg: 'linear-gradient(135deg, #b71c1c, #c62828)' },
      { id: 'unique-roulette', title: 'Unique Roulette', img: 'roulette', bg: 'linear-gradient(135deg, #1a237e, #283593)' },
      { id: 'mini-superover', title: 'Mini Super Over', img: 'cricket', bg: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
      { id: 'goal', title: 'Goal', img: 'football', bg: 'linear-gradient(135deg, #1b5e20, #2e7d32)' },

      // Row 3
      { id: 'andar-bahar-150', title: 'Andar Bahar 150 Cards', img: 'andar-bahar', bg: 'linear-gradient(135deg, #e65100, #f57c00)' },
      { id: 'lucky15', title: 'Lucky 15', img: 'lucky7', bg: 'linear-gradient(135deg, #1b5e20, #388e3c)' },
      { id: 'superover2', title: 'Super Over2', img: 'cricket', bg: 'linear-gradient(135deg, #b71c1c, #d32f2f)' },
      { id: 'queen-top-open', title: 'Queen Top Open Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #4a148c, #7b1fa2)' },
      { id: 'jack-top-open', title: 'Jack Top Open Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #1a237e, #283593)' },
      { id: 'sicbo2', title: 'Sic Bo 2', img: 'dice', bg: 'linear-gradient(135deg, #004d40, #00695c)' },
      { id: 'instant-teenpatti3', title: 'Instant Teenpatti 3.0', img: 'teen-patti', bg: 'linear-gradient(135deg, #e65100, #f57c00)' },
      { id: 'sicbo', title: 'Sic Bo', img: 'dice', bg: 'linear-gradient(135deg, #880e4f, #c2185b)' },
      { id: 'ballbyball', title: 'Ball By Ball', img: 'cricket', bg: 'linear-gradient(135deg, #1b5e20, #43a047)' },
      { id: 'instant-teenpatti2', title: 'Instant Teenpatti 2.0', img: 'teen-patti', bg: 'linear-gradient(135deg, #b71c1c, #e53935)' },

      // Row 4
      { id: 'teenpatti-1day', title: 'Teenpatti 1-Day', img: 'teen-patti', bg: 'linear-gradient(135deg, #263238, #455a64)' },
      { id: '2020-teenpatti', title: '20-20 Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #263238, #37474f)' },
      { id: 'teenpatti-test', title: 'Teenpatti Test', img: 'teen-patti', bg: 'linear-gradient(135deg, #1a237e, #1565c0)' },
      { id: 'open-teenpatti', title: 'Open Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #004d40, #00796b)' },
      { id: 'poker-1day', title: 'Poker 1-Day', img: 'poker', bg: 'linear-gradient(135deg, #b71c1c, #d32f2f)' },
      { id: 'poker-2020', title: 'Poker 20-20', img: 'poker', bg: 'linear-gradient(135deg, #b71c1c, #c62828)' },
      { id: 'poker-6player', title: 'Poker 6 Players', img: 'poker', bg: 'linear-gradient(135deg, #880e4f, #ad1457)' },
      { id: 'baccarat', title: 'Baccarat', img: 'baccarat', bg: 'linear-gradient(135deg, #1b5e20, #388e3c)' },
      { id: 'baccarat2', title: 'Baccarat 2', img: 'baccarat', bg: 'linear-gradient(135deg, #004d40, #00695c)' },
      { id: 'online-baccarat', title: 'Online Baccarat', img: 'baccarat', bg: 'linear-gradient(135deg, #0d47a1, #1565c0)' },

      // Row 5
      { id: '2020-dragon-tiger', title: '20-20 Dragon Tiger', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #b71c1c, #1565c0)' },
      { id: '1day-dragon-tiger', title: '1 Day Dragon Tiger', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #e65100, #f57c00)' },
      { id: '2020-dt1', title: '20-20 D T 1', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #4a148c, #7b1fa2)' },
      { id: '2020-dragon-tiger2', title: '20-20 Dragon Tiger 2', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #311b92, #4527a0)' },
      { id: '32cards-a', title: '32 Cards A', img: 'teen-patti', bg: 'linear-gradient(135deg, #263238, #37474f)' },
      { id: '32cards-b', title: '32 Cards B', img: 'teen-patti', bg: 'linear-gradient(135deg, #1a237e, #283593)' },
      { id: 'andar-bahar', title: 'Andar Bahar', img: 'andar-bahar', bg: 'linear-gradient(135deg, #0d47a1, #1976d2)' },
      { id: 'andar-bahar2', title: 'Andar Bahar 2', img: 'andar-bahar', bg: 'linear-gradient(135deg, #004d40, #00796b)' },
      { id: 'lucky7a', title: 'Lucky 7 - A', img: 'lucky7', bg: 'linear-gradient(135deg, #1b5e20, #43a047)' },
      { id: 'lucky7b', title: 'Lucky 7 - B', img: 'lucky7', bg: 'linear-gradient(135deg, #b71c1c, #e53935)' },

      // Row 6
      { id: '3cards-judgement', title: '3 Cards Judgement', img: 'teen-patti', bg: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
      { id: 'casino-war', title: 'Casino War', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #880e4f, #c2185b)' },
      { id: 'worli-matka', title: 'Worli Matka', img: 'matka', bg: 'linear-gradient(135deg, #e65100, #f57c00)' },
      { id: 'instant-worli', title: 'Instant Worli', img: 'matka', bg: 'linear-gradient(135deg, #263238, #455a64)' },
      { id: 'aviator', title: 'Aviator', img: 'aviator', bg: 'linear-gradient(135deg, #0d1b2a, #1b3a5c, #b71c1c)' },
      { id: 'lottery', title: 'Lottery', img: 'lottery', bg: 'linear-gradient(135deg, #4a148c, #7b1fa2)' },
      { id: 'color-game', title: 'Color Game', img: 'color-game', bg: 'linear-gradient(135deg, #22c55e, #3b82f6, #ef4444)' },
      { id: 'cricket-match', title: 'Cricket Match 20-20', img: 'cricket', bg: 'linear-gradient(135deg, #1b5e20, #388e3c)' },
      { id: 'casino-meter', title: 'Casino Meter', img: 'roulette', bg: 'linear-gradient(135deg, #0d47a1, #1976d2)' },
      { id: 'race-to-17', title: 'Race To 17', img: 'lucky7', bg: 'linear-gradient(135deg, #b71c1c, #d32f2f)' },

      // Row 7
      { id: 'casino-queen', title: 'Casino Queen', img: 'poker', bg: 'linear-gradient(135deg, #880e4f, #ad1457)' },
      { id: 'race33', title: 'Race 33', img: 'lucky7', bg: 'linear-gradient(135deg, #263238, #455a64)' },
      { id: 'lucky7e', title: 'Lucky 7 - E', img: 'lucky7', bg: 'linear-gradient(135deg, #004d40, #00695c)' },
      { id: 'trap', title: 'The Trap', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #1a237e, #283593)' },
      { id: '2cards-teenpatti', title: '2 Cards Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #4a148c, #6a1b9a)' },
      { id: '29card-baccarat', title: '29 Card Baccarat', img: 'baccarat', bg: 'linear-gradient(135deg, #e65100, #ff6d00)' },
      { id: 'muflis-teenpatti', title: 'Muflis Teenpatti', img: 'teen-patti', bg: 'linear-gradient(135deg, #1b5e20, #43a047)' },
      { id: 'trio', title: 'Trio', img: 'dragon-tiger', bg: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
      { id: 'note-number', title: 'Note Number', img: 'lottery', bg: 'linear-gradient(135deg, #b71c1c, #d32f2f)' },
      { id: '1card-2020', title: '1 Card 20-20', img: 'teen-patti', bg: 'linear-gradient(135deg, #263238, #37474f)' },
    ];

    return games.map(g => {
      const imgUrl = gameImages[g.img] || '';
      return `
        <div class="casino-card" data-game="${g.id}" data-title="${g.title}">
          <div class="casino-card-thumb" style="background: ${g.bg};">
            ${imgUrl ? `<img class="casino-card-img" src="${imgUrl}" alt="${g.title}" loading="lazy" />` : ''}
            <div class="casino-card-overlay"></div>
            <span class="casino-card-title-overlay">${g.title.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          <div class="casino-card-label">${g.title}</div>
        </div>
      `;
    }).join('');
  }

  setupEvents() {
    this.container.querySelectorAll('.casino-card').forEach(card => {
      card.addEventListener('click', () => {
        this.app.navigateTo(card.dataset.game);
      });
    });

    this.container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.navigateTo(link.dataset.page);
      });
    });
  }
}
