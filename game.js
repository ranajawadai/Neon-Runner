// Three.js loaded via CDN script tag (global THREE)

// ---------- Globals ----------
let scene, camera, renderer, clock;
let player, grid, starField, trailLine;
let composer, bloomPass;
let obstacles = [];
let coins = [];
let speedLines = [];
let powerups = [];

const LANES = [-2.2, 0, 2.2];
let currentLane = 1;
let targetX = 0;

const POWERUP_TYPES = [
  { type: 'magnet', color: 0xff00ff, label: 'M' },
  { type: 'shield', color: 0x00ff88, label: 'S' },
  { type: 'multi', color: 0xffdd00, label: 'x2' }
];

const THEMES = {
  neon: { name: 'Neon', unlock: 0, bg: 0x0a0a1a, gridA: 0x00ffff, gridB: 0xff00d6, ground: 0x06061a, fog: 0x0a0a1a, obstacle: 0xff1463, coin: 0xffe14d, player: 0x00ffff },
  retro: { name: 'Retro', unlock: 2000, bg: 0x001a00, gridA: 0x00ff00, gridB: 0x88ff00, ground: 0x001200, fog: 0x001a00, obstacle: 0xff3300, coin: 0xffff00, player: 0x00ff00 },
  space: { name: 'Space', unlock: 5000, bg: 0x000022, gridA: 0x4444ff, gridB: 0x8800ff, ground: 0x000033, fog: 0x000022, obstacle: 0xff0066, coin: 0xffffff, player: 0x6666ff },
  underwater: { name: 'Aqua', unlock: 10000, bg: 0x001122, gridA: 0x00cccc, gridB: 0x0066ff, ground: 0x001a33, fog: 0x001122, obstacle: 0xff6600, coin: 0x00ffcc, player: 0x00ddff }
};

const CHARACTERS = [
  { name: 'Runner', shape: 'icosa', color: 0x00ffff, unlock: 0 },
  { name: 'Ghost', shape: 'octa', color: 0xcc66ff, unlock: 1000 },
  { name: 'Star', shape: 'dodeca', color: 0xffdd00, unlock: 3000 },
  { name: 'Blaze', shape: 'torus', color: 0xff4400, unlock: 7000 }
];

const ACHIEVEMENTS = [
  { id: 'score1k', name: 'Getting Started', desc: 'Score 1,000', icon: '⭐', check: s => s.best >= 1000 },
  { id: 'score5k', name: 'Speed Demon', desc: 'Score 5,000', icon: '🔥', check: s => s.best >= 5000 },
  { id: 'score10k', name: 'Neon Legend', desc: 'Score 10,000', icon: '💎', check: s => s.best >= 10000 },
  { id: 'score25k', name: 'Cyber God', desc: 'Score 25,000', icon: '👑', check: s => s.best >= 25000 },
  { id: 'coins100', name: 'Coin Collector', desc: 'Collect 100 coins in one run', icon: '💰', check: s => s.coins >= 100 },
  { id: 'combo10', name: 'Combo Master', desc: 'Reach 10x combo', icon: '⚡', check: s => s.combo >= 10 },
  { id: 'speed3x', name: 'Need for Speed', desc: 'Reach 3x speed', icon: '🚀', check: s => (s.speed / s.baseSpeed) >= 3 },
  { id: 'games10', name: 'Dedicated', desc: 'Play 10 games', icon: '🎮', check: s => s.gamesPlayed >= 10 }
];

const state = {
  running: false,
  gameOver: false,
  isPaused: false,
  speed: 20,
  baseSpeed: 20,
  maxSpeed: 42,
  score: 0,
  coins: 0,
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
  unlockedAchievements: JSON.parse(localStorage.getItem('neonRunnerAchievements') || '[]'),
  dailyBest: Number(localStorage.getItem('neonRunnerDaily_' + new Date().toDateString()) || '0')
};
let lastCombo = 0;

// jump physics
let velocityY = 0;
const GRAVITY = -38;
const JUMP_FORCE = 13;
const GROUND_Y = 0.6;
let isJumping = false;

// spawn timing
let spawnTimer = 0;

// grid scrolling
const gridStartZ = -150;
const cellSize = 4;

// object pools
const obstaclePool = [];
const coinPool = [];
const OBSTACLE_POOL_SIZE = 30;
const COIN_POOL_SIZE = 40;
const powerupPool = [];
const POWERUP_POOL_SIZE = 10;

function getFromPool(pool, createFn) {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].visible) return pool[i];
  }
  const obj = createFn();
  pool.push(obj);
  return obj;
}

function resetObstacle(mesh, x) {
  const geo = OBSTACLE_GEOMETRIES[Math.floor(Math.random() * OBSTACLE_GEOMETRIES.length)];
  mesh.geometry.dispose();
  mesh.geometry = geo;
  mesh.position.set(x, 0.6, -80);
  mesh.visible = true;
  mesh.userData.moving = Math.random() < 0.3;
  mesh.userData.shifted = false;
  mesh.userData.nearMissed = false;
  if (mesh.userData.moving) {
    mesh.material = obstacleMat.clone();
    mesh.material.emissive.set(0xff6600);
  } else {
    mesh.material = obstacleMat;
  }
  return mesh;
}

