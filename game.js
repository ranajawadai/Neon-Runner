// Three.js loaded via CDN script tag (global THREE)

// ---------- Globals ----------
let scene, camera, renderer, clock;
let player, grid, starField, trailLine;
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

const state = {
  running: false,
  gameOver: false,
  isPaused: false,
  speed: 14,
  baseSpeed: 14,
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
};

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

// shared geometry
const OBSTACLE_GEOMETRIES = [
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.ConeGeometry(0.7, 1.4, 4),
  new THREE.BoxGeometry(2.0, 0.8, 0.8)
];
const COIN_GEOMETRY = new THREE.TorusGeometry(0.45, 0.16, 12, 24);

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
let gameTime = 0;

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

init();

function init() {
  console.log('THREE loaded:', typeof THREE !== 'undefined');
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.Fog(0x0a0a1a, 30, 200);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 3.4, 7);
  camera.lookAt(0, 1, -8);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

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

  window.addEventListener('resize', onResize);
  setupInput();
  setupUI();
  initAudio();

  simulateLoading();
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

function buildPlayer() {
  const geo = new THREE.IcosahedronGeometry(0.6, 1);
  player = new THREE.Mesh(geo, playerMat);
  player.position.set(0, GROUND_Y, 0);
  scene.add(player);

  const glowGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  player.add(glow);

  const pl = new THREE.PointLight(0x00ffff, 1.2, 8);
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

function spawnParticleBurst(x, y, z, color) {
  for (let i = 0; i < 12; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    const geo = new THREE.SphereGeometry(0.08, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x, y, z);
    p.userData.vx = (Math.random() - 0.5) * 8;
    p.userData.vy = Math.random() * 6 + 2;
    p.userData.vz = (Math.random() - 0.5) * 4;
    p.userData.life = 0.6;
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
    p.userData.vy -= 20 * dt;
    p.userData.life -= dt;
    p.material.opacity = Math.max(0, p.userData.life / 0.6);
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
  const geo = new THREE.PlaneGeometry(0.02, 2.5);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
  for (let i = 0; i < 24; i++) {
    const line = new THREE.Mesh(geo, mat.clone());
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
  const geo = OBSTACLE_GEOMETRIES[Math.floor(Math.random() * OBSTACLE_GEOMETRIES.length)];
  const m = new THREE.Mesh(geo, obstacleMat);
  m.position.set(x, 0.6, -80);
  scene.add(m);
  obstacles.push(m);
}

function spawnCoinLine(x) {
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const c = new THREE.Mesh(COIN_GEOMETRY, coinMat);
    c.position.set(x, 0.9, -80 - i * 1.8);
    scene.add(c);
    coins.push(c);
  }
}

function spawnPowerup() {
  if (Math.random() > 0.08) return;
  const t = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const geo = new THREE.OctahedronGeometry(0.35, 0);
  const mat = new THREE.MeshStandardMaterial({ color: t.color, emissive: t.color, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
  const m = new THREE.Mesh(geo, mat);
  const lane = LANES[Math.floor(Math.random() * 3)];
  m.position.set(lane, 1.0, -80);
  m.userData.type = t.type;
  scene.add(m);
  powerups.push(m);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.running && !state.gameOver && !state.isPaused) {
    if (gameTime === undefined) { gameTime = 0; }
    gameTime++;
    if (gameTime === 3) {
      console.log('scene.children:', scene.children.length);
      console.log('renderer.info:', JSON.stringify(renderer.info.render));
      console.log('camera pos:', camera.position.x, camera.position.y, camera.position.z);
      console.log('player pos:', player.position.x, player.position.y, player.position.z);
      console.log('player visible:', player.visible);
      console.log('fog:', scene.fog ? scene.fog.near + '-' + scene.fog.far : 'none');
    }

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
      if (Math.abs(o.position.x - px) < 0.85 && Math.abs(oz - pz) < 1.0 && Math.abs(o.position.y - py) < 0.95) {
        if (state.shield) {
          state.shield = false;
          state.shieldTimer = 0;
          spawnParticleBurst(o.position.x, o.position.y, o.position.z, 0x00ff88);
          scene.remove(o);
          o.geometry.dispose();
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
          spawnParticleBurst(c.position.x, c.position.y, c.position.z, 0xffe14d);
          sfxCoin();
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
        scene.remove(c);
        c.geometry.dispose();
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
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        powerups.splice(i, 1);
        continue;
      }
      if (p.position.z > DESPAWN_Z) {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
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
  } else {
    player.rotation.y += dt * 0.8;
  }

  updateParticles(dt);
  updateShake(dt);

  renderer.render(scene, camera);
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  triggerShake(0.5, 0.4);
  spawnParticleBurst(player.position.x, player.position.y, player.position.z, 0xff1463);
  stopBGM();
  sfxDeath();
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem('neonRunnerBest', state.best);
  }
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
  const canvas = document.getElementById('game-canvas');
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
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); }
    } else if (absX > absY) {
      if (dx > 0) currentLane = Math.min(2, currentLane + 1);
      else currentLane = Math.max(0, currentLane - 1);
    } else if (dy < 0) {
      if (!isJumping) { velocityY = JUMP_FORCE; isJumping = true; sfxJump(); }
    }
  }, { passive: true });
}

function setupUI() {
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('best-score').textContent = state.best;

  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings-screen'));
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('pause-settings-btn').addEventListener('click', () => showScreen('settings-screen'));
  document.getElementById('quit-btn').addEventListener('click', quitToMenu);
  document.getElementById('settings-back-btn').addEventListener('click', () => {
    if (state.running) showScreen('pause-screen');
    else showScreen('start-screen');
  });

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

function showScreen(id) {
  ['loading-screen', 'start-screen', 'pause-screen', 'settings-screen', 'game-over-screen'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  if (id) document.getElementById(id).classList.remove('hidden');
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
  obstacles.forEach(o => { scene.remove(o); o.geometry.dispose(); });
  obstacles = [];
  coins.forEach(c => { scene.remove(c); c.geometry.dispose(); });
  coins = [];
  particles.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  particles.length = 0;
  powerups.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  powerups.length = 0;
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
  currentLane = 1;
  velocityY = 0;
  isJumping = false;
  player.position.set(0, GROUND_Y, 0);
  spawnTimer = 0.5;

  obstacles.forEach(o => { scene.remove(o); o.geometry.dispose(); });
  obstacles = [];
  coins.forEach(c => { scene.remove(c); c.geometry.dispose(); });
  coins = [];
  particles.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  particles.length = 0;
  trailPositions.length = 0;
  shakeDuration = 0;
  speedLines.forEach(l => { l.visible = false; l.material.opacity = 0; });
  powerups.forEach(p => { scene.remove(p); p.geometry.dispose(); p.material.dispose(); });
  powerups.length = 0;
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
  const comboStr = state.combo >= 5 ? ` x${state.multiplier.toFixed(1)}` : '';
  const powerStr = (state.magnet ? ' [MAGNET]' : '') + (state.shield ? ' [SHIELD]' : '');
  document.getElementById('speed').textContent = speedStr + comboStr + powerStr;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
