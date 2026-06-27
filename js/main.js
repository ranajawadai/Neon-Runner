// ═══════════════════════════════════════════════════════════════
//  NEON RUNNER — Part 1: Renderer, Scene, Lights, Environment
// ═══════════════════════════════════════════════════════════════

import {
  LANES, POWERUP_TYPES, THEMES, CHARACTERS, ACHIEVEMENTS,
  OBSTACLE_TYPES, DIFFICULTY_TIERS, GRAVITY, JUMP_FORCE, GROUND_Y, DESPAWN_Z,
  OBSTACLE_POOL_SIZE, COIN_POOL_SIZE, POWERUP_POOL_SIZE, GAME_MODES
} from './config.js';

import {
  state, saveState, resetGameState, updateStreak,
  updateScore, addCoins, incrementGamesPlayed
} from './state.js';

import {
  initAudio, setMusicVolume, setSfxVolume, sfxCoin, sfxJump,
  sfxDeath, sfxPowerup, sfxNearMiss, sfxThemeChange, sfxHit, sfxCombo, sfxShift,
  startBGM, stopBGM, updateMusicIntensity, resumeAudio, startAmbient, stopAmbient, updateAmbientIntensity
} from './audio.js';

import { shuffle, getCurrentTier, getRandomObstacleType, getCharacterGeometry } from './utils.js';
import { spawnParticleBurst, updateParticles, clearParticles, initWeather, updateWeather } from './particles.js';
import { generateDailyChallenges, checkDailyChallenges, renderDailyChallenges } from './challenges.js';
import { showTierChange, resetTierIdx, getTierName, getTierColor } from './difficulty.js';

// ── Global State ──────────────────────────────────────────────
let scene, camera, renderer, clock;
let player, grid, starField, trailLine;
let composer, bloomPass;
let obstacles = [];
let coins = [];
let speedLines = [];
let powerups = [];

// Lane markers (visual guides on the ground)
let laneMarkers = [];

let currentLane = 1;
let targetX = 0;
let velocityY = 0;
let isJumping = false;
let spawnTimer = 0;
let lastMilestone = 0;
let lastCombo = 0;
let deathAnimTime = 0;
const DEATH_ANIM_DURATION = 1.5;

const gridStartZ = -150;
const cellSize = 4;

// Object pools
const obstaclePool = [];
const coinPool = [];
const powerupPool = [];

// Trail
const trailPositions = [];
const TRAIL_LENGTH = 12;

// Screen shake
let shakeIntensity = 0;
let shakeDuration = 0;
let shakeDecay = 0.92;

// FPS tracking
let fpsFrames = 0;
let fpsTime = 0;
let lowFpsStreak = 0;
let highFpsStreak = 0;
let bloomEnabled = true;

// Background parallax layers
let bgLayers = [];

// Screen flash
let flashOverlay = null;
let flashTimeout = null;

// Screen transition
let showScreenTimeout = null;

// Shared materials
let obstacleMat, coinMat, playerMat;
let ambientLight, dirLight, accentLightA, accentLightB, hemiLight;

// Pre-created obstacle material variants (avoids clone per spawn)
const obstacleMats = {
  cube: null, pyramid: null, wall: null, laser: null, spinner: null, slider: null
};

// Current game mode
let currentMode = GAME_MODES.classic;

// ── Shared Geometries ─────────────────────────────────────────
const OBSTACLE_GEOMETRIES = [
  new THREE.BoxGeometry(1.2, 1.2, 1.2, 3, 3, 3),        // cube
  new THREE.ConeGeometry(0.7, 1.4, 24),                   // pyramid
  new THREE.BoxGeometry(2.0, 0.8, 0.8, 4, 2, 2),          // wall
  new THREE.BoxGeometry(3.0, 0.15, 0.15, 8, 1, 1),        // laser
  new THREE.OctahedronGeometry(0.8, 0),                    // spinner
  new THREE.BoxGeometry(1.8, 1.8, 0.4, 2, 2, 1)           // slider
];
const COIN_GEOMETRY = new THREE.TorusGeometry(0.45, 0.16, 20, 40);


// ═══════════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function init() {
  setupScene();
  setupCamera();
  setupRenderer();
  setupBloom();
  clock = new THREE.Clock();

  createMaterials();
  buildLights();
  buildGround();
  buildLaneMarkers();
  buildPlayer();
  buildStars();
  buildTrail();
  buildSpeedLines();
  buildParallax();
  buildFlashOverlay();
  initWeather(scene);

  applyTheme(state.theme);

  window.addEventListener('resize', onResize);
  setupInput();
  setupUI();
  initAudio();
  showGestureTutorial();

  animate();
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e5a6b);
  scene.fog = new THREE.FogExp2(0x1a8a9a, 0.008);
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 250);
  camera.position.set(0, 3.6, 7.5);
  camera.lookAt(0, 1.2, -10);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '0';
  document.getElementById('game-container').prepend(renderer.domElement);
}

function setupBloom() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,   // strength — strong neon glow
    0.4,   // radius — soft spread
    0.55   // threshold — only bright things bloom
  );
  composer.addPass(bloomPass);
}

function createMaterials() {
  obstacleMat = new THREE.MeshStandardMaterial({
    color: 0xff4466,
    emissive: 0xff2244,
    emissiveIntensity: 0.7,
    metalness: 0.4,
    roughness: 0.3,
  });

  // Pre-create material variants for each obstacle type — no more clone per spawn
  obstacleMats.cube = obstacleMat;
  obstacleMats.pyramid = obstacleMat;
  obstacleMats.wall = obstacleMat;
  obstacleMats.spinner = obstacleMat;
  obstacleMats.slider = obstacleMat;
  obstacleMats.laser = new THREE.MeshStandardMaterial({
    color: 0xff3344,
    emissive: 0xff3344,
    emissiveIntensity: 1.2,
    metalness: 0.4,
    roughness: 0.3,
  });

  coinMat = new THREE.MeshStandardMaterial({
    color: 0x5ee8d6,
    emissive: 0x3bd4c0,
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.25,
  });

  playerMat = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    emissive: 0x2dd4bf,
    emissiveIntensity: 0.9,
    metalness: 0.5,
    roughness: 0.2,
  });
}


