// Main Entry Point - Neon Runner

import { 
  LANES, POWERUP_TYPES, THEMES, CHARACTERS, ACHIEVEMENTS,
  OBSTACLE_TYPES, DIFFICULTY_TIERS, GRAVITY, JUMP_FORCE, GROUND_Y, DESPAWN_Z,
  OBSTACLE_POOL_SIZE, COIN_POOL_SIZE, POWERUP_POOL_SIZE
} from './config.js';

import { 
  state, saveState, resetGameState, updateStreak, 
  updateScore, addCoins, incrementGamesPlayed 
} from './state.js';

import { 
  initAudio, setMusicVolume, setSfxVolume, sfxCoin, sfxJump,
  sfxDeath, sfxPowerup, sfxNearMiss, sfxThemeChange, sfxHit, sfxCombo,
  startBGM, stopBGM, updateMusicIntensity, resumeAudio, startAmbient, stopAmbient, updateAmbientIntensity 
} from './audio.js';

import { shuffle, getCurrentTier, getRandomObstacleType, getCharacterGeometry } from './utils.js';
import { spawnParticleBurst, updateParticles, clearParticles, initWeather, updateWeather } from './particles.js';
import { generateDailyChallenges, checkDailyChallenges, renderDailyChallenges } from './challenges.js';
import { getCurrentTier as getDifficultyTier, showTierChange, resetTierIdx, getTierName, getTierColor } from './difficulty.js';

// Global variables
let scene, camera, renderer, clock;
let player, grid, starField, trailLine;
let composer, bloomPass;
let obstacles = [];
let coins = [];
let speedLines = [];
let powerups = [];

let currentLane = 1;
let targetX = 0;
let laneVelocity = 0;
let velocityY = 0;
let isJumping = false;
let spawnTimer = 0;
let lastMilestone = 0;
let lastCombo = 0;
let deathAnimTime = 0;
const DEATH_ANIM_DURATION = 1.5;

const gridStartZ = -150;
const cellSize = 4;

const obstaclePool = [];
const coinPool = [];
const powerupPool = [];

const trailPositions = [];
const TRAIL_LENGTH = 8;

let shakeIntensity = 0;
let shakeDuration = 0;
let fpsFrames = 0;
let fpsTime = 0;
let lowFpsStreak = 0;
let highFpsStreak = 0;
let bloomEnabled = true;

let bgLayers = [];
let flashOverlay = null;
let flashTimeout = null;
let showScreenTimeout = null;

let obstacleMat, coinMat, playerMat;

const OBSTACLE_GEOMETRIES = [
  new THREE.BoxGeometry(1.2, 1.2, 1.2, 3, 3, 3),
  new THREE.ConeGeometry(0.7, 1.4, 24),
  new THREE.BoxGeometry(2.0, 0.8, 0.8, 4, 2, 2),
  new THREE.BoxGeometry(3.0, 0.15, 0.15, 8, 1, 1),
  new THREE.OctahedronGeometry(0.8, 0),
  new THREE.BoxGeometry(1.8, 1.8, 0.4, 2, 2, 1)
];
const COIN_GEOMETRY = new THREE.TorusGeometry(0.45, 0.16, 20, 40);

// Initialize game
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

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

  obstacleMat = new THREE.MeshStandardMaterial({ color: 0xff1463, emissive: 0xff1463, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.4 });
  coinMat = new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffaa00, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.4 });
  playerMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 });

  buildLights();
  buildGround();
  buildPlayer();
  buildStars();
  buildTrail();
  buildSpeedLines();
  buildParallax();
  buildFlashOverlay();
  initWeather(scene);

  window.addEventListener('resize', onResize);
  setupInput();
  setupUI();
  initAudio();
  showGestureTutorial();

  animate();
}

function setupBloom() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6, 0.3, 0.9
  );
  composer.addPass(bloomPass);
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
  
  // Add fog for depth
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);
}

function buildGround() {
  const groundGeo = new THREE.PlaneGeometry(40, 400);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x06061a, 
    metalness: 0.8, 
    roughness: 0.2,
    envMapIntensity: 1.0
  });
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

function buildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape, THREE);
  const mat = new THREE.MeshStandardMaterial({ color: char.color, emissive: char.color, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 });
  playerMat = mat;
  player = new THREE.Mesh(geo, mat);
  player.position.set(0, GROUND_Y, 0);
  scene.add(player);

  const glowGeo = getCharacterGeometry(char.shape, THREE);
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