function resetCoin(mesh, x, offsetZ) {
  mesh.position.set(x, 0.9, -80 - offsetZ);
  mesh.visible = true;
  mesh.rotation.set(0, 0, 0);
  return mesh;
}

// moving obstacles
let moveObstacleTimer = 0;
const MOVE_OBSTACLE_INTERVAL = 2;

// distance milestones
let lastMilestone = 0;
const MILESTONE_INTERVAL = 500;

// parallax layers
let bgLayers = [];

// screen flash
let flashOverlay = null;
let flashTimeout = null;

// shared geometry
const OBSTACLE_GEOMETRIES = [
  new THREE.BoxGeometry(1.2, 1.2, 1.2, 3, 3, 3),
  new THREE.ConeGeometry(0.7, 1.4, 24),
  new THREE.BoxGeometry(2.0, 0.8, 0.8, 4, 2, 2)
];
const COIN_GEOMETRY = new THREE.TorusGeometry(0.45, 0.16, 20, 40);

// materials (assigned in init)
let obstacleMat, coinMat, playerMat;

// particle pool
const particles = [];
const MAX_PARTICLES = 80;

// player trail
const trailPositions = [];
const TRAIL_LENGTH = 8;

// camera shake
let shakeIntensity = 0;
let shakeDuration = 0;

// FPS tracking
let fpsFrames = 0;
let fpsTime = 0;
let fpsDisplay = 60;

// audio
let audioCtx = null;
let bgmOsc = null;
let bgmGain = null;
let sfxGain = null;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 0.3;
  sfxGain.connect(audioCtx.destination);
  bgmGain = audioCtx.createGain();
  bgmGain.gain.value = 0.12;
  bgmGain.connect(audioCtx.destination);
}

function playTone(freq, duration, type, gain, detune) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  g.gain.setValueAtTime(gain || 0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function sfxCoin() {
  playTone(880, 0.1, 'sine', 0.4);
  playTone(1320, 0.08, 'sine', 0.2);
}

function sfxNearMiss() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

function sfxJump() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
  g.gain.setValueAtTime(0.25, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function sfxDeath() {
  playTone(200, 0.3, 'sawtooth', 0.3);
  playTone(150, 0.4, 'square', 0.15);
}

function sfxPowerup() {
  playTone(523, 0.08, 'sine', 0.3);
  playTone(659, 0.08, 'sine', 0.3);
  playTone(784, 0.12, 'sine', 0.3);
}

function startBGM() {
  if (!audioCtx || bgmOsc) return;
  bgmOsc = audioCtx.createOscillator();
  bgmOsc.type = 'triangle';
  bgmOsc.frequency.value = 110;
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.25;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 15;
  lfo.connect(lfoGain);
  lfoGain.connect(bgmOsc.frequency);
  lfo.start();
  bgmOsc.connect(bgmGain);
  bgmOsc.start();
  bgmOsc._lfo = lfo;
}

function stopBGM() {
  if (bgmOsc) {
    bgmOsc.stop();
    bgmOsc._lfo.stop();
    bgmOsc = null;
  }
}

const DESPAWN_Z = 8;

function setupBloom() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,
    0.4,
    0.85
  );
  composer.addPass(bloomPass);
}

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  // No fog — clean view of stars + grid + objects

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 3.4, 7);
  camera.lookAt(0, 1, -8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '0';
  document.getElementById('game-container').prepend(renderer.domElement);

  setupBloom();

  clock = new THREE.Clock();

  obstacleMat = new THREE.MeshStandardMaterial({ color: 0xff1463, emissive: 0xff1463, emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.4 });
  coinMat = new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffaa00, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.3 });
  playerMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 });

  buildLights();
  buildGround();
  buildPlayer();
  buildStars();
  buildTrail();
  buildSpeedLines();
  buildParallax();
  buildFlashOverlay();

  window.addEventListener('resize', onResize);
  setupInput();
  setupUI();
  initAudio();

  animate();
  simulateLoading();
  createMobileIndicators();
}

function simulateLoading() {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let progress = 0;
  const steps = [
    { p: 30, t: 'Building world...' },
    { p: 60, t: 'Spawning stars...' },
    { p: 85, t: 'Initializing audio...' },
    { p: 100, t: 'Ready!' }
  ];
  let stepIdx = 0;
  const iv = setInterval(() => {
    if (stepIdx < steps.length) {
      progress = steps[stepIdx].p;
      text.textContent = steps[stepIdx].t;
      bar.style.width = progress + '%';
      stepIdx++;
    }
    if (progress >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
      }, 400);
    }
  }, 350);
}

function buildLights() {
  scene.add(new THREE.AmbientLight(0x4040ff, 0.5));

  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  const pink = new THREE.PointLight(0xff00d6, 1.4, 40);
  pink.position.set(0, 5, -10);
  scene.add(pink);

  const cyan = new THREE.PointLight(0x00ffff, 1.0, 30);
  cyan.position.set(0, 4, 6);
  scene.add(cyan);
}