// ═══════════════════════════════════════════════════════════════
//  LIGHTS
// ═══════════════════════════════════════════════════════════════

function buildLights() {
  // Hemisphere light — natural sky/ground ambient
  hemiLight = new THREE.HemisphereLight(0x4a9aaa, 0x0a2030, 0.5);
  scene.add(hemiLight);

  // Ambient fill
  ambientLight = new THREE.AmbientLight(0x4a9aaa, 0.6);
  scene.add(ambientLight);

  // Main directional — overhead key light
  dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(4, 14, 6);
  scene.add(dirLight);

  // Cyan accent — ahead of player
  accentLightA = new THREE.PointLight(0x7fe8da, 1.4, 50);
  accentLightA.position.set(0, 6, -12);
  scene.add(accentLightA);

  // Warm accent — behind player
  accentLightB = new THREE.PointLight(0xffb74d, 0.8, 35);
  accentLightB.position.set(0, 4, 8);
  scene.add(accentLightB);
}


// ═══════════════════════════════════════════════════════════════
//  ENVIRONMENT
// ═══════════════════════════════════════════════════════════════

function buildGround() {
  // Main ground plane
  const groundGeo = new THREE.PlaneGeometry(50, 400);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a3e48,
    metalness: 0.3,
    roughness: 0.7,
    envMapIntensity: 0.5,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = gridStartZ;
  scene.add(ground);

  // Grid overlay
  grid = new THREE.GridHelper(400, 100, 0x5ee8d6, 0x3bbca8);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  grid.position.set(0, 0.02, gridStartZ);
  scene.add(grid);
}

function buildLaneMarkers() {
  // Glowing lane dividers — thin lines on the ground
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0.08,
  });

  // Two divider lines between 3 lanes
  const dividers = [
    (LANES[0] + LANES[1]) / 2,  // between left and center
    (LANES[1] + LANES[2]) / 2,  // between center and right
  ];

  dividers.forEach(x => {
    const geo = new THREE.PlaneGeometry(0.04, 300);
    const marker = new THREE.Mesh(geo, markerMat.clone());
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(x, 0.03, gridStartZ);
    scene.add(marker);
    laneMarkers.push(marker);
  });

  // Lane center indicators — subtle dots
  LANES.forEach(x => {
    const dotGeo = new THREE.CircleGeometry(0.08, 12);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.12,
    });
    // Place a series of dots down the lane
    for (let z = -5; z > -80; z -= 8) {
      const dot = new THREE.Mesh(dotGeo, dotMat.clone());
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(x, 0.035, z);
      scene.add(dot);
      laneMarkers.push(dot);
    }
  });
}

function buildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape, THREE);
  const mat = new THREE.MeshStandardMaterial({
    color: char.color,
    emissive: char.color,
    emissiveIntensity: 0.9,
    metalness: 0.5,
    roughness: 0.2,
  });
  playerMat = mat;
  player = new THREE.Mesh(geo, mat);
  player.position.set(0, GROUND_Y, 0);
  scene.add(player);

  // Glow shell — slightly larger transparent shell
  const glowGeo = getCharacterGeometry(char.shape, THREE);
  glowGeo.scale(1.5, 1.5, 1.5);
  const glowMat = new THREE.MeshBasicMaterial({
    color: char.color,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  player.add(glow);

  // Player point light
  const pl = new THREE.PointLight(char.color, 1.0, 10);
  player.add(pl);
}

function buildStars() {
  const geo = new THREE.BufferGeometry();
  const n = 700;
  const pos = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 250;
    pos[i * 3 + 1] = Math.random() * 70 + 5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 350 - 80;
    sizes[i] = Math.random() * 0.4 + 0.2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xaae8f0,
    size: 0.5,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  starField = new THREE.Points(geo, mat);
  scene.add(starField);
}

function buildTrail() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(TRAIL_LENGTH * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0.35,
  });
  trailLine = new THREE.Line(geo, mat);
  scene.add(trailLine);
}

function buildSpeedLines() {
  for (let i = 0; i < 24; i++) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x5ee8d6,
      transparent: true,
      opacity: 0,
    });
    const line = new THREE.Line(geo, mat);
    line.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 3 + 0.5,
      -Math.random() * 60 - 10
    );
    line.visible = false;
    scene.add(line);
    speedLines.push(line);
  }
}

function buildParallax() {
  const colors = [0x0d4a55, 0x083540, 0x05242c];
  const speeds = [0.3, 0.6, 1.0];
  const heights = [10, 6, 3.5];
  const widths = [140, 100, 60];

  for (let i = 0; i < 3; i++) {
    // Background wall
    const geo = new THREE.PlaneGeometry(widths[i], heights[i]);
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i],
      transparent: true,
      opacity: 0.5 - i * 0.12,
      side: THREE.DoubleSide,
    });
    const layer = new THREE.Mesh(geo, mat);
    layer.position.set(0, heights[i] / 2, -110 - i * 35);
    layer.userData.speed = speeds[i];
    layer.userData.baseZ = layer.position.z;
    scene.add(layer);
    bgLayers.push(layer);

    // Background structures (pillars / spires)
    for (let j = 0; j < 6; j++) {
      const isSpire = Math.random() < 0.5;
      const bWidth = isSpire ? 0.3 + Math.random() * 0.5 : 1.5 + Math.random() * 2.5;
      const bHeight = 2 + Math.random() * 6;
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, 0.5);
      const bMat = new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.3,
      });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(
        (j - 2.5) * 14 + (Math.random() - 0.5) * 10,
        bHeight / 2,
        -110 - i * 35
      );
      building.userData.speed = speeds[i];
      building.userData.baseZ = building.position.z;
      scene.add(building);
      bgLayers.push(building);
    }
  }
}

