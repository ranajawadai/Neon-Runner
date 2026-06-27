// ═══════════════════════════════════════════════════════════
//  NEON RUNNER — Game Configuration
// ═══════════════════════════════════════════════════════════

export const LANES = [-2.4, 0, 2.4];

// ── Game Modes ──────────────────────────────────────────────
export const GAME_MODES = {
  classic: {
    id: 'classic',
    name: 'CLASSIC',
    desc: 'The original experience. Dodge, collect, survive.',
    icon: '🎮',
    color: '#2dd4bf',
    unlock: 0,
    baseSpeed: 20,
    maxSpeed: 42,
    spawnRateMul: 1.0,
    scoreMultiplier: 1.0,
    lives: 1,
    powerups: true,
    obstacles: true,
  },
  speed: {
    id: 'speed',
    name: 'SPEED RUN',
    desc: 'Starts fast. Gets faster. How long can you last?',
    icon: '⚡',
    color: '#f5a623',
    unlock: 3000,
    baseSpeed: 32,
    maxSpeed: 58,
    spawnRateMul: 1.3,
    scoreMultiplier: 1.5,
    lives: 1,
    powerups: true,
    obstacles: true,
  },
  zen: {
    id: 'zen',
    name: 'ZEN',
    desc: 'No obstacles. Just vibes. Collect coins and relax.',
    icon: '🌊',
    color: '#4eeee0',
    unlock: 0,
    baseSpeed: 16,
    maxSpeed: 28,
    spawnRateMul: 0,
    scoreMultiplier: 0.5,
    lives: Infinity,
    powerups: true,
    obstacles: false,
  },
  hardcore: {
    id: 'hardcore',
    name: 'HARDCORE',
    desc: 'One hit. No power-ups. Pure skill.',
    icon: '💀',
    color: '#ff3355',
    unlock: 8000,
    baseSpeed: 26,
    maxSpeed: 50,
    spawnRateMul: 1.6,
    scoreMultiplier: 2.0,
    lives: 1,
    powerups: false,
    obstacles: true,
  },
};

// ── Power-ups ───────────────────────────────────────────────
export const POWERUP_TYPES = [
  { type: 'magnet', color: 0xff00ff, label: 'M', duration: 8 },
  { type: 'shield', color: 0x00ff88, label: 'S', duration: 10 },
  { type: 'multi', color: 0xffdd00, label: 'x3', duration: 0 },
];

// ── Obstacle Definitions ────────────────────────────────────
export const OBSTACLE_TYPES = {
  cube:    { geo: 0, behavior: 'static',   hitbox: { x: 0.65, y: 0.65, z: 0.65 } },
  pyramid: { geo: 1, behavior: 'static',   hitbox: { x: 0.5,  y: 0.7,  z: 0.5  } },
  wall:    { geo: 2, behavior: 'static',   hitbox: { x: 1.0,  y: 0.45, z: 0.45 } },
  laser:   { geo: 3, behavior: 'pulsing',  hitbox: { x: 1.5,  y: 0.2,  z: 0.2  } },
  spinner: { geo: 4, behavior: 'spinning', hitbox: { x: 0.6,  y: 0.6,  z: 0.6  } },
  slider:  { geo: 5, behavior: 'sliding',  hitbox: { x: 0.9,  y: 0.9,  z: 0.25 } },
};

