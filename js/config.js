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
    icon: '◆',
    color: '#00ffcc',
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
    icon: '◈',
    color: '#ffcc00',
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
    icon: '◇',
    color: '#88ffdd',
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
    icon: '⬥',
    color: '#ff0044',
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
    bg: 0x0a1e2e, fog: 0x1a3a4a,
    gridA: 0x44ddcc, gridB: 0x2a8a7a,
    ground: 0x0e2a38, groundAccent: 0x123444,
    obstacle: 0xff3355, obstacleEmissive: 0xdd2244,
    coin: 0x44ddcc, coinEmissive: 0x33bbaa,
    player: 0x33ddcc,
    ambient: 0x2a4a5a, ambientIntensity: 0.7,
    lightA: 0x44ddcc, lightB: 0xffaa44,
    fogDensity: 0.007,
    star: 0x88ccdd,
  },
  kelp: {
    name: 'Kelp Forest', unlock: 2000,
    bg: 0x0b2a18, fog: 0x1a4a2e,
    gridA: 0x6abb5e, gridB: 0xaacc44,
    ground: 0x081a0c, groundAccent: 0x0c2814,
    obstacle: 0xddaa33, obstacleEmissive: 0xcc9922,
    coin: 0x88cc55, coinEmissive: 0x77bb44,
    player: 0x99cc66,
    ambient: 0x2a4a30, ambientIntensity: 0.6,
    lightA: 0x6abb5e, lightB: 0xddaa33,
    fogDensity: 0.009,
    star: 0x99cc88,
  },
  twilight: {
    name: 'Twilight Reef', unlock: 5000,
    bg: 0x141830, fog: 0x2a2850,
    gridA: 0x7777cc, gridB: 0xaa77cc,
    ground: 0x0c0e22, groundAccent: 0x10143a,
    obstacle: 0xcc77bb, obstacleEmissive: 0xbb66aa,
    coin: 0x8899cc, coinEmissive: 0x7788bb,
    player: 0x8888cc,
    ambient: 0x2a2850, ambientIntensity: 0.5,
    lightA: 0x7777cc, lightB: 0xaa77cc,
    fogDensity: 0.008,
    star: 0xaaaaee,
  },
  abyss: {
    name: 'Abyssal Trench', unlock: 10000,
    bg: 0x040e14, fog: 0x0a2030,
    gridA: 0x33bbaa, gridB: 0xcc4488,
    ground: 0x040c10, groundAccent: 0x081820,
    obstacle: 0xee5533, obstacleEmissive: 0xdd4422,
    coin: 0x44ccaa, coinEmissive: 0x33bb99,
    player: 0x33bbaa,
    ambient: 0x0a2030, ambientIntensity: 0.4,
    lightA: 0x33bbaa, lightB: 0xcc4488,
    fogDensity: 0.010,
    star: 0x44aacc,
  },
  vent: {
    name: 'Hydrothermal Vent', unlock: 15000,
    bg: 0x1a0808, fog: 0x2a1410,
    gridA: 0xcc6633, gridB: 0xccaa33,
    ground: 0x100402, groundAccent: 0x1a0a05,
    obstacle: 0xccaa33, obstacleEmissive: 0xbb9922,
    coin: 0xcc8833, coinEmissive: 0xbb7722,
    player: 0xcc6633,
    ambient: 0x2a1a10, ambientIntensity: 0.5,
    lightA: 0xcc6633, lightB: 0xccaa33,
    fogDensity: 0.012,
    star: 0xccaa66,
  },
  biolum: {
    name: 'Bioluminescent Abyss', unlock: 25000,
    bg: 0x080418, fog: 0x140a28,
    gridA: 0xcc44aa, gridB: 0x44ccaa,
    ground: 0x040210, groundAccent: 0x080418,
    obstacle: 0x44ccaa, obstacleEmissive: 0x33bb99,
    coin: 0xcc44aa, coinEmissive: 0xbb3399,
    player: 0xcc44aa,
    ambient: 0x140a28, ambientIntensity: 0.35,
    lightA: 0xcc44aa, lightB: 0x44ccaa,
    fogDensity: 0.013,
    star: 0xcc66bb,
  },
};

// ── Characters ──────────────────────────────────────────────
export const CHARACTERS = [
  { name: 'Phantom',  shape: 'icosa',  color: 0x33ddcc, unlock: 0 },
  { name: 'Specter',  shape: 'octa',   color: 0x8844cc, unlock: 1000 },
  { name: 'Nova',     shape: 'dodeca', color: 0xddaa22, unlock: 3000 },
  { name: 'Ember',    shape: 'torus',  color: 0xcc3344, unlock: 7000 },
  { name: 'Glitch',   shape: 'icosa',  color: 0xcc33aa, unlock: 12000 },
  { name: 'Zero',     shape: 'dodeca', color: 0x3388cc, unlock: 20000 },
];

// ── Achievements ────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'score1k',  name: 'First Dive',     desc: 'Score 1,000',               icon: '◆',  check: s => s.best >= 1000 },
  { id: 'score5k',  name: 'Deep Current',    desc: 'Score 5,000',               icon: '◈',  check: s => s.best >= 5000 },
  { id: 'score10k', name: 'Pressure Zone',   desc: 'Score 10,000',              icon: '◇',  check: s => s.best >= 10000 },
  { id: 'score25k', name: 'Abyss Walker',    desc: 'Score 25,000',              icon: '⬥',  check: s => s.best >= 25000 },
  { id: 'coins100', name: 'Coin Hoarder',    desc: 'Collect 100 coins in one run', icon: '⬡', check: s => s.coins >= 100 },
  { id: 'combo10',  name: 'Chain Master',    desc: 'Reach 10x combo',           icon: '◆',  check: s => s.combo >= 10 },
  { id: 'speed3x',  name: 'Velocity',        desc: 'Reach 3x speed',            icon: '◈',  check: s => (s.speed / s.baseSpeed) >= 3 },
  { id: 'games10',  name: 'Dedicated',        desc: 'Play 10 games',             icon: '◇',  check: s => s.gamesPlayed >= 10 },
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