function buildFlashOverlay() {
  const geo = new THREE.PlaneGeometry(24, 14);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  flashOverlay = new THREE.Mesh(geo, mat);
  flashOverlay.position.set(0, 3.6, 5.5);
  flashOverlay.renderOrder = 999;
  scene.add(flashOverlay);
}


// ═══════════════════════════════════════════════════════════════
//  LOADING & BOOT
// ═══════════════════════════════════════════════════════════════

function simulateLoading() {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let progress = 0;
  const steps = [
    { p: 25, t: 'Building world...' },
    { p: 50, t: 'Spawning environment...' },
    { p: 75, t: 'Initializing audio...' },
    { p: 90, t: 'Calibrating bloom...' },
    { p: 100, t: 'Ready!' },
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
  }, 300);
}

function requiredGlobalsPresent() {
  return typeof THREE !== 'undefined' &&
    typeof THREE.EffectComposer !== 'undefined' &&
    typeof THREE.RenderPass !== 'undefined' &&
    typeof THREE.UnrealBloomPass !== 'undefined';
}

function showFatalLoadError() {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  const err = document.getElementById('load-error');
  if (bar) bar.style.width = '0%';
  if (text) text.textContent = 'Load failed.';
  if (err) err.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════════════════════════

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}


// ═══════════════════════════════════════════════════════════════
//  OBJECT POOL HELPER
// ═══════════════════════════════════════════════════════════════

function getFromPool(pool, createFn) {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].visible) return pool[i];
  }
  const obj = createFn();
  pool.push(obj);
  return obj;
}


// ═══════════════════════════════════════════════════════════════
//  THEME APPLICATION
// ═══════════════════════════════════════════════════════════════

