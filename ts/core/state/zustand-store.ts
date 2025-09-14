// Zustand-based state store with dev tools and persistence
//
// MEMORY: ALL GAME STATE VALUES (SIPS, SPD, PURCHASE COSTS) MUST PRESERVE DECIMAL PRECISION
// MEMORY: EXTREMELY LARGE VALUES IN STATE ARE THE INTENDED RESULT OF GAMEPLAY
// MEMORY: NEVER CONVERT CORE GAME VALUES TO JAVASCRIPT NUMBERS IN SELECTORS
// MEMORY: USE STRING REPRESENTATIONS FOR EXTREME VALUES IN REACT HOOKS
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { useMemo } from 'react';
import type { GameOptions, GameState } from './shape';
// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { toDecimal, add } from '../numbers/migration-utils';

// Extended state interface with actions
interface GameStore extends GameState {
  // Actions
  actions: {
    // Resource management (support Decimal for unlimited scaling)
    addSips: (_amount: any) => void;
    setSips: (_amount: any) => void;
    addStraws: (_amount: any) => void;
    setStraws: (_amount: any) => void;
    addCups: (_amount: any) => void;
    setCups: (_amount: any) => void;
    addSuctions: (_amount: any) => void;
    setSuctions: (_amount: any) => void;

    // Upgrade management
    addWiderStraws: (_amount: any) => void;
    setWiderStraws: (_amount: any) => void;
    addBetterCups: (_amount: any) => void;
    setBetterCups: (_amount: any) => void;
    addFasterDrinks: (_amount: any) => void;
    setFasterDrinks: (_amount: any) => void;
    addCriticalClicks: (_amount: any) => void;
    setCriticalClicks: (_amount: any) => void;

    // Production stats (support Decimal for high production rates)
    setStrawSPD: (_spd: any) => void;
    setCupSPD: (_spd: any) => void;
    setSPD: (_spd: any) => void;

    // Drink system
    setDrinkRate: (_rate: number) => void;
    setDrinkProgress: (_progress: number) => void;
    setLastDrinkTime: (_time: number) => void;

    // Session and persistence
    setLastSaveTime: (_time: number) => void;
    setSessionStartTime: (_time: number) => void;
    addTotalPlayTime: (_time: number) => void;
    setTotalPlayTime: (_time: number) => void;
    addTotalSipsEarned: (_amount: number) => void;
    setTotalSipsEarned: (_amount: number) => void;
    addTotalClicks: (_amount: number) => void;
    setTotalClicks: (_amount: number) => void;
    setHighestSipsPerSecond: (_sps: number) => void;
    setCurrentClickStreak: (_streak: number) => void;
    setBestClickStreak: (_streak: number) => void;

    // Click/crit systems
    setCriticalClickChance: (_chance: number) => void;
    setCriticalClickMultiplier: (_multiplier: number) => void;
    setSuctionClickBonus: (_bonus: number) => void;

    // Upgrade counters
    setFasterDrinksUpCounter: (_count: number) => void;
    setCriticalClickUpCounter: (_count: number) => void;

    // Level management
    setLevel: (_level: number) => void;
    addLevel: (_amount: number) => void;

    // Options management
    updateOptions: (_options: Partial<GameOptions>) => void;
    setOption: <K extends keyof GameOptions>(_key: K, _value: GameOptions[K]) => void;

    // Bulk operations
    setState: (_partial: Partial<GameState>) => void;
    resetState: () => void;
    loadState: (_state: Partial<GameState>) => void;
  };
}

// Default state from shape.ts - using Decimal for all numeric values
const defaultState: GameState = {
  // Core resources
  sips: toDecimal(0),
  straws: toDecimal(0),
  cups: toDecimal(0),
  suctions: toDecimal(0),
  widerStraws: toDecimal(0),
  betterCups: toDecimal(0),
  fasterDrinks: toDecimal(0),
  criticalClicks: toDecimal(0),
  level: toDecimal(1),

  // Production stats
  spd: toDecimal(0), // sips per drink (renamed from sps for clarity)
  strawSPD: toDecimal(0),
  cupSPD: toDecimal(0),

  // Drink system
  drinkRate: 0,
  drinkProgress: 0,
  lastDrinkTime: 0,

  // Session and persistence
  lastSaveTime: 0,
  lastClickTime: 0,
  sessionStartTime: 0,
  totalPlayTime: 0,
  totalSipsEarned: toDecimal(0),
  totalClicks: 0,
  highestSipsPerSecond: toDecimal(0),
  currentClickStreak: 0,
  bestClickStreak: 0,

  // Click/crit systems
  criticalClickChance: toDecimal(0),
  criticalClickMultiplier: toDecimal(0),
  suctionClickBonus: toDecimal(0),

  // Upgrade counters
  fasterDrinksUpCounter: toDecimal(0),
  criticalClickUpCounter: toDecimal(0),

  // Options
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: true,
    musicStreamPreferences: {
      preferred: 'local',
      fallbacks: ['local'],
    },
    devToolsEnabled: false, // Hidden by default
    secretsUnlocked: false, // Konami code required
    godTabEnabled: false, // Hidden by default, unlocked via secrets
  },
};

