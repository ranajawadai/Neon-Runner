import { describe, it, expect } from 'vitest';
import { shuffle, seededRandom, getDailySeed, getCurrentTier, getRandomObstacleType } from '../js/utils.js';

describe('Utils', () => {
  describe('shuffle', () => {
    it('should shuffle an array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should shuffle array in place', () => {
      const arr = [1, 2, 3];
      const original = [...arr];
      shuffle(arr);
      // shuffle modifies in place, elements should be the same
      expect(arr.sort()).toEqual(original.sort());
    });
  });

  describe('seededRandom', () => {
    it('should return consistent values for same seed', () => {
      const rng1 = seededRandom(12345);
      const rng2 = seededRandom(12345);
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    it('should return values between 0 and 1', () => {
      const rng = seededRandom(12345);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('getDailySeed', () => {
    it('should return a number', () => {
      const seed = getDailySeed();
      expect(typeof seed).toBe('number');
    });

    it('should return same value on same day', () => {
      const seed1 = getDailySeed();
      const seed2 = getDailySeed();
      expect(seed1).toBe(seed2);
    });
  });

  describe('getCurrentTier', () => {
    const tiers = [
      { minScore: 0, maxScore: 1000, speed: 20 },
      { minScore: 1000, maxScore: 3000, speed: 25 },
      { minScore: 3000, maxScore: Infinity, speed: 30 }
    ];

    it('should return first tier for score 0', () => {
      expect(getCurrentTier(0, tiers)).toBe(tiers[0]);
    });

    it('should return second tier for score 1500', () => {
      expect(getCurrentTier(1500, tiers)).toBe(tiers[1]);
    });

    it('should return last tier for high score', () => {
      expect(getCurrentTier(10000, tiers)).toBe(tiers[2]);
    });
  });

  describe('getRandomObstacleType', () => {
    it('should return a type from the tier', () => {
      const tier = { obstacleTypes: ['cube', 'pyramid', 'wall'] };
      const type = getRandomObstacleType(tier);
      expect(tier.obstacleTypes).toContain(type);
    });
  });
});
