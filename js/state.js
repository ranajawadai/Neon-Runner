// Game State Management

function getTodayDate() {
  return new Date().toDateString();
}

export const state = {
  running: false,
  gameOver: false,
  isPaused: false,
  speed: 20,
  baseSpeed: 20,
  maxSpeed: 42,
  score: 0,
  coins: Number(localStorage.getItem('neonRunnerCoins') || '0'),
  runCoins: 0,
  best: Number(localStorage.getItem('neonRunnerBest') || 0),
  combo: 0,
  multiplier: 1,
  shield: false,
  magnet: false,
  magnetTimer: 0,
  shieldTimer: 0,
  theme: localStorage.getItem('neonRunnerTheme') || 'neon',
  character: Number(localStorage.getItem('neonRunnerChar') || '0'),
  gamesPlayed: Number(localStorage.getItem('neonRunnerGames') || '0'),
  gamesPlayedToday: Number(localStorage.getItem('neonRunnerGames_' + getTodayDate()) || '0'),
  unlockedAchievements: JSON.parse(localStorage.getItem('neonRunnerAchievements') || '[]'),
  dailyBest: Number(localStorage.getItem('neonRunnerDaily_' + getTodayDate()) || '0'),
  streak: Number(localStorage.getItem('neonRunnerStreak') || '0'),
  lastPlayDate: localStorage.getItem('neonRunnerLastPlay') || ''
};

export function saveState() {
  const todayDate = getTodayDate();
  localStorage.setItem('neonRunnerCoins', state.coins);
  localStorage.setItem('neonRunnerBest', state.best);
  localStorage.setItem('neonRunnerGames', state.gamesPlayed);
  localStorage.setItem('neonRunnerGames_' + todayDate, state.gamesPlayedToday);
  localStorage.setItem('neonRunnerTheme', state.theme);
  localStorage.setItem('neonRunnerChar', state.character);
  localStorage.setItem('neonRunnerAchievements', JSON.stringify(state.unlockedAchievements));
  localStorage.setItem('neonRunnerDaily_' + todayDate, state.dailyBest);
  localStorage.setItem('neonRunnerStreak', state.streak);
  localStorage.setItem('neonRunnerLastPlay', state.lastPlayDate);
}

export function resetGameState() {
  state.running = false;
  state.gameOver = false;
  state.isPaused = false;
  state.speed = state.baseSpeed;
  state.score = 0;
  state.runCoins = 0;
  state.combo = 0;
  state.multiplier = 1;
  state.shield = false;
  state.magnet = false;
  state.magnetTimer = 0;
  state.shieldTimer = 0;
}

export function updateStreak() {
  const todayDate = getTodayDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (state.lastPlayDate === todayDate) {
    // Already played today
  } else if (state.lastPlayDate === yesterdayStr) {
    state.streak++;
  } else if (state.lastPlayDate !== todayDate) {
    state.streak = 1;
  }
  state.lastPlayDate = todayDate;
  saveState();
}

export function updateScore(newScore) {
  state.score = newScore;
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
  }
  if (state.score > state.dailyBest) {
    state.dailyBest = Math.floor(state.score);
  }
}

export function addCoins(amount) {
  state.coins += amount;
  state.runCoins += amount;
  saveState();
}

export function incrementGamesPlayed() {
  state.gamesPlayed++;
  state.gamesPlayedToday++;
  saveState();
}
