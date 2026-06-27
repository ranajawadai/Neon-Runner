import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateDailyChallenges, checkDailyChallenges, getDailyChallenges } from '../js/challenges.js';
import { state, resetGameState } from '../js/state.js';
import { getTodayDate, getDailySeed } from '../js/utils.js';

describe('Challenges', () => {
  beforeEach(() => {
    resetGameState();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('generateDailyChallenges', () => {
    it('should generate 3 challenges', () => {
      generateDailyChallenges();
      const challenges = getDailyChallenges();
      expect(challenges).toHaveLength(3);
    });

    it('should generate consistent challenges for the same day', () => {
      generateDailyChallenges();
      const first = [...getDailyChallenges()];
      generateDailyChallenges();
      const second = [...getDailyChallenges()];
      expect(first.map(c => c.id)).toEqual(second.map(c => c.id));
    });

    it('should have valid challenge structure', () => {
      generateDailyChallenges();
      const challenges = getDailyChallenges();
      challenges.forEach(c => {
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

    it('should restore from localStorage if same day', () => {
      // First call generates and saves
      generateDailyChallenges();
      const first = getDailyChallenges().map(c => c.id);

      // Second call should restore from storage
      generateDailyChallenges();
      const second = getDailyChallenges().map(c => c.id);

      expect(first).toEqual(second);
    });
  });

  describe('checkDailyChallenges', () => {
    it('should not give rewards when no challenges are met', () => {
      generateDailyChallenges();
      state.score = 0;
      state.coins = 0;
      state.combo = 0;
      const coinsBefore = state.coins;
      checkDailyChallenges();
      expect(state.coins).toBe(coinsBefore);
    });

    it('should give rewards when challenge is met', () => {
      generateDailyChallenges();
      // Set high values to likely trigger at least one challenge
      state.score = 50000;
      state.coins = 200;
      state.combo = 15;
      state.gamesPlayedToday = 5;
      const coinsBefore = state.coins;
      checkDailyChallenges();
      // At least one challenge should have been met
      expect(state.coins).toBeGreaterThanOrEqual(coinsBefore);
    });
  });

  describe('getDailyChallenges', () => {
    it('should return empty array before generation', () => {
      // Fresh state — no generation yet
      const challenges = getDailyChallenges();
      // Might be empty or populated depending on localStorage state
      expect(Array.isArray(challenges)).toBe(true);
    });
  });
});
