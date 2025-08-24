// Zustand-based state store with dev tools and persistence
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { GameOptions, GameState } from './shape';

// Extended state interface with actions
interface GameStore extends GameState {
  // Actions
  actions: {
    // Resource management
    addSips: (_amount: number) => void;
    setSips: (_amount: number) => void;
    addStraws: (_amount: number) => void;
    setStraws: (_amount: number) => void;
    addCups: (_amount: number) => void;
    setCups: (_amount: number) => void;
    addSuctions: (_amount: number) => void;
    setSuctions: (_amount: number) => void;

    // Upgrade management
    addWiderStraws: (_amount: number) => void;
    setWiderStraws: (_amount: number) => void;
    addBetterCups: (_amount: number) => void;
    setBetterCups: (_amount: number) => void;
    addFasterDrinks: (_amount: number) => void;
    setFasterDrinks: (_amount: number) => void;
    addCriticalClicks: (_amount: number) => void;
    setCriticalClicks: (_amount: number) => void;

    // Production stats
    setStrawSPD: (_spd: number) => void;
    setCupSPD: (_spd: number) => void;
    setSPS: (_sps: number) => void;

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
          setCriticalClickChance: (_chance: number) => set({ criticalClickChance: _chance }),
          setCriticalClickMultiplier: (_multiplier: number) =>
            set({ criticalClickMultiplier: _multiplier }),
          setSuctionClickBonus: (_bonus: number) => set({ suctionClickBonus: _bonus }),

          // Upgrade counters
          setFasterDrinksUpCounter: (_count: number) => set({ fasterDrinksUpCounter: _count }),
          setCriticalClickUpCounter: (_count: number) => set({ criticalClickUpCounter: _count }),

          // Level management
          setLevel: (_level: number) => set({ level: _level }),
          addLevel: (_amount: number) => set(state => ({ level: state.level + _amount })),

          // Options management
          updateOptions: (_options: Partial<GameOptions>) =>
            set(state => ({
              options: { ...state.options, ..._options },
            })),
          setOption: (_key: keyof GameOptions, _value: any) =>
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
} catch (error) {
  console.warn('Failed to expose Zustand store globally:', error);
}
