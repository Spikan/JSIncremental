// Zustand-based state store with dev tools and persistence
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { useMemo } from 'react';
import type { GameOptions, GameState } from './shape';
import { LargeNumber } from '../numbers/large-number';
import { add, toLargeNumber } from '../numbers/migration-utils';

// Extended state interface with actions
interface GameStore extends GameState {
  // Actions
  actions: {
    // Resource management (support LargeNumber for unlimited scaling)
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

    // Production stats (support LargeNumber for high production rates)
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

// Default state from shape.ts
const defaultState: GameState = {
  // Core resources
  sips: 0,
  straws: 0,
  cups: 0,
  suctions: 0,
  widerStraws: 0,
  betterCups: 0,
  fasterDrinks: 0,
  criticalClicks: 0,
  level: 1,

  // Production stats
  spd: 0, // sips per drink (renamed from sps for clarity)
  strawSPD: 0,
  cupSPD: 0,

  // Drink system
  drinkRate: 0,
  drinkProgress: 0,
  lastDrinkTime: 0,

  // Session and persistence
  lastSaveTime: 0,
  lastClickTime: 0,
  sessionStartTime: 0,
  totalPlayTime: 0,
  totalSipsEarned: 0,
  totalClicks: 0,
  highestSipsPerSecond: 0,
  currentClickStreak: 0,
  bestClickStreak: 0,

  // Click/crit systems
  criticalClickChance: 0,
  criticalClickMultiplier: 0,
  suctionClickBonus: 0,

  // Upgrade counters
  fasterDrinksUpCounter: 0,
  criticalClickUpCounter: 0,

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
          setSips: amount => set({ sips: toLargeNumber(amount) }),
          addStraws: amount => set(state => ({ straws: add(state.straws, amount) })),
          setStraws: amount => set({ straws: toLargeNumber(amount) }),
          addCups: amount => set(state => ({ cups: add(state.cups, amount) })),
          setCups: amount => set({ cups: toLargeNumber(amount) }),
          addSuctions: amount => set(state => ({ suctions: add(state.suctions, amount) })),
          setSuctions: amount => set({ suctions: toLargeNumber(amount) }),

          // Upgrade management
          addWiderStraws: amount => set(state => ({ widerStraws: add(state.widerStraws, amount) })),
          setWiderStraws: amount => set({ widerStraws: toLargeNumber(amount) }),
          addBetterCups: amount => set(state => ({ betterCups: add(state.betterCups, amount) })),
          setBetterCups: amount => set({ betterCups: toLargeNumber(amount) }),
          addFasterDrinks: amount => set(state => ({ fasterDrinks: add(state.fasterDrinks, amount) })),
          setFasterDrinks: amount => set({ fasterDrinks: toLargeNumber(amount) }),
          addCriticalClicks: amount =>
            set(state => ({ criticalClicks: add(state.criticalClicks, amount) })),
          setCriticalClicks: amount => set({ criticalClicks: toLargeNumber(amount) }),

          // Production stats
          setStrawSPD: spd => set({ strawSPD: toLargeNumber(spd) }),
          setCupSPD: spd => set({ cupSPD: toLargeNumber(spd) }),
          setSPD: spd => set({ spd: toLargeNumber(spd) }),

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
          setTotalSipsEarned: amount => set({ totalSipsEarned: toLargeNumber(amount) }),
          addTotalClicks: amount => set(state => ({ totalClicks: add(state.totalClicks, amount) })),
          setTotalClicks: amount => set({ totalClicks: toLargeNumber(amount) }),
          setHighestSipsPerSecond: sps => set({ highestSipsPerSecond: toLargeNumber(sps) }),
          setCurrentClickStreak: streak => set({ currentClickStreak: streak }),
          setBestClickStreak: streak =>
            set(state => ({
              bestClickStreak: Math.max(state.bestClickStreak, streak),
            })),

          // Click/crit systems
          setCriticalClickChance: (_chance: number) => set({ criticalClickChance: _chance }),
          setCriticalClickMultiplier: (_multiplier: any) =>
            set({ criticalClickMultiplier: toLargeNumber(_multiplier) }),
          setSuctionClickBonus: (_bonus: any) => set({ suctionClickBonus: toLargeNumber(_bonus) }),

          // Upgrade counters
          setFasterDrinksUpCounter: (_count: any) => set({ fasterDrinksUpCounter: toLargeNumber(_count) }),
          setCriticalClickUpCounter: (_count: any) => set({ criticalClickUpCounter: toLargeNumber(_count) }),

          // Level management
          setLevel: (_level: any) => set({ level: toLargeNumber(_level) }),
          addLevel: (_amount: number) => set(state => ({ level: state.level.add(toLargeNumber(_amount)) })),

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
          // Custom serialize to handle LargeNumber objects
          const serialized = JSON.stringify(state, (key, value) => {
            if (value && typeof value === 'object' && 'toString' in value && 'toNumber' in value) {
              // This looks like a LargeNumber object
              return {
                __largeNumber: true,
                value: value.toString()
              };
            }
            return value;
          });
          return serialized;
        },
        // Note: custom deserialize to revive LargeNumber
        deserialize: (str: any) => {
          // Custom deserialize to restore LargeNumber objects
          const parsed = JSON.parse(str, (key, value) => {
            if (value && typeof value === 'object' && value.__largeNumber) {
              // Restore LargeNumber from string representation
              return new LargeNumber(value.value);
            }
            return value;
          });
          return parsed;
        }
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
        console.warn(`${selectorName} selector failed in test environment, returning default:`, error);
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

// Basic resource selectors - convert LargeNumber to numbers for UI display
export const useSips = createSelector(state => state.sips.toNumber(), 0, 'sips');

export const useStraws = createSelector(state => state.straws.toNumber(), 0, 'straws');

export const useCups = createSelector(state => state.cups.toNumber(), 0, 'cups');

export const useSuctions = createSelector(state => state.suctions.toNumber(), 0, 'suctions');

export const useWiderStraws = createSelector(state => state.widerStraws.toNumber(), 0, 'widerStraws');

export const useBetterCups = createSelector(state => state.betterCups.toNumber(), 0, 'betterCups');

export const useFasterDrinks = createSelector(state => state.fasterDrinks.toNumber(), 0, 'fasterDrinks');

export const useCriticalClicks = createSelector(state => state.criticalClicks.toNumber(), 0, 'criticalClicks');

export const useLevel = createSelector(state => state.level.toNumber(), 1, 'level');

// Production and performance selectors - convert LargeNumber to numbers for UI display
export const useSPD = createSelector(state => state.spd.toNumber(), 0, 'spd');

export const useStrawSPD = createSelector(state => state.strawSPD.toNumber(), 0, 'strawSPD');

export const useCupSPD = createSelector(state => state.cupSPD.toNumber(), 0, 'cupSPD');

// Drink system selectors
export const useDrinkRate = createSelector(state => state.drinkRate, 0, 'drinkRate');

export const useDrinkProgress = createSelector(state => state.drinkProgress, 0, 'drinkProgress');

export const useLastDrinkTime = createSelector(state => state.lastDrinkTime, 0, 'lastDrinkTime');

// Click system selectors - convert LargeNumber to numbers for UI display
export const useCriticalClickChance = createSelector(
  state => state.criticalClickChance.toNumber(),
  0,
  'criticalClickChance'
);

export const useCriticalClickMultiplier = createSelector(
  state => state.criticalClickMultiplier.toNumber(),
  0,
  'criticalClickMultiplier'
);

export const useSuctionClickBonus = createSelector(
  state => state.suctionClickBonus.toNumber(),
  0,
  'suctionClickBonus'
);

// Session and statistics selectors - convert LargeNumber to numbers for UI display
export const useTotalClicks = createSelector(state => state.totalClicks.toNumber(), 0, 'totalClicks');

export const useTotalSipsEarned = createSelector(
  state => state.totalSipsEarned.toNumber(),
  0,
  'totalSipsEarned'
);

export const useTotalPlayTime = createSelector(state => state.totalPlayTime, 0, 'totalPlayTime');

export const useHighestSipsPerSecond = createSelector(
  state => state.highestSipsPerSecond.toNumber(),
  0,
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
      total: sips + straws + cups + suctions,
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
      totalSPD: strawSPD + cupSPD,
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
      effectiveMultiplier: criticalClickMultiplier + suctionClickBonus,
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
