// Comprehensive tests for Zustand store implementation
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { expectLargeNumberToEqual } from './test-utils';
import {
  useGameStore,
  storeActions,
  useSips,
  useStraws,
  useCups,
  useLevel,
  useSPS,
  useOptions,
  useActions,
} from '../ts/core/state/zustand-store';
import {
  createLegacyStore,
  appStore,
  selectors,
  migrateToZustand,
} from '../ts/core/state/zustand-bridge';
import { setupTestEnvironment, expectLargeNumberToEqual } from './test-utils';

describe('Zustand Store - Core Functionality', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment();
    cleanup = env.cleanup;

    // Reset store to initial state before each test
    storeActions.resetState();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Store Initialization', () => {
    it('should initialize with default state', () => {
      const state = useGameStore.getState();

      expectLargeNumberToEqual(state.sips, 0);
      expectLargeNumberToEqual(state.straws, 0);
      expectLargeNumberToEqual(state.cups, 0);
      expectLargeNumberToEqual(state.level, 1);
      expect(state.options.autosaveEnabled).toBe(true);
    });

    it('should have all required actions', () => {
      const actions = storeActions;

      expect(actions.addSips).toBeDefined();
      expect(actions.setSips).toBeDefined();
      expect(actions.addStraws).toBeDefined();
      expect(actions.setStraws).toBeDefined();
      expect(actions.addCups).toBeDefined();
      expect(actions.setCups).toBeDefined();
      expect(actions.setLevel).toBeDefined();
      expect(actions.updateOptions).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    it('should add sips correctly', () => {
      storeActions.addSips(100);
      expectLargeNumberToEqual(useGameStore.getState().sips, 100);
      expectLargeNumberToEqual(useGameStore.getState().totalSipsEarned, 100);
    });

    it('should set sips correctly', () => {
      storeActions.setSips(500);
      expectLargeNumberToEqual(useGameStore.getState().sips, 500);
    });

    it('should add straws correctly', () => {
      storeActions.addStraws(3);
      expectLargeNumberToEqual(useGameStore.getState().straws, 3);
    });

    it('should add cups correctly', () => {
      storeActions.addCups(2);
      expectLargeNumberToEqual(useGameStore.getState().cups, 2);
    });

    it('should add suctions correctly', () => {
      storeActions.addSuctions(1);
      expectLargeNumberToEqual(useGameStore.getState().suctions, 1);
    });
  });

  describe('Upgrade Management', () => {
    it('should add wider straws correctly', () => {
      storeActions.addWiderStraws(2);
      expectLargeNumberToEqual(useGameStore.getState().widerStraws, 2);
    });

    it('should add better cups correctly', () => {
      storeActions.addBetterCups(1);
      expectLargeNumberToEqual(useGameStore.getState().betterCups, 1);
    });

    it('should add faster drinks correctly', () => {
      storeActions.addFasterDrinks(3);
      expectLargeNumberToEqual(useGameStore.getState().fasterDrinks, 3);
    });

    it('should add critical clicks correctly', () => {
      storeActions.addCriticalClicks(2);
      expectLargeNumberToEqual(useGameStore.getState().criticalClicks, 2);
    });
  });

  describe('Production Stats', () => {
    it('should set straw SPD correctly', () => {
      storeActions.setStrawSPD(1.5);
      expectLargeNumberToEqual(useGameStore.getState().strawSPD, 1.5);
    });

    it('should set cup SPD correctly', () => {
      storeActions.setCupSPD(2.8);
      expectLargeNumberToEqual(useGameStore.getState().cupSPD, 2.8);
    });

    it('should set SPS correctly', () => {
      storeActions.setHighestSipsPerSecond(25.5);
      expect(useGameStore.getState().highestSipsPerSecond.toNumber()).toBe(25.5);
    });
  });

  describe('Drink System', () => {
    it('should set drink rate correctly', () => {
      storeActions.setDrinkRate(800);
      expect(useGameStore.getState().drinkRate).toBe(800);
    });

    it('should set drink progress correctly', () => {
      storeActions.setDrinkProgress(0.75);
      expect(useGameStore.getState().drinkProgress).toBe(0.75);
    });

    it('should set last drink time correctly', () => {
      const time = Date.now();
      storeActions.setLastDrinkTime(time);
      expect(useGameStore.getState().lastDrinkTime).toBe(time);
    });
  });

  describe('Session and Persistence', () => {
    it('should set last save time correctly', () => {
      const time = Date.now();
      storeActions.setLastSaveTime(time);
      expect(useGameStore.getState().lastSaveTime).toBe(time);
    });

    it('should add total play time correctly', () => {
      storeActions.addTotalPlayTime(60000); // 1 minute
      expect(useGameStore.getState().totalPlayTime).toBe(60000);

      storeActions.addTotalPlayTime(30000); // 30 seconds
      expect(useGameStore.getState().totalPlayTime).toBe(90000);
    });

    it('should add total sips earned correctly', () => {
      storeActions.addTotalSipsEarned(1000);
      expectLargeNumberToEqual(useGameStore.getState().totalSipsEarned, 1000);

      storeActions.addTotalSipsEarned(500);
      expectLargeNumberToEqual(useGameStore.getState().totalSipsEarned, 1500);
    });

    it('should add total clicks correctly', () => {
      storeActions.addTotalClicks(50);
      expectLargeNumberToEqual(useGameStore.getState().totalClicks, 50);

      storeActions.addTotalClicks(25);
      expectLargeNumberToEqual(useGameStore.getState().totalClicks, 75);
    });

    it('should set highest SPS correctly', () => {
      storeActions.setHighestSipsPerSecond(30.5);
      expectLargeNumberToEqual(useGameStore.getState().highestSipsPerSecond, 30.5);
    });

    it('should set click streaks correctly', () => {
      storeActions.setCurrentClickStreak(8);
      expect(useGameStore.getState().currentClickStreak).toBe(8);

      storeActions.setBestClickStreak(15);
      expect(useGameStore.getState().bestClickStreak).toBe(15);

      // Should update best streak if current is higher
      storeActions.setCurrentClickStreak(20);
      storeActions.setBestClickStreak(20);
      expect(useGameStore.getState().bestClickStreak).toBe(20);
    });
  });

  describe('Click and Crit Systems', () => {
    it('should set critical click chance correctly', () => {
      storeActions.setCriticalClickChance(0.1);
      expect(useGameStore.getState().criticalClickChance).toBe(0.1);
    });

    it('should set critical click multiplier correctly', () => {
      storeActions.setCriticalClickMultiplier(3.0);
      expectLargeNumberToEqual(useGameStore.getState().criticalClickMultiplier, 3.0);
    });

    it('should set suction click bonus correctly', () => {
      storeActions.setSuctionClickBonus(0.5);
      expectLargeNumberToEqual(useGameStore.getState().suctionClickBonus, 0.5);
    });
  });

  describe('Upgrade Counters', () => {
    it('should set faster drinks up counter correctly', () => {
      storeActions.setFasterDrinksUpCounter(5);
      expectLargeNumberToEqual(useGameStore.getState().fasterDrinksUpCounter, 5);
    });

    it('should set critical click up counter correctly', () => {
      storeActions.setCriticalClickUpCounter(3);
      expectLargeNumberToEqual(useGameStore.getState().criticalClickUpCounter, 3);
    });
  });

  describe('Level Management', () => {
    it('should set level correctly', () => {
      storeActions.setLevel(5);
      expectLargeNumberToEqual(useGameStore.getState().level, 5);
    });

    it('should add level correctly', () => {
      storeActions.setLevel(3);
      storeActions.addLevel(2);
      expectLargeNumberToEqual(useGameStore.getState().level, 5);
    });
  });

  describe('Options Management', () => {
    it('should update options correctly', () => {
      storeActions.updateOptions({
        autosaveEnabled: false,
        autosaveInterval: 60,
      });

      const options = useGameStore.getState().options;
      expect(options.autosaveEnabled).toBe(false);
      expect(options.autosaveInterval).toBe(60);
      expect(options.clickSoundsEnabled).toBe(true); // Should preserve other options
    });

    it('should set individual options correctly', () => {
      storeActions.setOption('clickSoundsEnabled', false);
      expect(useGameStore.getState().options.clickSoundsEnabled).toBe(false);

      storeActions.setOption('musicEnabled', false);
      expect(useGameStore.getState().options.musicEnabled).toBe(false);
    });
  });

  describe('Bulk Operations', () => {
    it('should set state partially correctly', () => {
      storeActions.setState({
        sips: 1000,
        straws: 10,
        level: 5,
      });

      const state = useGameStore.getState();
      expect(state.sips).toBe(1000);
      expectLargeNumberToEqual(state.straws, 10);
      expectLargeNumberToEqual(state.level, 5);
      expectLargeNumberToEqual(state.cups, 0); // Should preserve other values
    });

    it('should reset state correctly', () => {
      // First set some values
      storeActions.setState({
        sips: 1000,
        straws: 10,
        level: 5,
      });

      // Then reset
      storeActions.resetState();

      const state = useGameStore.getState();
      expectLargeNumberToEqual(state.sips, 0);
      expectLargeNumberToEqual(state.straws, 0);
      expectLargeNumberToEqual(state.level, 1);
    });

    it('should load state correctly', () => {
      const newState = {
        sips: 2000,
        straws: 15,
        cups: 8,
        level: 10,
      };

      storeActions.loadState(newState);

      const state = useGameStore.getState();
      expect(state.sips).toBe(2000);
      expect(state.straws).toBe(15);
      expect(state.cups).toBe(8);
      expect(state.level).toBe(10);
    });
  });

  describe('Store Subscriptions', () => {
    it('should notify subscribers of state changes', () => {
      let notifiedCount = 0;
      let lastState: any = null;

      const unsubscribe = useGameStore.subscribe(state => {
        notifiedCount++;
        lastState = state;
      });

      // Make a change
      storeActions.addSips(100);

      expect(notifiedCount).toBeGreaterThan(0);
      expectLargeNumberToEqual(lastState.sips, 100);

      unsubscribe();
    });

    it('should unsubscribe correctly', () => {
      let notifiedCount = 0;

      const unsubscribe = useGameStore.subscribe(() => {
        notifiedCount++;
      });

      // Make a change
      storeActions.addSips(100);
      const countAfterChange = notifiedCount;

      // Unsubscribe
      unsubscribe();

      // Make another change
      storeActions.addSips(100);

      // Should not have increased
      expect(notifiedCount).toBe(countAfterChange);
    });
  });
});