// Create the Zustand store
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      subscribeWithSelector(set => ({
        ...defaultState,

        actions: {
          // Resource management
          addSips: amount =>
            set(state => ({
              sips: add(state.sips, amount),
              totalSipsEarned: add(state.totalSipsEarned, amount),
            })),
          setSips: amount => set({ sips: toDecimal(amount) }),
          addStraws: amount => set(state => ({ straws: add(state.straws, amount) })),
          setStraws: amount => set({ straws: toDecimal(amount) }),
          addCups: amount => set(state => ({ cups: add(state.cups, amount) })),
          setCups: amount => set({ cups: toDecimal(amount) }),
          addSuctions: amount => set(state => ({ suctions: add(state.suctions, amount) })),
          setSuctions: amount => set({ suctions: toDecimal(amount) }),

          // Upgrade management
          addWiderStraws: amount => set(state => ({ widerStraws: add(state.widerStraws, amount) })),
          setWiderStraws: amount => set({ widerStraws: toDecimal(amount) }),
          addBetterCups: amount => set(state => ({ betterCups: add(state.betterCups, amount) })),
          setBetterCups: amount => set({ betterCups: toDecimal(amount) }),
          addFasterDrinks: amount =>
            set(state => ({ fasterDrinks: add(state.fasterDrinks, amount) })),
          setFasterDrinks: amount => set({ fasterDrinks: toDecimal(amount) }),
          addCriticalClicks: amount =>
            set(state => ({ criticalClicks: add(state.criticalClicks, amount) })),
          setCriticalClicks: amount => set({ criticalClicks: toDecimal(amount) }),

          // Production stats
          setStrawSPD: spd => set({ strawSPD: toDecimal(spd) }),
          setCupSPD: spd => set({ cupSPD: toDecimal(spd) }),
          setSPD: spd => set({ spd: toDecimal(spd) }),

          // Drink system
          setDrinkRate: rate => set({ drinkRate: rate }),
          setDrinkProgress: progress => set({ drinkProgress: progress }),
          setLastDrinkTime: time => set({ lastDrinkTime: time }),

          // Session and persistence
          setLastSaveTime: time => set({ lastSaveTime: time }),
          setSessionStartTime: time => set({ sessionStartTime: time }),
          addTotalPlayTime: time => set(state => ({ totalPlayTime: state.totalPlayTime + time })),
          setTotalPlayTime: time => set({ totalPlayTime: time }),
          addTotalSipsEarned: amount =>
            set(state => ({ totalSipsEarned: add(state.totalSipsEarned, amount) })),
          setTotalSipsEarned: amount => set({ totalSipsEarned: toDecimal(amount) }),
          addTotalClicks: amount => set(state => ({ totalClicks: add(state.totalClicks, amount) })),
          setTotalClicks: amount => set({ totalClicks: toDecimal(amount) }),
          setHighestSipsPerSecond: sps => set({ highestSipsPerSecond: toDecimal(sps) }),
          setCurrentClickStreak: streak => set({ currentClickStreak: streak }),
          setBestClickStreak: streak =>
            set(state => ({
              bestClickStreak: Math.max(state.bestClickStreak, streak),
            })),

          // Click/crit systems
          setCriticalClickChance: (_chance: number) => set({ criticalClickChance: _chance }),
          setCriticalClickMultiplier: (_multiplier: any) =>
            set({ criticalClickMultiplier: toDecimal(_multiplier) }),
          setSuctionClickBonus: (_bonus: any) => set({ suctionClickBonus: toDecimal(_bonus) }),

          // Upgrade counters
          setFasterDrinksUpCounter: (_count: any) =>
            set({ fasterDrinksUpCounter: toDecimal(_count) }),
          setCriticalClickUpCounter: (_count: any) =>
            set({ criticalClickUpCounter: toDecimal(_count) }),

          // Level management
          setLevel: (_level: any) => set({ level: toDecimal(_level) }),
          addLevel: (_amount: number) =>
            set(state => ({ level: state.level.add(toDecimal(_amount)) })),

          // Options management
          updateOptions: (_options: Partial<GameOptions>) =>
            set(state => ({
              options: { ...state.options, ..._options },
            })),
          setOption: <K extends keyof GameOptions>(_key: K, _value: GameOptions[K]) =>
            set(state => ({
              options: { ...state.options, [_key]: _value },
            })),

          // Bulk operations
          setState: (_partial: Partial<GameState>) => set(state => ({ ...state, ..._partial })),
          resetState: () => set(defaultState),
          loadState: (_state: Partial<GameState>) => set(current => ({ ...current, ..._state })),
        },
      })),
      {
        name: 'soda-clicker-pro-save',
        partialize: state => ({
          // Only persist game state, not actions
          sips: state.sips,
          straws: state.straws,
          cups: state.cups,
          suctions: state.suctions,
          widerStraws: state.widerStraws,
          betterCups: state.betterCups,
          fasterDrinks: state.fasterDrinks,
          criticalClicks: state.criticalClicks,
          level: state.level,
          spd: state.spd,
          strawSPD: state.strawSPD,
          cupSPD: state.cupSPD,
          drinkRate: state.drinkRate,
          drinkProgress: state.drinkProgress,
          lastDrinkTime: state.lastDrinkTime,
          lastSaveTime: state.lastSaveTime,
          lastClickTime: state.lastClickTime,
          sessionStartTime: state.sessionStartTime,
          totalPlayTime: state.totalPlayTime,
          totalSipsEarned: state.totalSipsEarned,
          totalClicks: state.totalClicks,
          highestSipsPerSecond: state.highestSipsPerSecond,
          currentClickStreak: state.currentClickStreak,
          bestClickStreak: state.bestClickStreak,
          criticalClickChance: state.criticalClickChance,
          criticalClickMultiplier: state.criticalClickMultiplier,
          suctionClickBonus: state.suctionClickBonus,
          fasterDrinksUpCounter: state.fasterDrinksUpCounter,
          criticalClickUpCounter: state.criticalClickUpCounter,
          options: state.options,
        }),
        // @ts-expect-error: custom persist options supported by our setup
        serialize: (state: any) => {
          // Custom serialize to handle Decimal objects
          const serialized = JSON.stringify(state, (_key, value) => {
            if (value && typeof value === 'object' && 'toString' in value && 'toNumber' in value) {
              // This looks like a Decimal object
              return {
                __largeNumber: true,
                value: value.toString(),
              };
            }
            return value;
          });
          return serialized;
        },
        // Note: custom deserialize to revive Decimal
        deserialize: (str: any) => {
          // Custom deserialize to restore Decimal objects
          const parsed = JSON.parse(str, (_key, value) => {
            if (value && typeof value === 'object' && value.__largeNumber) {
              // Restore Decimal from string representation
              return new Decimal(value.value);
            }
            return value;
          });
          return parsed;
        },
      }
    ),
    {
      name: 'soda-clicker-pro-store',
    }
  )
);

