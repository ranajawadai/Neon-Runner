import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentTier, getTierName, getTierColor, resetTierIdx } from '../js/difficulty.js';
import { DIFFICULTY_TIERS } from '../js/config.js';
import { state } from '../js/state.js';

describe('Difficulty', () => {
  beforeEach(() => {
    resetTierIdx();
    state.score = 0;
  });

  describe('getCurrentTier', () => {
    it('should return first tier for score 0', () => {
      const tier = getCurrentTier();
      expect(tier).toBe(DIFFICULTY_TIERS[0]);
    });

    it('should return second tier for score 1500', () => {
      state.score = 1500;
      const tier = getCurrentTier();
      expect(tier).toBe(DIFFICULTY_TIERS[1]);
    });

    it('should return last tier for high score', () => {
      state.score = 50000;
      const tier = getCurrentTier();
      expect(tier).toBe(DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1]);
    });
  });

  describe('getTierName', () => {
    it('should return BEGINNER for first tier', () => {
      expect(getTierName(DIFFICULTY_TIERS[0])).toBe('BEGINNER');
    });

    it('should return LEGEND for last tier', () => {
      expect(getTierName(DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1])).toBe('LEGEND');
    });
  });

  describe('getTierColor', () => {
    it('should return cyan for first tier', () => {
      expect(getTierColor(DIFFICULTY_TIERS[0])).toBe('#00ffff');
    });

    it('should return red for last tier', () => {
      expect(getTierColor(DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1])).toBe('#ff0044');
    });
  });
});
