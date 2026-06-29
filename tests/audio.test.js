import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AudioContext
const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  disconnect: vi.fn(),
  frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  detune: { value: 0 },
  type: 'sine',
  _lfo: null,
  _sub: null,
  _arp: null,
  _bassGain: null,
  _arpGain: null,
  _filter: null,
};

const mockGain = {
  connect: vi.fn(),
  gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
};

const mockFilter = {
  connect: vi.fn(),
  frequency: { value: 0 },
  type: 'lowpass',
  Q: { value: 0 },
};

const mockAudioContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillator, frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, detune: { value: 0 } })),
  createGain: vi.fn(() => ({ ...mockGain, gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } })),
  createBiquadFilter: vi.fn(() => ({ ...mockFilter, frequency: { value: 0 } })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
};

global.AudioContext = vi.fn(() => mockAudioContext);
global.webkitAudioContext = vi.fn(() => mockAudioContext);

describe('Audio', () => {
  let audio;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to reset module state
    audio = await import('../js/audio.js');
  });

  describe('initAudio', () => {
    it('should create AudioContext', () => {
      audio.initAudio();
      expect(global.AudioContext).toHaveBeenCalled();
    });
  });

  describe('setMusicVolume', () => {
    it('should not throw when called before init', () => {
      expect(() => audio.setMusicVolume(50)).not.toThrow();
    });
  });

  describe('setSfxVolume', () => {
    it('should not throw when called before init', () => {
      expect(() => audio.setSfxVolume(50)).not.toThrow();
    });
  });

  describe('SFX functions', () => {
    beforeEach(() => {
      audio.initAudio();
    });

    it('sfxCoin should not throw', () => {
      expect(() => audio.sfxCoin()).not.toThrow();
    });

    it('sfxJump should not throw', () => {
      expect(() => audio.sfxJump()).not.toThrow();
    });

    it('sfxDeath should not throw', () => {
      expect(() => audio.sfxDeath()).not.toThrow();
    });

    it('sfxPowerup should not throw', () => {
      expect(() => audio.sfxPowerup()).not.toThrow();
    });

    it('sfxNearMiss should not throw', () => {
      expect(() => audio.sfxNearMiss()).not.toThrow();
    });

    it('sfxTierUp should not throw', () => {
      expect(() => audio.sfxTierUp()).not.toThrow();
    });

    it('sfxThemeChange should not throw', () => {
      expect(() => audio.sfxThemeChange()).not.toThrow();
    });

    it('sfxHit should not throw', () => {
      expect(() => audio.sfxHit()).not.toThrow();
    });

    it('sfxCombo should not throw', () => {
      expect(() => audio.sfxCombo()).not.toThrow();
    });

    it('sfxShift should not throw', () => {
      expect(() => audio.sfxShift()).not.toThrow();
    });
  });

  describe('BGM', () => {
    beforeEach(() => {
      audio.initAudio();
    });

    it('startBGM should not throw', () => {
      expect(() => audio.startBGM()).not.toThrow();
    });

    it('stopBGM should not throw', () => {
      audio.startBGM();
      expect(() => audio.stopBGM()).not.toThrow();
    });

    it('stopBGM should be safe to call multiple times', () => {
      audio.startBGM();
      audio.stopBGM();
      expect(() => audio.stopBGM()).not.toThrow();
    });

    it('updateMusicIntensity should not throw', () => {
      audio.startBGM();
      expect(() => audio.updateMusicIntensity(1.5)).not.toThrow();
    });
  });

  describe('Ambient', () => {
    beforeEach(() => {
      audio.initAudio();
    });

    it('startAmbient should not throw', () => {
      expect(() => audio.startAmbient()).not.toThrow();
    });

    it('stopAmbient should not throw', () => {
      audio.startAmbient();
      expect(() => audio.stopAmbient()).not.toThrow();
    });

    it('stopAmbient should be safe to call multiple times', () => {
      audio.startAmbient();
      audio.stopAmbient();
      expect(() => audio.stopAmbient()).not.toThrow();
    });

    it('updateAmbientIntensity should not throw', () => {
      audio.startAmbient();
      expect(() => audio.updateAmbientIntensity(1.5)).not.toThrow();
    });
  });

  describe('resumeAudio', () => {
    it('should not throw when called before init', () => {
      expect(() => audio.resumeAudio()).not.toThrow();
    });

    it('should resume suspended context', () => {
      audio.initAudio();
      mockAudioContext.state = 'suspended';
      audio.resumeAudio();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });
});
