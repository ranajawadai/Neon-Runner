import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js
const mockVector2 = { x: 0, y: 0 };
const mockVector3 = { x: 0, y: 0, z: 0, set: vi.fn(), project: vi.fn(() => mockVector2) };
const createMockColor = () => ({ set: vi.fn(), getHex: vi.fn(() => 0xff0000) });
const mockMaterial = {
  color: createMockColor(),
  emissive: createMockColor(),
  opacity: 1,
  transparent: false,
  dispose: vi.fn(),
};
const mockGeometry = {
  dispose: vi.fn(),
  attributes: { position: { array: new Float32Array(36), needsUpdate: false } },
  scale: vi.fn(),
  type: 'BoxGeometry',
};
const mockMesh = {
  position: { set: vi.fn(), x: 0, y: 0, z: 0 },
  rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
  scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  material: { ...mockMaterial },
  geometry: { ...mockGeometry },
  visible: true,
  userData: {},
  add: vi.fn(),
  remove: vi.fn(),
  children: [],
};
const mockScene = { add: vi.fn(), background: createMockColor(), fog: { color: createMockColor(), density: 0.001 } };
const mockCamera = { position: { set: vi.fn(), x: 0, y: 3.8, z: 7.5 }, lookAt: vi.fn(), aspect: 1, updateProjectionMatrix: vi.fn() };
const mockRenderer = {
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  domElement: { style: {}, prepend: vi.fn() },
  outputEncoding: 0,
  toneMapping: 0,
  toneMappingExposure: 1.3,
};
const mockComposer = { addPass: vi.fn(), render: vi.fn(), setSize: vi.fn() };
const mockBloomPass = { enabled: true };
const mockClock = { getDelta: vi.fn(() => 0.016) };

global.THREE = {
  Scene: vi.fn(() => mockScene),
  PerspectiveCamera: vi.fn(() => mockCamera),
  WebGLRenderer: vi.fn(() => mockRenderer),
  EffectComposer: vi.fn(() => mockComposer),
  RenderPass: vi.fn(),
  UnrealBloomPass: vi.fn(() => mockBloomPass),
  Clock: vi.fn(() => mockClock),
  BoxGeometry: vi.fn(() => ({ ...mockGeometry })),
  ConeGeometry: vi.fn(() => ({ ...mockGeometry })),
  OctahedronGeometry: vi.fn(() => ({ ...mockGeometry })),
  TorusGeometry: vi.fn(() => ({ ...mockGeometry })),
  PlaneGeometry: vi.fn(() => ({ ...mockGeometry })),
  CircleGeometry: vi.fn(() => ({ ...mockGeometry })),
  SphereGeometry: vi.fn(() => ({ ...mockGeometry })),
  GridHelper: vi.fn(() => ({ ...mockMesh, material: { ...mockMaterial } })),
  Points: vi.fn(() => ({ ...mockMesh })),
  Line: vi.fn(() => ({ ...mockMesh })),
  BufferGeometry: vi.fn(() => ({ ...mockGeometry })),
  BufferAttribute: vi.fn(),
  Float32Array: Float32Array,
  MeshStandardMaterial: vi.fn(() => ({ ...mockMaterial })),
  MeshBasicMaterial: vi.fn(() => ({ ...mockMaterial })),
  LineBasicMaterial: vi.fn(() => ({ ...mockMaterial })),
  PointsMaterial: vi.fn(() => ({ ...mockMaterial })),
  AmbientLight: vi.fn(() => ({ ...mockMesh })),
  HemisphereLight: vi.fn(() => ({ ...mockMesh })),
  DirectionalLight: vi.fn(() => ({ ...mockMesh, position: { set: vi.fn() } })),
  PointLight: vi.fn(() => ({ ...mockMesh, position: { set: vi.fn() } })),
  Mesh: vi.fn(() => ({ ...mockMesh })),
  Color: vi.fn(() => createMockColor()),
  FogExp2: vi.fn(() => ({ color: createMockColor(), density: 0.001 })),
  Vector2: vi.fn(() => mockVector2),
  Vector3: vi.fn(() => ({ ...mockVector3, project: vi.fn(() => mockVector2) })),
  sRGBEncoding: 0,
  ACESFilmicToneMapping: 0,
  DoubleSide: 2,
  BackSide: 1,
};

// Mock DOM
const mockElement = {
  classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn(), contains: vi.fn(() => false) },
  style: {},
  textContent: '',
  innerHTML: '',
  prepend: vi.fn(),
  addEventListener: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  querySelector: vi.fn(() => mockElement),
  append: vi.fn(),
  appendChild: vi.fn(),
  remove: vi.fn(),
  getAttribute: vi.fn(),
  setAttribute: vi.fn(),
  parentElement: null,
  parentElement: null,
};

global.document = {
  getElementById: vi.fn(() => mockElement),
  createElement: vi.fn(() => ({ ...mockElement })),
  body: { appendChild: vi.fn() },
  addEventListener: vi.fn(),
};

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  ontouchstart: null,
};

global.navigator = {
  vibrate: vi.fn(),
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
};

global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.requestAnimationFrame = vi.fn();
global.setTimeout = vi.fn((fn) => fn());
global.clearTimeout = vi.fn();