function applyTheme(themeId) {
  const t = THEMES[themeId];
  if (!t) return;

  scene.background = new THREE.Color(t.bg);
  if (scene.fog) {
    scene.fog.color.set(t.fog);
    if (scene.fog.density !== undefined) scene.fog.density = t.fogDensity || 0.008;
  }

  grid.material.color.set(t.gridA);
  grid.material.opacity = 0.18;

  obstacleMat.color.set(t.obstacle);
  obstacleMat.emissive.set(t.obstacleEmissive || t.obstacle);
  coinMat.color.set(t.coin);
  coinMat.emissive.set(t.coinEmissive || t.coin);

  if (ambientLight) {
    ambientLight.color.set(t.ambient || t.bg);
    ambientLight.intensity = t.ambientIntensity !== undefined ? t.ambientIntensity : 0.5;
  }
  if (hemiLight) {
    hemiLight.color.set(t.lightA || t.gridA);
    hemiLight.groundColor.set(t.bg);
  }
  if (accentLightA) accentLightA.color.set(t.lightA || t.gridA);
  if (accentLightB) accentLightB.color.set(t.lightB || t.gridB);

  if (starField && starField.material) {
    starField.material.color.set(t.star || 0xaae8f0);
  }

  // Update lane markers
  laneMarkers.forEach(m => {
    if (m.material) m.material.color.set(t.gridA);
  });

  // Update background layers
  bgLayers.forEach(layer => {
    if (layer.geometry.type === 'BoxGeometry') {
      layer.material.color.set(t.bg);
    }
  });

  // Update player if using default color
  const char = CHARACTERS[state.character];
  if (char && char.color === 0x2dd4bf) {
    playerMat.color.set(t.player);
    playerMat.emissive.set(t.player);
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXPORTS FOR PART 2+
// ═══════════════════════════════════════════════════════════════
// Part 2 (game loop) will be appended below this line.
// Part 3 (UI, input, screens) will follow.
// Part 4 (analytics, effects, boot) will follow.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  PART 2 — Game Loop, Physics, Collision, Spawning
// ═══════════════════════════════════════════════════════════════

function resetObstacle(mesh, x, typeKey) {
  const type = typeKey || 'cube';
  const obstacleType = OBSTACLE_TYPES[type];
  const geoIdx = obstacleType.geo;
  const geo = OBSTACLE_GEOMETRIES[geoIdx];

  mesh.geometry = geo;
  mesh.position.set(x, 0.6, -85);
  mesh.visible = true;
  mesh.userData.type = type;
  mesh.userData.behavior = obstacleType.behavior;
  mesh.userData.shifted = false;
  mesh.userData.nearMissed = false;
  mesh.userData.pulsePhase = Math.random() * Math.PI * 2;
  mesh.userData.slideDir = Math.random() < 0.5 ? -1 : 1;
  mesh.userData.slideOrigin = x;

  // Use pre-created material variant — no cloning, no disposal needed
  mesh.material = obstacleMats[type] || obstacleMat;

  if (type === 'spinner') {
    mesh.rotation.set(0, 0, 0);
  } else if (type === 'slider') {
    mesh.position.y = 0.9;
  }
  mesh.scale.set(1, 1, 1);

  return mesh;
}

function resetCoin(mesh, x, offsetZ) {
  mesh.position.set(x, 0.9, -85 - offsetZ);
  mesh.visible = true;
  mesh.rotation.set(0, 0, 0);
  return mesh;
}

function spawn() {
  const mode = currentMode;
  if (mode.obstacles) spawnPowerup();

  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  const spawnChance = 0.6 * tier.spawnRate * mode.spawnRateMul;
  const r = Math.random();

  if (r < spawnChance && mode.obstacles) {
    const numObs = Math.random() < 0.3 ? 2 : 1;
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
  if (Math.random() > 0.07) return;
  if (!currentMode.powerups) return;

  const t = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const m = getFromPool(powerupPool, () => {
    const geo = new THREE.OctahedronGeometry(0.35, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: t.color,
      emissive: t.color,
      emissiveIntensity: 1.0,
      metalness: 0.6,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    return mesh;
  });
  const lane = LANES[Math.floor(Math.random() * 3)];
  m.position.set(lane, 1.0, -85);
  m.userData.type = t.type;
  m.visible = true;
  m.material.color.set(t.color);
  m.material.emissive.set(t.color);
  powerups.push(m);
}


// ═══════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running && !state.gameOver && !state.isPaused) {
    updateGameplay(dt);
  } else if (state.gameOver && deathAnimTime < DEATH_ANIM_DURATION) {
    updateDeathAnim(dt);
  } else {
    // Idle rotation when not playing
    player.rotation.y += dt * 0.8;
  }

  updateParticles(dt);
  updateWeather(dt, state.speed);
  updateShake(dt);
  updateFPS(dt);

  composer.render();
}

function updateGameplay(dt) {
  const mode = currentMode;

  // Speed ramp
  state.speed = Math.min(mode.maxSpeed, state.speed + 0.3 * dt);
  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  showTierChange(tier);
  if (state.speed < tier.speed) {
    state.speed = Math.min(tier.speed, state.speed + 0.7 * dt);
  }

  // Score
  const streakMultiplier = 1 + Math.min(state.streak * 0.1, 0.5);
  state.score += state.speed * dt * streakMultiplier * mode.scoreMultiplier;
  updateHUD();

  // Player movement
  updatePlayer(dt);

  // World movement
  const dz = state.speed * dt;
  const px = player.position.x;
  const py = player.position.y;
  const pz = player.position.z;

  // Obstacles
  updateObstacles(dt, dz, px, py, pz);

  // Coins
  updateCoins(dt, dz, px, py, pz);

  // Power-ups
  updatePowerups(dt, dz, px, py, pz);

  // Power-up timers
  if (state.magnet) {
    state.magnetTimer -= dt;
    if (state.magnetTimer <= 0) state.magnet = false;
  }
  if (state.shield) {
    state.shieldTimer -= dt;
    if (state.shieldTimer <= 0) state.shield = false;
  }

  // Spawning
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawn();
    const interval = Math.max(0.45, 1.2 - state.speed * 0.012);
    spawnTimer = interval;
  }

  // Environment
  updateEnvironment(dt);

  // Audio
  updateMusicIntensity(state.speed / mode.baseSpeed);
  updateAmbientIntensity(state.speed / mode.baseSpeed);

  // Milestones
  const distance = Math.floor(state.score / 10);
  if (distance >= lastMilestone + 500) {
    lastMilestone = distance - (distance % 500);
    showMilestone(lastMilestone);
    sfxCoin();
  }
}

function updatePlayer(dt) {
  targetX = LANES[currentLane];
  const laneDiff = targetX - player.position.x;

  // Spring-damped lane switching
  if (Math.abs(laneDiff) > 0.003) {
    const springSpeed = 38;
    player.position.x += Math.sign(laneDiff) * Math.min(Math.abs(laneDiff), springSpeed * dt);
  } else {
    player.position.x = targetX;
  }

  // Jump physics
  if (isJumping || player.position.y > GROUND_Y + 0.001) {
    velocityY += GRAVITY * dt;
    player.position.y += velocityY * dt;
    if (player.position.y <= GROUND_Y) {
      player.position.y = GROUND_Y;
      velocityY = 0;
      isJumping = false;
    }
  }

  // Rotation — subtle spin
  player.rotation.y += dt * 2.0;
  player.rotation.x += dt * 1.0;
}

function updateObstacles(dt, dz, px, py, pz) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.position.z += dz;
    const oz = o.position.z;
    const behavior = o.userData.behavior;

    // Behavior animations
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
      o.position.x += o.userData.slideDir * dt * 2.2;
      if (Math.abs(o.position.x - o.userData.slideOrigin) > slideRange) {
        o.userData.slideDir *= -1;
      }
    } else if (behavior === 'static' && !o.userData.shifted && oz > -40 && oz < -10) {
      // Random lane shift for surprise
      if (Math.random() < 0.25) {
        const currentLaneIdx = LANES.indexOf(o.position.x);
        if (currentLaneIdx !== -1) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const newIdx = Math.max(0, Math.min(2, currentLaneIdx + dir));
          if (newIdx !== currentLaneIdx) {
            o.position.x = LANES[newIdx];
            sfxShift();
            spawnParticleBurst(o.position.x, o.position.y, o.position.z, obstacleMat.color.getHex(), 6, scene);
          }
        }
      }
      o.userData.shifted = true;
    }

    // Collision check
    const hitbox = OBSTACLE_TYPES[o.userData.type]
      ? OBSTACLE_TYPES[o.userData.type].hitbox
      : { x: 0.7, y: 0.7, z: 0.7 };
    const hitDx = Math.abs(o.position.x - px);
    const hitDz = Math.abs(oz - pz);
    const hitDy = Math.abs(o.position.y - py);

    if (hitDx < hitbox.x && hitDz < hitbox.z && hitDy < hitbox.y) {
      if (state.shield) {
        state.shield = false;
        state.shieldTimer = 0;
        sfxHit();
        spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0x00ff88, 10, scene);
        o.visible = false;
        obstacles.splice(i, 1);
        continue;
      }
      endGame();
      return;
    }

    // Near-miss check
    if (!o.userData.nearMissed && hitDx < 1.3 && hitDz < 1.6 && hitDx > 0.6) {
      o.userData.nearMissed = true;
      sfxNearMiss();
      const overlay = document.getElementById('near-miss-overlay');
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), 100);
      state.score += 50;
    }

    // Despawn
    if (oz > DESPAWN_Z) {
      o.visible = false;
      obstacles.splice(i, 1);
    }
  }
}