function buildTrail() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(TRAIL_LENGTH * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
  trailLine = new THREE.Line(geo, mat);
  scene.add(trailLine);
}

function buildSpeedLines() {
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
  for (let i = 0; i < 20; i++) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
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

function buildFlashOverlay() {
  const geo = new THREE.PlaneGeometry(20, 12);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false });
  flashOverlay = new THREE.Mesh(geo, mat);
  flashOverlay.position.set(0, 3.4, 5);
  flashOverlay.renderOrder = 999;
  scene.add(flashOverlay);
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

function getFromPool(pool, createFn) {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].visible) return pool[i];
  }
  const obj = createFn();
  pool.push(obj);
  return obj;
}

function resetObstacle(mesh, x, typeKey) {
  const type = typeKey || 'cube';
  const obstacleType = OBSTACLE_TYPES[type];
  const geoIdx = obstacleType.geo;
  const geo = OBSTACLE_GEOMETRIES[geoIdx];
  
  mesh.geometry = geo;
  mesh.position.set(x, 0.6, -80);
  mesh.visible = true;
  mesh.userData.type = type;
  mesh.userData.behavior = obstacleType.behavior;
  mesh.userData.shifted = false;
  mesh.userData.nearMissed = false;
  mesh.userData.pulsePhase = 0;
  mesh.userData.slideDir = Math.random() < 0.5 ? -1 : 1;
  mesh.userData.slideOrigin = x;
  
  if (mesh.material !== obstacleMat && mesh.material !== coinMat) {
    mesh.material.dispose();
  }
  mesh.material = obstacleMat.clone();
  mesh.material.color.set(obstacleType.color);
  mesh.material.emissive.set(obstacleType.color);
  
  if (type === 'laser') {
    mesh.material.emissiveIntensity = 1.0;
    mesh.scale.set(1, 1, 1);
  } else if (type === 'spinner') {
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
  } else if (type === 'slider') {
    mesh.position.y = 0.9;
    mesh.scale.set(1, 1, 1);
  } else {
    mesh.scale.set(1, 1, 1);
  }
  
  return mesh;
}

function resetCoin(mesh, x, offsetZ) {
  mesh.position.set(x, 0.9, -80 - offsetZ);
  mesh.visible = true;
  mesh.rotation.set(0, 0, 0);
  return mesh;
}

function spawn() {
  spawnPowerup();
  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  const r = Math.random();
  
  if (r < 0.6 * tier.spawnRate) {
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
  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  const type = getRandomObstacleType(tier);
  const m = getFromPool(obstaclePool, () => {
    const geo = OBSTACLE_GEOMETRIES[0];
    const mesh = new THREE.Mesh(geo, obstacleMat);
    scene.add(mesh);
    return mesh;
  });
  resetObstacle(m, x, type);
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

function updateParallax(dt) {
  bgLayers.forEach(layer => {
    layer.position.z += state.speed * dt * layer.userData.speed;
    if (layer.position.z > 20) {
      layer.position.z = layer.userData.baseZ - 60;
    }
  });
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
  if (scene.fog) scene.fog.color.set(t.fog || t.bg);
  grid.material.color.set(t.gridA);
  grid.material.opacity = 0.35;
  obstacleMat.color.set(t.obstacle);
  obstacleMat.emissive.set(t.obstacle);
  coinMat.color.set(t.coin);
  coinMat.emissive.set(t.coin);
  
  if (starField && starField.material) {
    starField.material.color.set(t.star || 0x88aaff);
  }
  
  bgLayers.forEach((layer, i) => {
    if (layer.userData.isBuilding || layer.geometry.type === 'BoxGeometry') {
      layer.material.color.set(t.building || t.bg);
    }
  });
  
  const char = CHARACTERS[state.character];
  if (char && char.color === 0x00ffff) {
    playerMat.color.set(t.player);
    playerMat.emissive.set(t.player);
  }
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!state.unlockedAchievements.includes(a.id) && a.check(state)) {
      state.unlockedAchievements.push(a.id);
      saveState();
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
  sfxPowerup();
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    setTimeout(() => el.remove(), 500);
  }, 3000);
}

function rebuildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape, THREE);
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
  const glowGeo = getCharacterGeometry(char.shape, THREE);
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
  if (showScreenTimeout) clearTimeout(showScreenTimeout);
  const transition = document.getElementById('screen-transition');
  transition.classList.add('active');
  showScreenTimeout = setTimeout(() => {
    ['loading-screen', 'start-screen', 'pause-screen', 'settings-screen', 'game-over-screen', 'achievements-screen'].forEach(s => {
      document.getElementById(s).classList.add('hidden');
    });
    if (id) document.getElementById(id).classList.remove('hidden');
    transition.classList.remove('active');
    showScreenTimeout = null;
  }, 250);
}

function togglePause() {
  if (!state.running && !state.gameOver) return;
  if (state.gameOver) return;
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    showScreen('pause-screen');
    document.getElementById('hud').classList.add('hidden');
    stopBGM();
    stopAmbient();
  } else {
    showScreen(null);
    document.getElementById('hud').classList.remove('hidden');
    startBGM();
    startAmbient();
  }
}

function quitToMenu() {
  state.running = false;
  state.gameOver = false;
  state.isPaused = false;
  stopBGM();
  stopAmbient();
  obstacles.forEach(o => { o.visible = false; });
  obstacles = [];
  coins.forEach(c => { c.visible = false; });
  coins = [];
  clearParticles();
  powerups.forEach(p => { p.visible = false; });
  powerups = [];
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });
  state.combo = 0;
  state.multiplier = 1;
  state.shield = false;
  state.magnet = false;
  document.getElementById('hud').classList.add('hidden');
  showScreen('start-screen');
}

function startGame() {
  resetGameState();
  state.running = true;
  incrementGamesPlayed();
  updateStreak();
  lastMilestone = 0;
  resetTierIdx();
  currentLane = 1;
  laneVelocity = 0;
  velocityY = 0;
  isJumping = false;
  player.position.set(0, GROUND_Y, 0);
  player.visible = true;
  deathAnimTime = 0;
  player.material.opacity = 1;
  player.material.transparent = false;
  spawnTimer = 0.5;

  applyTheme(state.theme);

  obstacles.forEach(o => { o.visible = false; });
  obstacles = [];
  coins.forEach(c => { c.visible = false; });
  coins = [];
  clearParticles();
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });
  powerups.forEach(p => { p.visible = false; });
  powerups = [];

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  updateHUD();
  resumeAudio();
  startBGM();
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  deathAnimTime = 0;
  player.visible = true;
  triggerShake(0.8, 0.6);
  triggerFlash(0xff0000, 0.5, 300);

  spawnParticleBurst(player.position.x, player.position.y, player.position.z, 0xff1463, 8, scene);
  setTimeout(() => spawnParticleBurst(player.position.x + 0.5, player.position.y + 0.3, player.position.z, 0xff6600, 8, scene), 100);
  setTimeout(() => spawnParticleBurst(player.position.x - 0.5, player.position.y, player.position.z + 0.5, 0xff00ff, 8, scene), 200);
  setTimeout(() => spawnParticleBurst(player.position.x, player.position.y + 0.5, player.position.z - 0.3, 0x00ffff, 8, scene), 300);

  stopBGM();
  stopAmbient();
  sfxDeath();
  updateScore(state.score);
  checkAchievements();
  checkDailyChallenges();
  updateAnalytics();
  saveState();
  showShareButton();
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('final-score').textContent = Math.floor(state.score);
  document.getElementById('final-coins').textContent = state.runCoins || 0;
  document.getElementById('best-score').textContent = state.best;
  document.getElementById('final-daily').textContent = state.dailyBest;
  const gameOverScreen = document.getElementById('game-over-screen');
  gameOverScreen.classList.remove('hidden');
  gameOverScreen.classList.add('game-over-animate');
  setTimeout(() => gameOverScreen.classList.remove('game-over-animate'), 1000);
}