// ── Depth Zone Themes ───────────────────────────────────────
export const THEMES = {
  neon: {
    name: 'Sunlit Shallows', unlock: 0,
    bg: 0x0e5a6b, fog: 0x1a8a9a,
    gridA: 0x5ee8d6, gridB: 0x3bbca8,
    ground: 0x0a3e48, groundAccent: 0x0d4f5c,
    obstacle: 0xff4466, obstacleEmissive: 0xff2244,
    coin: 0x5ee8d6, coinEmissive: 0x3bd4c0,
    player: 0x2dd4bf,
    ambient: 0x4a9aaa, ambientIntensity: 0.8,
    lightA: 0x7fe8da, lightB: 0xffb74d,
    fogDensity: 0.008,
    star: 0xaae8f0,
  },
  kelp: {
    name: 'Kelp Forest', unlock: 2000,
    bg: 0x0b3318, fog: 0x1a5a2e,
    gridA: 0x7ad45e, gridB: 0xc8e44a,
    ground: 0x061a0c, groundAccent: 0x0a2814,
    obstacle: 0xe8c34a, obstacleEmissive: 0xd4a830,
    coin: 0xa8d957, coinEmissive: 0x8ec440,
    player: 0xb4e878,
    ambient: 0x2a5a30, ambientIntensity: 0.6,
    lightA: 0x7ad45e, lightB: 0xe8c34a,
    fogDensity: 0.010,
    star: 0xb8e89a,
  },
  twilight: {
    name: 'Twilight Reef', unlock: 5000,
    bg: 0x141840, fog: 0x2a3070,
    gridA: 0x8888e8, gridB: 0xcc88ee,
    ground: 0x0a0c22, groundAccent: 0x10143a,
    obstacle: 0xee88dd, obstacleEmissive: 0xdd66cc,
    coin: 0xaabbff, coinEmissive: 0x8899ee,
    player: 0x9fa3f0,
    ambient: 0x383880, ambientIntensity: 0.5,
    lightA: 0x8888e8, lightB: 0xcc88ee,
    fogDensity: 0.009,
    star: 0xccccff,
  },
  abyss: {
    name: 'Abyssal Trench', unlock: 10000,
    bg: 0x040e14, fog: 0x0a2030,
    gridA: 0x2dd4bf, gridB: 0xd946a8,
    ground: 0x020608, groundAccent: 0x040c10,
    obstacle: 0xff6644, obstacleEmissive: 0xee5533,
    coin: 0x4ee8d4, coinEmissive: 0x3bd4c0,
    player: 0x2dd4bf,
    ambient: 0x0a2030, ambientIntensity: 0.35,
    lightA: 0x2dd4bf, lightB: 0xd946a8,
    fogDensity: 0.012,
    star: 0x44ccbb,
  },
  vent: {
    name: 'Hydrothermal Vent', unlock: 15000,
    bg: 0x1a0808, fog: 0x3a1410,
    gridA: 0xff7744, gridB: 0xffcc44,
    ground: 0x0d0402, groundAccent: 0x1a0a05,
    obstacle: 0xffcc44, obstacleEmissive: 0xeebb33,
    coin: 0xffaa44, coinEmissive: 0xee9933,
    player: 0xff7742,
    ambient: 0x3a1a10, ambientIntensity: 0.45,
    lightA: 0xff7744, lightB: 0xffcc44,
    fogDensity: 0.014,
    star: 0xffbb88,
  },
  biolum: {
    name: 'Bioluminescent Abyss', unlock: 25000,
    bg: 0x050210, fog: 0x100828,
    gridA: 0xee44cc, gridB: 0x44eedd,
    ground: 0x020008, groundAccent: 0x060012,
    obstacle: 0x44eedd, obstacleEmissive: 0x33ddcc,
    coin: 0xee44cc, coinEmissive: 0xdd33bb,
    player: 0xee44cc,
    ambient: 0x180830, ambientIntensity: 0.3,
    lightA: 0xee44cc, lightB: 0x44eedd,
    fogDensity: 0.016,
    star: 0xee66dd,
  },
};

// ── Characters ──────────────────────────────────────────────
export const CHARACTERS = [
  { name: 'Phantom',  shape: 'icosa',  color: 0x2dd4bf, unlock: 0 },
  { name: 'Specter',  shape: 'octa',   color: 0xbb66ff, unlock: 1000 },
  { name: 'Nova',     shape: 'dodeca', color: 0xffcc00, unlock: 3000 },
  { name: 'Ember',    shape: 'torus',  color: 0xff4400, unlock: 7000 },
  { name: 'Glitch',   shape: 'icosa',  color: 0xff00ff, unlock: 12000 },
  { name: 'Zero',     shape: 'dodeca', color: 0x00eeff, unlock: 20000 },
];

