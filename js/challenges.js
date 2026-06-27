// Daily Challenges System

import { DAILY_CHALLENGES } from './config.js';
import { getTodayDate, getDailySeed, seededRandom } from './utils.js';
import { state, addCoins } from './state.js';
import { sfxPowerup } from './audio.js';

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return (v === null || v === undefined) ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // localStorage unavailable (e.g. private browsing) - challenge progress will not persist this session
  }
}

let dailyChallenges = [];
let dailyChallengeProgress = {};

export function generateDailyChallenges() {
  const todayDate = getTodayDate();
  const savedDate = safeGet('neonRunnerChallengeDate', null);
  
  if (savedDate === todayDate) {
    let saved = [];
    try { saved = JSON.parse(safeGet('neonRunnerChallenges', '[]')); } catch (e) { saved = []; }
    try { dailyChallengeProgress = JSON.parse(safeGet('neonRunnerChallengeProgress', '{}')); } catch (e) { dailyChallengeProgress = {}; }
    dailyChallenges = saved.map(c => {
      const original = DAILY_CHALLENGES.find(d => d.id === c.id);
      return original ? { ...original } : c;
    });
    return;
  }
  
  const rng = seededRandom(getDailySeed());
  const shuffled = [...DAILY_CHALLENGES].sort(() => rng() - 0.5);
  dailyChallenges = shuffled.slice(0, 3);
  dailyChallengeProgress = {};
  dailyChallenges.forEach(c => { dailyChallengeProgress[c.id] = false; });
  
  safeSet('neonRunnerChallengeDate', todayDate);
  safeSet('neonRunnerChallenges', JSON.stringify(dailyChallenges));
  safeSet('neonRunnerChallengeProgress', JSON.stringify(dailyChallengeProgress));
}

export function checkDailyChallenges() {
  let rewards = 0;
  dailyChallenges.forEach(c => {
    if (!dailyChallengeProgress[c.id] && c.check(state)) {
      dailyChallengeProgress[c.id] = true;
      rewards += c.reward;
    }
  });
  if (rewards > 0) {
    addCoins(rewards);
    safeSet('neonRunnerChallengeProgress', JSON.stringify(dailyChallengeProgress));
    showChallengeComplete(rewards);
  }
}

function showChallengeComplete(rewards) {
  const el = document.createElement('div');
  el.innerHTML = '<div style="font-size:24px">🎯</div><div style="font-size:16px;font-weight:bold;color:#2dd4bf">Challenge Complete!</div><div style="font-size:14px;color:#f5a623">+' + rewards + ' coins</div>';
  el.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(3,6,11,0.96);border:2px solid #2dd4bf;border-radius:12px;padding:16px 20px;text-align:center;z-index:100;transition:all 0.5s ease-out;opacity:0;transform:translateX(100px);box-shadow:0 0 20px rgba(45,212,191,0.3);';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });
  sfxPowerup();
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    setTimeout(() => el.remove(), 500);
  }, 3000);
}

export function renderDailyChallenges() {
  const list = document.getElementById('challenge-list');
  if (!list) return;
  list.innerHTML = '';
  
  dailyChallenges.forEach(c => {
    const completed = dailyChallengeProgress[c.id];
    const item = document.createElement('div');
    item.className = 'challenge-item' + (completed ? ' completed' : '');
    item.innerHTML = `
      <div class="challenge-info">
        <div class="challenge-name">${c.name}</div>
        <div class="challenge-desc">${c.desc}</div>
      </div>
      <div class="challenge-reward">+${c.reward} 💰</div>
      <div class="challenge-check">✓</div>
    `;
    list.appendChild(item);
  });
}

export function getDailyChallenges() {
  return dailyChallenges;
}