function buildGround() {
  const groundGeo = new THREE.PlaneGeometry(40, 400);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x06061a, metalness: 0.5, roughness: 0.5 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = gridStartZ;
  scene.add(ground);

  grid = new THREE.GridHelper(400, 100, 0x00ffff, 0xff00d6);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.set(0, 0.02, gridStartZ);
  scene.add(grid);
}

function getCharacterGeometry(shape) {
  switch (shape) {
    case 'octa': return new THREE.OctahedronGeometry(0.6, 3);
    case 'dodeca': return new THREE.DodecahedronGeometry(0.6, 2);
    case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 32, 64);
    default: return new THREE.IcosahedronGeometry(0.6, 3);
  }
}

function buildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape);
  const mat = new THREE.MeshStandardMaterial({ color: char.color, emissive: char.color, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 });
  playerMat = mat;
  player = new THREE.Mesh(geo, mat);
  player.position.set(0, GROUND_Y, 0);
  scene.add(player);

  const glowGeo = getCharacterGeometry(char.shape);
  glowGeo.scale(1.4, 1.4, 1.4);
  const glowMat = new THREE.MeshBasicMaterial({ color: char.color, transparent: true, opacity: 0.15 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  player.add(glow);

  const pl = new THREE.PointLight(char.color, 1.2, 8);
  player.add(pl);
}

function buildStars() {
  const geo = new THREE.BufferGeometry();
  const n = 600;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 200;
    pos[i * 3 + 1] = Math.random() * 60 + 5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 300 - 80;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.5, transparent: true, opacity: 0.8 });
  starField = new THREE.Points(geo, mat);
  scene.add(starField);
}

function spawnParticleBurst(x, y, z, color, count) {
  count = count || 8;
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    const size = 0.08 + Math.random() * 0.12;
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x, y, z);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;
    p.userData.vx = Math.cos(angle) * speed;
    p.userData.vy = Math.random() * 5 + 2;
    p.userData.vz = Math.sin(angle) * speed;
    p.userData.life = 0.5 + Math.random() * 0.3;
    p.userData.maxLife = p.userData.life;
    scene.add(p);
    particles.push(p);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.position.x += p.userData.vx * dt;
    p.position.y += p.userData.vy * dt;
    p.position.z += p.userData.vz * dt;
    p.userData.vy -= 25 * dt;
    p.userData.life -= dt;
    const lifeRatio = Math.max(0, p.userData.life / p.userData.maxLife);
    p.material.opacity = lifeRatio;
    p.scale.setScalar(0.5 + lifeRatio * 0.5);
    if (p.userData.life <= 0) {
      scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      particles.splice(i, 1);
    }
  }
}

function triggerShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeDuration = duration;
}

function updateShake(dt) {
  if (shakeDuration > 0) {
    shakeDuration -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5;
    shakeIntensity *= 0.9;
  } else {
    camera.position.x = 0;
    camera.position.y = 3.4;
  }
}

function updateTrail() {
  trailPositions.unshift({ x: player.position.x, y: player.position.y, z: player.position.z });
  if (trailPositions.length > TRAIL_LENGTH) trailPositions.pop();
  
  const positions = trailLine.geometry.attributes.position.array;
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const t = trailPositions[Math.min(i, trailPositions.length - 1)];
    positions[i * 3] = t.x;
    positions[i * 3 + 1] = t.y;
    positions[i * 3 + 2] = t.z;
  }
  trailLine.geometry.attributes.position.needsUpdate = true;
}

function buildTrail() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(TRAIL_LENGTH * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
  trailLine = new THREE.Line(geo, mat);
  scene.add(trailLine);
}

function buildSpeedLines() {
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0
  });

  for (let i = 0; i < 20; i++) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    positions[0] = 0; positions[1] = 0; positions[2] = 0;
    positions[3] = 0; positions[4] = 0; positions[5] = -1;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(geo, lineMat.clone());
    line.position.set(
      (Math.random() - 0.5) * 8,
      Math.random() * 3 + 0.5,
      -Math.random() * 60 - 10
    );
    line.visible = false;
    scene.add(line);
    speedLines.push(line);
  }
}

function updateSpeedLines(dt) {
  const speedRatio = state.speed / state.baseSpeed;
  const showLines = speedRatio > 1.3;
  speedLines.forEach(line => {
    if (showLines) {
      line.visible = true;
      line.material.opacity = Math.min(0.5, (speedRatio - 1.3) * 0.7);
      line.position.z += state.speed * dt * 1.8;
      if (line.position.z > 10) {
        line.position.z = -Math.random() * 60 - 10;
        line.position.x = (Math.random() - 0.5) * 8;
        line.position.y = Math.random() * 3 + 0.5;
      }
    } else {
      line.visible = false;
    }
  });
}

