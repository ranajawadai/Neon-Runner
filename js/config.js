// Game Configuration Constants

export const LANES = [-2.2, 0, 2.2];

export const POWERUP_TYPES = [
  { type: 'magnet', color: 0xff00ff, label: 'M' },
  { type: 'shield', color: 0x00ff88, label: 'S' },
  { type: 'multi', color: 0xffdd00, label: 'x2' }
];

export const OBSTACLE_TYPES = {
  cube: { geo: 0, color: 0xff1463, behavior: 'static' },
  pyramid: { geo: 1, color: 0xff1463, behavior: 'static' },
  wall: { geo: 2, color: 0xff1463, behavior: 'static' },
  laser: { geo: 3, color: 0xff0044, behavior: 'pulsing', pulseSpeed: 2 },
  spinner: { geo: 4, color: 0xffaa00, behavior: 'spinning', spinSpeed: 5 },
  slider: { geo: 5, color: 0xff6600, behavior: 'sliding', slideSpeed: 3 }
};

export const THEMES = {
  neon: { 
    name: 'Neon', unlock: 0, 
    bg: 0x0a0a1a, gridA: 0x00ffff, gridB: 0xff00d6, 
    ground: 0x06061a, fog: 0x0a0a1a, 
    obstacle: 0xff1463, coin: 0xffe14d, player: 0x00ffff,
    building: 0x1a0033, star: 0x88aaff
  },
  retro: { 
    name: 'Retro', unlock: 2000, 
    bg: 0x001a00, gridA: 0x00ff00, gridB: 0x88ff00, 
    ground: 0x001200, fog: 0x001a00, 
    obstacle: 0xff3300, coin: 0xffff00, player: 0x00ff00,
    building: 0x002200, star: 0x00ff00
  },
  space: { 
    name: 'Space', unlock: 5000, 
    bg: 0x000022, gridA: 0x4444ff, gridB: 0x8800ff, 
    ground: 0x000033, fog: 0x000022, 
    obstacle: 0xff0066, coin: 0xffffff, player: 0x6666ff,
    building: 0x000044, star: 0xffffff
  },
  underwater: { 
    name: 'Aqua', unlock: 10000, 
    bg: 0x001122, gridA: 0x00cccc, gridB: 0x0066ff, 
    ground: 0x001a33, fog: 0x001122, 
    obstacle: 0xff6600, coin: 0x00ffcc, player: 0x00ddff,
    building: 0x002244, star: 0x00cccc
  },
  cyber: { 
    name: 'Cyber', unlock: 15000, 
    bg: 0x0a001a, gridA: 0xff00ff, gridB: 0x00ffff, 
    ground: 0x06001a, fog: 0x0a001a, 
    obstacle: 0x00ffff, coin: 0xff00ff, player: 0xff00ff,
    building: 0x1a0033, star: 0xff00ff
  },
  fire: { 
    name: 'Inferno', unlock: 25000, 
    bg: 0x1a0500, gridA: 0xff4400, gridB: 0xffaa00, 
    ground: 0x1a0800, fog: 0x1a0500, 
    obstacle: 0xff0000, coin: 0xffdd00, player: 0xff4400,
    building: 0x220800, star: 0xff6600
  }
};

export const CHARACTERS = [
  { name: 'Runner', shape: 'icosa', color: 0x00ffff, unlock: 0 },
  { name: 'Ghost', shape: 'octa', color: 0xcc66ff, unlock: 1000 },
  { name: 'Star', shape: 'dodeca', color: 0xffdd00, unlock: 3000 },
  { name: 'Blaze', shape: 'torus', color: 0xff4400, unlock: 7000 },
  { name: 'Neon', shape: 'icosa', color: 0xff00ff, unlock: 12000 },
  { name: 'Frost', shape: 'dodeca', color: 0x00ffff, unlock: 20000 }
];

