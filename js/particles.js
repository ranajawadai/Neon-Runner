// Particle System

import { MAX_PARTICLES } from './config.js';

const particles = [];
const particlePool = [];

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
    const size = 0.8 + Math.random() * 1.2;
    p.scale.set(size, size, size);
    p.position.set(x, y, z);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;
    p.userData.vx = Math.cos(angle) * speed;
    p.userData.vy = Math.random() * 5 + 2;
    p.userData.vz = Math.sin(angle) * speed;
    p.userData.life = 0.5 + Math.random() * 0.3;
    p.userData.maxLife = p.userData.life;
    p.visible = true;
    particles.push(p);
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.position.x += p.userData.vx * dt;
    p.position.y += p.userData.vy * dt;
    p.position.z += p.userData.vz * dt;
    p.userData.vy -= 25 * dt;
    p.userData.life -= dt;
    const lifeRatio = Math.max(0, p.userData.life / p.userData.maxLife);
    p.material.opacity = lifeRatio;
    const s = 0.5 + lifeRatio * 0.5;
    p.scale.set(s, s, s);
    if (p.userData.life <= 0) {
      p.visible = false;
      particlePool.push(p);
      particles.splice(i, 1);
    }
  }
}

export function clearParticles() {
  particles.forEach(p => { p.visible = false; particlePool.push(p); });
  particles.length = 0;
}

export function getParticles() {
  return particles;
}
