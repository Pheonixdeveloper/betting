// Game Themes - Visual customization for each game variant
// Each variant shares core game logic but has unique visual identity

export const GAME_THEMES = {
  // === TEEN PATTI VARIANTS ===
  'vip-teenpatti-1day': {
    route: 'teen-patti', title: 'V VIP Teenpatti 1-Day', subtitle: 'Ultra Premium VIP Table • 1-Day Format',
    img: '/games/vip-gold.png', headerBg: 'linear-gradient(135deg, #b8860b, #ffd700, #b8860b)',
    accentColor: '#ffd700', labelA: '👑 VIP Player A', labelB: '💎 VIP Player B'
  },
  '2020-teenpatti-vip': {
    route: 'teen-patti', title: '20-20 Teenpatti VIP1', subtitle: 'VIP Express Format • Fast 20-20 Rounds',
    img: '/games/vip-gold.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    accentColor: '#64b5f6', labelA: '⚡ Player A', labelB: '⚡ Player B'
  },
  'teenpatti-poison-1day': {
    route: 'teen-patti', title: 'Teenpatti Poison', subtitle: 'Dark Poison Edition • Deadly Hands Only',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1a0033, #4a148c)',
    accentColor: '#ce93d8', labelA: '☠️ Venom A', labelB: '☠️ Venom B',
    overlay: 'rgba(75,0,130,0.3)'
  },
  'unique-teenpatti': {
    route: 'teen-patti', title: 'Unique Teenpatti', subtitle: 'One-of-a-Kind Rules • Unique Combos Win Big',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #004d40, #00796b)',
    accentColor: '#80cbc4', labelA: '🌟 Unique A', labelB: '🌟 Unique B'
  },
  'teenpatti-poison-2020': {
    route: 'teen-patti', title: 'Teenpatti Poison 20-20', subtitle: 'Speed Poison • 20-20 Deadly Rounds',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
    accentColor: '#66bb6a', labelA: '💀 Toxic A', labelB: '💀 Toxic B',
    overlay: 'rgba(0,50,0,0.3)'
  },
  'teenpatti-joker-2020': {
    route: 'teen-patti', title: 'Teenpatti Joker 20-20', subtitle: 'Wild Joker Edition • Jokers Change Everything',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #4a148c, #7b1fa2)',
    accentColor: '#e040fb', labelA: '🃏 Joker A', labelB: '🃏 Joker B'
  },
  '2020-teenpatti-c': {
    route: 'teen-patti', title: '20-20 Teenpatti C', subtitle: 'Classic 20-20 Format • Series C Edition',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1976d2)',
    accentColor: '#90caf9', labelA: '🔵 Player A', labelB: '🔴 Player B'
  },
  'queen-top-open': {
    route: 'teen-patti', title: 'Queen Top Open', subtitle: 'Queens Rule • Top Card Revealed',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #880e4f, #ad1457)',
    accentColor: '#f48fb1', labelA: '👸 Queen A', labelB: '👸 Queen B'
  },
  'jack-top-open': {
    route: 'teen-patti', title: 'Jack Top Open', subtitle: 'Jacks Lead • Top Card Revealed',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1a237e, #283593)',
    accentColor: '#9fa8da', labelA: '🤴 Jack A', labelB: '🤴 Jack B'
  },
  'instant-teenpatti3': {
    route: 'teen-patti', title: 'Instant Teenpatti 3.0', subtitle: 'Lightning Fast • Instant Results',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #e65100, #ff6d00)',
    accentColor: '#ffab40', labelA: '⚡ Flash A', labelB: '⚡ Flash B'
  },
  'instant-teenpatti2': {
    route: 'teen-patti', title: 'Instant Teenpatti 2.0', subtitle: 'Speed Edition • Quick Rounds',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #b71c1c, #e53935)',
    accentColor: '#ef9a9a', labelA: '🔥 Rapid A', labelB: '🔥 Rapid B'
  },
  'teenpatti-1day': {
    route: 'teen-patti', title: 'Teenpatti 1-Day', subtitle: 'Classic One Day Format',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #263238, #455a64)',
    accentColor: '#b0bec5', labelA: '🔵 Player A', labelB: '🔴 Player B'
  },
  '2020-teenpatti': {
    route: 'teen-patti', title: '20-20 Teenpatti', subtitle: 'Classic 20-20 Format',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #263238, #37474f)',
    accentColor: '#90a4ae', labelA: '🔵 Player A', labelB: '🔴 Player B'
  },
  'teenpatti-test': {
    route: 'teen-patti', title: 'Teenpatti Test', subtitle: 'Practice Mode • Test Your Skills',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1a237e, #1565c0)',
    accentColor: '#90caf9', labelA: '🧪 Test A', labelB: '🧪 Test B'
  },
  'open-teenpatti': {
    route: 'teen-patti', title: 'Open Teenpatti', subtitle: 'All Cards Face Up • Pure Strategy',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #004d40, #00796b)',
    accentColor: '#80cbc4', labelA: '👁️ Open A', labelB: '👁️ Open B'
  },
  '2cards-teenpatti': {
    route: 'teen-patti', title: '2 Cards Teenpatti', subtitle: '2 Card Variant • Quick & Deadly',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #4a148c, #6a1b9a)',
    accentColor: '#ce93d8', labelA: '✌️ Duo A', labelB: '✌️ Duo B'
  },
  'muflis-teenpatti': {
    route: 'teen-patti', title: 'Muflis Teenpatti', subtitle: 'Reverse Rules • Lowest Hand Wins!',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1b5e20, #43a047)',
    accentColor: '#a5d6a7', labelA: '🔄 Muflis A', labelB: '🔄 Muflis B'
  },
  '3cards-judgement': {
    route: 'teen-patti', title: '3 Cards Judgement', subtitle: 'Judgement Day • 3 Card Showdown',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    accentColor: '#90caf9', labelA: '⚖️ Judge A', labelB: '⚖️ Judge B'
  },

  // === JOKER / POKER VARIANTS ===
  'unlimited-joker-2020': {
    route: 'teen-patti', title: 'Unlimited Joker 20-20', subtitle: 'Unlimited Wild Cards • Maximum Chaos',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #880e4f, #ad1457)',
    accentColor: '#f48fb1', labelA: '🃏 Wild A', labelB: '🃏 Wild B'
  },
  'unlimited-joker-1day': {
    route: 'teen-patti', title: 'Unlimited Joker 1-Day', subtitle: 'Wild Cards All Day • No Limits',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #263238, #37474f)',
    accentColor: '#b0bec5', labelA: '🃏 Wild A', labelB: '🃏 Wild B'
  },
  'poker-1day': {
    route: 'teen-patti', title: 'Poker 1-Day', subtitle: 'Classic Poker • 1-Day Tournament',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #b71c1c, #d32f2f)',
    accentColor: '#ef9a9a', labelA: '♠️ Player A', labelB: '♥️ Player B'
  },
  'poker-2020': {
    route: 'teen-patti', title: 'Poker 20-20', subtitle: 'Speed Poker • 20-20 Format',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #b71c1c, #c62828)',
    accentColor: '#ef9a9a', labelA: '♠️ Player A', labelB: '♥️ Player B'
  },
  'poker-6player': {
    route: 'teen-patti', title: 'Poker 6 Players', subtitle: '6 Player Table • Full Ring Action',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #880e4f, #ad1457)',
    accentColor: '#f48fb1', labelA: '♦️ Player A', labelB: '♣️ Player B'
  },
  '32cards-a': {
    route: 'teen-patti', title: '32 Cards A', subtitle: '32 Card Deck • Series A',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #263238, #37474f)',
    accentColor: '#b0bec5', labelA: '🂠 Hand A', labelB: '🂠 Hand B'
  },
  '32cards-b': {
    route: 'teen-patti', title: '32 Cards B', subtitle: '32 Card Deck • Series B',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #1a237e, #283593)',
    accentColor: '#9fa8da', labelA: '🂠 Hand A', labelB: '🂠 Hand B'
  },

  // === DRAGON TIGER VARIANTS ===
  '2020-dragon-tiger': {
    route: 'dragon-tiger', title: '20-20 Dragon Tiger', subtitle: 'Speed Format • Dragon vs Tiger',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #b71c1c, #1565c0)',
    accentColor: '#fff', dragonLabel: '🐉 Dragon', tigerLabel: '🐯 Tiger'
  },
  '1day-dragon-tiger': {
    route: 'dragon-tiger', title: '1 Day Dragon Tiger', subtitle: 'Full Day Format • Higher Stakes',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #e65100, #f57c00)',
    accentColor: '#ffe0b2', dragonLabel: '🐉 Dragon', tigerLabel: '🐯 Tiger'
  },
  '2020-dt1': {
    route: 'dragon-tiger', title: '20-20 D T 1', subtitle: 'Express Dragon Tiger Series 1',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #4a148c, #7b1fa2)',
    accentColor: '#e1bee7', dragonLabel: '🐉 Dragon', tigerLabel: '🐯 Tiger'
  },
  '2020-dragon-tiger2': {
    route: 'dragon-tiger', title: '20-20 Dragon Tiger 2', subtitle: 'Series 2 • Enhanced Payouts',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #311b92, #4527a0)',
    accentColor: '#b39ddb', dragonLabel: '🐉 Dragon', tigerLabel: '🐯 Tiger'
  },
  'casino-war': {
    route: 'dragon-tiger', title: 'Casino War', subtitle: 'War of Cards • Highest Card Wins',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #880e4f, #c2185b)',
    accentColor: '#f8bbd0', dragonLabel: '⚔️ Attacker', tigerLabel: '🛡️ Defender'
  },
  'casino-queen': {
    route: 'dragon-tiger', title: 'Casino Queen', subtitle: 'Queen Rules The Table',
    img: '/games/poker.png', headerBg: 'linear-gradient(135deg, #880e4f, #ad1457)',
    accentColor: '#f48fb1', dragonLabel: '👑 Queen', tigerLabel: '🃏 Challenger'
  },
  'trio': {
    route: 'dragon-tiger', title: 'Trio', subtitle: 'Triple Threat • Three Way Showdown',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    accentColor: '#90caf9', dragonLabel: '🔱 Alpha', tigerLabel: '🔱 Beta'
  },
  '1card-2020': {
    route: 'dragon-tiger', title: '1 Card 20-20', subtitle: 'Single Card • Pure Luck',
    img: '/games/teen-patti.png', headerBg: 'linear-gradient(135deg, #263238, #37474f)',
    accentColor: '#b0bec5', dragonLabel: '🂡 Card A', tigerLabel: '🂡 Card B'
  },
  'trap': {
    route: 'dragon-tiger', title: 'The Trap', subtitle: 'Beware The Trap • High Risk',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #1a237e, #283593)',
    accentColor: '#9fa8da', dragonLabel: '🪤 Side A', tigerLabel: '🪤 Side B'
  },

  // === MOGAMBO / SPECIAL ===
  'mogambo': {
    route: 'dragon-tiger', title: 'Mogambo', subtitle: 'Mogambo Khush Hua • Power Play',
    img: '/games/dragon-tiger.png', headerBg: 'linear-gradient(135deg, #004d40, #00695c)',
    accentColor: '#80cbc4', dragonLabel: '🦹 Mogambo', tigerLabel: '🦸 Hero'
  },
  'dolidana': {
    route: 'color-game', title: 'Doli Dana Live', subtitle: 'Live Action • Pick Your Fortune',
    img: '/games/color-game.png', headerBg: 'linear-gradient(135deg, #1a237e, #0d47a1)',
    accentColor: '#64b5f6'
  },

  // === ROULETTE VARIANTS ===
  'beach-roulette': {
    route: 'roulette', title: 'Beach Roulette', subtitle: 'Tropical Vibes • Beach Party Edition',
    img: '/games/roulette.png', headerBg: 'linear-gradient(135deg, #0277bd, #0288d1)',
    accentColor: '#81d4fa'
  },
  'golden-roulette': {
    route: 'roulette', title: 'Golden Roulette', subtitle: 'Pure Gold Edition • Premium Payouts',
    img: '/games/roulette.png', headerBg: 'linear-gradient(135deg, #b8860b, #daa520)',
    accentColor: '#fff8e1'
  },
  'unique-roulette': {
    route: 'roulette', title: 'Unique Roulette', subtitle: 'Special Rules • Unique Betting Options',
    img: '/games/roulette.png', headerBg: 'linear-gradient(135deg, #1a237e, #283593)',
    accentColor: '#9fa8da'
  },
  'sicbo': {
    route: 'roulette', title: 'Sic Bo', subtitle: 'Ancient Dice Game • Multiple Bets',
    img: '/games/dice.png', headerBg: 'linear-gradient(135deg, #880e4f, #c2185b)',
    accentColor: '#f8bbd0'
  },
  'sicbo2': {
    route: 'roulette', title: 'Sic Bo 2', subtitle: 'Enhanced Dice • Series 2',
    img: '/games/dice.png', headerBg: 'linear-gradient(135deg, #004d40, #00695c)',
    accentColor: '#b2dfdb'
  },
  'bollywood-casino': {
    route: 'roulette', title: 'Bollywood Casino 2', subtitle: 'Bollywood Glamour • Spin & Win',
    img: '/games/bollywood.png', headerBg: 'linear-gradient(135deg, #b71c1c, #c62828)',
    accentColor: '#ef9a9a'
  },

  // === COLOR GAME / LUCK VARIANTS ===
  'matka': {
    route: 'color-game', title: 'Matka Market', subtitle: 'Traditional Number Game • Pick & Win',
    img: '/games/matka.png', headerBg: 'linear-gradient(135deg, #0d1b2a, #1b3a4b)',
    accentColor: '#4caf50'
  },
  'worli-matka': {
    route: 'color-game', title: 'Worli Matka', subtitle: 'Mumbai Special • Worli Numbers',
    img: '/games/matka.png', headerBg: 'linear-gradient(135deg, #e65100, #f57c00)',
    accentColor: '#ffe0b2'
  },
  'instant-worli': {
    route: 'color-game', title: 'Instant Worli', subtitle: 'Lightning Worli • Instant Results',
    img: '/games/matka.png', headerBg: 'linear-gradient(135deg, #263238, #455a64)',
    accentColor: '#b0bec5'
  },
  'lucky6': {
    route: 'color-game', title: 'Lucky 6', subtitle: 'Pick 6 Lucky Numbers',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
    accentColor: '#a5d6a7'
  },
  'lucky7a': {
    route: 'color-game', title: 'Lucky 7 - A', subtitle: 'Series A • Lucky Number 7',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #1b5e20, #43a047)',
    accentColor: '#c8e6c9'
  },
  'lucky7b': {
    route: 'color-game', title: 'Lucky 7 - B', subtitle: 'Series B • Lucky Number 7',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #b71c1c, #e53935)',
    accentColor: '#ffcdd2'
  },
  'lucky7e': {
    route: 'color-game', title: 'Lucky 7 - E', subtitle: 'Series E • Lucky Number 7',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #004d40, #00695c)',
    accentColor: '#b2dfdb'
  },
  'lucky15': {
    route: 'color-game', title: 'Lucky 15', subtitle: '15 Ways to Win',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #1b5e20, #388e3c)',
    accentColor: '#c8e6c9'
  },

  // === CRICKET / SPORTS ===
  'mini-superover': {
    route: 'color-game', title: 'Mini Super Over', subtitle: 'Cricket Super Over • Quick Match',
    img: '/games/cricket.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    accentColor: '#90caf9'
  },
  'superover2': {
    route: 'color-game', title: 'Super Over 2', subtitle: 'Cricket Finals • Series 2',
    img: '/games/cricket.png', headerBg: 'linear-gradient(135deg, #b71c1c, #d32f2f)',
    accentColor: '#ffcdd2'
  },
  'ballbyball': {
    route: 'color-game', title: 'Ball By Ball', subtitle: 'Live Cricket • Ball by Ball Betting',
    img: '/games/cricket.png', headerBg: 'linear-gradient(135deg, #1b5e20, #43a047)',
    accentColor: '#c8e6c9'
  },
  'goal': {
    route: 'color-game', title: 'Goal', subtitle: 'Football Betting • Score Predictions',
    img: '/games/football.png', headerBg: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
    accentColor: '#a5d6a7'
  },
  'cricket-match': {
    route: 'color-game', title: 'Cricket Match 20-20', subtitle: 'Full T20 Match Betting',
    img: '/games/cricket.png', headerBg: 'linear-gradient(135deg, #1b5e20, #388e3c)',
    accentColor: '#a5d6a7'
  },

  // === OTHER ===
  'lottery': {
    route: 'color-game', title: 'Lottery', subtitle: 'Lucky Draw • Big Jackpots',
    img: '/games/lottery.png', headerBg: 'linear-gradient(135deg, #4a148c, #7b1fa2)',
    accentColor: '#e1bee7'
  },
  'casino-meter': {
    route: 'color-game', title: 'Casino Meter', subtitle: 'Watch The Meter • Cash at Peak',
    img: '/games/roulette.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1976d2)',
    accentColor: '#90caf9'
  },
  'race-to-17': {
    route: 'color-game', title: 'Race To 17', subtitle: 'First to 17 Wins',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #b71c1c, #d32f2f)',
    accentColor: '#ffcdd2'
  },
  'race33': {
    route: 'color-game', title: 'Race 33', subtitle: 'Number Race • Reach 33',
    img: '/games/lucky7.png', headerBg: 'linear-gradient(135deg, #263238, #455a64)',
    accentColor: '#cfd8dc'
  },
  'note-number': {
    route: 'color-game', title: 'Note Number', subtitle: 'Currency Game • Match The Note',
    img: '/games/lottery.png', headerBg: 'linear-gradient(135deg, #b71c1c, #d32f2f)',
    accentColor: '#ffcdd2'
  },

  // === BACCARAT VARIANTS ===
  'baccarat2': {
    route: 'baccarat', title: 'Baccarat 2', subtitle: 'Premium Baccarat • Series 2',
    img: '/games/baccarat.png', headerBg: 'linear-gradient(135deg, #004d40, #00695c)',
    accentColor: '#b2dfdb'
  },
  'online-baccarat': {
    route: 'baccarat', title: 'Online Baccarat', subtitle: 'Live Online • Real Time Dealing',
    img: '/games/baccarat.png', headerBg: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    accentColor: '#90caf9'
  },
  '29card-baccarat': {
    route: 'baccarat', title: '29 Card Baccarat', subtitle: '29 Card Deck • Special Edition',
    img: '/games/baccarat.png', headerBg: 'linear-gradient(135deg, #e65100, #ff6d00)',
    accentColor: '#ffab40'
  },

  // === ANDAR BAHAR VARIANTS ===
  'andar-bahar-150': {
    route: 'andar-bahar', title: 'Andar Bahar 150 Cards', subtitle: '150 Card Deck • Extended Play',
    img: '/games/andar-bahar.png', headerBg: 'linear-gradient(135deg, #e65100, #f57c00)',
    accentColor: '#ffab40'
  },
  'andar-bahar2': {
    route: 'andar-bahar', title: 'Andar Bahar 2', subtitle: 'Enhanced Edition • Series 2',
    img: '/games/andar-bahar.png', headerBg: 'linear-gradient(135deg, #004d40, #00796b)',
    accentColor: '#b2dfdb'
  },
};
