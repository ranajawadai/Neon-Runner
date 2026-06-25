# Neon Runner — Full Game Improvement Plan

> **Goal:** Transform Neon Runner from a polished MVP into a complete, engaging, maintainable browser game with variety, retention, and clean architecture.

**Current State:**
- `game.js`: 1,475 lines (monolith)
- `style.css`: 698 lines
- `index.html`: 162 lines
- No tests, no build system, no modular architecture

**Target State:**
- Modular architecture with clear separation of concerns
- Multiple obstacle types and environments
- Progression system with daily challenges
- Testable, maintainable codebase

---

## Phase 1: Gameplay Variety (Week 1-2)

### 1.1 New Obstacle Types

| Obstacle | Behavior | Visual |
|----------|----------|--------|
| **Laser** | Horizontal beam, periodic on/off | Red glow, pulsing |
| **Rotating Barrier** | Spins in place, wider hitbox | Yellow spinning box |
| **Moving Wall** | Slides left/right across lanes | Orange moving block |
| **Gap** | Jump over or die | Dark hole in ground |

**Implementation:**
- Add new geometry types to `OBSTACLE_GEOMETRIES`
- Add behavior flags to `obstacle.userData`
- Update collision detection for each type
- Add visual effects (glow for lasers, rotation for barriers)

### 1.2 Environment Themes

| Theme | Grid Color | Obstacle Style | Background |
|-------|------------|----------------|------------|
| **Neon City** | Cyan/Pink | Default | Current |
| **Retro Grid** | Green/Yellow | Low-poly | Starfield |
| **Space Station** | Blue/Purple | Floating | Nebula |
| **Underwater** | Teal/Blue | Organic | Bubbles |

**Implementation:**
- Expand `THEMES` object with more properties
- Add theme-specific obstacle colors
- Add background variation per theme
- Theme unlocks based on score milestones

### 1.3 Difficulty Progression

```
Score 0-1000:    Speed 1.0x, single obstacles
Score 1000-3000: Speed 1.5x, 2-obstacle combos
Score 3000-6000: Speed 2.0x, moving obstacles
Score 6000-10000: Speed 2.5x, lasers + rotating barriers
Score 10000+:    Speed 3.0x, all obstacle types
```

**Implementation:**
- Add difficulty tiers to `state`
- Spawn logic checks score tier
- Gradually increase obstacle variety
- Visual feedback for tier changes (milestone celebration)

---

## Phase 2: Retention Hooks (Week 2-3)

### 2.1 Daily Challenges

| Challenge | Reward |
|-----------|--------|
| Score 5,000 | 50 coins |
| Collect 100 coins | 75 coins |
| Reach 10x combo | 100 coins |
| Survive 2 minutes | 150 coins |
| No deaths for 500m | 200 coins |

**Implementation:**
- Add `dailyChallenges` to state
- Generate 3 random challenges per day (seeded by date)
- Track progress in localStorage
- Show challenge UI on start screen
- Reward coins on completion

### 2.2 Coin Economy

```
Coins earned per run: ~10-50 (based on score)
Shop items:
- Character skins: 500-2000 coins
- Trail colors: 200-500 coins
- Starting boost: 100 coins
- Shield start: 150 coins
```

**Implementation:**
- Add `coins` to localStorage (persistent)
- Add shop screen UI
- Add unlockable items
- Add coin display in HUD

### 2.3 Streak System

```
Day 1: 1x multiplier
Day 2: 1.1x multiplier
Day 3: 1.2x multiplier
...
Day 7+: 1.5x multiplier
```

**Implementation:**
- Track last play date in localStorage
- Calculate streak on game start
- Apply multiplier to score
- Show streak badge on start screen

### 2.4 Global Leaderboard

**Implementation:**
- Use localStorage for local leaderboard
- Optional: Firebase/Supabase for global (future)
- Show top 10 scores on start screen
- Show rank after each game

---

## Phase 3: Code Quality (Week 3-4)

### 3.1 Modular Architecture

```
Neon-Runner/
├── index.html
├── style.css
├── js/
│   ├── main.js           — Entry point, game loop
│   ├── config.js          — Constants, themes, characters
│   ├── state.js           — Game state management
│   ├── renderer.js        — Three.js setup, bloom, camera
│   ├── player.js          — Player movement, physics
│   ├── obstacles.js       — Obstacle spawning, types
│   ├── coins.js           — Coin spawning, collection
│   ├── powerups.js        — Power-up system
│   ├── particles.js       — Particle system
│   ├── audio.js           — Procedural audio
│   ├── ui.js              — UI screens, HUD
│   ├── input.js           — Keyboard, touch
│   ├── analytics.js       — Stats tracking
│   └── utils.js           — Helpers
├── tests/
│   ├── state.test.js
│   ├── obstacles.test.js
│   └── coins.test.js
└── manifest.json
```

### 3.2 Testing Strategy

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit tests | Vitest | State, utils, spawn logic |
| Integration | Vitest | Game loop, collision |
| Visual | Manual | Bloom, effects, UI |

**Implementation:**
- Add Vitest for unit testing
- Add npm scripts for test/dev/build
- Write tests for critical paths
- Add CI/CD with GitHub Actions

### 3.3 Performance Optimization

- [ ] Object pooling for all entities
- [ ] Frustum culling
- [ ] Texture atlas for materials
- [ ] LOD for distant objects
- [ ] FPS monitoring with auto-quality

---

## Phase 4: Polish (Week 4-5)

### 4.1 Audio Improvements

- Add ambient sound effects
- Add environmental audio (wind, water)
- Add hit/miss sounds
- Add achievement unlock sounds

### 4.2 Visual Polish

- Add fog for depth
- Add ground reflection
- Add building silhouettes
- Add weather effects (rain, snow)

### 4.3 Mobile Improvements

- Add haptic feedback patterns
- Add portrait/landscape modes
- Add safe area handling
- Add gesture tutorials

---

## Implementation Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P0 | Modular architecture | High | High |
| P0 | New obstacle types | Medium | High |
| P1 | Difficulty progression | Low | High |
| P1 | Daily challenges | Medium | High |
| P2 | Coin economy | Medium | Medium |
| P2 | Testing setup | Medium | Medium |
| P3 | Streak system | Low | Medium |
| P3 | Audio improvements | Low | Medium |
| P4 | Visual polish | Low | Low |
| P4 | Mobile improvements | Low | Low |

---

## Estimated Timeline

- **Week 1:** Modular architecture + new obstacles
- **Week 2:** Difficulty progression + daily challenges
- **Week 3:** Coin economy + testing setup
- **Week 4:** Streak system + audio improvements
- **Week 5:** Polish + mobile improvements

**Total: ~5 weeks for complete transformation**