function buildParallax() {
  const colors = [0x1a0033, 0x0d001a, 0x0a0014];
  const speeds = [0.3, 0.6, 1.0];
  const heights = [8, 5, 3];
  const widths = [120, 80, 50];

  for (let i = 0; i < 3; i++) {
    const geo = new THREE.PlaneGeometry(widths[i], heights[i]);
    const mat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.6 - i * 0.15, side: THREE.DoubleSide });
    const layer = new THREE.Mesh(geo, mat);
    layer.position.set(0, heights[i] / 2, -100 - i * 30);
    layer.userData.speed = speeds[i];
    layer.userData.baseZ = layer.position.z;
    scene.add(layer);
    bgLayers.push(layer);

    for (let j = 0; j < 5; j++) {
      const bGeo = new THREE.BoxGeometry(1.5 + Math.random() * 2, 2 + Math.random() * 4, 0.5);
      const bMat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.4 });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set((j - 2) * 15 + (Math.random() - 0.5) * 8, heights[i] / 2 - 1, -100 - i * 30);
      building.userData.speed = speeds[i];
      building.userData.baseZ = building.position.z;
      scene.add(building);
      bgLayers.push(building);
    }
  }
}

function updateParallax(dt) {
  bgLayers.forEach(layer => {
    layer.position.z += state.speed * dt * layer.userData.speed;
    if (layer.position.z > 20) {
      layer.position.z = layer.userData.baseZ - 60;
    }
  });
}

function buildFlashOverlay() {
  const geo = new THREE.PlaneGeometry(20, 12);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false });
  flashOverlay = new THREE.Mesh(geo, mat);
  flashOverlay.position.set(0, 3.4, 5);
  flashOverlay.renderOrder = 999;
  scene.add(flashOverlay);
}

function triggerFlash(color, intensity, duration) {
  if (!flashOverlay) return;
  flashOverlay.material.color.set(color);
  flashOverlay.material.opacity = intensity;
  if (flashTimeout) clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => {
    flashOverlay.material.opacity = 0;
  }, duration);
}

function showMilestone(distance) {
  const text = distance + 'm!';
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:900;color:#00ffff;text-shadow:0 0 20px #00ffff,0 0 40px #00ff88;pointer-events:none;z-index:100;transition:all 0.8s ease-out;opacity:1;';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.top = '20%';
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(1.5)';
  });
  setTimeout(() => el.remove(), 900);
}

function applyTheme(themeId) {
  const t = THEMES[themeId];
  if (!t) return;
  scene.background = new THREE.Color(t.bg);
  grid.material.color.set(t.gridA);
  grid.material.opacity = 0.35;
  obstacleMat.color.set(t.obstacle);
  obstacleMat.emissive.set(t.obstacle);
  coinMat.color.set(t.coin);
  coinMat.emissive.set(t.coin);
  bgLayers.forEach((layer, i) => {
    if (layer.userData.isBuilding) {
      layer.material.color.set(t.bg);
    }
  });
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!state.unlockedAchievements.includes(a.id) && a.check(state)) {
      state.unlockedAchievements.push(a.id);
      localStorage.setItem('neonRunnerAchievements', JSON.stringify(state.unlockedAchievements));
      showAchievementPopup(a);
    }
  });
}

function showAchievementPopup(achievement) {
  const el = document.createElement('div');
  el.innerHTML = '<div style="font-size:24px">' + achievement.icon + '</div><div style="font-size:16px;font-weight:bold;color:#ffdd00">' + achievement.name + '</div><div style="font-size:12px;color:#aaa">' + achievement.desc + '</div>';
  el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(10,10,26,0.95);border:2px solid #ffdd00;border-radius:12px;padding:16px 20px;text-align:center;z-index:100;transition:all 0.5s ease-out;opacity:0;transform:translateX(100px);box-shadow:0 0 20px rgba(255,221,0,0.3);';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });
  playTone(523, 0.1, 'sine', 0.3);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    setTimeout(() => el.remove(), 500);
  }, 3000);
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function updateMusicIntensity() {
  if (!bgmOsc) return;
  const speedRatio = state.speed / state.baseSpeed;
  const baseFreq = 110;
  const maxFreq = 220;
  bgmOsc.frequency.value = baseFreq + (maxFreq - baseFreq) * Math.min(1, (speedRatio - 1) / 2);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function spawn() {
  spawnPowerup();
  const r = Math.random();
  if (r < 0.6) {
    const numObs = Math.random() < 0.35 ? 2 : 1;
    const laneIdxs = shuffle([0, 1, 2]).slice(0, numObs);
    laneIdxs.forEach(l => spawnObstacle(LANES[l]));
    const free = [0, 1, 2].filter(l => !laneIdxs.includes(l));
    if (free.length) spawnCoinLine(LANES[free[Math.floor(Math.random() * free.length)]]);
  } else {
    const l = Math.floor(Math.random() * 3);
    spawnCoinLine(LANES[l]);
  }
}

function spawnObstacle(x) {
  const m = getFromPool(obstaclePool, () => {
    const geo = OBSTACLE_GEOMETRIES[0];
    const mesh = new THREE.Mesh(geo, obstacleMat);
    scene.add(mesh);
    return mesh;
  });
  resetObstacle(m, x);
  obstacles.push(m);
}

function spawnCoinLine(x) {
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const c = getFromPool(coinPool, () => {
      const mesh = new THREE.Mesh(COIN_GEOMETRY, coinMat);
      scene.add(mesh);
      return mesh;
    });
    resetCoin(c, x, i * 1.8);
    coins.push(c);
  }
}