// Export store instance for legacy compatibility
export const gameStore = useGameStore;

// Optimized selectors with memoization and proper error handling

// Selector creator with error boundary
const createSelector = <T>(
  selector: (state: GameStore) => T,
  defaultValue: T,
  selectorName: string
) => {
  return () => {
    // Test environment bypass for performance
    if (typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true) {
      try {
        const state = useGameStore.getState();
        return selector(state);
      } catch (error) {
        console.warn(
          `${selectorName} selector failed in test environment, returning default:`,
          error
        );
        return defaultValue;
      }
    }

    try {
      return useGameStore(selector);
    } catch (error) {
      console.warn(`${selectorName} selector failed, returning default:`, error);
      return defaultValue;
    }
  };
};

// Basic resource selectors - convert Decimal to numbers for UI display
// Keep full precision for extreme sips values - use string representation
export const useSips = createSelector(state => state.sips, null, 'sips');

export const useStraws = createSelector(state => state.straws?.toString() || '0', '0', 'straws');

export const useCups = createSelector(state => state.cups?.toString() || '0', '0', 'cups');

export const useSuctions = createSelector(
  state => state.suctions?.toString() || '0',
  '0',
  'suctions'
);

export const useWiderStraws = createSelector(
  state => state.widerStraws?.toString() || '0',
  '0',
  'widerStraws'
);

export const useBetterCups = createSelector(
  state => state.betterCups?.toString() || '0',
  '0',
  'betterCups'
);

export const useFasterDrinks = createSelector(
  state => state.fasterDrinks?.toString() || '0',
  '0',
  'fasterDrinks'
);

export const useCriticalClicks = createSelector(
  state => state.criticalClicks?.toString() || '0',
  '0',
  'criticalClicks'
);

export const useLevel = createSelector(state => state.level?.toString() || '1', '1', 'level');

// Production and performance selectors - convert Decimal to numbers for UI display
export const useSPD = createSelector(state => state.spd?.toString() || '0', '0', 'spd');

export const useStrawSPD = createSelector(
  state => state.strawSPD?.toString() || '0',
  '0',
  'strawSPD'
);