export const ACHIEVEMENTS = [
  { id: 'score1k', name: 'Getting Started', desc: 'Score 1,000', icon: '⭐', check: s => s.best >= 1000 },
  { id: 'score5k', name: 'Speed Demon', desc: 'Score 5,000', icon: '🔥', check: s => s.best >= 5000 },
  { id: 'score10k', name: 'Neon Legend', desc: 'Score 10,000', icon: '💎', check: s => s.best >= 10000 },
  { id: 'score25k', name: 'Cyber God', desc: 'Score 25,000', icon: '👑', check: s => s.best >= 25000 },
  { id: 'coins100', name: 'Coin Collector', desc: 'Collect 100 coins in one run', icon: '💰', check: s => s.coins >= 100 },
  { id: 'combo10', name: 'Combo Master', desc: 'Reach 10x combo', icon: '⚡', check: s => s.combo >= 10 },
  { id: 'speed3x', name: 'Need for Speed', desc: 'Reach 3x speed', icon: '🚀', check: s => (s.speed / s.baseSpeed) >= 3 },
  { id: 'games10', name: 'Dedicated', desc: 'Play 10 games', icon: '🎮', check: s => s.gamesPlayed >= 10 }
];

export const DAILY_CHALLENGES = [
  { id: 'daily_score5k', name: 'Score 5,000', desc: 'Score 5,000 points in one run', reward: 50, check: s => s.score >= 5000 },
  { id: 'daily_score10k', name: 'Score 10,000', desc: 'Score 10,000 points in one run', reward: 100, check: s => s.score >= 10000 },
  { id: 'daily_coins50', name: 'Collect 50 Coins', desc: 'Collect 50 coins in one run', reward: 75, check: s => s.coins >= 50 },
  { id: 'daily_coins100', name: 'Collect 100 Coins', desc: 'Collect 100 coins in one run', reward: 150, check: s => s.coins >= 100 },
  { id: 'daily_combo5', name: '5x Combo', desc: 'Reach 5x combo', reward: 40, check: s => s.combo >= 5 },
  { id: 'daily_combo10', name: '10x Combo', desc: 'Reach 10x combo', reward: 100, check: s => s.combo >= 10 },
  { id: 'daily_nododge', name: 'Perfect Run', desc: 'Survive 500m without hitting obstacles', reward: 200, check: s => Math.floor(s.score / 10) >= 500 },
  { id: 'daily_games3', name: 'Play 3 Games', desc: 'Play 3 games today', reward: 30, check: s => s.gamesPlayedToday >= 3 }
];

export const DIFFICULTY_TIERS = [
  { minScore: 0, maxScore: 1000, speed: 20, obstacleTypes: ['cube', 'pyramid', 'wall'], spawnRate: 1.0 },
  { minScore: 1000, maxScore: 3000, speed: 25, obstacleTypes: ['cube', 'pyramid', 'wall', 'slider'], spawnRate: 0.9 },
  { minScore: 3000, maxScore: 6000, speed: 30, obstacleTypes: ['cube', 'pyramid', 'wall', 'spinner', 'slider'], spawnRate: 0.8 },
  { minScore: 6000, maxScore: 10000, speed: 35, obstacleTypes: ['cube', 'pyramid', 'wall', 'laser', 'spinner', 'slider'], spawnRate: 0.7 },
  { minScore: 10000, maxScore: Infinity, speed: 42, obstacleTypes: ['cube', 'pyramid', 'wall', 'laser', 'spinner', 'slider'], spawnRate: 0.6 }
];

export const GRAVITY = -38;
export const JUMP_FORCE = 13;
export const GROUND_Y = 0.6;
export const DESPAWN_Z = 8;
export const MAX_PARTICLES = 80;
export const TRAIL_LENGTH = 8;
export const OBSTACLE_POOL_SIZE = 30;
export const COIN_POOL_SIZE = 40;
export const POWERUP_POOL_SIZE = 10;
