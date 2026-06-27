<div align="center">

# NEON RUNNER

### *A Premium Bioluminescent 3D Endless Runner*

**[PLAY NOW](https://ranajawadai.github.io/Neon-Runner/)** • **[REPORT BUG](https://github.com/ranajawadai/Neon-Runner/issues)** • **[CONTRIBUTE](#contributing)**

![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/ranajawadai/Neon-Runner?style=for-the-badge&color=yellow)

<br>

**A fast-paced, bioluminescent 3D endless runner** with bloom post-processing, procedural audio, and buttery-smooth 60fps gameplay. Zero external assets — everything is generated in real-time. Dive through six depth zones, from sunlit shallows to the bioluminescent abyss.

[![Demo](https://img.shields.io/badge/WATCH-DEMO-red?style=for-the-badge&logo=youtube&logoColor=white)](https://ranajawadai.github.io/Neon-Runner/)

</div>

---

## Why Neon Runner?

> *"Most browser games feel like prototypes. This one feels like a product."*

- **Bloom post-processing** — real bioluminescent glow, not just bright colors
- **Six depth zones** — Shallows, Kelp Forest, Twilight Reef, Abyssal Trench, Hydrothermal Vent, Bioluminescent Abyss, unlocked by score
- **Procedural everything** — audio, particles, effects, all generated at runtime
- **Buttery smooth** — 60fps with object pooling, optimized rendering, and automatic bloom downgrade on low-end hardware
- **Mobile-first** — swipe controls, responsive UI, PWA installable
- **Zero dependencies** — just Three.js via CDN, no build step required

---

## Gameplay

<div align="center">

```
DODGE ← → COLLECT COINS ← → SURVIVE ← → REPEAT
```

</div>

| | |
|---|---|
| **3-lane runner** | Switch lanes with spring-damped movement — feels responsive, not robotic |
| **Coin collection** | Grab coins for score — consecutive picks build combo multiplier |
| **Power-ups** | Magnet pulls coins, Shield absorbs hits, Multiplier gives 3x score |
| **Near-miss bonus** | Dodge obstacles narrowly for +50 score and visual feedback |
| **Combo system** | Chain pickups for increasing multipliers with HUD pulse animation |
| **Procedural audio** | Multi-oscillator synth soundtrack that evolves with speed |

---

## Features

<details>
<summary><b>Core Gameplay</b></summary>

- 6 obstacle types: cubes, pyramids, walls, lasers, spinners, sliding panels
- Moving obstacles that shift lanes
- Jump physics with gravity
- Dynamic speed ramp across 5 difficulty tiers
- Combo multiplier (up to 3x+)
- High score saved to localStorage
- Daily best tracking + daily challenges (3 random challenges per day, coin rewards)
- Achievement system (8 achievements)
- 6 unlockable depth-zone themes + 6 unlockable characters, both gated by best score

</details>

<details>
<summary><b>Visual Effects</b></summary>

- **Bloom post-processing** — UnrealBloomPass for authentic neon glow
- **Enhanced particles** — circular bursts with size scaling on fade
- **Near-miss feedback** — cyan border flash + audio ping
- **Score fly-ups** — floating "+10" text on coin collect
- **Death animation** — player spins, fades, and falls
- **Player trail** — cyan glow line
- **Speed lines** — appear above 1.3x speed
- **Screen transitions** — smooth fade-to-black between views
- **Button animations** — ripple effects, hover transforms, shimmer loading bar

</details>

<details>
<summary><b>Audio</b></summary>

- **Multi-oscillator BGM** — sawtooth bass, sine sub bass, square arpeggio
- **Speed-reactive music** — intensity increases with player speed
- Coin pickup chime
- Jump whoosh
- Death explosion
- Power-up arpeggio
- Near-miss ping
- Volume controls in settings

</details>

<details>
<summary><b>Power-ups</b></summary>

| Power-up | Color | Duration | Effect |
|----------|-------|----------|--------|
| **Magnet** | Pink | 8s | Attracts nearby coins with visual indicator |
| **Shield** | Green | 10s | Absorbs one hit with visual indicator |
| **Multiplier** | Gold | Instant | 3x score |

</details>

<details>
<summary><b>UI/UX</b></summary>

- Animated loading screen with shimmer effect
- Pause menu (ESC)
- Settings panel (volume, sensitivity)
- Combo counter with pulse animation
- Power-up indicators with countdown timers
- PWA support — installable on mobile/desktop
- Responsive design with mobile-specific scaling
- Accessibility: ARIA labels, reduced-motion support, high contrast mode

</details>

---

## Quick Start

### Play Instantly

**[Click here to play →](https://ranajawadai.github.io/Neon-Runner/)**

No installation needed. Works in any modern browser.

### Local Development

```bash
# Clone the repo
git clone https://github.com/ranajawadai/Neon-Runner.git
cd Neon-Runner

# Start a local server (pick one)
python -m http.server 8080    # Python
npx serve .                   # Node.js
php -S localhost:8080         # PHP

# Open in browser
open http://localhost:8080
```

> **Note:** ES modules require an HTTP server. Opening `index.html` directly won't work.

---

## Controls

| Input | Action |
|-------|--------|
| `←` `→` / `A` `D` | Switch lanes |
| `Space` / `↑` / `W` | Jump |
| `ESC` | Pause |
| Swipe left/right | Switch lanes (mobile) |
| Tap | Jump (mobile) |

---

## Tech Stack

```
├── Three.js r128      — 3D rendering + bloom post-processing
├── Web Audio API      — Multi-oscillator procedural soundtrack
├── CSS3               — Neon cyberpunk theme + animations
├── HTML5              — Semantic markup + ARIA accessibility
└── Vanilla JS         — Zero build step, zero dependencies
```

| Metric | Value |
|--------|-------|
| External dependencies | 1 (Three.js via CDN) |
| Audio files | 0 (all procedural) |
| Bundle size | ~0KB (CDN-loaded) |
| Load time | <1s |
| Frame rate | 60fps (adaptive bloom downgrade below 30fps) |
| Platforms | Desktop, Mobile, Tablet |
| Browsers | Chrome, Firefox, Safari, Edge |

---

## Project Structure

```
Neon-Runner/
├── index.html        — Entry point + UI screens + ARIA labels
├── style.css         — Cyberpunk theme + animations + mobile scaling
├── manifest.json     — PWA manifest
├── js/
│   ├── main.js       — Entry point: init, render loop, input, UI wiring
│   ├── config.js     — Constants: lanes, themes, characters, tiers, physics
│   ├── state.js       — Game state + localStorage persistence
│   ├── audio.js       — Procedural BGM/SFX/ambient (Web Audio API)
│   ├── difficulty.js  — Tier lookup + tier-change UI/audio
│   ├── particles.js   — Particle bursts + weather effects
│   ├── utils.js       — Shuffle, seeded RNG, tier/obstacle helpers
│   └── challenges.js  — Daily challenge generation + tracking
├── tests/             — Vitest unit tests (state, utils, difficulty)
├── archive/           — Pre-refactor legacy code, not loaded by the game
└── README.md         — This file
```

> `index.html` loads `js/main.js` as an ES module. All gameplay code lives
> under `js/`. The `archive/` folder contains an old, unused single-file
> version kept for reference only.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         THREE.js + Bloom Post-Processing │
├─────────────────────────────────────────┤
│  Scene → Camera → Lights → Bloom Pass   │
├─────────────────────────────────────────┤
│           Game Loop (60fps)              │
│  ┌───────────┬───────────┬───────────┐  │
│  │  Physics  │   Spawn   │  Collide  │  │
│  │ (gravity, │ (obs/coin │ (3-axis   │  │
│  │  easing)  │ /powerup) │  check)   │  │
│  └───────────┴───────────┴───────────┘  │
├─────────────────────────────────────────┤
│  Systems: Particles (pooled), Shake,    │
│  Trail, Speed Lines, Magnet, Shield,    │
│  Combo, Near-Miss, Death Animation      │
├─────────────────────────────────────────┤
│  Audio: Multi-oscillator synth          │
│  (bass + sub + arpeggio + LFO)          │
├─────────────────────────────────────────┤
│  UI: DOM overlays with transitions,     │
│  ARIA labels, mobile scaling            │
└─────────────────────────────────────────┘
```

---

## What's New (v2.0)

### Visual Overhaul
- Bloom post-processing for authentic neon glow
- Enhanced particle system with circular bursts
- Score fly-ups on coin collect
- Near-miss feedback (cyan flash + audio ping)
- Power-up visual indicators with timers
- Screen transitions between views

### Game Feel
- Spring-damped lane switching (responsive, no shake)
- Death animation (spin, fade, fall)
- Combo counter with pulse animation
- Button ripple effects and hover transforms

### Audio
- Multi-oscillator BGM (bass + sub + arpeggio)
- Speed-reactive music intensity
- Near-miss audio feedback

### Performance
- Object pooling for obstacles, coins, particles, power-ups
- Memory leak fixes (material disposal)
- Frame-rate independent physics

### Accessibility
- ARIA labels on all interactive elements
- Reduced-motion media query support
- High-contrast mode support
- Mobile-specific UI scaling

---

## Contributing

Contributions welcome! Here's how:

1. **Fork** the repo
2. **Create** a branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for contributions:

- New obstacle types beyond the current 6
- New power-ups (slow-mo, double jump, score multiplier)
- Global leaderboard
- Additional depth zones beyond the current 6
- Sound effect and music variety per theme
- Unit test coverage for `main.js` (currently only `state.js`, `utils.js`, `difficulty.js` are tested)

---

## Roadmap

- [x] Core 3-lane runner
- [x] 6 obstacle types + moving/pulsing/spinning/sliding behaviors
- [x] Coin system + combo multiplier
- [x] Power-ups (Magnet, Shield, Multiplier)
- [x] Bloom post-processing
- [x] Enhanced particle system
- [x] Near-miss feedback
- [x] Score fly-ups
- [x] Screen transitions
- [x] Multi-oscillator BGM
- [x] Object pooling (performance)
- [x] Mobile scaling + accessibility
- [x] Achievement system
- [x] Daily challenges
- [x] Multiple depth-zone environments (6 themes)
- [x] Stats tracking (in-settings analytics panel)
- [ ] Global leaderboard

---

## License

MIT License — use it however you want.

```
MIT License

Copyright (c) 2026 Rana Jawad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Made with Three.js and a lot of neon**

Star this repo if you enjoyed the game!

[![GitHub followers](https://img.shields.io/github/followers/ranajawadai?style=social)](https://github.com/ranajawadai)

</div>
