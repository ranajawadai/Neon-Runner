// Particle System

import { MAX_PARTICLES } from './config.js';

const particles = [];
const particlePool = [];
const weatherParticles = [];
const MAX_WEATHER = 30;

export function spawnParticleBurst(x, y, z, color, count, scene) {
  count = count || 8;
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    let p;
    if (particlePool.length > 0) {
      p = particlePool.pop();
      p.material.color.set(color);
      p.material.opacity = 1;
      p.scale.set(1, 1, 1);
    } else {
      const geo = new THREE.SphereGeometry(0.1, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
      p = new THREE.Mesh(geo, mat);
      scene.add(p);
    }
    const size = 0.6 + Math.random() * 0.7;
    p.scale.set(size, size, size);
    p.position.set(x, y, z);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1.2 + Math.random() * 1.6;
    p.userData.vx = Math.cos(angle) * speed;
    p.userData.vy = Math.random() * 1.2 + 0.6;
    p.userData.vz = Math.sin(angle) * speed;
    p.userData.wobblePhase = Math.random() * Math.PI * 2;
    p.userData.life = 0.7 + Math.random() * 0.4;
    p.userData.maxLife = p.userData.life;
    p.visible = true;
    particles.push(p);
  }
}

export function initWeather(scene) {
  for (let i = 0; i < MAX_WEATHER; i++) {
    const geo = new THREE.SphereGeometry(0.03, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(
      (Math.random() - 0.5) * 24,
      Math.random() * 10 + 1,
      (Math.random() - 0.5) * 50 - 20
    );
    p.userData.vy = -0.12 - Math.random() * 0.18;
    p.userData.vx = (Math.random() - 0.5) * 0.25;
    p.visible = true;
    scene.add(p);
    weatherParticles.push(p);
  }
}

export function updateWeather(dt, speed) {
  weatherParticles.forEach(p => {
    p.position.y += p.userData.vy * dt;
    p.position.x += p.userData.vx * dt;
    p.position.z += speed * dt * 0.3;
    
    if (p.position.y < 0) {
      p.position.y = 8 + Math.random() * 2;
      p.position.x = (Math.random() - 0.5) * 20;
      p.position.z = -20 - Math.random() * 20;
    }
    if (p.position.z > 10) {
      p.position.z = -40;
    }
  });
}

export function updateParticles(dt) {
  // Swap-and-pop removal — O(1) per removal instead of O(n) with splice
  let i = 0;
  while (i < particles.length) {
    const p = particles[i];
    p.userData.wobblePhase += dt * 3;
    p.position.x += (p.userData.vx + Math.sin(p.userData.wobblePhase) * 0.3) * dt;
    p.position.y += p.userData.vy * dt;
    p.position.z += p.userData.vz * dt;
    p.userData.vx *= 0.96;
    p.userData.vz *= 0.96;
    p.userData.vy = Math.min(p.userData.vy + 1.5 * dt, 1.0);
    p.userData.life -= dt;
    const lifeRatio = Math.max(0, p.userData.life / p.userData.maxLife);
    p.material.opacity = lifeRatio * 0.85;
    const s = 0.5 + lifeRatio * 0.5;
    p.scale.set(s, s, s);
    if (p.userData.life <= 0) {
      p.visible = false;
      particlePool.push(p);
      // Swap with last element and pop — O(1)
      particles[i] = particles[particles.length - 1];
      particles.pop();
    } else {
      i++;
    }
  }
}

export function clearParticles() {
  particles.forEach(p => { p.visible = false; particlePool.push(p); });
  particles.length = 0;
}
