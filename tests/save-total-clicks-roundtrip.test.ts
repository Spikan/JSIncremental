import Decimal from 'break_eternity.js';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockState = {
  sips: new Decimal('1e6'),
  straws: new Decimal(0),
  cups: new Decimal(0),
  widerStraws: new Decimal(0),
  betterCups: new Decimal(0),
  suctions: new Decimal(0),
  fasterDrinks: new Decimal(0),
  totalSipsEarned: new Decimal('1e6'),
  spd: new Decimal(1),
  strawSPD: new Decimal(0),
  cupSPD: new Decimal(0),
  drinkRate: 1000,
  lastDrinkTime: 0,
  drinkProgress: 0,
  totalPlayTime: 0,
  totalClicks: new Decimal('1e1000'),
  suctionClickBonus: new Decimal(0),
  options: {},
};

const mockActions = {
  setSips: vi.fn(),
  setStraws: vi.fn(),
  setCups: vi.fn(),
  setSuctions: vi.fn(),
  setSPD: vi.fn(),
  setStrawSPD: vi.fn(),
  setCupSPD: vi.fn(),
  setFasterDrinks: vi.fn(),
  setWiderStraws: vi.fn(),
  setBetterCups: vi.fn(),
  setSuctionClickBonus: vi.fn(),
  setTotalClicks: vi.fn(),
  setSessionStartTime: vi.fn(),
  setState: vi.fn(),
  setTotalPlayTime: vi.fn(),
};

vi.mock('../ts/core/state/zustand-store', () => ({
  useGameStore: {
    getState: () => mockState,
    setState: vi.fn(),
  },
  getStoreActions: () => mockActions,
}));

vi.mock('../ts/ui/index', () => ({}));
vi.mock('../ts/ui/mobile-input', () => ({ mobileInputHandler: {} }));
vi.mock('../ts/core/systems/resources', () => ({ recalcProduction: vi.fn() }));
vi.mock('../ts/feature-unlocks', () => ({ FEATURE_UNLOCKS: {} }));
vi.mock('../ts/core/systems/hybrid-level-system', () => ({
  hybridLevelSystem: {
    getCurrentLevelId: () => 1,
    getUnlockedLevelIds: () => [1],
  },
}));
vi.mock('../ts/services/optimized-event-bus', () => ({
  optimizedEventBus: { emit: vi.fn() },
}));
vi.mock('../ts/services/storage', () => ({
  AppStorage: { saveGame: vi.fn() },
}));
vi.mock('../ts/services/data-service', () => ({ getUpgradesData: vi.fn() }));
vi.mock('../ts/core/error-handling/error-handler', () => ({
  errorHandler: { handleError: vi.fn() },
  safeStateOperation: (fn: () => void) => fn(),
}));
vi.mock('../ts/core/systems/button-audio', () => ({
  initButtonAudioSystem: vi.fn(),
  updateButtonSoundsToggleButton: vi.fn(),
}));

describe('save totalClicks roundtrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('serializes and reloads extreme totalClicks without precision loss', async () => {
    const { performSaveSnapshot } = await import('../ts/core/systems/save-system');
    const { SaveGameLoader } = await import('../ts/core/systems/save-game-loader');

    const payload = performSaveSnapshot();
    expect(typeof payload.totalClicks).toBe('string');
    expect(payload.totalClicks).toBe('1e1000');

    SaveGameLoader.getInstance().loadGameState(payload);

    expect(mockActions.setTotalClicks).toHaveBeenCalledTimes(1);
    const loadedValue = mockActions.setTotalClicks.mock.calls[0][0];
    expect(new Decimal(loadedValue.toString()).eq(new Decimal(payload.totalClicks))).toBe(true);
  });
});
