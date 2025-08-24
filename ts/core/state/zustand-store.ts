// Zustand-based state store with dev tools and persistence
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { GameOptions, GameState } from './shape';

// Extended state interface with actions
interface GameStore extends GameState {
  // Actions
  actions: {
    // Resource management
    addSips: (amount: number) => void;
    setSips: (amount: number) => void;
    addStraws: (amount: number) => void;
    setStraws: (amount: number) => void;
    addCups: (amount: number) => void;
    setCups: (amount: number) => void;
    addSuctions: (amount: number) => void;
    setSuctions: (amount: number) => void;

    // Upgrade management
    addWiderStraws: (amount: number) => void;
    setWiderStraws: (amount: number) => void;
    addBetterCups: (amount: number) => void;
    setBetterCups: (amount: number) => void;
    addFasterDrinks: (amount: number) => void;
    setFasterDrinks: (amount: number) => void;
    addCriticalClicks: (amount: number) => void;
    setCriticalClicks: (amount: number) => void;

    // Production stats
    setStrawSPD: (spd: number) => void;
    setCupSPD: (spd: number) => void;
    setSPS: (sps: number) => void;

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
  sps: 0,
  strawSPD: 0,
  cupSPD: 0,

  // Drink system
  drinkRate: 0,
  drinkProgress: 0,
  lastDrinkTime: 0,

  // Session and persistence
  lastSaveTime: 0,
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
              sips: state.sips + amount,
              totalSipsEarned: state.totalSipsEarned + amount,
            })),
          setSips: amount => set({ sips: amount }),
          addStraws: amount => set(state => ({ straws: state.straws + amount })),
          setStraws: amount => set({ straws: amount }),
          addCups: amount => set(state => ({ cups: state.cups + amount })),
          setCups: amount => set({ cups: amount }),
          addSuctions: amount => set(state => ({ suctions: state.suctions + amount })),
          setSuctions: amount => set({ suctions: amount }),

          // Upgrade management
          addWiderStraws: amount => set(state => ({ widerStraws: state.widerStraws + amount })),
          setWiderStraws: amount => set({ widerStraws: amount }),
          addBetterCups: amount => set(state => ({ betterCups: state.betterCups + amount })),
          setBetterCups: amount => set({ betterCups: amount }),
          addFasterDrinks: amount => set(state => ({ fasterDrinks: state.fasterDrinks + amount })),
          setFasterDrinks: amount => set({ fasterDrinks: amount }),
          addCriticalClicks: amount =>
            set(state => ({ criticalClicks: state.criticalClicks + amount })),
          setCriticalClicks: amount => set({ criticalClicks: amount }),

          // Production stats
          setStrawSPD: spd => set({ strawSPD: spd }),
          setCupSPD: spd => set({ cupSPD: spd }),
          setSPS: sps => set({ sps }),

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
            set(state => ({ totalSipsEarned: state.totalSipsEarned + amount })),
          setTotalSipsEarned: amount => set({ totalSipsEarned: amount }),
          addTotalClicks: amount => set(state => ({ totalClicks: state.totalClicks + amount })),
          setTotalClicks: amount => set({ totalClicks: amount }),
          setHighestSipsPerSecond: sps => set({ highestSipsPerSecond: sps }),
          setCurrentClickStreak: streak => set({ currentClickStreak: streak }),
          setBestClickStreak: streak =>
            set(state => ({
              bestClickStreak: Math.max(state.bestClickStreak, streak),
            })),

          // Click/crit systems
          setCriticalClickChance: chance => set({ criticalClickChance: chance }),
          setCriticalClickMultiplier: multiplier => set({ criticalClickMultiplier: multiplier }),
          setSuctionClickBonus: bonus => set({ suctionClickBonus: bonus }),

          // Upgrade counters
          setFasterDrinksUpCounter: count => set({ fasterDrinksUpCounter: count }),
          setCriticalClickUpCounter: count => set({ criticalClickUpCounter: count }),

          // Level management
          setLevel: level => set({ level }),
          addLevel: amount => set(state => ({ level: state.level + amount })),

          // Options management
          updateOptions: options =>
            set(state => ({
              options: { ...state.options, ...options },
            })),
          setOption: (key, value) =>
            set(state => ({
              options: { ...state.options, [key]: value },
            })),

          // Bulk operations
          setState: partial => set(state => ({ ...state, ...partial })),
          resetState: () => set(defaultState),
          loadState: state => set(current => ({ ...current, ...state })),
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
          sps: state.sps,
          strawSPD: state.strawSPD,
          cupSPD: state.cupSPD,
          drinkRate: state.drinkRate,
          drinkProgress: state.drinkProgress,
          lastDrinkTime: state.lastDrinkTime,
          lastSaveTime: state.lastSaveTime,
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
      }
    ),
    {
      name: 'soda-clicker-pro-store',
    }
  )
);

// Export store instance for legacy compatibility
export const gameStore = useGameStore;

// Export selectors for performance optimization
export const useSips = () => useGameStore(state => state.sips);
export const useStraws = () => useGameStore(state => state.straws);
export const useCups = () => useGameStore(state => state.cups);
export const useLevel = () => useGameStore(state => state.level);
export const useSPS = () => useGameStore(state => state.sps);
export const useOptions = () => useGameStore(state => state.options);
export const useActions = () => useGameStore(state => state.actions);

// Export store actions for direct access (useful in tests and non-React contexts)
export const storeActions = useGameStore.getState().actions;

// Export for legacy window access
try {
  (window as any).useGameStore = useGameStore;
  (window as any).gameStore = gameStore;
} catch {}