function updateHUD() {
  document.getElementById('score').textContent = Math.floor(state.score);
  document.getElementById('coins').textContent = state.runCoins;
  const speedStr = (state.speed / state.baseSpeed).toFixed(1) + 'x';
  document.getElementById('speed').textContent = speedStr;

  const comboEl = document.getElementById('combo');
  const comboText = state.combo >= 5 ? state.combo + ' (x' + state.multiplier.toFixed(1) + ')' : state.combo;
  if (lastCombo !== state.combo) {
    lastCombo = state.combo;
    comboEl.classList.remove('combo-pulse');
    void comboEl.offsetWidth;
    comboEl.classList.add('combo-pulse');
  }
  comboEl.textContent = comboText;

  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  const tierEl = document.getElementById('difficulty-tier');
  if (tierEl) {
    tierEl.textContent = getTierName(tier);
    tierEl.style.color = getTierColor(tier);
  }

  const shieldBadge = document.getElementById('shield-badge');
  const magnetBadge = document.getElementById('magnet-badge');
  if (shieldBadge) {
    shieldBadge.classList.toggle('active', state.shield);
    shieldBadge.querySelector('.timer').textContent = state.shield ? Math.ceil(state.shieldTimer) + 's' : '';
  }
  if (magnetBadge) {
    magnetBadge.classList.toggle('active', state.magnet);
    magnetBadge.querySelector('.timer').textContent = state.magnet ? Math.ceil(state.magnetTimer) + 's' : '';
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running && !state.gameOver && !state.isPaused) {
    state.speed = Math.min(state.maxSpeed, state.speed + 0.25 * dt);
    
    const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
    showTierChange(tier);
    if (state.speed < tier.speed) {
      state.speed = Math.min(tier.speed, state.speed + 0.6 * dt);
    }
    
    const streakMultiplier = 1 + Math.min(state.streak * 0.1, 0.5);
    state.score += state.speed * dt * streakMultiplier;
    updateHUD();

    targetX = LANES[currentLane];
    const laneDiff = targetX - player.position.x;
    const laneSpeed = 35;
    if (Math.abs(laneDiff) > 0.005) {
      player.position.x += Math.sign(laneDiff) * Math.min(Math.abs(laneDiff), laneSpeed * dt);
    } else {
      player.position.x = targetX;
    }

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
      const behavior = o.userData.behavior;

      if (behavior === 'spinning') {
        o.rotation.y += dt * 5;
        o.rotation.x += dt * 3;
      } else if (behavior === 'pulsing') {
        o.userData.pulsePhase += dt * 4;
        const pulse = Math.sin(o.userData.pulsePhase) * 0.5 + 0.5;
        o.material.opacity = 0.3 + pulse * 0.7;
        o.material.transparent = true;
        o.scale.y = 0.5 + pulse * 0.5;
      } else if (behavior === 'sliding') {
        const slideRange = 1.5;
        o.position.x += o.userData.slideDir * dt * 2;
        if (Math.abs(o.position.x - o.userData.slideOrigin) > slideRange) {
          o.userData.slideDir *= -1;
        }
      } else if (behavior === 'static' && o.userData.shifted === false && oz > -40 && oz < -10) {
        if (Math.random() < 0.3) {
          const currentLaneIdx = LANES.indexOf(o.position.x);
          if (currentLaneIdx !== -1) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const newIdx = Math.max(0, Math.min(2, currentLaneIdx + dir));
            if (newIdx !== currentLaneIdx) {
              o.position.x = LANES[newIdx];
              o.userData.shifted = true;
              spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0xff4400, 8, scene);
            }
          }
        }
        o.userData.shifted = true;
      }

      const hitbox = OBSTACLE_TYPES[o.userData.type] ? OBSTACLE_TYPES[o.userData.type].hitbox : { x: 0.7, y: 0.7, z: 0.7 };
      const hitDx = Math.abs(o.position.x - px);
      const hitDz = Math.abs(oz - pz);
      if (hitDx < hitbox.x && hitDz < hitbox.z && Math.abs(o.position.y - py) < hitbox.y) {
        if (state.shield) {
          state.shield = false;
          state.shieldTimer = 0;
          spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0x00ff88, 8, scene);
          o.visible = false;
          obstacles.splice(i, 1);
          continue;
        }
        endGame();
        return;
      }
      if (!o.userData.nearMissed && hitDx < 1.2 && hitDz < 1.5 && hitDx > 0.7) {
        o.userData.nearMissed = true;
        sfxNearMiss();
        const overlay = document.getElementById('near-miss-overlay');
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 100);
        state.score += 50;
      }
      if (oz > DESPAWN_Z) {
        o.visible = false;
        obstacles.splice(i, 1);
      }
    }

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
          spawnParticleBurst(c.position.x, c.position.y, c.position.z, 0xffe14d, 10, scene);
          sfxCoin();
          const vec = new THREE.Vector3(c.position.x, c.position.y, c.position.z);
          vec.project(camera);
          const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
          const pts = Math.floor(10 * state.multiplier);
          showScoreFly(sx, sy, '+' + pts);
          c.visible = false;
          coins.splice(i, 1);
          addCoins(1);
          state.combo++;
          if (state.combo >= 5) sfxCombo();
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

    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.position.z += dz;
      p.rotation.y += dt * 4;
      const dist = Math.sqrt((p.position.x - px) ** 2 + (p.position.y - py) ** 2 + (p.position.z - pz) ** 2);
      if (dist < 1.2) {
        const color = p.material.color.getHex();
        spawnParticleBurst(p.position.x, p.position.y, p.position.z, color, 8, scene);
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
    updateMusicIntensity(state.speed / state.baseSpeed);
    updateAmbientIntensity(state.speed / state.baseSpeed);

    const distance = Math.floor(state.score / 10);
    if (distance >= lastMilestone + 500) {
      lastMilestone = distance - (distance % 500);
      showMilestone(lastMilestone);
      sfxCoin();
    }
  } else {
    if (state.gameOver && deathAnimTime < DEATH_ANIM_DURATION) {
      deathAnimTime += dt;
      const t = deathAnimTime / DEATH_ANIM_DURATION;
      player.rotation.y += dt * 15 * (1 - t);
      player.rotation.x += dt * 8 * (1 - t);
      player.position.y -= dt * 3 * t;
      player.material.opacity = 1 - t;
      player.material.transparent = true;
      if (t >= 1) {
        player.visible = false;
      }
    } else {
      player.rotation.y += dt * 0.8;
    }
  }

  updateParticles(dt);
  updateWeather(dt, state.speed);
  updateShake(dt);

  fpsFrames++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    const fpsDisplay = Math.round(fpsFrames / fpsTime);
    const fpsEl = document.getElementById('fps-counter');
    if (fpsEl) fpsEl.textContent = fpsDisplay + ' FPS';
    fpsFrames = 0;
    fpsTime = 0;

    if (fpsDisplay < 30) {
      lowFpsStreak++;
      highFpsStreak = 0;
    } else if (fpsDisplay >= 45) {
      highFpsStreak++;
      lowFpsStreak = 0;
    } else {
      lowFpsStreak = 0;
      highFpsStreak = 0;
    }

    if (bloomEnabled && lowFpsStreak >= 3) {
      bloomEnabled = false;
      bloomPass.enabled = false;
    } else if (!bloomEnabled && highFpsStreak >= 3) {
      bloomEnabled = true;
      bloomPass.enabled = true;
    }
  }

  composer.render();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
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
      try { localStorage.setItem('neonRunnerChar', i); } catch (e) {}
      charSel.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rebuildPlayer();
    });
    charSel.appendChild(btn);
  });

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
      try { localStorage.setItem('neonRunnerTheme', key); } catch (e) {}
      themeSel.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyTheme(key);
      sfxThemeChange();
    });
    themeSel.appendChild(btn);
  });

  document.getElementById('menu-best').textContent = '🏆 Best: ' + state.best;
  document.getElementById('menu-daily').textContent = '📅 Daily: ' + state.dailyBest;
  document.getElementById('menu-games').textContent = '🎮 Games: ' + state.gamesPlayed;
  document.getElementById('menu-coins').textContent = '💰 Coins: ' + state.coins;
  document.getElementById('menu-streak').textContent = '🔥 Streak: ' + state.streak;

  generateDailyChallenges();
  renderDailyChallenges();

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
    setMusicVolume(musicVol.value);
  });
  sfxVol.addEventListener('input', () => {
    document.getElementById('sfx-volume-val').textContent = sfxVol.value + '%';
    setSfxVolume(sfxVol.value);
  });
  sens.addEventListener('input', () => {
    document.getElementById('sensitivity-val').textContent = sens.value;
  });
}

