# Neon Runner v3.0 — Complete Upgrade Design

**Date:** 2026-06-29
**Author:** Rana Jawad + Claude
**Status:** Approved

---

## 1. Overview

Neon Runner is a 3D endless runner game built with Three.js. The v3.0 upgrade aims to transform it from a basic game (7/10) to a premium, AAA-quality browser game (9/10) with professional graphics, immersive sound, and engaging features.

### Current State
- 4,284 lines of code
- 101 tests passing
- 7 game modes (Classic, Speed, Zen, Hardcore + 3 locked)
- 6 themes, 6 characters, 8 achievements
- Basic procedural audio (Web Audio API)
- No background music, basic SFX

### Target State
- Premium 3D graphics with post-processing
- Synthwave background music with beat sync
- 16+ achievements, leaderboard, daily events
- Social sharing, screenshot functionality
- 9/10 overall quality

---

## 2. Graphics & Effects

### 2.1 3D Models & Animations

**Player:**
- Smooth rotation animation (Y-axis spin)
- Trail effect behind player (line geometry)
- Glow pulse effect (emissive oscillation)
- Shadow on ground (circle mesh)

**Obstacles:**
- Different visual per type (cube, pyramid, wall, laser, spinner, slider)
- Behavior animations (spinning, pulsing, sliding)
- Material variants per type

**Coins:**
- Spinning animation (Y-axis rotation)
- Collection burst effect (particles)
- Score fly-up text

**Powerups:**
- Floating animation (sine wave Y position)
- Pickup burst effect (particles)
- HUD badge with timer

### 2.2 Particle & VFX

**Explosion Particles:**
- On death: 4-burst cascade with different colors
- Particle pool for performance
- Swap-and-pop removal (O(1))

**Speed Lines:**
- 20 line geometries that appear at speed > 1.3x
- Opacity increases with speed
- Random positions, recycle when past camera

**Near-Miss Flash:**
- Screen border flash on near-miss
- 100ms duration, cyan color

**Combo Visual:**
- HUD combo counter pulses on increment
- Scale animation (1.2 → 1.0)

**Screen Shake:**
- On collision: camera shake
- Intensity: 0.8, duration: 0.6s
- Decay: 0.92 per frame

### 2.3 Lighting & Effects

**Post-Processing:**
- UnrealBloomPass (strength: 0.6, radius: 0.4, threshold: 0.6)
- ACES Filmic tone mapping
- Exposure: 1.3

**Dynamic Lights:**
- Ambient light (white, intensity 0.8)
- Hemisphere light (sky/ground)
- Directional light (overhead)
- 2 accent point lights (cyan + red)

**Fog:**
- FogExp2, density 0.001
- Matches background color

### 2.4 Environment

**Ground:**
- Large plane (200x1000) — no visible edges
- Grid overlay (1000x1000) — scrolling effect

**Background:**
- 3 layers of small buildings (z=-200 to -360)
- Parallax scrolling (different speeds per layer)
- Stars (500 points, subtle blue)

**Lane Markers:**
- Divider lines between lanes
- Dot indicators along lanes

---

## 3. Sound & Music

### 3.1 Background Music

**Procedural BGM:**
- 4 oscillators: bass (sawtooth 55Hz), sub (sine 55Hz), arp (square 220Hz), LFO
- Music intensity increases with speed
- Start/stop on game start/pause/game over

**Music Intensity:**
- Base: 55Hz bass, 220Hz arp
- At 2x speed: 85Hz bass, 440Hz arp, faster LFO
- Smooth transitions

### 3.2 Sound Effects

**Existing SFX:**
- sfxCoin: 880Hz + 1320Hz sine
- sfxJump: 300→600Hz sweep
- sfxDeath: 200Hz sawtooth + 150Hz square
- sfxPowerup: 523Hz + 659Hz + 784Hz arpeggio
- sfxNearMiss: 1200→800Hz sweep
- sfxTierUp: 440Hz + 554Hz + 659Hz + 880Hz arpeggio
- sfxHit: 100Hz sawtooth + 80Hz square
- sfxCombo: 660Hz + 880Hz
- sfxShift: 500→350Hz sweep
- sfxThemeChange: 330Hz + 440Hz

### 3.3 Ambient Sounds

**Wind Noise:**
- Sawtooth 80Hz through lowpass filter (200Hz)
- LFO modulates filter frequency
- Intensity increases with speed

**Ambient Intensity:**
- Base: 200Hz filter, 0.08 gain
- At 2x speed: 500Hz filter, 0.12 gain

### 3.4 Audio Controls

**Volume Controls:**
- Music volume (0-100%)
- SFX volume (0-100%)
- Persisted to localStorage

---