function spawnPowerup() {
  if (Math.random() > 0.08) return;
  const t = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const m = getFromPool(powerupPool, () => {
    const geo = new THREE.OctahedronGeometry(0.35, 2);
    const mat = new THREE.MeshStandardMaterial({ color: t.color, emissive: t.color, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    return mesh;
  });
  const lane = LANES[Math.floor(Math.random() * 3)];
  m.position.set(lane, 1.0, -80);
  m.userData.type = t.type;
  m.visible = true;
  m.material.color.set(t.color);
  m.material.emissive.set(t.color);
  powerups.push(m);
}

function showScoreFly(screenX, screenY, text) {
  const el = document.createElement('div');
  el.className = 'score-fly';
  el.textContent = text;
  el.style.left = screenX + 'px';
  el.style.top = screenY + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running && !state.gameOver && !state.isPaused) {

    state.speed = Math.min(state.maxSpeed, state.speed + 0.25 * dt);
    state.score += state.speed * dt;
    updateHUD();

    targetX = LANES[currentLane];
    player.position.x += (targetX - player.position.x) * Math.min(1, dt * 12);

    if (isJumping || player.position.y > GROUND_Y + 0.001) {
      velocityY += GRAVITY * dt;
      player.position.y += velocityY * dt;
      if (player.position.y <= GROUND_Y) {
        player.position.y = GROUND_Y;
        velocityY = 0;
        isJumping = false;
      }
    }

    player.rotation.y += dt * 2;
    player.rotation.x += dt * 1.5;

    const dz = state.speed * dt;
    const px = player.position.x, py = player.position.y, pz = player.position.z;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.position.z += dz;
      const oz = o.position.z;

      // Moving obstacle: shift lanes when close to player
      if (o.userData.moving && oz > -40 && oz < -10 && !o.userData.shifted) {
        const currentLaneIdx = LANES.indexOf(o.position.x);
        if (currentLaneIdx !== -1) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const newIdx = Math.max(0, Math.min(2, currentLaneIdx + dir));
          if (newIdx !== currentLaneIdx) {
            o.position.x = LANES[newIdx];
            o.userData.shifted = true;
            spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0xff4400);
          }
        }
      }

      if (Math.abs(o.position.x - px) < 0.85 && Math.abs(oz - pz) < 1.0 && Math.abs(o.position.y - py) < 0.95) {
        if (state.shield) {
          state.shield = false;
          state.shieldTimer = 0;
          spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0x00ff88);
          scene.remove(o);
          o.visible = false;
          obstacles.splice(i, 1);
          continue;
        }
        endGame();
        return;
      }
      if (oz > DESPAWN_Z) {
        scene.remove(o);
        o.geometry.dispose();
        obstacles.splice(i, 1);
      }
    }

    // Magnet effect: attract nearby coins
    if (state.magnet) {
      coins.forEach(c => {
        const dx = c.position.x - px, dy = c.position.y - py, dz2 = c.position.z - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz2 * dz2);
        if (dist < 8 && dist > 0.5) {
          c.position.x += (px - c.position.x) * dt * 4;
          c.position.y += (py + 0.3 - c.position.y) * dt * 4;
          c.position.z += (pz - c.position.z) * dt * 3;
        }
      });
    }

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      const prevZ = c.position.z;
      c.position.z += dz;
      c.rotation.y += dt * 3;
      if (prevZ < pz && c.position.z >= pz) {
        if (Math.abs(c.position.x - px) < 0.8 && Math.abs(c.position.y - py) < 0.85) {
          spawnParticleBurst(c.position.x, c.position.y, c.position.z, 0xffe14d, 10);
          sfxCoin();
          const vec = new THREE.Vector3(c.position.x, c.position.y, c.position.z);
          vec.project(camera);
          const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
          const pts = Math.floor(10 * state.multiplier);
          showScoreFly(sx, sy, '+' + pts);
          scene.remove(c);
          coins.splice(i, 1);
          state.coins++;
          state.combo++;
          state.multiplier = 1 + Math.floor(state.combo / 5) * 0.5;
          state.score += 10 * state.multiplier;
          updateHUD();
          continue;
        }
      }
      if (c.position.z > DESPAWN_Z) {
        c.visible = false;
        coins.splice(i, 1);
        state.combo = 0;
        state.multiplier = 1;
      }
    }

    // Power-up collection
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.position.z += dz;
      p.rotation.y += dt * 4;
      const dist = Math.sqrt((p.position.x - px) ** 2 + (p.position.y - py) ** 2 + (p.position.z - pz) ** 2);
      if (dist < 1.2) {
        const color = p.material.color.getHex();
        spawnParticleBurst(p.position.x, p.position.y, p.position.z, color);
        sfxPowerup();
        if (p.userData.type === 'magnet') { state.magnet = true; state.magnetTimer = 8; }
        if (p.userData.type === 'shield') { state.shield = true; state.shieldTimer = 10; }
        if (p.userData.type === 'multi') { state.multiplier = 3; }
        p.visible = false;
        powerups.splice(i, 1);
        continue;
      }
      if (p.position.z > DESPAWN_Z) {
        p.visible = false;
        powerups.splice(i, 1);
      }
    }

    // Power-up timers
    if (state.magnet) {
      state.magnetTimer -= dt;
      if (state.magnetTimer <= 0) { state.magnet = false; }
    }
    if (state.shield) {
      state.shieldTimer -= dt;
      if (state.shieldTimer <= 0) { state.shield = false; }
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      const interval = Math.max(0.5, 1.3 - state.speed * 0.012);
      spawnTimer = interval;
    }

    grid.position.z += state.speed * dt;
    if (grid.position.z - gridStartZ >= cellSize) grid.position.z -= cellSize;
    
    updateTrail();
    updateSpeedLines(dt);
    updateParallax(dt);
    updateMusicIntensity();

    // Distance milestone check
    const distance = Math.floor(state.score / 10);
    if (distance >= lastMilestone + MILESTONE_INTERVAL) {
      lastMilestone = distance - (distance % MILESTONE_INTERVAL);
      showMilestone(lastMilestone);
      playTone(660, 0.15, 'sine', 0.3);
      playTone(880, 0.15, 'sine', 0.2);
    }

    // Near-miss detection
    obstacles.forEach(o => {
      const dx = Math.abs(o.position.x - px);
      const dz2 = Math.abs(o.position.z - pz);
      if (dx < 1.2 && dz2 < 1.5 && dx > 0.7 && !o.userData.nearMissed) {
        o.userData.nearMissed = true;
        sfxNearMiss();
        const overlay = document.getElementById('near-miss-overlay');
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 100);
        state.score += 50;
      }
    });
  } else {
    player.rotation.y += dt * 0.8;
  }

  updateParticles(dt);
  updateShake(dt);

  // FPS counter
  fpsFrames++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    fpsDisplay = Math.round(fpsFrames / fpsTime);
    const fpsEl = document.getElementById('fps-counter');
    if (fpsEl) fpsEl.textContent = fpsDisplay + ' FPS';
    fpsFrames = 0;
    fpsTime = 0;
  }

  composer.render();
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  triggerShake(0.8, 0.6);
  triggerFlash(0xff0000, 0.5, 300);

  // Enhanced death explosion — multiple bursts
  spawnParticleBurst(player.position.x, player.position.y, player.position.z, 0xff1463);
  setTimeout(() => spawnParticleBurst(player.position.x + 0.5, player.position.y + 0.3, player.position.z, 0xff6600), 100);
  setTimeout(() => spawnParticleBurst(player.position.x - 0.5, player.position.y, player.position.z + 0.5, 0xff00ff), 200);
  setTimeout(() => spawnParticleBurst(player.position.x, player.position.y + 0.5, player.position.z - 0.3, 0x00ffff), 300);

  // Hide player
  player.visible = false;

  stopBGM();
  sfxDeath();
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem('neonRunnerBest', state.best);
  }
  if (state.score > state.dailyBest) {
    state.dailyBest = Math.floor(state.score);
    localStorage.setItem('neonRunnerDaily_' + new Date().toDateString(), state.dailyBest);
  }
  checkAchievements();
  updateAnalytics();
  showShareButton();
  document.getElementById('final-score').textContent = Math.floor(state.score);
  document.getElementById('final-coins').textContent = state.coins;
  document.getElementById('best-score').textContent = state.best;
  document.getElementById('game-over-screen').classList.remove('hidden');
}

