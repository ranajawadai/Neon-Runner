// Difficulty Progression System

import { DIFFICULTY_TIERS } from './config.js';
import { sfxTierUp } from './audio.js';

let lastTierIdx = 0;

export function showTierChange(newTier) {
  const tierIdx = DIFFICULTY_TIERS.indexOf(newTier);
  if (tierIdx > lastTierIdx) {
    lastTierIdx = tierIdx;
    sfxTierUp();

    const flash = document.createElement('div');
    flash.className = 'tier-up-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 800);

    const tierNames = ['BEGINNER', 'ROOKIE', 'PRO', 'EXPERT', 'LEGEND'];
    const tierColors = ['#00ffcc', '#00aaff', '#ffdd00', '#ff6600', '#ff0066'];
    const el = document.createElement('div');
    el.textContent = tierNames[tierIdx] + '!';
    el.style.cssText = 'position:fixed;top:25%;left:50%;transform:translate(-50%,-50%);font-size:44px;font-weight:800;font-family:Orbitron,monospace;letter-spacing:3px;color:' + tierColors[tierIdx] + ';pointer-events:none;z-index:100;transition:all 0.8s ease-out;opacity:1;';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.top = '15%';
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%,-50%) scale(1.2)';
    });
    setTimeout(() => el.remove(), 900);
  }
}

export function resetTierIdx() {
  lastTierIdx = 0;
}

export function getTierName(tier) {
  const tierIdx = DIFFICULTY_TIERS.indexOf(tier);
  const tierNames = ['BEGINNER', 'ROOKIE', 'PRO', 'EXPERT', 'LEGEND'];
  return tierNames[tierIdx] || 'BEGINNER';
}

export function getTierColor(tier) {
  const tierIdx = DIFFICULTY_TIERS.indexOf(tier);
  return ['#00ffcc', '#00aaff', '#ffdd00', '#ff6600', '#ff0066'][tierIdx] || '#00ffcc';
}
