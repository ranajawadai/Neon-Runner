// Utility Functions

/**
 * Fisher-Yates shuffle. Mutates the array in place and returns it.
 * Pass [...arr] if you need to preserve the original.
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTodayDate() {
  return new Date().toDateString();
}

export function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getCurrentTier(score, tiers) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].minScore) return tiers[i];
  }
  return tiers[0];
}

export function getRandomObstacleType(tier) {
  const types = tier.obstacleTypes;
  return types[Math.floor(Math.random() * types.length)];
}

export function getCharacterGeometry(shape, THREE) {
  switch (shape) {
    case 'octa': return new THREE.OctahedronGeometry(0.6, 3);
    case 'dodeca': return new THREE.DodecahedronGeometry(0.6, 2);
    case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 32, 64);
    default: return new THREE.IcosahedronGeometry(0.6, 3);
  }
}