describe('Main Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Game Constants', () => {
    it('should have valid lane positions', async () => {
      const { LANES } = await import('../js/config.js');
      expect(LANES).toHaveLength(3);
      expect(LANES[1]).toBe(0);
      expect(LANES[0]).toBe(-LANES[2]);
    });

    it('should have valid physics constants', async () => {
      const { GRAVITY, JUMP_FORCE, GROUND_Y, DESPAWN_Z } = await import('../js/config.js');
      expect(GRAVITY).toBeLessThan(0);
      expect(JUMP_FORCE).toBeGreaterThan(0);
      expect(GROUND_Y).toBeGreaterThan(0);
      expect(DESPAWN_Z).toBeGreaterThan(0);
    });
  });

  describe('Game Modes', () => {
    it('should have classic mode with correct properties', async () => {
      const { GAME_MODES } = await import('../js/config.js');
      expect(GAME_MODES.classic).toBeDefined();
      expect(GAME_MODES.classic.id).toBe('classic');
      expect(GAME_MODES.classic.baseSpeed).toBe(20);
      expect(GAME_MODES.classic.maxSpeed).toBe(42);
      expect(GAME_MODES.classic.obstacles).toBe(true);
    });

    it('should have zen mode without obstacles', async () => {
      const { GAME_MODES } = await import('../js/config.js');
      expect(GAME_MODES.zen.obstacles).toBe(false);
    });

    it('should have hardcore mode without powerups', async () => {
      const { GAME_MODES } = await import('../js/config.js');
      expect(GAME_MODES.hardcore.powerups).toBe(false);
    });
  });

  describe('Obstacle Types', () => {
    it('should have 6 obstacle types', async () => {
      const { OBSTACLE_TYPES } = await import('../js/config.js');
      expect(Object.keys(OBSTACLE_TYPES)).toHaveLength(6);
    });

    it('each obstacle should have hitbox', async () => {
      const { OBSTACLE_TYPES } = await import('../js/config.js');
      Object.values(OBSTACLE_TYPES).forEach(obs => {
        expect(obs.hitbox).toBeDefined();
        expect(obs.hitbox.x).toBeGreaterThan(0);
        expect(obs.hitbox.y).toBeGreaterThan(0);
        expect(obs.hitbox.z).toBeGreaterThan(0);
      });
    });
  });

  describe('Themes', () => {
    it('should have 6 themes', async () => {
      const { THEMES } = await import('../js/config.js');
      expect(Object.keys(THEMES)).toHaveLength(6);
    });

    it('each theme should have required colors', async () => {
      const { THEMES } = await import('../js/config.js');
      Object.values(THEMES).forEach(theme => {
        expect(theme.bg).toBeDefined();
        expect(theme.fog).toBeDefined();
        expect(theme.gridA).toBeDefined();
        expect(theme.obstacle).toBeDefined();
        expect(theme.coin).toBeDefined();
        expect(theme.player).toBeDefined();
      });
    });
  });

  describe('Characters', () => {
    it('should have 6 characters', async () => {
      const { CHARACTERS } = await import('../js/config.js');
      expect(CHARACTERS).toHaveLength(6);
    });

    it('each character should have unlock requirement', async () => {
      const { CHARACTERS } = await import('../js/config.js');
      CHARACTERS.forEach(char => {
        expect(char.unlock).toBeDefined();
        expect(typeof char.unlock).toBe('number');
      });
    });
  });

  describe('Achievements', () => {
    it('should have 16 achievements', async () => {
      const { ACHIEVEMENTS } = await import('../js/config.js');
      expect(ACHIEVEMENTS).toHaveLength(16);
    });

    it('each achievement should have check function', async () => {
      const { ACHIEVEMENTS } = await import('../js/config.js');
      ACHIEVEMENTS.forEach(a => {
        expect(typeof a.check).toBe('function');
      });
    });
  });

  describe('State Management', () => {
    it('should initialize with correct defaults', async () => {
      const { state } = await import('../js/state.js');
      expect(state.running).toBe(false);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.multiplier).toBe(1);
    });

    it('should reset game state correctly', async () => {
      const { state, resetGameState } = await import('../js/state.js');
      state.running = true;
      state.score = 1000;
      state.combo = 5;
      resetGameState();
      expect(state.running).toBe(false);
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
    });

    it('should update score and track best', async () => {
      const { state, updateScore } = await import('../js/state.js');
      state.best = 1000;
      updateScore(2000);
      expect(state.score).toBe(2000);
      expect(state.best).toBe(2000);
    });

    it('should not lower best score', async () => {
      const { state, updateScore } = await import('../js/state.js');
      state.best = 5000;
      updateScore(3000);
      expect(state.best).toBe(5000);
    });
  });

  describe('Particle System', () => {
    it('should spawn particles', async () => {
      const { spawnParticleBurst } = await import('../js/particles.js');
      expect(() => spawnParticleBurst(0, 0, 0, 0xff0000, 5, mockScene)).not.toThrow();
    });

    it('should clear particles', async () => {
      const { clearParticles } = await import('../js/particles.js');
      expect(() => clearParticles()).not.toThrow();
    });
  });

  describe('Daily Challenges', () => {
    it('should generate challenges', async () => {
      const { generateDailyChallenges, getDailyChallenges } = await import('../js/challenges.js');
      generateDailyChallenges();
      const challenges = getDailyChallenges();
      expect(challenges).toHaveLength(3);
    });
  });

  describe('Difficulty System', () => {
    it('should return correct tier for score', async () => {
      const { getCurrentTier } = await import('../js/utils.js');
      const { DIFFICULTY_TIERS } = await import('../js/config.js');
      expect(getCurrentTier(0, DIFFICULTY_TIERS)).toBe(DIFFICULTY_TIERS[0]);
      expect(getCurrentTier(5000, DIFFICULTY_TIERS)).toBe(DIFFICULTY_TIERS[3]);
    });

    it('should return correct tier name', async () => {
      const { getTierName } = await import('../js/difficulty.js');
      const { DIFFICULTY_TIERS } = await import('../js/config.js');
      expect(getTierName(DIFFICULTY_TIERS[0])).toBe('BEGINNER');
      expect(getTierName(DIFFICULTY_TIERS[4])).toBe('LEGEND');
    });
  });
});
