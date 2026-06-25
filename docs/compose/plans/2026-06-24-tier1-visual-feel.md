# Tier 1: Visual Feel Transformation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Neon Runner from flat geometric shapes into a polished neon cyberpunk game with bloom, dynamic effects, and screen polish.

**Architecture:** Add Three.js post-processing (UnrealBloomPass) for neon glow, enable speed lines, improve particle system, add near-miss feedback, and implement screen transitions. All changes stay within the existing `game.js` monolith.

**Tech Stack:** Three.js r128, Web Audio API, vanilla JS

---

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Add Three.js post-processing imports (EffectComposer, RenderPass, UnrealBloomPass) |
| `game.js` | All game logic changes (bloom setup, speed lines, particles, transitions, near-miss) |
| `style.css` | Screen transition CSS, near-miss overlay, UI animation keyframes |

---

## Task 1: Add Bloom/Post-Processing for Neon Glow

**Covers:** Visual Quality — the single highest-impact change

**Files:**
- Modify: `index.html:143` — add post-processing script imports
- Modify: `game.js:258-300` — add bloom composer setup after renderer init
- Modify: `game.js:892` — render via composer instead of renderer

- [ ] **Step 1: Add Three.js post-processing imports to index.html**

In `index.html`, after the Three.js CDN script tag (line 143), add:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
```

- [ ] **Step 2: Add bloom composer variables in game.js**

After the existing global variables (around line 6, after `let player, grid, starField, trailLine;`), add:

```javascript
let composer, bloomPass;
```

- [ ] **Step 3: Create bloom setup function in game.js**

Add this function before `init()` (around line 256):

```javascript
function setupBloom() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,   // strength
    0.4,   // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);
}
```

- [ ] **Step 4: Call setupBloom() inside init()**

In `init()`, after `renderer.domElement` is prepended to game-container (around line 275), add:

```javascript
setupBloom();
```

- [ ] **Step 5: Replace renderer.render with composer.render in animate()**

In `animate()`, find line 892:
```javascript
renderer.render(scene, camera);
```

Replace with:
```javascript
composer.render();
```

- [ ] **Step 6: Update onResize to handle composer**

In `onResize()`, after `renderer.setSize(window.innerWidth, window.innerHeight);`, add:

```javascript
composer.setSize(window.innerWidth, window.innerHeight);
```

- [ ] **Step 7: Visual verification**

Open the game in a browser. Confirm:
- Emissive materials now glow with bloom halo
- Player, coins, obstacles, and grid have visible light bleed
- No performance regression (should stay 60fps)

---

## Task 2: Enable and Improve Speed Lines

**Covers:** Visual Quality, Game Feel — conveys speed sensation

**Files:**
- Modify: `game.js:478-480` — implement buildSpeedLines()
- Modify: `game.js:482-499` — update speed line rendering

- [ ] **Step 1: Implement buildSpeedLines()**

Replace the empty `buildSpeedLines()` function (lines 478-480):

```javascript
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
```

- [ ] **Step 2: Visual verification**

Start a game. Confirm speed lines appear when speed exceeds 1.3x and fade in with opacity.

---

## Task 3: Improve Particle System

**Covers:** Visual Quality, Effects — particles must be visible and impactful

**Files:**
- Modify: `game.js:404-418` — improve spawnParticleBurst()

- [ ] **Step 1: Replace spawnParticleBurst with enhanced version**

Replace `spawnParticleBurst()` (lines 404-418):

```javascript
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
```

- [ ] **Step 2: Update updateParticles for size scaling**

Replace `updateParticles()` (lines 420-436):

```javascript
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
```

- [ ] **Step 3: Update coin collect burst call**

In the coin collection block (around line 785), update the spawnParticleBurst call:

```javascript
spawnParticleBurst(c.position.x, c.position.y, c.position.z, 0xffe14d, 10);
```

- [ ] **Step 4: Visual verification**

Collect coins. Confirm particles are visible, burst outward in a circle, scale down as they fade.

---

## Task 4: Add Near-Miss Feedback

**Covers:** Game Feel — reward skilled play with visual/audio feedback

**Files:**
- Modify: `game.js:867-873` — add near-miss visual trigger
- Modify: `game.js:197-200` — add near-miss sound
- Modify: `style.css` — add near-miss overlay class

- [ ] **Step 1: Add near-miss sound function in game.js**

After `sfxCoin()` (around line 200), add:

```javascript
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
```

- [ ] **Step 2: Add near-miss overlay CSS in style.css**

Add at the end of `style.css`:

```css
.near-miss-flash {
  position: fixed;
  inset: 0;
  border: 3px solid rgba(0, 255, 255, 0.6);
  box-shadow: inset 0 0 60px rgba(0, 255, 255, 0.3);
  pointer-events: none;
  z-index: 15;
  opacity: 0;
  transition: opacity 0.1s;
}

