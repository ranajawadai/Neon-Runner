// Game State Management

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // localStorage unavailable (e.g. private browsing) - state will not persist this session
  }
}

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
  coins: Number(safeGet('neonRunnerCoins', '0')),
  runCoins: 0,
  best: Number(safeGet('neonRunnerBest', 0)),
  combo: 0,
  multiplier: 1,
  shield: false,
  magnet: false,
  magnetTimer: 0,
  shieldTimer: 0,
  theme: safeGet('neonRunnerTheme', 'neon'),
  character: Number(safeGet('neonRunnerChar', '0')),
  gamesPlayed: Number(safeGet('neonRunnerGames', '0')),
  gamesPlayedToday: Number(safeGet('neonRunnerGames_' + getTodayDate(), '0')),
  unlockedAchievements: JSON.parse(safeGet('neonRunnerAchievements', '[]')),
  dailyBest: Number(safeGet('neonRunnerDaily_' + getTodayDate(), '0')),
  streak: Number(safeGet('neonRunnerStreak', '0')),
  lastPlayDate: safeGet('neonRunnerLastPlay', '')
};

export function saveState() {
  const todayDate = getTodayDate();
  safeSet('neonRunnerCoins', state.coins);
  safeSet('neonRunnerBest', state.best);
  safeSet('neonRunnerGames', state.gamesPlayed);
  safeSet('neonRunnerGames_' + todayDate, state.gamesPlayedToday);
  safeSet('neonRunnerTheme', state.theme);
  safeSet('neonRunnerChar', state.character);
  safeSet('neonRunnerAchievements', JSON.stringify(state.unlockedAchievements));
  safeSet('neonRunnerDaily_' + todayDate, state.dailyBest);
  safeSet('neonRunnerStreak', state.streak);
  safeSet('neonRunnerLastPlay', state.lastPlayDate);
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