describe('Zustand Store - Selectors', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment();
    cleanup = env.cleanup;
    storeActions.resetState();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Individual Selectors', () => {
    it('should select sips correctly', () => {
      storeActions.setSips(1500);
      const sips = useGameStore.getState().sips;
      expectLargeNumberToEqual(sips, 1500);
    });

    it('should select straws correctly', () => {
      storeActions.setStraws(12);
      const straws = useGameStore.getState().straws;
      expectLargeNumberToEqual(straws, 12);
    });

    it('should select cups correctly', () => {
      storeActions.setCups(6);
      const cups = useGameStore.getState().cups;
      expectLargeNumberToEqual(cups, 6);
    });

    it('should select level correctly', () => {
      storeActions.setLevel(8);
      const level = useGameStore.getState().level;
      expectLargeNumberToEqual(level, 8);
    });

    it('should select SPS correctly', () => {
      storeActions.setHighestSipsPerSecond(45.5);
      const sps = useGameStore.getState().highestSipsPerSecond;
      expectLargeNumberToEqual(sps, 45.5);
    });

    it('should select options correctly', () => {
      storeActions.updateOptions({
        autosaveEnabled: false,
        clickSoundsEnabled: false,
      });

      const options = useGameStore.getState().options;
      expect(options.autosaveEnabled).toBe(false);
      expect(options.clickSoundsEnabled).toBe(false);
    });

    it('should select actions correctly', () => {
      const actions = useGameStore.getState().actions;
      expect(actions.addSips).toBeDefined();
      expect(actions.setSips).toBeDefined();
      expect(actions.addStraws).toBeDefined();
    });
  });
});

