import { describe, it, expect } from 'vitest';
import {
  LANES, GAME_MODES, POWERUP_TYPES, OBSTACLE_TYPES, THEMES,
  CHARACTERS, ACHIEVEMENTS, DAILY_CHALLENGES, DIFFICULTY_TIERS,
  GRAVITY, JUMP_FORCE, GROUND_Y, DESPAWN_Z
} from '../js/config.js';

describe('Config', () => {
  describe('LANES', () => {
    it('should have 3 lanes', () => {
      expect(LANES).toHaveLength(3);
    });

    it('should have center lane at 0', () => {
      expect(LANES[1]).toBe(0);
    });

    it('should have symmetric side lanes', () => {
      expect(LANES[0]).toBe(-LANES[2]);
    });
  });

  describe('GAME_MODES', () => {
    it('should have classic mode', () => {
      expect(GAME_MODES.classic).toBeDefined();
      expect(GAME_MODES.classic.id).toBe('classic');
    });

    it('should have speed mode', () => {
      expect(GAME_MODES.speed).toBeDefined();
      expect(GAME_MODES.speed.id).toBe('speed');
    });

    it('should have zen mode', () => {
      expect(GAME_MODES.zen).toBeDefined();
      expect(GAME_MODES.zen.id).toBe('zen');
    });

    it('should have hardcore mode', () => {
      expect(GAME_MODES.hardcore).toBeDefined();
      expect(GAME_MODES.hardcore.id).toBe('hardcore');
    });

    it('each mode should have required properties', () => {
      Object.values(GAME_MODES).forEach(mode => {
        expect(mode).toHaveProperty('id');
        expect(mode).toHaveProperty('name');
        expect(mode).toHaveProperty('baseSpeed');
        expect(mode).toHaveProperty('maxSpeed');
        expect(mode).toHaveProperty('spawnRateMul');
        expect(mode).toHaveProperty('scoreMultiplier');
        expect(mode).toHaveProperty('obstacles');
        expect(typeof mode.baseSpeed).toBe('number');
        expect(typeof mode.maxSpeed).toBe('number');
        expect(mode.maxSpeed).toBeGreaterThan(mode.baseSpeed);
      });
    });
  });

  describe('POWERUP_TYPES', () => {
    it('should have 3 powerup types', () => {
      expect(POWERUP_TYPES).toHaveLength(3);
    });

    it('each powerup should have type and color', () => {
      POWERUP_TYPES.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('color');
        expect(typeof p.type).toBe('string');
        expect(typeof p.color).toBe('number');
      });
    });
  });

  describe('OBSTACLE_TYPES', () => {
    it('should have 6 obstacle types', () => {
      expect(Object.keys(OBSTACLE_TYPES)).toHaveLength(6);
    });

    it('each obstacle should have geo, behavior, and hitbox', () => {
      Object.values(OBSTACLE_TYPES).forEach(obs => {
        expect(obs).toHaveProperty('geo');
        expect(obs).toHaveProperty('behavior');
        expect(obs).toHaveProperty('hitbox');
        expect(obs.hitbox).toHaveProperty('x');
        expect(obs.hitbox).toHaveProperty('y');
        expect(obs.hitbox).toHaveProperty('z');
      });
    });
  });

  describe('THEMES', () => {
    it('should have 6 themes', () => {
      expect(Object.keys(THEMES)).toHaveLength(6);
    });

    it('each theme should have required color properties', () => {
      Object.values(THEMES).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('bg');
        expect(theme).toHaveProperty('fog');
        expect(theme).toHaveProperty('gridA');
        expect(theme).toHaveProperty('obstacle');
        expect(theme).toHaveProperty('coin');
        expect(theme).toHaveProperty('player');
        expect(typeof theme.bg).toBe('number');
        expect(typeof theme.fog).toBe('number');
      });
    });
  });

  describe('CHARACTERS', () => {
    it('should have 6 characters', () => {
      expect(CHARACTERS).toHaveLength(6);
    });

    it('each character should have name, shape, and color', () => {
      CHARACTERS.forEach(char => {
        expect(char).toHaveProperty('name');
        expect(char).toHaveProperty('shape');
        expect(char).toHaveProperty('color');
        expect(char).toHaveProperty('unlock');
        expect(typeof char.color).toBe('number');
        expect(typeof char.unlock).toBe('number');
      });
    });
  });

  describe('ACHIEVEMENTS', () => {
    it('should have 16 achievements', () => {
      expect(ACHIEVEMENTS).toHaveLength(16);
    });

    it('each achievement should have id, name, desc, and check', () => {
      ACHIEVEMENTS.forEach(a => {
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('name');
        expect(a).toHaveProperty('desc');
        expect(a).toHaveProperty('check');
        expect(typeof a.check).toBe('function');
      });
    });
  });

  describe('DAILY_CHALLENGES', () => {
    it('should have 8 challenges', () => {
      expect(DAILY_CHALLENGES).toHaveLength(8);
    });

    it('each challenge should have id, name, desc, reward, and check', () => {
      DAILY_CHALLENGES.forEach(c => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('desc');
        expect(c).toHaveProperty('reward');
        expect(c).toHaveProperty('check');
        expect(typeof c.check).toBe('function');
        expect(typeof c.reward).toBe('number');
        expect(c.reward).toBeGreaterThan(0);
      });
    });
  });

  describe('DIFFICULTY_TIERS', () => {
    it('should have 5 tiers', () => {
      expect(DIFFICULTY_TIERS).toHaveLength(5);
    });

    it('tiers should be sorted by minScore', () => {
      for (let i = 1; i < DIFFICULTY_TIERS.length; i++) {
        expect(DIFFICULTY_TIERS[i].minScore).toBeGreaterThan(DIFFICULTY_TIERS[i - 1].minScore);
      }
    });

    it('each tier should have required properties', () => {
      DIFFICULTY_TIERS.forEach(tier => {
        expect(tier).toHaveProperty('minScore');
        expect(tier).toHaveProperty('maxScore');
        expect(tier).toHaveProperty('speed');
        expect(tier).toHaveProperty('obstacleTypes');
        expect(tier).toHaveProperty('spawnRate');
        expect(Array.isArray(tier.obstacleTypes)).toBe(true);
      });
    });
  });

  describe('Physics constants', () => {
    it('GRAVITY should be negative', () => {
      expect(GRAVITY).toBeLessThan(0);
    });

    it('JUMP_FORCE should be positive', () => {
      expect(JUMP_FORCE).toBeGreaterThan(0);
    });

    it('GROUND_Y should be positive', () => {
      expect(GROUND_Y).toBeGreaterThan(0);
    });

    it('DESPAWN_Z should be positive', () => {
      expect(DESPAWN_Z).toBeGreaterThan(0);
    });
  });
});