function updateCoins(dt, dz, px, py, pz) {
  // Magnet pull
  if (state.magnet) {
    coins.forEach(c => {
      const dx = c.position.x - px;
      const dy = c.position.y - py;
      const dz2 = c.position.z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz2 * dz2);
      if (dist < 10 && dist > 0.3) {
        c.position.x += (px - c.position.x) * dt * 5;
        c.position.y += (py + 0.3 - c.position.y) * dt * 5;
        c.position.z += (pz - c.position.z) * dt * 4;
      }
    });
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    const prevZ = c.position.z;
    c.position.z += dz;
    c.rotation.y += dt * 3;

    // Collection check — when coin crosses player Z
    if (prevZ < pz && c.position.z >= pz) {
      if (Math.abs(c.position.x - px) < 0.85 && Math.abs(c.position.y - py) < 0.9) {
        spawnParticleBurst(c.position.x, c.position.y, c.position.z, coinMat.color.getHex(), 12, scene);
        sfxCoin();

        // Score fly-up
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
        state.score += 10 * state.multiplier * currentMode.scoreMultiplier;
        updateHUD();
        continue;
      }
    }

    // Despawn — reset combo if coins pass without collection
    if (c.position.z > DESPAWN_Z) {
      c.visible = false;
      coins.splice(i, 1);
      state.combo = 0;
      state.multiplier = 1;
    }
  }
}

function updatePowerups(dt, dz, px, py, pz) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.position.z += dz;
    p.rotation.y += dt * 4;
    p.rotation.x += dt * 2;

    const dist = Math.sqrt(
      (p.position.x - px) ** 2 +
      (p.position.y - py) ** 2 +
      (p.position.z - pz) ** 2
    );

    if (dist < 1.3) {
      const color = p.material.color.getHex();
      spawnParticleBurst(p.position.x, p.position.y, p.position.z, color, 10, scene);
      sfxPowerup();

      if (p.userData.type === 'magnet')  { state.magnet = true; state.magnetTimer = 8; }
      if (p.userData.type === 'shield')  { state.shield = true; state.shieldTimer = 10; }
      if (p.userData.type === 'multi')   { state.multiplier = 3; }

      p.visible = false;
      powerups.splice(i, 1);
      continue;
    }

    if (p.position.z > DESPAWN_Z) {
      p.visible = false;
      powerups.splice(i, 1);
    }
  }
}

function updateEnvironment(dt) {
  // Grid scroll
  grid.position.z += state.speed * dt;
  if (grid.position.z - gridStartZ >= cellSize) grid.position.z -= cellSize;

  // Lane markers scroll
  laneMarkers.forEach(m => {
    if (m.geometry.type === 'CircleGeometry') {
      m.position.z += state.speed * dt;
      if (m.position.z > 10) m.position.z -= 80;
    }
  });

  updateTrail();
  updateSpeedLines(dt);
  updateParallax(dt);
}

function updateTrail() {
  trailPositions.unshift({ x: player.position.x, y: player.position.y, z: player.position.z });
  if (trailPositions.length > TRAIL_LENGTH) trailPositions.pop();

  const positions = trailLine.geometry.attributes.position.array;
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const t = trailPositions[Math.min(i, trailPositions.length - 1)];
    positions[i * 3]     = t.x;
    positions[i * 3 + 1] = t.y;
    positions[i * 3 + 2] = t.z;
  }
  trailLine.geometry.attributes.position.needsUpdate = true;
}

function updateSpeedLines(dt) {
  const speedRatio = state.speed / currentMode.baseSpeed;
  const showLines = speedRatio > 1.3;

  speedLines.forEach(line => {
    if (showLines) {
      line.visible = true;
      line.material.opacity = Math.min(0.45, (speedRatio - 1.3) * 0.6);
      line.position.z += state.speed * dt * 1.8;
      if (line.position.z > 10) {
        line.position.z = -Math.random() * 60 - 10;
        line.position.x = (Math.random() - 0.5) * 10;
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
    if (layer.position.z > 25) {
      layer.position.z = layer.userData.baseZ - 60;
    }
  });
}

function updateDeathAnim(dt) {
  deathAnimTime += dt;
  const t = deathAnimTime / DEATH_ANIM_DURATION;
  player.rotation.y += dt * 15 * (1 - t);
  player.rotation.x += dt * 8 * (1 - t);
  player.position.y -= dt * 3 * t;
  player.material.opacity = 1 - t;
  player.material.transparent = true;
  if (t >= 1) player.visible = false;
}

function updateShake(dt) {
  if (shakeDuration > 0) {
    shakeDuration -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5;
    shakeIntensity *= shakeDecay;
  } else {
    // Return to base position smoothly
    camera.position.x += (0 - camera.position.x) * 0.1;
    camera.position.y += (3.6 - camera.position.y) * 0.1;
  }
}

function updateFPS(dt) {
  fpsFrames++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    const fpsDisplay = Math.round(fpsFrames / fpsTime);
    const fpsEl = document.getElementById('fps-counter');
    if (fpsEl) fpsEl.textContent = fpsDisplay + ' FPS';
    fpsFrames = 0;
    fpsTime = 0;

    // Adaptive bloom
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
}


// ═══════════════════════════════════════════════════════════════
//  HUD — Throttled Updates
// ═══════════════════════════════════════════════════════════════

let _lastHudScore = -1;
let _lastHudCoins = -1;
let _lastHudSpeed = '';
let _lastHudCombo = -1;
let _lastHudTier = '';

function updateHUD() {
  // Score — only update when integer changes
  const s = Math.floor(state.score);
  if (s !== _lastHudScore) {
    _lastHudScore = s;
    document.getElementById('score').textContent = s;
  }

  // Coins
  if (state.runCoins !== _lastHudCoins) {
    _lastHudCoins = state.runCoins;
    document.getElementById('coins').textContent = state.runCoins;
  }

  // Speed
  const speedStr = (state.speed / currentMode.baseSpeed).toFixed(1) + 'x';
  if (speedStr !== _lastHudSpeed) {
    _lastHudSpeed = speedStr;
    document.getElementById('speed').textContent = speedStr;
  }

  // Combo
  if (state.combo !== _lastHudCombo) {
    _lastHudCombo = state.combo;
    const comboEl = document.getElementById('combo');
    const comboText = state.combo >= 5
      ? state.combo + ' (x' + state.multiplier.toFixed(1) + ')'
      : state.combo;
    comboEl.textContent = comboText;
    if (state.combo > 0) {
      comboEl.classList.remove('combo-pulse');
      void comboEl.offsetWidth;
      comboEl.classList.add('combo-pulse');
    }
  }

  // Difficulty tier
  const tier = getCurrentTier(state.score, DIFFICULTY_TIERS);
  const tierName = getTierName(tier);
  if (tierName !== _lastHudTier) {
    _lastHudTier = tierName;
    const tierEl = document.getElementById('difficulty-tier');
    if (tierEl) {
      tierEl.textContent = tierName;
      tierEl.style.color = getTierColor(tier);
    }
  }

  // Power-up badges
  const shieldBadge = document.getElementById('shield-badge');
  const magnetBadge = document.getElementById('magnet-badge');
  if (shieldBadge) {
    shieldBadge.classList.toggle('active', state.shield);
    shieldBadge.querySelector('.timer').textContent =
      state.shield ? Math.ceil(state.shieldTimer) + 's' : '';
  }
  if (magnetBadge) {
    magnetBadge.classList.toggle('active', state.magnet);
    magnetBadge.querySelector('.timer').textContent =
      state.magnet ? Math.ceil(state.magnetTimer) + 's' : '';
  }
}

// ═══════════════════════════════════════════════════════════════
//  PART 3 — UI, Input, Screens, Game Modes
// ═══════════════════════════════════════════════════════════════


// ── INPUT ────────────────────────────────────────────────────

function setupInput() {
  window.addEventListener('keydown', (e) => {
    if (!state.running && e.key !== 'Escape') return;
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

  // Touch controls
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
      // Tap — jump
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); flashMobileIndicator('mi-jump'); }
    } else if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) { currentLane = Math.min(2, currentLane + 1); flashMobileIndicator('mi-right'); }
      else { currentLane = Math.max(0, currentLane - 1); flashMobileIndicator('mi-left'); }
    } else if (dy < 0) {
      // Swipe up — jump
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); flashMobileIndicator('mi-jump'); }
    }
    if (navigator.vibrate) navigator.vibrate(12);
  }, { passive: true });
}


