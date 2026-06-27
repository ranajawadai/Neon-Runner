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
    setTimeout(() => flash.remove(), 1000);
    
    const tierNames = ['BEGINNER', 'ROOKIE', 'PRO', 'EXPERT', 'LEGEND'];
    const tierColors = ['#2dd4bf', '#1a8f82', '#f5a623', '#ff6b35', '#d946a8'];
    const tierGlows = ['#2dd4bf', '#0d6b62', '#f5a623', '#c94f1f', '#9b2f72'];
    const el = document.createElement('div');
    el.textContent = tierNames[tierIdx] + '!';
    el.style.cssText = 'position:fixed;top:25%;left:50%;transform:translate(-50%,-50%);font-size:56px;font-weight:900;color:' + tierColors[tierIdx] + ';text-shadow:0 0 30px ' + tierColors[tierIdx] + ',0 0 60px ' + tierGlows[tierIdx] + ';pointer-events:none;z-index:100;transition:all 1s ease-out;opacity:1;';
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
  return ['#2dd4bf', '#1a8f82', '#f5a623', '#ff6b35', '#d946a8'][tierIdx] || '#2dd4bf';
}