function setupInput() {
  window.addEventListener('keydown', (e) => {
    if (!state.running) return;
    switch (e.key) {
      case 'ArrowLeft':
      case 'a': case 'A':
        currentLane = Math.max(0, currentLane - 1);
        break;
      case 'ArrowRight':
      case 'd': case 'D':
        currentLane = Math.min(2, currentLane + 1);
        break;
      case 'ArrowUp':
      case ' ':
      case 'w': case 'W':
        if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); }
        e.preventDefault();
        break;
      case 'Escape':
        togglePause();
        e.preventDefault();
        break;
    }
  });

  let touchStartX = 0, touchStartY = 0, touchStartT = 0;
  const canvas = renderer.domElement;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartT = Date.now();
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!state.running) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const elapsed = Date.now() - touchStartT;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    if (absX < 24 && absY < 24 && elapsed < 250) {
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); flashMobileIndicator('mi-jump'); }
    } else if (absX > absY) {
      if (dx > 0) { currentLane = Math.min(2, currentLane + 1); flashMobileIndicator('mi-right'); }
      else { currentLane = Math.max(0, currentLane - 1); flashMobileIndicator('mi-left'); }
    } else if (dy < 0) {
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); flashMobileIndicator('mi-jump'); }
    }
    if (navigator.vibrate) navigator.vibrate(15);
  }, { passive: true });
}