function createMobileIndicators() {
  if (!('ontouchstart' in window)) return;
  const indicators = document.createElement('div');
  indicators.id = 'mobile-indicators';
  indicators.innerHTML = `
    <div id="mi-left" class="mi">
      <span class="mi-icon">◀</span>
      <span class="mi-label">LEFT</span>
    </div>
    <div id="mi-jump" class="mi">
      <span class="mi-icon">▲</span>
      <span class="mi-label">JUMP</span>
    </div>
    <div id="mi-right" class="mi">
      <span class="mi-icon">▶</span>
      <span class="mi-label">RIGHT</span>
    </div>
  `;
  indicators.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:center;gap:16px;z-index:50;pointer-events:none;';
  document.body.appendChild(indicators);
  document.querySelectorAll('.mi').forEach(el => {
    el.style.cssText = 'width:70px;height:70px;border-radius:16px;background:rgba(0,255,255,0.1);border:2px solid rgba(0,255,255,0.2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;backdrop-filter:blur(4px);';
    el.querySelector('.mi-icon').style.cssText = 'font-size:20px;color:rgba(0,255,255,0.6);';
    el.querySelector('.mi-label').style.cssText = 'font-size:8px;font-weight:700;letter-spacing:1px;color:rgba(0,255,255,0.4);';
  });
}