## 4. Features & Engagement

### 4.1 Leaderboard & Scores

**Local High Score Table:**
- Top 10 scores per game mode
- Stored in localStorage
- Display in settings screen

**Personal Best:**
- Best score overall
- Best score per mode
- Daily best
- Displayed on start screen

**Statistics Dashboard:**
- Total games played
- Total score
- Total coins
- Best distance
- Death lane analysis
- Average score

### 4.2 Achievements & Unlocks

**16 Achievements:**
- Score milestones (1k, 5k, 10k, 25k)
- Coin milestones (100, 500, 1000)
- Combo milestones (5x, 10x, 20x)
- Speed milestones (2x, 3x, 4x)
- Games played (10, 50, 100)
- Special (near-miss 10, perfect run)

**Unlockables:**
- 6 characters (unlock at score milestones)
- 6 themes (unlock at score milestones)
- 4 game modes (unlock at score milestones)

### 4.3 Daily/Weekly Events

**Daily Challenges:**
- 3 random challenges per day
- Seeded random (same challenges for all)
- Reward: bonus coins
- Progress persisted to localStorage

**Challenge Types:**
- Score milestones (5k, 10k)
- Coin collection (50, 100)
- Combo milestones (5x, 10x)
- Perfect run (500m without hit)
- Games played (3)

### 4.4 Social & Sharing

**Screenshot:**
- Capture canvas as PNG
- Filename: neonrunner-{score}.png
- Share button appears on game over

**Share Options:**
- Download screenshot
- Copy score text
- (Future: social media integration)

---

## 5. Architecture

### 5.1 Current Structure
```
js/
├── main.js        (1935 lines) — everything
├── audio.js       (247 lines) — procedural audio
├── config.js      (224 lines) — game config
├── state.js       (152 lines) — state management
├── particles.js   (109 lines) — particle system
├── challenges.js  (137 lines) — daily challenges
├── difficulty.js  (47 lines) — difficulty tiers
└── utils.js       (93 lines) — utilities
```

### 5.2 Target Structure (Future Refactor)
```
js/
├── renderer.js    — Three.js setup, bloom, resize
├── scene.js       — lights, ground, environment
├── gameLoop.js    — animate(), physics, collision
├── input.js       — keyboard, touch, gestures
├── ui.js          — screen management, HUD, settings
├── spawner.js     — obstacle/coin/powerup spawning
├── effects.js     — particles, shake, flash
└── analytics.js   — death tracking, stats
```

**Note:** Architecture refactor deferred to v3.1 to minimize risk.

---

## 6. Testing Strategy

### 6.1 Current Coverage
- utils.test.js: 10 tests ✅
- state.test.js: 18 tests ✅
- difficulty.test.js: 7 tests ✅
- challenges.test.js: 7 tests ✅
- config.test.js: 32 tests ✅
- audio.test.js: 22 tests ✅
- particles.test.js: 9 tests ✅
- **Total: 101 tests**

### 6.2 New Tests Needed
- Leaderboard tests
- Achievement tests
- Screenshot tests
- Share functionality tests

---

## 7. Implementation Order

### Phase 1: Graphics & Effects (Current)
- [x] Player shadow
- [x] Trail effect
- [x] Speed lines
- [x] Particle system
- [x] Screen shake
- [x] Near-miss flash
- [x] Combo pulse
- [x] Bloom post-processing
- [x] Dynamic lighting
- [x] Environment (ground, grid, buildings, stars)

### Phase 2: Sound & Music
- [x] Procedural BGM
- [x] SFX (jump, coin, death, powerup, etc.)
- [x] Ambient wind noise
- [x] Music intensity scaling
- [x] Volume controls

### Phase 3: Features
- [x] Daily challenges
- [x] Achievements (8)
- [x] Statistics dashboard
- [x] Screenshot functionality
- [ ] Leaderboard (local)
- [ ] More achievements (16)
- [ ] Share functionality

### Phase 4: Polish
- [x] Premium UI
- [x] Responsive design
- [x] Accessibility
- [x] Performance optimization

---

## 8. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Overall Score | 7/10 | 9/10 |
| Graphics | 7/10 | 9/10 |
| Sound | 6/10 | 8/10 |
| Features | 6/10 | 8/10 |
| Testing | 7/10 | 8/10 |
| Performance | 8/10 | 9/10 |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| main.js too large | High | Defer refactor to v3.1 |
| AudioContext browser support | Medium | Fallback to no audio |
| Performance on mobile | Medium | Adaptive quality settings |
| localStorage limits | Low | Clean old data periodically |

---

## 10. Approval

- [x] Design approved by user
- [ ] Implementation started
- [ ] Testing complete
- [ ] Deployed to production