function setupUI() {
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('best-score').textContent = state.best;

  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('analytics-display').innerHTML = getAnalyticsHTML();
    showScreen('settings-screen');
  });
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('pause-settings-btn').addEventListener('click', () => showScreen('settings-screen'));
  document.getElementById('quit-btn').addEventListener('click', quitToMenu);
  document.getElementById('settings-back-btn').addEventListener('click', () => {
    if (state.running) showScreen('pause-screen');
    else showScreen('start-screen');
  });

  // Character selector
  const charSel = document.getElementById('char-selector');
  CHARACTERS.forEach((char, i) => {
    const btn = document.createElement('div');
    btn.className = 'selector-btn' + (i === state.character ? ' active' : '') + (state.best < char.unlock ? ' locked' : '');
    btn.style.background = '#' + char.color.toString(16).padStart(6, '0');
    btn.textContent = char.name.charAt(0);
    btn.title = char.name + (state.best < char.unlock ? ' (Unlock at ' + char.unlock + ')' : '');
    btn.addEventListener('click', () => {
      if (state.best < char.unlock) return;
      state.character = i;
      localStorage.setItem('neonRunnerChar', i);
      charSel.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rebuildPlayer();
    });
    charSel.appendChild(btn);
  });

  // Theme selector
  const themeSel = document.getElementById('theme-selector');
  Object.keys(THEMES).forEach(key => {
    const t = THEMES[key];
    const btn = document.createElement('div');
    btn.className = 'selector-btn' + (key === state.theme ? ' active' : '') + (state.best < t.unlock ? ' locked' : '');
    btn.style.background = '#' + t.gridA.toString(16).padStart(6, '0');
    btn.textContent = t.name.charAt(0);
    btn.title = t.name + (state.best < t.unlock ? ' (Unlock at ' + t.unlock + ')' : '');
    btn.addEventListener('click', () => {
      if (state.best < t.unlock) return;
      state.theme = key;
      localStorage.setItem('neonRunnerTheme', key);
      themeSel.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyTheme(key);
    });
    themeSel.appendChild(btn);
  });

  // Stats
  document.getElementById('menu-best').textContent = '🏆 Best: ' + state.best;
  document.getElementById('menu-daily').textContent = '📅 Daily: ' + state.dailyBest;
  document.getElementById('menu-games').textContent = '🎮 Games: ' + state.gamesPlayed;

  // Achievements button
  document.getElementById('achievements-btn').addEventListener('click', () => {
    renderAchievements();
    showScreen('achievements-screen');
  });
  document.getElementById('ach-back-btn').addEventListener('click', () => showScreen('start-screen'));

  const musicVol = document.getElementById('music-volume');
  const sfxVol = document.getElementById('sfx-volume');
  const sens = document.getElementById('sensitivity');
  musicVol.addEventListener('input', () => {
    document.getElementById('music-volume-val').textContent = musicVol.value + '%';
    if (bgmGain) bgmGain.gain.value = musicVol.value / 100 * 0.25;
  });
  sfxVol.addEventListener('input', () => {
    document.getElementById('sfx-volume-val').textContent = sfxVol.value + '%';
    if (sfxGain) sfxGain.gain.value = sfxVol.value / 100 * 0.5;
  });
  sens.addEventListener('input', () => {
    document.getElementById('sensitivity-val').textContent = sens.value;
  });
}

function rebuildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape);
  const mat = new THREE.MeshStandardMaterial({ color: char.color, emissive: char.color, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 });
  playerMat = mat;
  player.geometry.dispose();
  player.geometry = geo;
  player.material = mat;
  player.children.forEach(c => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
    player.remove(c);
  });
  const glowGeo = getCharacterGeometry(char.shape);
  glowGeo.scale(1.4, 1.4, 1.4);
  const glowMat = new THREE.MeshBasicMaterial({ color: char.color, transparent: true, opacity: 0.15 });
  player.add(new THREE.Mesh(glowGeo, glowMat));
  const pl = new THREE.PointLight(char.color, 1.2, 8);
  player.add(pl);
}

function renderAchievements() {
  const list = document.getElementById('achievements-list');
  list.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const unlocked = state.unlockedAchievements.includes(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card' + (unlocked ? ' unlocked' : '');
    card.innerHTML = '<div class="ach-icon">' + a.icon + '</div><div class="ach-name">' + a.name + '</div><div class="ach-desc">' + a.desc + '</div>';
    list.appendChild(card);
  });
}

function showScreen(id) {
  const transition = document.getElementById('screen-transition');
  transition.classList.add('active');
  setTimeout(() => {
    ['loading-screen', 'start-screen', 'pause-screen', 'settings-screen', 'game-over-screen', 'achievements-screen'].forEach(s => {
      document.getElementById(s).classList.add('hidden');
    });
    if (id) document.getElementById(id).classList.remove('hidden');
    transition.classList.remove('active');
  }, 250);
}

let previousScreen = 'start-screen';

function togglePause() {
  if (!state.running && !state.gameOver) return;
  if (state.gameOver) return;
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    previousScreen = 'pause-screen';
    showScreen('pause-screen');
    stopBGM();
  } else {
    showScreen(null);
    document.getElementById('hud').classList.remove('hidden');
    startBGM();
  }
}

function quitToMenu() {
  state.running = false;
  state.gameOver = false;
  state.isPaused = false;
  stopBGM();
  obstacles.forEach(o => { o.visible = false; });
  obstacles = [];
  coins.forEach(c => { c.visible = false; });
  coins = [];
  particles.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  particles.length = 0;
  powerups.forEach(p => { p.visible = false; });
  powerups = [];
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });
  state.combo = 0;
  state.multiplier = 1;
  state.shield = false;
  state.magnet = false;
  showScreen('start-screen');
}

