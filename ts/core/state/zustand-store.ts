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
// Import toDecimal for lazy loading
import { toDecimal, add } from '../numbers/migration-utils';

// Extended state interface with actions
interface GameStore extends GameState {
  // Actions
  actions: {
    // Resource management (support Decimal for unlimited scaling)
    addSips: (amount: any) => void;
    setSips: (amount: any) => void;
    addStraws: (amount: any) => void;
    setStraws: (amount: any) => void;
    addCups: (amount: any) => void;
    setCups: (amount: any) => void;
    addSuctions: (amount: any) => void;
    setSuctions: (amount: any) => void;

    // Upgrade management
    addWiderStraws: (amount: any) => void;
    setWiderStraws: (amount: any) => void;
    addBetterCups: (amount: any) => void;
    setBetterCups: (amount: any) => void;
    addFasterDrinks: (amount: any) => void;
    setFasterDrinks: (amount: any) => void;
    addCriticalClicks: (amount: any) => void;
    setCriticalClicks: (amount: any) => void;

    // Production stats (support Decimal for high production rates)
    setStrawSPD: (spd: any) => void;
    setCupSPD: (spd: any) => void;
    setSPD: (spd: any) => void;

    // Drink system
    setDrinkRate: (rate: number) => void;
    setDrinkProgress: (progress: number) => void;
    setLastDrinkTime: (time: number) => void;

    // Session and persistence
    setLastSaveTime: (time: number) => void;
    setSessionStartTime: (time: number) => void;
    addTotalPlayTime: (time: number) => void;
    setTotalPlayTime: (time: number) => void;
    addTotalSipsEarned: (amount: number) => void;
    setTotalSipsEarned: (amount: number) => void;
    addTotalClicks: (amount: number) => void;
    setTotalClicks: (amount: number) => void;
    setHighestSipsPerSecond: (sps: number) => void;
    setCurrentClickStreak: (streak: number) => void;
    setBestClickStreak: (streak: number) => void;

    // Click/crit systems
    setCriticalClickChance: (chance: number) => void;
    setCriticalClickMultiplier: (multiplier: number) => void;
    setSuctionClickBonus: (bonus: number) => void;

    // Upgrade counters
    setFasterDrinksUpCounter: (count: number) => void;
    setCriticalClickUpCounter: (count: number) => void;

    // Level management
    setLevel: (level: number) => void;
    addLevel: (amount: number) => void;

    // Options management
    updateOptions: (options: Partial<GameOptions>) => void;
    setOption: <K extends keyof GameOptions>(key: K, value: GameOptions[K]) => void;

    // Bulk operations
    setState: (partial: Partial<GameState>) => void;
    resetState: () => void;
    loadState: (state: Partial<GameState>) => void;
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
          setCriticalClickChance: (chance: number) => set({ criticalClickChance: chance }),
          setCriticalClickMultiplier: (multiplier: any) =>
            set({ criticalClickMultiplier: toDecimal(multiplier) }),
          setSuctionClickBonus: (bonus: any) => set({ suctionClickBonus: toDecimal(bonus) }),

          // Upgrade counters
          setFasterDrinksUpCounter: (count: any) =>
            set({ fasterDrinksUpCounter: toDecimal(count) }),
          setCriticalClickUpCounter: (count: any) =>
            set({ criticalClickUpCounter: toDecimal(count) }),

          // Level management
          setLevel: (level: any) => set({ level: toDecimal(level) }),
          addLevel: (amount: number) =>
            set(state => ({ level: state.level.add(toDecimal(amount)) })),

          // Options management
          updateOptions: (options: Partial<GameOptions>) =>
            set(state => ({
              options: { ...state.options, ...options },
            })),
          setOption: <K extends keyof GameOptions>(key: K, value: GameOptions[K]) =>
            set(state => ({
              options: { ...state.options, [key]: value },
            })),

          // Bulk operations
          setState: (partial: Partial<GameState>) => set(state => ({ ...state, ...partial })),
          resetState: () => set(defaultState),
          loadState: (state: Partial<GameState>) => set(current => ({ ...current, ...state })),
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
              return toDecimal(value.value);
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
          ?.add(state.straws || toDecimal(0))
          .add(state.cups || toDecimal(0))
          .add(state.suctions || toDecimal(0))
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
        state.strawSPD?.add(state.cupSPD || toDecimal(0)).toString() || '0',
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
        state.criticalClickMultiplier?.add(state.suctionClickBonus || toDecimal(0)).toString() ||
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
export const storeActions = useGameStore.getState().actions;

// Export for legacy window access
try {
  (window as any).useGameStore = useGameStore;
  (window as any).gameStore = gameStore;
} catch (error) {
  console.warn('Failed to expose Zustand store globally:', error);
}