function flashMobileIndicator(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = 'rgba(0,255,255,0.3)';
  el.style.borderColor = 'rgba(0,255,255,0.8)';
  el.style.transform = 'scale(0.95)';
  if (navigator.vibrate) navigator.vibrate(10);
  setTimeout(() => {
    el.style.background = 'rgba(0,255,255,0.1)';
    el.style.borderColor = 'rgba(0,255,255,0.2)';
    el.style.transform = 'scale(1)';
  }, 100);
}

function showGestureTutorial() {
  if (!('ontouchstart' in window)) return;
  let alreadySeen = false;
  try { alreadySeen = !!localStorage.getItem('neonRunnerTutorialSeen'); } catch (e) {}
  if (alreadySeen) return;
  
  const tutorial = document.createElement('div');
  tutorial.id = 'gesture-tutorial';
  tutorial.innerHTML = `
    <div class="tutorial-content">
      <h3>HOW TO PLAY</h3>
      <div class="tutorial-gestures">
        <div class="gesture">
          <div class="gesture-icon">👈👉</div>
          <div class="gesture-text">Swipe Left/Right to switch lanes</div>
        </div>
        <div class="gesture">
          <div class="gesture-icon">👆</div>
          <div class="gesture-text">Tap to jump</div>
        </div>
      </div>
      <button id="tutorial-dismiss" class="btn small">GOT IT!</button>
    </div>
  `;
  tutorial.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,26,0.95);z-index:200;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(tutorial);
  
  document.getElementById('tutorial-dismiss').addEventListener('click', () => {
    tutorial.remove();
    try { localStorage.setItem('neonRunnerTutorialSeen', '1'); } catch (e) {}
  });
}

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

function loadAnalytics() {
  try {
    return JSON.parse(localStorage.getItem('neonRunnerAnalytics') || '{"totalScore":0,"totalGames":0,"totalCoins":0,"bestDistance":0,"deathLanes":[0,0,0]}');
  } catch (e) {
    return { totalScore: 0, totalGames: 0, totalCoins: 0, bestDistance: 0, deathLanes: [0, 0, 0] };
  }
}

function saveAnalytics(data) {
  try { localStorage.setItem('neonRunnerAnalytics', JSON.stringify(data)); } catch (e) {}
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

// Start the game — guard against missing CDN dependencies instead of crashing silently
function showFatalLoadError() {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  const err = document.getElementById('load-error');
  if (bar) bar.style.width = '0%';
  if (text) text.textContent = 'Load failed.';
  if (err) err.classList.remove('hidden');
}

function requiredGlobalsPresent() {
  return typeof THREE !== 'undefined' &&
    typeof THREE.EffectComposer !== 'undefined' &&
    typeof THREE.RenderPass !== 'undefined' &&
    typeof THREE.UnrealBloomPass !== 'undefined';
}

if (window.__assetLoadFailed || !requiredGlobalsPresent()) {
  showFatalLoadError();
} else {
  try {
    init();
    simulateLoading();
    createMobileIndicators();
  } catch (e) {
    console.error('Neon Runner failed to start:', e);
    showFatalLoadError();
  }
}