// ── UI SETUP ─────────────────────────────────────────────────

function setupUI() {
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('best-score').textContent = state.best;

  // Controls hint — adapt for touch
  const controlsHint = document.getElementById('controls-hint-text');
  if (controlsHint && 'ontouchstart' in window) {
    controlsHint.textContent = 'Swipe ← → Switch lanes  |  Tap Jump  |  Pause button';
  }

  // HUD buttons
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('analytics-display').innerHTML = getAnalyticsHTML();
    showScreen('settings-screen');
  });

  // Pause screen
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('pause-settings-btn').addEventListener('click', () => showScreen('settings-screen'));
  document.getElementById('quit-btn').addEventListener('click', quitToMenu);

  // Settings
  document.getElementById('settings-back-btn').addEventListener('click', () => {
    if (state.running) showScreen('pause-screen');
    else showScreen('start-screen');
  });

  // Volume controls
  const musicVol = document.getElementById('music-volume');
  const sfxVol = document.getElementById('sfx-volume');
  const sens = document.getElementById('sensitivity');

  musicVol.addEventListener('input', () => {
    document.getElementById('music-volume-val').textContent = musicVol.value + '%';
    setMusicVolume(musicVol.value);
    try { localStorage.setItem('neonRunnerMusicVol', musicVol.value); } catch (e) {}
  });
  sfxVol.addEventListener('input', () => {
    document.getElementById('sfx-volume-val').textContent = sfxVol.value + '%';
    setSfxVolume(sfxVol.value);
    try { localStorage.setItem('neonRunnerSfxVol', sfxVol.value); } catch (e) {}
  });
  sens.addEventListener('input', () => {
    document.getElementById('sensitivity-val').textContent = sens.value;
    try { localStorage.setItem('neonRunnerSensitivity', sens.value); } catch (e) {}
  });

  // Restore saved settings
  try {
    const savedMusic = localStorage.getItem('neonRunnerMusicVol');
    const savedSfx = localStorage.getItem('neonRunnerSfxVol');
    const savedSens = localStorage.getItem('neonRunnerSensitivity');
    if (savedMusic !== null) { musicVol.value = savedMusic; document.getElementById('music-volume-val').textContent = savedMusic + '%'; setMusicVolume(savedMusic); }
    if (savedSfx !== null) { sfxVol.value = savedSfx; document.getElementById('sfx-volume-val').textContent = savedSfx + '%'; setSfxVolume(savedSfx); }
    if (savedSens !== null) { sens.value = savedSens; document.getElementById('sensitivity-val').textContent = savedSens; }
  } catch (e) {}

  // Build selectors
  buildModeSelector();
  buildCharSelector();
  buildThemeSelector();

  // Stats
  document.getElementById('menu-best').textContent = '🏆 Best: ' + state.best;
  document.getElementById('menu-daily').textContent = '📅 Daily: ' + state.dailyBest;
  document.getElementById('menu-games').textContent = '🎮 Games: ' + state.gamesPlayed;
  document.getElementById('menu-coins').textContent = '💰 Coins: ' + state.coins;
  document.getElementById('menu-streak').textContent = '🔥 Streak: ' + state.streak;

  // Daily challenges
  generateDailyChallenges();
  renderDailyChallenges();

  // Achievements
  document.getElementById('achievements-btn').addEventListener('click', () => {
    renderAchievements();
    showScreen('achievements-screen');
  });
  document.getElementById('ach-back-btn').addEventListener('click', () => showScreen('start-screen'));
}


// ── GAME MODE SELECTOR ───────────────────────────────────────