.near-miss-flash.active {
  opacity: 1;
}
```

- [ ] **Step 3: Add near-miss overlay element in index.html**

In `index.html`, after the `<div id="hud">` closing tag (line 53), add:

```html
<div id="near-miss-overlay" class="near-miss-flash"></div>
```

- [ ] **Step 4: Update near-miss detection in game.js**

Replace the near-miss detection block (lines 867-873):

```javascript
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
```

- [ ] **Step 5: Visual verification**

Play a game and narrowly dodge obstacles. Confirm:
- Cyan border flash appears
- Subtle audio ping plays
- +50 score bonus awarded

---

## Task 5: Add Score Fly-Ups on Coin Collect

**Covers:** UI/UX, Game Feel — immediate feedback loop

**Files:**
- Modify: `game.js:785-793` — add score fly-up element creation
- Modify: `style.css` — add score-fly animation

- [ ] **Step 1: Add score fly CSS in style.css**

Add at the end of `style.css`:

```css
.score-fly {
  position: fixed;
  font-size: 18px;
  font-weight: 800;
  color: #ffe14d;
  text-shadow: 0 0 10px rgba(255, 225, 77, 0.6);
  pointer-events: none;
  z-index: 25;
  animation: scoreFly 0.6s ease-out forwards;
}

@keyframes scoreFly {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
}
```

- [ ] **Step 2: Add score fly function in game.js**

Add this function before `animate()`:

```javascript
function showScoreFly(screenX, screenY, text) {
  const el = document.createElement('div');
  el.className = 'score-fly';
  el.textContent = text;
  el.style.left = screenX + 'px';
  el.style.top = screenY + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}
```

- [ ] **Step 3: Add screen-space conversion and fly-up in coin collect**

In the coin collection block, after `spawnParticleBurst` and `sfxCoin()`, add:

```javascript
const vec = new THREE.Vector3(c.position.x, c.position.y, c.position.z);
vec.project(camera);
const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
const pts = Math.floor(10 * state.multiplier);
showScoreFly(sx, sy, '+' + pts);
```

- [ ] **Step 4: Visual verification**

Collect coins. Confirm "+10" (or higher with multiplier) floats up from the coin's screen position.

---

## Task 6: Add Screen Transitions

**Covers:** UI/UX — eliminate jarring pop-in/out

**Files:**
- Modify: `style.css` — add transition overlay and animations
- Modify: `game.js:1099-1104` — update showScreen() with transitions

- [ ] **Step 1: Add transition CSS in style.css**

Add at the end of `style.css`:

```css
.screen-transition {
  position: fixed;
  inset: 0;
  background: #0a0a1a;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-in-out;
}

.screen-transition.active {
  opacity: 1;
  pointer-events: all;
}
```

- [ ] **Step 2: Add transition overlay element in index.html**

In `index.html`, just before the closing `</div>` of `game-container` (line 141), add:

```html
<div id="screen-transition" class="screen-transition"></div>
```

- [ ] **Step 3: Update showScreen() in game.js**

Replace `showScreen()` (lines 1099-1104):

```javascript
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
```

- [ ] **Step 4: Visual verification**

Navigate between screens (start → pause → settings → back). Confirm fade-to-black transitions between each.

---

## Task 7: Improve Combo Display in HUD

**Covers:** UI/UX — player must see multiplier building

**Files:**
- Modify: `game.js:1188-1195` — enhance updateHUD()
- Modify: `style.css` — add combo pulse animation

- [ ] **Step 1: Add combo pulse CSS in style.css**

Add at the end of `style.css`:

```css
.combo-pulse {
  animation: comboPulse 0.3s ease-out;
}

