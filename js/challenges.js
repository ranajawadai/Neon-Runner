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
  el.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.9);border:1px solid rgba(0,255,204,0.3);border-radius:8px;padding:14px 18px;text-align:center;z-index:100;transition:all 0.4s ease-out;opacity:0;transform:translateX(100px);';

  const iconEl = document.createElement('div');
  iconEl.style.fontSize = '24px';
  iconEl.textContent = '🎯';

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:14px;font-weight:bold;color:#00ffcc';
  titleEl.textContent = 'Challenge Complete!';

  const rewardEl = document.createElement('div');
  rewardEl.style.cssText = 'font-size:14px;color:#e8a630';
  rewardEl.textContent = '+' + rewards + ' coins';

  el.append(iconEl, titleEl, rewardEl);
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

    const info = document.createElement('div');
    info.className = 'challenge-info';

    const name = document.createElement('div');
    name.className = 'challenge-name';
    name.textContent = c.name;

    const desc = document.createElement('div');
    desc.className = 'challenge-desc';
    desc.textContent = c.desc;

    info.append(name, desc);

    const reward = document.createElement('div');
    reward.className = 'challenge-reward';
    reward.textContent = '+' + c.reward + ' 💰';

    const check = document.createElement('div');
    check.className = 'challenge-check';
    check.textContent = '✓';

    item.append(info, reward, check);
    list.appendChild(item);
  });
}

export function getDailyChallenges() {
  return dailyChallenges;
}