function buildModeSelector() {
  const container = document.getElementById('mode-selector');
  if (!container) return;
  container.innerHTML = '';

  Object.values(GAME_MODES).forEach(mode => {
    const btn = document.createElement('div');
    btn.className = 'mode-btn' +
      (mode.id === state.gameMode ? ' active' : '') +
      (state.best < mode.unlock ? ' locked' : '');
    btn.innerHTML = '<span class="mode-icon">' + mode.icon + '</span><span class="mode-name">' + mode.name + '</span>';
    btn.title = mode.desc + (state.best < mode.unlock ? ' (Unlock at ' + mode.unlock + ')' : '');
    btn.style.setProperty('--mode-color', mode.color);

    btn.addEventListener('click', () => {
      if (state.best < mode.unlock) return;
      state.gameMode = mode.id;
      try { localStorage.setItem('neonRunnerMode', mode.id); } catch (e) {}
      container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfxThemeChange();
    });

    container.appendChild(btn);
  });
}


// ── CHARACTER SELECTOR ───────────────────────────────────────

function buildCharSelector() {
  const charSel = document.getElementById('char-selector');
  charSel.innerHTML = '';

  CHARACTERS.forEach((char, i) => {
    const btn = document.createElement('div');
    btn.className = 'selector-btn' +
      (i === state.character ? ' active' : '') +
      (state.best < char.unlock ? ' locked' : '');
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
      sfxThemeChange();
    });

    charSel.appendChild(btn);
  });
}


// ── THEME SELECTOR ───────────────────────────────────────────

function buildThemeSelector() {
  const themeSel = document.getElementById('theme-selector');
  themeSel.innerHTML = '';

  Object.keys(THEMES).forEach(key => {
    const t = THEMES[key];
    const btn = document.createElement('div');
    btn.className = 'selector-btn' +
      (key === state.theme ? ' active' : '') +
      (state.best < t.unlock ? ' locked' : '');
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
}


// ── SCREEN MANAGEMENT ────────────────────────────────────────

function showScreen(id) {
  if (showScreenTimeout) clearTimeout(showScreenTimeout);
  const transition = document.getElementById('screen-transition');
  transition.classList.add('active');

  showScreenTimeout = setTimeout(() => {
    ['loading-screen', 'start-screen', 'pause-screen', 'settings-screen',
     'game-over-screen', 'achievements-screen'].forEach(s => {
      document.getElementById(s).classList.add('hidden');
    });
    if (id) document.getElementById(id).classList.remove('hidden');
    transition.classList.remove('active');
    showScreenTimeout = null;
  }, 200);
}


// ── GAME FLOW ────────────────────────────────────────────────

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

function startGame() {
  // Resolve game mode
  const modeId = state.gameMode || 'classic';
  currentMode = GAME_MODES[modeId] || GAME_MODES.classic;

  resetGameState();
  state.running = true;
  state.baseSpeed = currentMode.baseSpeed;
  state.maxSpeed = currentMode.maxSpeed;
  state.speed = currentMode.baseSpeed;
  incrementGamesPlayed();
  updateStreak();
  lastMilestone = 0;
  resetTierIdx();

  currentLane = 1;
  velocityY = 0;
  isJumping = false;
  player.position.set(0, GROUND_Y, 0);
  player.visible = true;
  deathAnimTime = 0;
  player.material.opacity = 1;
  player.material.transparent = false;
  spawnTimer = 0.5;

  applyTheme(state.theme);

  // Clear all active objects
  obstacles.forEach(o => { o.visible = false; }); obstacles = [];
  coins.forEach(c => { c.visible = false; }); coins = [];
  powerups.forEach(p => { p.visible = false; }); powerups = [];
  clearParticles();
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });

  // Reset HUD throttle cache
  _lastHudScore = -1; _lastHudCoins = -1; _lastHudSpeed = '';
  _lastHudCombo = -1; _lastHudTier = '';

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
  triggerFlash(0xff0000, 0.4, 250);

  // Death particle cascade
  spawnParticleBurst(player.position.x, player.position.y, player.position.z, 0xf5a623, 10, scene);
  setTimeout(() => spawnParticleBurst(player.position.x + 0.5, player.position.y + 0.3, player.position.z, 0xff6b35, 8, scene), 80);
  setTimeout(() => spawnParticleBurst(player.position.x - 0.5, player.position.y, player.position.z + 0.5, 0xd946a8, 8, scene), 160);
  setTimeout(() => spawnParticleBurst(player.position.x, player.position.y + 0.5, player.position.z - 0.3, 0x2dd4bf, 8, scene), 240);

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

function quitToMenu() {
  state.running = false;
  state.gameOver = false;
  state.isPaused = false;
  stopBGM();
  stopAmbient();

  obstacles.forEach(o => { o.visible = false; }); obstacles = [];
  coins.forEach(c => { c.visible = false; }); coins = [];
  powerups.forEach(p => { p.visible = false; }); powerups = [];
  clearParticles();
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


// ── PLAYER REBUILD ───────────────────────────────────────────

function rebuildPlayer() {
  const char = CHARACTERS[state.character];
  const geo = getCharacterGeometry(char.shape, THREE);
  const mat = new THREE.MeshStandardMaterial({
    color: char.color,
    emissive: char.color,
    emissiveIntensity: 0.9,
    metalness: 0.5,
    roughness: 0.2,
  });
  playerMat = mat;
  player.geometry.dispose();
  player.geometry = geo;
  player.material = mat;

  // Rebuild children (glow + light)
  player.children.forEach(c => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
    player.remove(c);
  });

  const glowGeo = getCharacterGeometry(char.shape, THREE);
  glowGeo.scale(1.5, 1.5, 1.5);
  const glowMat = new THREE.MeshBasicMaterial({
    color: char.color,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
  });
  player.add(new THREE.Mesh(glowGeo, glowMat));
  player.add(new THREE.PointLight(char.color, 1.0, 10));
}


// ── EFFECTS ──────────────────────────────────────────────────

function showScoreFly(screenX, screenY, text) {
  const el = document.createElement('div');
  el.className = 'score-fly';
  el.textContent = text;
  el.style.left = screenX + 'px';
  el.style.top = screenY + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function showMilestone(distance) {
  const el = document.createElement('div');
  el.textContent = distance + 'm!';
  el.style.cssText = 'position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);' +
    'font-family:Orbitron,monospace;font-size:48px;font-weight:900;color:#2dd4bf;' +
    'text-shadow:0 0 20px #2dd4bf,0 0 40px #1a8f82;pointer-events:none;z-index:100;' +
    'transition:all 0.8s cubic-bezier(0.22,1,0.36,1);opacity:1;';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.top = '20%';
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(1.4)';
  });
  setTimeout(() => el.remove(), 900);
}