@keyframes comboPulse {
  0% { transform: scale(1.3); color: #ffdd00; }
  100% { transform: scale(1); }
}
```

- [ ] **Step 2: Add combo element to HUD in index.html**

In the HUD section, after the speed `hud-item` (around line 47), add:

```html
<div class="hud-item">
  <span class="hud-label">COMBO</span>
  <span id="combo" class="hud-value" style="color:#ffdd00;text-shadow:0 0 12px rgba(255,221,0,0.6);">0</span>
</div>
```

- [ ] **Step 3: Update updateHUD() in game.js**

Replace `updateHUD()` (lines 1188-1195):

```javascript
function updateHUD() {
  document.getElementById('score').textContent = Math.floor(state.score);
  document.getElementById('coins').textContent = state.coins;
  const speedStr = (state.speed / state.baseSpeed).toFixed(1) + 'x';
  const powerStr = (state.magnet ? ' [MAGNET]' : '') + (state.shield ? ' [SHIELD]' : '');
  document.getElementById('speed').textContent = speedStr + powerStr;

  const comboEl = document.getElementById('combo');
  const comboText = state.combo >= 5 ? state.combo + ' (x' + state.multiplier.toFixed(1) + ')' : state.combo;
  if (comboEl.textContent !== String(state.combo)) {
    comboEl.classList.remove('combo-pulse');
    void comboEl.offsetWidth;
    comboEl.classList.add('combo-pulse');
  }
  comboEl.textContent = comboText;
}
```

- [ ] **Step 4: Visual verification**

Play a game, collect coins consecutively. Confirm combo counter increments, shows multiplier at 5+, pulses on change.

---

## Task 8: Pool Power-Up Geometry (Performance Fix)

**Covers:** Performance — prevent memory leaks

**Files:**
- Modify: `game.js:684-695` — pool power-up creation

- [ ] **Step 1: Add power-up pool variables**

After `const COIN_POOL_SIZE = 40;` (line 87), add:

```javascript
const powerupPool = [];
const POWERUP_POOL_SIZE = 10;
```

- [ ] **Step 2: Replace spawnPowerup() with pooled version**

Replace `spawnPowerup()` (lines 684-695):

```javascript
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
```

- [ ] **Step 3: Update power-up collection to hide instead of dispose**

In the power-up collection block (lines 818-821), replace:

```javascript
scene.remove(p);
p.geometry.dispose();
p.material.dispose();
powerups.splice(i, 1);
```

With:

```javascript
p.visible = false;
powerups.splice(i, 1);
```

Do the same for the power-up despawn block (lines 824-828).

- [ ] **Step 4: Visual verification**

Play multiple games. Confirm power-ups still spawn, can be collected, and no memory growth in DevTools Performance tab.

---

## Summary

| Task | Impact | Effort |
|------|--------|--------|
| 1. Bloom/Post-Processing | HIGH | Medium |
| 2. Speed Lines | MEDIUM | Low |
| 3. Particle System | MEDIUM | Low |
| 4. Near-Miss Feedback | HIGH | Low |
| 5. Score Fly-Ups | MEDIUM | Low |
| 6. Screen Transitions | MEDIUM | Low |
| 7. Combo Display | MEDIUM | Low |
| 8. Power-Up Pooling | LOW (perf) | Low |

**Estimated Total Effort:** 2-3 hours of implementation

**Verification:** After all tasks, run the game and confirm:
- [ ] Neon bloom visible on all emissive materials
- [ ] Speed lines appear above 1.3x speed
- [ ] Particles burst outward and scale down
- [ ] Near-miss gives visual + audio + score feedback
- [ ] Coin collect shows floating score text
- [ ] Screen transitions fade between views
- [ ] Combo counter pulses and shows multiplier
- [ ] No memory leaks in DevTools
