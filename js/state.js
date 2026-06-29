// Game State Management

import { getTodayDate } from './utils.js';

/**
 * Safely get a value from localStorage with fallback.
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if key missing or error
 * @returns {*}
 */
function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return (v === null || v === undefined) ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

/**
 * Safely set a value in localStorage.
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // localStorage unavailable (e.g. private browsing)
  }
}

/**
 * Safely parse JSON with schema validation.
 * @param {string} key - Storage key
 * @param {*} fallback - Default value
 * @param {Function} validate - Validation function
 * @returns {*}
 */
function safeGetJSON(key, fallback, validate) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const parsed = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

// Validation functions for localStorage data
const isValidNumber = (v) => typeof v === 'number' && !isNaN(v) && isFinite(v);
const isValidString = (v) => typeof v === 'string';
const isValidArray = (v) => Array.isArray(v);
const isValidMode = (v) => ['classic', 'speed', 'zen', 'hardcore'].includes(v);
const isValidTheme = (v) => ['neon', 'synthwave', 'cyberpunk', 'aurora', 'inferno', 'void'].includes(v);

export const state = {
  running: false,
  gameOver: false,
  isPaused: false,
  speed: 20,
  baseSpeed: 20,
  maxSpeed: 42,
  score: 0,
  coins: isValidNumber(Number(safeGet('neonRunnerCoins', '0'))) ? Number(safeGet('neonRunnerCoins', '0')) : 0,
  runCoins: 0,
  best: isValidNumber(Number(safeGet('neonRunnerBest', 0))) ? Number(safeGet('neonRunnerBest', 0)) : 0,
  combo: 0,
  multiplier: 1,
  shield: false,
  magnet: false,
  magnetTimer: 0,
  shieldTimer: 0,
  gameMode: isValidMode(safeGet('neonRunnerMode', 'classic')) ? safeGet('neonRunnerMode', 'classic') : 'classic',
  theme: isValidTheme(safeGet('neonRunnerTheme', 'neon')) ? safeGet('neonRunnerTheme', 'neon') : 'neon',
  character: isValidNumber(Number(safeGet('neonRunnerChar', '0'))) ? Math.min(5, Math.max(0, Number(safeGet('neonRunnerChar', '0')))) : 0,
  gamesPlayed: isValidNumber(Number(safeGet('neonRunnerGames', '0'))) ? Number(safeGet('neonRunnerGames', '0')) : 0,
  gamesPlayedToday: isValidNumber(Number(safeGet('neonRunnerGames_' + getTodayDate(), '0'))) ? Number(safeGet('neonRunnerGames_' + getTodayDate(), '0')) : 0,
  unlockedAchievements: safeGetJSON('neonRunnerAchievements', [], isValidArray),
  dailyBest: isValidNumber(Number(safeGet('neonRunnerDaily_' + getTodayDate(), '0'))) ? Number(safeGet('neonRunnerDaily_' + getTodayDate(), '0')) : 0,
  streak: isValidNumber(Number(safeGet('neonRunnerStreak', '0'))) ? Number(safeGet('neonRunnerStreak', '0')) : 0,
  lastPlayDate: isValidString(safeGet('neonRunnerLastPlay', '')) ? safeGet('neonRunnerLastPlay', '') : ''
};

export function saveState() {
  const todayDate = getTodayDate();
  safeSet('neonRunnerCoins', state.coins);
  safeSet('neonRunnerBest', state.best);
  safeSet('neonRunnerGames', state.gamesPlayed);
  safeSet('neonRunnerGames_' + todayDate, state.gamesPlayedToday);
  safeSet('neonRunnerMode', state.gameMode);
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
}

export function incrementGamesPlayed() {
  state.gamesPlayed++;
  state.gamesPlayedToday++;
  saveState();
}