describe('Zustand Store - Legacy Compatibility', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment();
    cleanup = env.cleanup;
    storeActions.resetState();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Legacy Store Interface', () => {
    it('should create legacy store correctly', () => {
      const legacyStore = createLegacyStore({ test: 'value' });

      expect(legacyStore.getState).toBeDefined();
      expect(legacyStore.setState).toBeDefined();
      expect(legacyStore.subscribe).toBeDefined();
    });

    it('should get state through legacy interface', () => {
      const legacyStore = createLegacyStore({});
      const state = legacyStore.getState();

      expectLargeNumberToEqual((state as any).sips, 0);
      expectLargeNumberToEqual((state as any).straws, 0);
    });

    it('should set state through legacy interface', () => {
      const legacyStore = createLegacyStore({});

      legacyStore.setState({ sips: 500, straws: 5 });

      const state = legacyStore.getState();
      expect((state as any).sips).toBe(500);
      expect((state as any).straws).toBe(5);
    });

    it('should subscribe through legacy interface', () => {
      const legacyStore = createLegacyStore({});
      let notified = false;

      const unsubscribe = legacyStore.subscribe(() => {
        notified = true;
      });

      legacyStore.setState({ sips: 100 });

      expect(notified).toBe(true);
      unsubscribe();
    });
  });

  describe('Legacy App Store', () => {
    it('should provide legacy app store', () => {
      expect(appStore).toBeDefined();
      expect(appStore.getState).toBeDefined();
      expect(appStore.setState).toBeDefined();
      expect(appStore.subscribe).toBeDefined();
    });

    it('should work with legacy selectors', () => {
      const state = appStore.getState();

      expectLargeNumberToEqual(selectors.sips(state), 0);
      expectLargeNumberToEqual(selectors.level(state), 1);
      expect(selectors.drinkProgress(state)).toBe(0);
      expect(selectors.drinkRate(state)).toBe(0);
      expect(selectors.options(state)).toEqual({
        autosaveEnabled: true,
        autosaveInterval: 30,
        clickSoundsEnabled: true,
        musicEnabled: true,
        musicStreamPreferences: {
          preferred: 'local',
          fallbacks: ['local'],
        },
      });
    });
  });

  describe('Migration Functions', () => {
    it('should migrate to Zustand correctly', () => {
      const oldState = {
        sips: 2500,
        straws: 20,
        cups: 10,
        level: 15,
      };

      migrateToZustand(oldState);

      const newState = useGameStore.getState();
      expect(newState.sips).toBe(2500);
      expect(newState.straws).toBe(20);
      expect(newState.cups).toBe(10);
      expect(newState.level).toBe(15);
    });
  });
});

describe('Zustand Store - Performance', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment();
    cleanup = env.cleanup;
    storeActions.resetState();
  });

  afterEach(() => {
    cleanup();
  });

  it('should handle rapid state updates efficiently', () => {
    const startTime = performance.now();

    // Perform many rapid updates
    for (let i = 0; i < 1000; i++) {
      storeActions.addSips(1);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in reasonable time (less than 100ms)
    expect(duration).toBeLessThan(100);
    expectLargeNumberToEqual(useGameStore.getState().sips, 1000);
  });

  it('should handle multiple subscribers efficiently', () => {
    const subscribers = Array.from({ length: 100 }, () => {
      return useGameStore.subscribe(() => {});
    });

    const startTime = performance.now();

    // Make a change that should notify all subscribers
    storeActions.addSips(100);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in reasonable time (less than 50ms)
    expect(duration).toBeLessThan(50);

    // Clean up subscribers
    subscribers.forEach(unsubscribe => unsubscribe());
  });
});
