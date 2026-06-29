// ═══════════════════════════════════════════════════════════
//  Utility Functions
// ═══════════════════════════════════════════════════════════

/**
 * Fisher-Yates shuffle — O(n) time, O(1) space.
 *
 * ⚠️ MUTATES the input array in place and returns it.
 * Pass `[...arr]` if you need to preserve the original.
 *
 * @param {Array} arr - The array to shuffle (will be mutated)
 * @returns {Array} The same array, now shuffled
 *
 * @example
 * shuffle([1, 2, 3]);        // mutates and returns
 * shuffle([...myArr]);        // safe copy + shuffle
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get today's date as a locale string for streak tracking.
 * @returns {string} e.g. "Sun Jun 29 2026"
 */
export function getTodayDate() {
  return new Date().toDateString();
}

/**
 * Generate a deterministic daily seed from today's date.
 * Used for seeded random to ensure same challenges per day.
 * @returns {number} e.g. 20260629
 */
export function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * Create a seeded PRNG (Park-Miller LCG).
 * @param {number} seed - Integer seed value
 * @returns {() => number} Function returning values in [0, 1)
 */
export function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Find the highest difficulty tier the player has reached.
 * @param {number} score - Current game score
 * @param {Array} tiers - Sorted difficulty tier definitions
 * @returns {Object} The active tier object
 */
export function getCurrentTier(score, tiers) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].minScore) return tiers[i];
  }
  return tiers[0];
}

/**
 * Pick a random obstacle type from the current tier's allowed list.
 * @param {Object} tier - Current difficulty tier
 * @returns {string} Obstacle type key
 */
export function getRandomObstacleType(tier) {
  const types = tier.obstacleTypes;
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Build a THREE.js geometry for a character shape.
 * @param {string} shape - Shape key: 'icosa' | 'octa' | 'dodeca' | 'torus'
 * @param {Object} THREE - THREE.js namespace (passed to avoid global dependency)
 * @returns {THREE.BufferGeometry}
 */
export function getCharacterGeometry(shape, THREE) {
  switch (shape) {
    case 'octa': return new THREE.OctahedronGeometry(0.6, 3);
    case 'dodeca': return new THREE.DodecahedronGeometry(0.6, 2);
    case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 32, 64);
    default: return new THREE.IcosahedronGeometry(0.6, 3);
  }
}