function startGame() {
  state.running = true;
  state.gameOver = false;
  state.speed = state.baseSpeed;
  state.score = 0;
  state.coins = 0;
  state.gamesPlayed++;
  localStorage.setItem('neonRunnerGames', state.gamesPlayed);
  lastMilestone = 0;
  currentLane = 1;
  velocityY = 0;
  isJumping = false;
  player.position.set(0, GROUND_Y, 0);
  player.visible = true;
  spawnTimer = 0.5;

  applyTheme(state.theme);

  obstacles.forEach(o => { o.visible = false; });
  obstacles = [];
  coins.forEach(c => { c.visible = false; });
  coins = [];
  particles.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  particles.length = 0;
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });
  powerups.forEach(p => { p.visible = false; });
  powerups = [];
  state.combo = 0;
  state.multiplier = 1;
  state.shield = false;
  state.magnet = false;

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  updateHUD();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startBGM();
}

function updateHUD() {
  document.getElementById('score').textContent = Math.floor(state.score);
  document.getElementById('coins').textContent = state.coins;
  const speedStr = (state.speed / state.baseSpeed).toFixed(1) + 'x';
  const powerStr = (state.magnet ? ' [MAGNET]' : '') + (state.shield ? ' [SHIELD]' : '');
  document.getElementById('speed').textContent = speedStr + powerStr;

  const comboEl = document.getElementById('combo');
  const comboText = state.combo >= 5 ? state.combo + ' (x' + state.multiplier.toFixed(1) + ')' : state.combo;
  if (lastCombo !== state.combo) {
    lastCombo = state.combo;
    comboEl.classList.remove('combo-pulse');
    void comboEl.offsetWidth;
    comboEl.classList.add('combo-pulse');
  }
  comboEl.textContent = comboText;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// === MOBILE SWIPE INDICATORS ===
function createMobileIndicators() {
  if (!('ontouchstart' in window)) return;
  const indicators = document.createElement('div');
  indicators.id = 'mobile-indicators';
  indicators.innerHTML = '<div id="mi-left" class="mi">◀</div><div id="mi-right" class="mi">▶</div><div id="mi-jump" class="mi">▲</div>';
  indicators.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:center;gap:20px;z-index:50;pointer-events:none;';
  document.body.appendChild(indicators);
  document.querySelectorAll('.mi').forEach(el => {
    el.style.cssText = 'width:60px;height:60px;border-radius:50%;background:rgba(0,255,255,0.15);border:2px solid rgba(0,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:24px;color:rgba(0,255,255,0.5);';
  });
}

function flashMobileIndicator(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = 'rgba(0,255,255,0.4)';
  el.style.borderColor = 'rgba(0,255,255,0.8)';
  setTimeout(() => {
    el.style.background = 'rgba(0,255,255,0.15)';
    el.style.borderColor = 'rgba(0,255,255,0.3)';
  }, 150);
}

// === SCREENSHOT / SHARE ===
function captureScreenshot() {
  composer.render();
  const link = document.createElement('a');
  link.download = 'neonrunner-' + Math.floor(state.score) + '.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function showShareButton() {
  const btn = document.createElement('button');
  btn.textContent = '📸 SAVE SCREENSHOT';
  btn.className = 'btn small';
  btn.style.cssText = 'position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:101;font-size:11px;padding:8px 12px;';
  btn.addEventListener('click', () => {
    captureScreenshot();
    btn.remove();
  });
  document.body.appendChild(btn);
  setTimeout(() => { if (btn.parentElement) btn.remove(); }, 5000);
}

// === ANALYTICS ===
function loadAnalytics() {
  return JSON.parse(localStorage.getItem('neonRunnerAnalytics') || '{"totalScore":0,"totalGames":0,"totalCoins":0,"bestDistance":0,"deathLanes":[0,0,0]}');
}

function saveAnalytics(data) {
  localStorage.setItem('neonRunnerAnalytics', JSON.stringify(data));
}

function updateAnalytics() {
  const a = loadAnalytics();
  a.totalScore += state.score;
  a.totalGames++;
  a.totalCoins += state.coins;
  const dist = Math.floor(state.score / 10);
  if (dist > a.bestDistance) a.bestDistance = dist;
  const laneIdx = LANES.indexOf(player.position.x);
  if (laneIdx !== -1) a.deathLanes[laneIdx]++;
  saveAnalytics(a);
}

function getAnalyticsHTML() {
  const a = loadAnalytics();
  const avg = a.totalGames > 0 ? Math.floor(a.totalScore / a.totalGames) : 0;
  const favLane = a.deathLanes.indexOf(Math.max(...a.deathLanes));
  const laneNames = ['Left', 'Center', 'Right'];
  return '<div class="stats-panel"><div class="stat-row"><span>Avg Score</span><span>' + avg + '</span></div><div class="stat-row"><span>Total Games</span><span>' + a.totalGames + '</span></div><div class="stat-row"><span>Total Coins</span><span>' + a.totalCoins + '</span></div><div class="stat-row"><span>Best Distance</span><span>' + a.bestDistance + 'm</span></div><div class="stat-row"><span>Death Lane</span><span>' + laneNames[favLane] + '</span></div></div>';
}
