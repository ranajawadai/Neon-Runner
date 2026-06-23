<div align="center">

# 🏃‍♂️ NEON RUNNER

### *Cyberpunk 3D Endless Runner — Built with Three.js*

**[PLAY NOW](https://ranajawadai.github.io/Neon-Runner/)** • **[REPORT BUG](https://github.com/ranajawadai/Neon-Runner/issues)** • **[CONTRIBUTE](#contributing)**

![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/ranajawadai/Neon-Runner?style=for-the-badge&color=yellow)

<br>

**A fast-paced, neon-drenched 3D endless runner** where you dodge obstacles, collect coins, and chase your high score through a cyberpunk cityscape.

</div>

---

## 🎮 Gameplay

<div align="center">

```
DODGE ← → COLLECT COINS ← → SURVIVE ← → REPEAT
```

</div>

| | |
|---|---|
| 🏃 **3-lane runner** | Switch lanes to dodge randomly generated obstacles |
| 💰 **Coin collection** | Grab coins for score — consecutive picks build combo multiplier |
| ⚡ **Power-ups** | Magnet pulls coins toward you, Shield absorbs one hit, Multiplier gives 3x score |
| 🔥 **Combo system** | Chain coin pickups for increasing score multipliers |
| 🎵 **Synth audio** | Procedural cyberpunk soundtrack — no external audio files needed |
| 📱 **Mobile ready** | Swipe to switch lanes, tap to jump |

---

## ✨ Features

<details>
<summary><b>🚀 Core Gameplay</b></summary>

- 3 obstacle types: cubes, pyramids, walls
- Jump physics with gravity
- Dynamic speed ramp (1x → 3x)
- Combo multiplier (up to 3x+)
- High score saved to localStorage

</details>

<details>
<summary><b>🎨 Visual Effects</b></summary>

- Coin pickup particle bursts
- Death screen shake + particles
- Player trail (cyan glow line)
- Speed lines at high velocity
- Neon cyberpunk color palette

</details>

<details>
<summary><b>🔊 Audio</b></summary>

- Procedural synth soundtrack (Web Audio API)
- Coin pickup chime
- Jump whoosh
- Death buzz
- Power-up arpeggio
- Volume controls in settings

</details>

<details>
<summary><b>⚡ Power-ups</b></summary>

| Power-up | Color | Duration | Effect |
|----------|-------|----------|--------|
| **Magnet** | 🟣 Pink | 8s | Attracts nearby coins |
| **Shield** | 🟢 Green | 10s | Absorbs one hit |
| **Multiplier** | 🟡 Gold | Instant | 3x score |

</details>

<details>
<summary><b>🎯 UI/UX</b></summary>

- Animated loading screen
- Pause menu (ESC)
- Settings panel (volume, sensitivity)
- PWA support — installable
- Responsive design

</details>

---

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

**[Click here to play instantly →](https://ranajawadai.github.io/Neon-Runner/)**

No installation needed. Works in any modern browser.

### Option 2: Local Development

```bash
# Clone the repo
git clone https://github.com/ranajawadai/Neon-Runner.git
cd Neon-Runner

# Start a local server (Python)
python -m http.server 8080

# Or with Node.js
npx serve .

# Or with PHP
php -S localhost:8080

# Open in browser
open http://localhost:8080
```

> **Note:** ES modules require an HTTP server. Opening `index.html` directly won't work.

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| `←` `→` / `A` `D` | Switch lanes |
| `Space` / `↑` / `W` | Jump |
| `ESC` | Pause |
| 📱 Swipe left/right | Switch lanes |
| 📱 Tap | Jump |

---

## 🏗️ Tech Stack

```
├── Three.js          — 3D rendering engine
├── Web Audio API     — Procedural sound synthesis
├── CSS3              — Neon cyberpunk UI theme
├── HTML5             — Semantic markup
└── Vanilla JS        — Zero dependencies (beyond Three.js)
```

**Total code:** ~800 lines • **Bundle size:** ~0KB (CDN) • **Load time:** <1s

---

## 📁 Project Structure

```
Neon-Runner/
├── index.html        — Entry point + UI screens
├── game.js           — Game logic, rendering, physics, audio
├── style.css         — Cyberpunk neon theme
├── manifest.json     — PWA manifest
└── README.md         — This file
```

---

## 🎯 Game Architecture

```
┌─────────────────────────────────────┐
│           THREE.js Renderer          │
├─────────────────────────────────────┤
│  Scene → Camera → Lights → Objects   │
├─────────────────────────────────────┤
│          Game Loop (60fps)           │
│  ┌───────────┬──────────┬────────┐  │
│  │  Physics  │  Spawn   │ Collide│  │
│  │  (gravity)│ (obs/coin│ (3-axis│  │
│  │           │ /powerup)│  check)│  │
│  └───────────┴──────────┴────────┘  │
├─────────────────────────────────────┤
│  Systems: Particles, Shake, Trail,  │
│  Speed Lines, Magnet, Shield, Combo │
├─────────────────────────────────────┤
│  Audio: Web Audio API (procedural)  │
│  UI: DOM overlays (loading/pause/   │
│      settings/game over)            │
└─────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork** the repo
2. **Create** a branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for contributions:

- 🗺️ New obstacle types (moving obstacles, lasers)
- 💎 New power-ups (score magnet, slow-mo, double jump)
- 🎵 More audio effects
- 🏆 Global leaderboard
- 🌍 Multiple themes (retro, space, underwater)
- 📊 Stats tracking

---

## 📋 Roadmap

- [x] Core 3-lane runner
- [x] 3 obstacle types
- [x] Coin system + combo multiplier
- [x] Power-ups (Magnet, Shield, Multiplier)
- [x] Particle effects + screen shake
- [x] Player trail + speed lines
- [x] Procedural audio (Web Audio API)
- [x] Pause menu + settings
- [x] Loading screen
- [x] PWA support
- [ ] Moving obstacles
- [ ] Multiple themes
- [ ] Global leaderboard
- [ ] Achievement system
- [ ] Daily challenges

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Lines of code | ~800 |
| External dependencies | 1 (Three.js) |
| Audio files | 0 (all procedural) |
| Load time | <1s |
| Works on | Desktop, Mobile, Tablet |
| Browser support | Chrome, Firefox, Safari, Edge |

---

## 📜 License

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

**Made with 💜 and Three.js**

⭐ Star this repo if you enjoyed the game!

[![GitHub followers](https://img.shields.io/github/followers/ranajawadai?style=social)](https://github.com/ranajawadai)

</div>
