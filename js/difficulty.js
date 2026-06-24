// Difficulty Progression System

import { DIFFICULTY_TIERS } from './config.js';
import { state } from './state.js';
import { sfxTierUp } from './audio.js';

let lastTierIdx = 0;

export function getCurrentTier() {
  const score = state.score;
  for (let i = DIFFICULTY_TIERS.length - 1; i >= 0; i--) {
    if (score >= DIFFICULTY_TIERS[i].minScore) return DIFFICULTY_TIERS[i];
  }
  return DIFFICULTY_TIERS[0];
}

export function showTierChange(newTier) {
  const tierIdx = DIFFICULTY_TIERS.indexOf(newTier);
  if (tierIdx > lastTierIdx) {
    lastTierIdx = tierIdx;
    sfxTierUp();
    
    const flash = document.createElement('div');
    flash.className = 'tier-up-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);
    
    const tierNames = ['BEGINNER', 'ROOKIE', 'PRO', 'EXPERT', 'LEGEND'];
    const el = document.createElement('div');
    el.textContent = tierNames[tierIdx] + '!';
    el.style.cssText = 'position:fixed;top:25%;left:50%;transform:translate(-50%,-50%);font-size:56px;font-weight:900;color:#00ffff;text-shadow:0 0 30px #00ffff,0 0 60px #00ff88;pointer-events:none;z-index:100;transition:all 1s ease-out;opacity:1;';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.top = '15%';
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%,-50%) scale(1.5)';
    });
    setTimeout(() => el.remove(), 1100);
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
  return ['#00ffff', '#00ff88', '#ffdd00', '#ff6600', '#ff0044'][tierIdx] || '#00ffff';
}