function showAchievementPopup(achievement) {
  const el = document.createElement('div');
  el.innerHTML = '<div style="font-size:24px">' + achievement.icon + '</div>' +
    '<div style="font-family:Orbitron,monospace;font-size:14px;font-weight:700;color:#f5a623">' + achievement.name + '</div>' +
    '<div style="font-size:11px;color:rgba(232,244,242,0.5)">' + achievement.desc + '</div>';
  el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(8,18,35,0.92);' +
    'border:1px solid rgba(245,166,35,0.3);border-radius:14px;padding:14px 18px;text-align:center;' +
    'z-index:100;transition:all 0.4s cubic-bezier(0.22,1,0.36,1);opacity:0;transform:translateX(100px);' +
    'box-shadow:0 0 20px rgba(245,166,35,0.2);backdrop-filter:blur(12px);';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });
  sfxPowerup();
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    setTimeout(() => el.remove(), 400);
  }, 3000);
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

function renderAchievements() {
  const list = document.getElementById('achievements-list');
  list.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const unlocked = state.unlockedAchievements.includes(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card' + (unlocked ? ' unlocked' : '');
    card.innerHTML = '<div class="ach-icon">' + a.icon + '</div>' +
      '<div class="ach-name">' + a.name + '</div>' +
      '<div class="ach-desc">' + a.desc + '</div>';
    list.appendChild(card);
  });
}

function triggerShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeDuration = duration;
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


// ── MOBILE INDICATORS ────────────────────────────────────────

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
  indicators.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:center;gap:14px;z-index:50;pointer-events:none;';
  document.body.appendChild(indicators);

  document.querySelectorAll('.mi').forEach(el => {
    el.style.cssText = 'width:64px;height:64px;border-radius:14px;background:rgba(8,18,35,0.6);' +
      'border:1px solid rgba(45,212,191,0.15);display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;gap:2px;backdrop-filter:blur(8px);transition:all 0.08s ease;';
    el.querySelector('.mi-icon').style.cssText = 'font-size:18px;color:rgba(45,212,191,0.5);';
    el.querySelector('.mi-label').style.cssText = 'font-family:Orbitron,monospace;font-size:7px;font-weight:700;letter-spacing:1px;color:rgba(45,212,191,0.3);';
  });
}

function flashMobileIndicator(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = 'rgba(45,212,191,0.25)';
  el.style.borderColor = 'rgba(45,212,191,0.7)';
  el.style.transform = 'scale(0.92)';
  if (navigator.vibrate) navigator.vibrate(10);
  setTimeout(() => {
    el.style.background = 'rgba(8,18,35,0.6)';
    el.style.borderColor = 'rgba(45,212,191,0.15)';
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
          <div class="gesture-text">Tap to jump over obstacles</div>
        </div>
      </div>
      <button id="tutorial-dismiss" class="btn small">GOT IT!</button>
    </div>
  `;
  tutorial.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,8,0.95);z-index:200;display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(tutorial);

  document.getElementById('tutorial-dismiss').addEventListener('click', () => {
    tutorial.remove();
    try { localStorage.setItem('neonRunnerTutorialSeen', '1'); } catch (e) {}
  });
}


// ── SCREENSHOT ───────────────────────────────────────────────

function captureScreenshot() {
  composer.render();
  const link = document.createElement('a');
  link.download = 'neonrunner-' + Math.floor(state.score) + '.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function showShareButton() {
  const btn = document.createElement('button');
  btn.textContent = '📸 SCREENSHOT';
  btn.className = 'btn small share-btn';
  btn.addEventListener('click', () => {
    captureScreenshot();
    btn.remove();
  });
  document.body.appendChild(btn);
  setTimeout(() => { if (btn.parentElement) btn.remove(); }, 5000);
}

// ═══════════════════════════════════════════════════════════════
//  PART 4 — Analytics, Effects, Boot
// ═══════════════════════════════════════════════════════════════


// ── ANALYTICS ────────────────────────────────────────────────

function loadAnalytics() {
  try {
    return JSON.parse(localStorage.getItem('neonRunnerAnalytics') ||
      '{"totalScore":0,"totalGames":0,"totalCoins":0,"bestDistance":0,"deathLanes":[0,0,0]}');
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
  a.totalCoins += state.runCoins;
  const dist = Math.floor(state.score / 10);
  if (dist > a.bestDistance) a.bestDistance = dist;

  // Track death lane
  let laneIdx = 0;
  let closestDist = Infinity;
  LANES.forEach((laneX, idx) => {
    const d = Math.abs(player.position.x - laneX);
    if (d < closestDist) { closestDist = d; laneIdx = idx; }
  });
  a.deathLanes[laneIdx]++;
  saveAnalytics(a);
}

function getAnalyticsHTML() {
  const a = loadAnalytics();
  const avg = a.totalGames > 0 ? Math.floor(a.totalScore / a.totalGames) : 0;
  const favLane = a.deathLanes.indexOf(Math.max(...a.deathLanes));
  const laneNames = ['Left', 'Center', 'Right'];
  return '<div class="stats-panel">' +
    '<div class="stat-row"><span>Avg Score</span><span>' + avg + '</span></div>' +
    '<div class="stat-row"><span>Total Games</span><span>' + a.totalGames + '</span></div>' +
    '<div class="stat-row"><span>Total Coins</span><span>' + a.totalCoins + '</span></div>' +
    '<div class="stat-row"><span>Best Distance</span><span>' + a.bestDistance + 'm</span></div>' +
    '<div class="stat-row"><span>Death Lane</span><span>' + laneNames[favLane] + '</span></div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
//  BOOT SEQUENCE
// ═══════════════════════════════════════════════════════════════

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