// ── Achievements ────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'score1k',  name: 'First Dive',     desc: 'Score 1,000',               icon: '⭐',  check: s => s.best >= 1000 },
  { id: 'score5k',  name: 'Deep Current',    desc: 'Score 5,000',               icon: '🌊',  check: s => s.best >= 5000 },
  { id: 'score10k', name: 'Pressure Zone',   desc: 'Score 10,000',              icon: '💎',  check: s => s.best >= 10000 },
  { id: 'score25k', name: 'Abyss Walker',    desc: 'Score 25,000',              icon: '👑',  check: s => s.best >= 25000 },
  { id: 'coins100', name: 'Coin Hoarder',    desc: 'Collect 100 coins in one run', icon: '💰', check: s => s.coins >= 100 },
  { id: 'combo10',  name: 'Chain Master',    desc: 'Reach 10x combo',           icon: '⚡',  check: s => s.combo >= 10 },
  { id: 'speed3x',  name: 'Velocity',        desc: 'Reach 3x speed',            icon: '🚀',  check: s => (s.speed / s.baseSpeed) >= 3 },
  { id: 'games10',  name: 'Dedicated',        desc: 'Play 10 games',             icon: '🎮',  check: s => s.gamesPlayed >= 10 },
];

// ── Daily Challenges ────────────────────────────────────────
export const DAILY_CHALLENGES = [
  { id: 'daily_score5k',  name: 'Score 5,000',       desc: 'Score 5,000 points in one run',    reward: 50,  check: s => s.score >= 5000 },
  { id: 'daily_score10k', name: 'Score 10,000',      desc: 'Score 10,000 points in one run',   reward: 100, check: s => s.score >= 10000 },
  { id: 'daily_coins50',  name: 'Collect 50 Coins',  desc: 'Collect 50 coins in one run',       reward: 75,  check: s => s.coins >= 50 },
  { id: 'daily_coins100', name: 'Collect 100 Coins', desc: 'Collect 100 coins in one run',      reward: 150, check: s => s.coins >= 100 },
  { id: 'daily_combo5',   name: '5x Combo',          desc: 'Reach 5x combo',                    reward: 40,  check: s => s.combo >= 5 },
  { id: 'daily_combo10',  name: '10x Combo',         desc: 'Reach 10x combo',                   reward: 100, check: s => s.combo >= 10 },
  { id: 'daily_nododge',  name: 'Perfect Run',       desc: 'Survive 500m without hitting',      reward: 200, check: s => Math.floor(s.score / 10) >= 500 },
  { id: 'daily_games3',   name: 'Play 3 Games',      desc: 'Play 3 games today',                reward: 30,  check: s => s.gamesPlayedToday >= 3 },
];

// ── Difficulty Tiers ────────────────────────────────────────
export const DIFFICULTY_TIERS = [
  { minScore: 0,     maxScore: 1000,  speed: 20, obstacleTypes: ['cube', 'pyramid', 'wall'],                         spawnRate: 1.0 },
  { minScore: 1000,  maxScore: 3000,  speed: 25, obstacleTypes: ['cube', 'pyramid', 'wall', 'slider'],                spawnRate: 0.9 },
  { minScore: 3000,  maxScore: 6000,  speed: 30, obstacleTypes: ['cube', 'pyramid', 'wall', 'spinner', 'slider'],     spawnRate: 0.8 },
  { minScore: 6000,  maxScore: 10000, speed: 35, obstacleTypes: ['cube', 'pyramid', 'wall', 'laser', 'spinner', 'slider'], spawnRate: 0.7 },
  { minScore: 10000, maxScore: Infinity, speed: 42, obstacleTypes: ['cube', 'pyramid', 'wall', 'laser', 'spinner', 'slider'], spawnRate: 0.6 },
];

// ── Physics Constants ───────────────────────────────────────
export const GRAVITY = -40;
export const JUMP_FORCE = 14;
export const GROUND_Y = 0.6;
export const DESPAWN_Z = 10;

// ── Pool Sizes ──────────────────────────────────────────────
export const MAX_PARTICLES = 100;
export const TRAIL_LENGTH = 12;
export const OBSTACLE_POOL_SIZE = 30;
export const COIN_POOL_SIZE = 50;
export const POWERUP_POOL_SIZE = 10;
