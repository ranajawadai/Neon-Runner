// Procedural Audio System

let audioCtx = null;
let bgmOsc = null;
let bgmGain = null;
let sfxGain = null;

export function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 0.3;
  sfxGain.connect(audioCtx.destination);
  bgmGain = audioCtx.createGain();
  bgmGain.gain.value = 0.12;
  bgmGain.connect(audioCtx.destination);
}

export function setMusicVolume(value) {
  if (bgmGain) bgmGain.gain.value = value / 100 * 0.25;
}

export function setSfxVolume(value) {
  if (sfxGain) sfxGain.gain.value = value / 100 * 0.5;
}

function playTone(freq, duration, type, gain, detune) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  g.gain.setValueAtTime(gain || 0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function sfxCoin() {
  playTone(880, 0.1, 'sine', 0.4);
  playTone(1320, 0.08, 'sine', 0.2);
}

export function sfxJump() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
  g.gain.setValueAtTime(0.25, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

export function sfxDeath() {
  playTone(200, 0.3, 'sawtooth', 0.3);
  playTone(150, 0.4, 'square', 0.15);
}

export function sfxPowerup() {
  playTone(523, 0.08, 'sine', 0.3);
  playTone(659, 0.08, 'sine', 0.3);
  playTone(784, 0.12, 'sine', 0.3);
}

export function sfxNearMiss() {
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

export function sfxTierUp() {
  playTone(440, 0.1, 'sine', 0.4);
  playTone(554, 0.1, 'sine', 0.4);
  playTone(659, 0.1, 'sine', 0.4);
  playTone(880, 0.2, 'sine', 0.3);
}

export function sfxThemeChange() {
  playTone(330, 0.1, 'sine', 0.3);
  playTone(440, 0.15, 'sine', 0.25);
}

export function startBGM() {
  if (!audioCtx || bgmOsc) return;

  bgmOsc = audioCtx.createOscillator();
  bgmOsc.type = 'sawtooth';
  bgmOsc.frequency.value = 55;
  const bassGain = audioCtx.createGain();
  bassGain.gain.value = 0.15;
  bgmOsc.connect(bassGain);
  bassGain.connect(bgmGain);
  bgmOsc.start();

  const subOsc = audioCtx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.value = 55;
  const subGain = audioCtx.createGain();
  subGain.gain.value = 0.2;
  subOsc.connect(subGain);
  subGain.connect(bgmGain);
  subOsc.start();

  const arpOsc = audioCtx.createOscillator();
  arpOsc.type = 'square';
  arpOsc.frequency.value = 220;
  const arpGain = audioCtx.createGain();
  arpGain.gain.value = 0.08;
  arpOsc.connect(arpGain);
  arpGain.connect(bgmGain);
  arpOsc.start();

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.5;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 10;
  lfo.connect(lfoGain);
  lfoGain.connect(bgmOsc.frequency);
  lfo.start();

  bgmOsc._lfo = lfo;
  bgmOsc._sub = subOsc;
  bgmOsc._arp = arpOsc;
  bgmOsc._bassGain = bassGain;
  bgmOsc._arpGain = arpGain;
}

export function stopBGM() {
  if (bgmOsc) {
    bgmOsc._lfo.stop();
    bgmOsc._sub.stop();
    bgmOsc._arp.stop();
    bgmOsc.stop();
    bgmOsc = null;
  }
}

export function updateMusicIntensity(speedRatio) {
  if (!bgmOsc) return;
  const intensity = Math.min(1, (speedRatio - 1) / 2);
  bgmOsc.frequency.value = 55 + intensity * 30;
  bgmOsc._arp.frequency.value = 220 + intensity * 220;
  bgmOsc._arpGain.gain.value = 0.08 + intensity * 0.06;
  bgmOsc._lfo.frequency.value = 0.5 + intensity * 1.5;
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