export const useCupSPD = createSelector(state => state.cupSPD?.toString() || '0', '0', 'cupSPD');

// Drink system selectors
export const useDrinkRate = createSelector(state => state.drinkRate, 0, 'drinkRate');

export const useDrinkProgress = createSelector(state => state.drinkProgress, 0, 'drinkProgress');

export const useLastDrinkTime = createSelector(state => state.lastDrinkTime, 0, 'lastDrinkTime');

// Click system selectors - convert Decimal to numbers for UI display
export const useCriticalClickChance = createSelector(
  state => state.criticalClickChance,
  0,
  'criticalClickChance'
);

export const useCriticalClickMultiplier = createSelector(
  state => state.criticalClickMultiplier?.toString() || '0',
  '0',
  'criticalClickMultiplier'
);

export const useSuctionClickBonus = createSelector(
  state => state.suctionClickBonus?.toString() || '0',
  '0',
  'suctionClickBonus'
);

// Session and statistics selectors - convert Decimal to numbers for UI display
export const useTotalClicks = createSelector(
  state => state.totalClicks?.toString() || '0',
  '0',
  'totalClicks'
);

export const useTotalSipsEarned = createSelector(
  state => state.totalSipsEarned?.toString() || '0',
  '0',
  'totalSipsEarned'
);

export const useTotalPlayTime = createSelector(state => state.totalPlayTime, 0, 'totalPlayTime');

export const useHighestSipsPerSecond = createSelector(
  state => state.highestSipsPerSecond?.toString() || '0',
  '0',
  'highestSipsPerSecond'
);

export const useCurrentClickStreak = createSelector(
  state => state.currentClickStreak,
  0,
  'currentClickStreak'
);

export const useBestClickStreak = createSelector(
  state => state.bestClickStreak,
  0,
  'bestClickStreak'
);

// Options and settings selectors
export const useOptions = createSelector(state => state.options, defaultState.options, 'options');

// Actions selector (memoized to prevent unnecessary re-renders)
export const useActions = () => {
  if (typeof window !== 'undefined' && (window as any).__TEST_ENV__ === true) {
    return useGameStore.getState().actions;
  }

  return useGameStore(state => state.actions);
};

// Computed selectors for derived state
export const useTotalResources = () => {
  const sips = useSips();
  const straws = useStraws();
  const cups = useCups();
  const suctions = useSuctions();

  return useMemo(
    () => ({
      sips,
      straws,
      cups,
      suctions,
      total: (state: GameStore) =>
        state.sips
          ?.add(state.straws || new Decimal(0))
          .add(state.cups || new Decimal(0))
          .add(state.suctions || new Decimal(0))
          .toString() || '0',
    }),
    [sips, straws, cups, suctions]
  );
};

export const useProductionStats = () => {
  const spd = useSPD();
  const strawSPD = useStrawSPD();
  const cupSPD = useCupSPD();

  return useMemo(
    () => ({
      spd,
      strawSPD,
      cupSPD,
      totalSPD: (state: GameStore) =>
        state.strawSPD?.add(state.cupSPD || new Decimal(0)).toString() || '0',
    }),
    [spd, strawSPD, cupSPD]
  );
};

export const useClickStats = () => {
  const totalClicks = useTotalClicks();
  const criticalClickChance = useCriticalClickChance();
  const criticalClickMultiplier = useCriticalClickMultiplier();
  const suctionClickBonus = useSuctionClickBonus();

  return useMemo(
    () => ({
      totalClicks,
      criticalClickChance,
      criticalClickMultiplier,
      suctionClickBonus,
      effectiveMultiplier: (state: GameStore) =>
        state.criticalClickMultiplier?.add(state.suctionClickBonus || new Decimal(0)).toString() ||
        '0',
    }),
    [totalClicks, criticalClickChance, criticalClickMultiplier, suctionClickBonus]
  );
};

// Optimized subscription hooks
export const useSubscribeToSips = (callback: (sips: number) => void) => {
  return useGameStore.subscribe(state => state.sips, callback, { fireImmediately: false });
};

export const useSubscribeToLevel = (callback: (level: number) => void) => {
  return useGameStore.subscribe(state => state.level, callback, { fireImmediately: false });
};

export const useSubscribeToSPD = (callback: (spd: number) => void) => {
  return useGameStore.subscribe(state => state.spd, callback, { fireImmediately: false });
};

// Export store actions for direct access (useful in tests and non-React contexts)
export const getStoreActions = () => useGameStore.getState().actions;

// Export for legacy window access
try {
  (window as any).useGameStore = useGameStore;
  (window as any).gameStore = gameStore;
} catch (error) {
  console.warn('Failed to expose Zustand store globally:', error);
}
