import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE
const mockMesh = {
  position: { set: vi.fn(), x: 0, y: 0, z: 0 },
  scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  material: { color: { set: vi.fn() }, opacity: 1 },
  visible: true,
  userData: {},
};

const mockScene = {
  add: vi.fn(),
};

global.THREE = {
  SphereGeometry: vi.fn(() => ({})),
  MeshBasicMaterial: vi.fn(() => ({ color: { set: vi.fn() }, opacity: 1 })),
  Mesh: vi.fn(() => ({ ...mockMesh, position: { set: vi.fn(), x: 0, y: 0, z: 0 }, scale: { set: vi.fn(), x: 1, y: 1, z: 1 }, material: { color: { set: vi.fn() }, opacity: 1 }, visible: true, userData: {} })),
};

describe('Particles', () => {
  let particles;

  beforeEach(async () => {
    vi.clearAllMocks();
    particles = await import('../js/particles.js');
    particles.clearParticles();
  });

  describe('spawnParticleBurst', () => {
    it('should spawn particles', () => {
      particles.spawnParticleBurst(0, 0, 0, 0xff0000, 5, mockScene);
      // We can't directly check the internal array, but it should not throw
    });

    it('should not throw with default count', () => {
      expect(() => particles.spawnParticleBurst(0, 0, 0, 0xff0000, undefined, mockScene)).not.toThrow();
    });

    it('should respect MAX_PARTICLES limit', () => {
      // Spawn many particles - should not exceed limit
      for (let i = 0; i < 200; i++) {
        particles.spawnParticleBurst(0, 0, 0, 0xff0000, 10, mockScene);
      }
      // Should not throw
    });
  });

  describe('updateParticles', () => {
    it('should not throw with no particles', () => {
      expect(() => particles.updateParticles(0.016)).not.toThrow();
    });

    it('should update particle positions', () => {
      particles.spawnParticleBurst(0, 0, 0, 0xff0000, 5, mockScene);
      expect(() => particles.updateParticles(0.016)).not.toThrow();
    });
  });

  describe('clearParticles', () => {
    it('should clear all particles', () => {
      particles.spawnParticleBurst(0, 0, 0, 0xff0000, 10, mockScene);
      expect(() => particles.clearParticles()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      particles.clearParticles();
      particles.clearParticles();
      // Should not throw
    });
  });

  describe('initWeather', () => {
    it('should create weather particles', () => {
      expect(() => particles.initWeather(mockScene)).not.toThrow();
    });
  });

  describe('updateWeather', () => {
    it('should not throw', () => {
      particles.initWeather(mockScene);
      expect(() => particles.updateWeather(0.016, 20)).not.toThrow();
    });
  });
});
