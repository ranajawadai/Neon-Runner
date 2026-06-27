import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state, resetGameState, updateScore, addCoins, incrementGamesPlayed, saveState, updateStreak } from '../js/state.js';

describe('State', () => {
  beforeEach(() => {
    resetGameState();
    localStorage.clear();
    vi.restoreAllMocks();
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

    it('should not reset gameMode', () => {
      state.gameMode = 'speed';
      resetGameState();
      expect(state.gameMode).toBe('speed');
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

    it('should update dailyBest if new score is higher', () => {
      state.dailyBest = 500;
      updateScore(1000);
      expect(state.dailyBest).toBe(1000);
    });
  });

  describe('addCoins', () => {
    it('should add to total coins', () => {
      state.coins = 100;
      addCoins(50);
      expect(state.coins).toBe(150);
    });

    it('should add to runCoins', () => {
      state.runCoins = 10;
      addCoins(5);
      expect(state.runCoins).toBe(15);
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

  describe('saveState', () => {
    it('should save best to localStorage', () => {
      state.best = 9999;
      saveState();
      expect(localStorage.setItem).toHaveBeenCalledWith('neonRunnerBest', 9999);
    });

    it('should save coins to localStorage', () => {
      state.coins = 500;
      saveState();
      expect(localStorage.setItem).toHaveBeenCalledWith('neonRunnerCoins', 500);
    });

    it('should save gameMode to localStorage', () => {
      state.gameMode = 'hardcore';
      saveState();
      expect(localStorage.setItem).toHaveBeenCalledWith('neonRunnerMode', 'hardcore');
    });
  });

  describe('updateStreak', () => {
    it('should set streak to 1 on first play', () => {
      state.lastPlayDate = '';
      state.streak = 0;
      updateStreak();
      expect(state.streak).toBe(1);
    });

    it('should not increment streak if already played today', () => {
      const today = new Date().toDateString();
      state.lastPlayDate = today;
      state.streak = 5;
      updateStreak();
      expect(state.streak).toBe(5);
    });
  });
});
