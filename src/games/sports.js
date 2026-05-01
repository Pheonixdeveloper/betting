export class SportsGame {
  constructor(container, app, theme = null) {
    this.container = container;
    this.app = app;
    this.theme = theme;
    this.matches = [
      { id: 1, title: 'Pakistan Super League', date: '24/03/2026 17:30:00', type: 'cricket', odds: { 1: { back: 1.14, lay: 1.36 }, 2: { back: 3.75, lay: 8 } } },
      { id: 2, title: 'Indian Premier League', date: '28/03/2026 19:30:00', type: 'cricket', odds: { 1: { back: 1.8, lay: 1.9 }, 2: { back: 2.1, lay: 2.2 } } },
      { id: 3, title: 'Surrey v Sussex', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 1.14, lay: 1.36 }, 2: { back: 3.75, lay: 8 } } },
      { id: 4, title: 'Kent v Derbyshire', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 1.2, lay: 1.9 }, 2: { back: 2.12, lay: 6 } } },
      { id: 5, title: 'Somerset v Yorkshire', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 1.15, lay: 1.4 }, 2: { back: 3.5, lay: 7.8 } } },
      { id: 6, title: 'Middlesex v Durham', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 1.21, lay: 2.76 }, 2: { back: 1.57, lay: 5.8 } } },
      { id: 7, title: 'Leicestershire v Nottinghamshire', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 8.2, lay: 15.5 }, 2: { back: 1.11, lay: 1.13 } } },
      { id: 8, title: 'Hampshire v Glamorgan', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 3.55, lay: 13.5 }, 2: { back: 1.1, lay: 1.39 } } },
      { id: 9, title: 'Northamptonshire v Worcestershire', date: '01/05/2026 15:30:00', type: 'cricket', odds: { 1: { back: 1.2, lay: 1.9 }, 2: { back: 2.1, lay: 6 } } },
      { id: 10, title: 'Islamabad United v Hyderabad Kingsmen', date: '01/05/2026 19:30:00', type: 'cricket', odds: { 1: { back: 2.38, lay: 2.42 }, 2: { back: 1.71, lay: 1.72 } } },
      { id: 11, title: 'Rajasthan Royals v Delhi Capitals', date: '01/05/2026 19:30:00', type: 'cricket', odds: { 1: { back: 4.4, lay: 4.5 }, 2: { back: 1.28, lay: 1.29 } } },
      { id: 12, title: 'Bangladesh W v Sri Lanka W', date: '02/05/2026 13:00:00', type: 'cricket', odds: { 1: { back: 3.3, lay: 3.35 }, 2: { back: 1.43, lay: 1.44 } } }
    ];
    this.currentMatch = null;
    this.isPlaying = false;
    this.init();
  }

  init() {
    this.renderListView();
  }

  renderListView() {
    let html = `
      <div class="sports-container fade-in">
        <div class="sports-header">
          <div class="sports-header-title">Game</div>
          <div class="sports-header-odds">
            <div class="odds-col-header">1</div>
            <div class="odds-col-header">X</div>
            <div class="odds-col-header">2</div>
          </div>
        </div>
        <div class="sports-list">
    `;

    this.matches.forEach(match => {
      html += `
        <div class="sports-row" data-id="${match.id}">
          <div class="sports-info">
            <div class="sports-title">${match.title} / ${match.date}</div>
            <div class="sports-icons">
              <i class="fas fa-circle" style="color: #4caf50; font-size: 8px;"></i>
              <i class="fas fa-tv"></i>
            </div>
          </div>
          <div class="sports-odds">
            <div class="odds-group">
              <div class="odd-box back">${match.odds[1].back}</div>
              <div class="odd-box lay">${match.odds[1].lay}</div>
            </div>
            <div class="odds-group">
              <div class="odd-box empty">-</div>
              <div class="odd-box empty">-</div>
            </div>
            <div class="odds-group">
              <div class="odd-box back">${match.odds[2].back}</div>
              <div class="odd-box lay">${match.odds[2].lay}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachListEvents();
  }

  attachListEvents() {
    const rows = this.container.querySelectorAll('.sports-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const matchId = parseInt(row.dataset.id);
        this.currentMatch = this.matches.find(m => m.id === matchId);
        this.renderMatchView();
      });
    });
  }

  renderMatchView() {
    const [team1, team2] = this.currentMatch.title.split(' v ');
    
    this.container.innerHTML = `
      <div class="sports-match-container fade-in">
        <div class="match-left">
          <div class="match-header">
            <div class="match-title-bar">
              <span class="match-name">${this.currentMatch.title.toUpperCase()}</span>
              <span class="match-date">${this.currentMatch.date}</span>
            </div>
          </div>
          
          <div class="odds-table-container">
            <div class="odds-table-header">
              <div class="odds-table-title">MATCH_ODDS</div>
              <div class="odds-table-cashout">Cashout</div>
            </div>
            
            <div class="odds-table-subheader">
              <div class="odds-runner-info">Max: 1</div>
              <div class="odds-actions-header">
                <div class="odds-back-title">Back</div>
                <div class="odds-lay-title">Lay</div>
              </div>
            </div>
            
            <div class="odds-runner-row">
              <div class="runner-name">${team1}</div>
              <div class="runner-odds">
                <div class="odd-box back-light">1.09<span>3.64</span></div>
                <div class="odd-box back-light">1.1<span>14.48</span></div>
                <div class="odd-box back" onclick="window.placeSportsBet('${team1}', 'back', ${this.currentMatch.odds[1].back})">${this.currentMatch.odds[1].back}<span>11.19</span></div>
                <div class="odd-box lay" onclick="window.placeSportsBet('${team1}', 'lay', ${this.currentMatch.odds[1].lay})">${this.currentMatch.odds[1].lay}<span>10.52</span></div>
                <div class="odd-box lay-light">1.56<span>1</span></div>
                <div class="odd-box lay-light">1.57<span>4.32</span></div>
              </div>
            </div>
            
            <div class="odds-runner-row">
              <div class="runner-name">${team2}</div>
              <div class="runner-odds">
                <div class="odd-box back-light">1.5<span>10</span></div>
                <div class="odd-box back-light">2.76<span>3.02</span></div>
                <div class="odd-box back" onclick="window.placeSportsBet('${team2}', 'back', ${this.currentMatch.odds[2].back})">${this.currentMatch.odds[2].back}<span>4.13</span></div>
                <div class="odd-box lay" onclick="window.placeSportsBet('${team2}', 'lay', ${this.currentMatch.odds[2].lay})">${this.currentMatch.odds[2].lay}<span>1.65</span></div>
                <div class="odd-box lay-light">11<span>1.45</span></div>
                <div class="odd-box lay-light">15.5<span>4.37</span></div>
              </div>
            </div>
          </div>
          
          <button class="back-to-list-btn" id="back-to-list"><i class="fas fa-arrow-left"></i> Back to Matches</button>
        </div>
        
        <div class="match-right">
          <div class="live-feed-container">
            <div class="live-feed-header">Live Match</div>
            <div class="live-feed-player">
              <!-- Animated live sports feed placeholder -->
              <div class="live-feed-overlay">
                <div class="live-indicator"><span class="blink">●</span> LIVE</div>
                <div class="score-overlay">
                  <div class="team-score">${team1.substring(0,3).toUpperCase()} 145/3</div>
                  <div class="team-score">${team2.substring(0,3).toUpperCase()} 0/0</div>
                </div>
              </div>
              <video id="live-sports-video" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; filter: brightness(0.8);">
                <source src="https://assets.mixkit.co/videos/preview/mixkit-cricket-batsman-hitting-the-ball-40292-large.mp4" type="video/mp4">
              </video>
            </div>
          </div>
          
          <div class="my-bets-container">
            <div class="my-bets-header">My Bet</div>
            <div class="my-bets-table">
              <div class="my-bets-thead">
                <span>Matched Bet</span>
                <span>Odds</span>
                <span>Stake</span>
              </div>
              <div class="my-bets-tbody" id="sports-bets-list">
                <div class="no-bets-msg">No matched bets</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bet Slip Modal (Hidden by default) -->
      <div id="sports-bet-slip" class="sports-bet-slip">
        <div class="bet-slip-header">
          <span>Place Bet</span>
          <i class="fas fa-times" onclick="document.getElementById('sports-bet-slip').classList.remove('active')"></i>
        </div>
        <div class="bet-slip-details">
          <div class="bet-slip-team" id="bet-slip-team">Team Name</div>
          <div class="bet-slip-odds-stake">
            <div class="bet-slip-input-group">
              <label>Odds</label>
              <input type="number" id="bet-slip-odds" readonly>
            </div>
            <div class="bet-slip-input-group">
              <label>Stake</label>
              <input type="number" id="bet-slip-stake" placeholder="0">
            </div>
          </div>
          <div class="bet-slip-profit">Profit: <span id="bet-slip-profit-val">0.00</span></div>
          <div class="bet-slip-buttons">
            <button class="btn-cancel" onclick="document.getElementById('sports-bet-slip').classList.remove('active')">Cancel</button>
            <button class="btn-place" id="btn-place-sports-bet">Place Bet</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-list').addEventListener('click', () => {
      this.renderListView();
    });

    window.placeSportsBet = (team, type, odds) => {
      if (!this.app.userManager.isLoggedIn()) {
        this.app.toastManager.show('Please login to place bets', 'warning');
        this.app.openModal('login-modal');
        return;
      }

      const slip = document.getElementById('sports-bet-slip');
      slip.classList.add('active');
      if (type === 'back') {
        slip.classList.add('is-back');
        slip.classList.remove('is-lay');
      } else {
        slip.classList.add('is-lay');
        slip.classList.remove('is-back');
      }
      
      document.getElementById('bet-slip-team').textContent = `${type.toUpperCase()} - ${team}`;
      document.getElementById('bet-slip-odds').value = odds;
      document.getElementById('bet-slip-stake').value = '';
      document.getElementById('bet-slip-profit-val').textContent = '0.00';
      
      this.currentBetContext = { team, type, odds };
    };

    document.getElementById('bet-slip-stake').addEventListener('input', (e) => {
      const stake = parseFloat(e.target.value) || 0;
      const odds = parseFloat(document.getElementById('bet-slip-odds').value);
      const profit = (stake * odds) - stake;
      document.getElementById('bet-slip-profit-val').textContent = profit.toFixed(2);
    });

    document.getElementById('btn-place-sports-bet').addEventListener('click', () => {
      const stake = parseFloat(document.getElementById('bet-slip-stake').value);
      if (!stake || stake <= 0) {
        this.app.toastManager.show('Please enter a valid stake', 'error');
        return;
      }
      
      if (!this.app.walletManager.placeBet(stake, 'Sports Exchange')) {
        this.app.toastManager.show('Insufficient balance', 'error');
        return;
      }
      
      this.app.updateWalletDisplay();
      document.getElementById('sports-bet-slip').classList.remove('active');
      this.app.toastManager.show('Bet placed successfully', 'success');
      
      // Add to my bets list
      const betsList = document.getElementById('sports-bets-list');
      if (betsList.querySelector('.no-bets-msg')) {
        betsList.innerHTML = '';
      }
      
      const profit = (stake * this.currentBetContext.odds) - stake;
      const typeClass = this.currentBetContext.type === 'back' ? 'text-back' : 'text-lay';
      
      betsList.innerHTML += `
        <div class="my-bets-row">
          <div class="my-bets-team ${typeClass}">${this.currentBetContext.team}</div>
          <div>${this.currentBetContext.odds}</div>
          <div>₹${stake}</div>
        </div>
      `;
      
      // Admin dashboard live bet
      const user = this.app.userManager.getUser();
      if (user) {
        this.app.adminController.addLiveBet('sports', user.username || user.name, stake, `${this.currentBetContext.type.toUpperCase()} ${this.currentBetContext.team}`);
      }
      
      // Simulate outcome after 10 seconds for demo
      setTimeout(() => {
        // Since we are creating a prediction game, we randomize if they won
        const winProbability = Math.random();
        if (winProbability > 0.5) {
          const winAmount = stake + profit;
          this.app.walletManager.addWinnings(winAmount, 'Sports Exchange');
          this.app.updateWalletDisplay();
          this.app.toastManager.show(`Sports Bet Won! You received ₹${winAmount.toFixed(2)}`, 'success');
        } else {
          this.app.toastManager.show(`Sports Bet Lost. Better luck next time!`, 'warning');
        }
      }, 10000);
    });
  }

  destroy() {
    delete window.placeSportsBet;
    this.container.innerHTML = '';
  }
}
