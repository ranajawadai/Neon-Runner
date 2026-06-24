import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetGameState, updateScore, addCoins, incrementGamesPlayed } from '../js/state.js';

describe('State', () => {
  beforeEach(() => {
    resetGameState();
  });

  describe('resetGameState', () => {
    it('should reset running to false', () => {
      state.running = true;
      resetGameState();
      expect(state.running).toBe(false);
    });

    it('should reset score to 0', () => {
      state.score = 1000;
      resetGameState();
      expect(state.score).toBe(0);
    });

    it('should reset combo to 0', () => {
      state.combo = 10;
      resetGameState();
      expect(state.combo).toBe(0);
    });

    it('should reset multiplier to 1', () => {
      state.multiplier = 3;
      resetGameState();
      expect(state.multiplier).toBe(1);
    });
  });

  describe('updateScore', () => {
    it('should update score', () => {
      updateScore(5000);
      expect(state.score).toBe(5000);
    });

    it('should update best if new score is higher', () => {
      state.best = 1000;
      updateScore(2000);
      expect(state.best).toBe(2000);
    });

    it('should not update best if new score is lower', () => {
      state.best = 5000;
      updateScore(1000);
      expect(state.best).toBe(5000);
    });
  });

  describe('addCoins', () => {
    it('should add coins', () => {
      state.coins = 100;
      addCoins(50);
      expect(state.coins).toBe(150);
    });
  });

  describe('incrementGamesPlayed', () => {
    it('should increment games played', () => {
      state.gamesPlayed = 5;
      incrementGamesPlayed();
      expect(state.gamesPlayed).toBe(6);
    });

    it('should increment games played today', () => {
      state.gamesPlayedToday = 2;
      incrementGamesPlayed();
      expect(state.gamesPlayedToday).toBe(3);
    });
  });
});
