// Enhanced Type Definitions for Soda Clicker Pro (TypeScript)
// Replacing excessive 'any' usage with proper types

import { DecimalType } from '../core/numbers/decimal-utils';
import { GameState, GameOptions } from '../core/state/shape';

// Enhanced numeric value type
export type NumericValue = number | string | DecimalType;

// Window App object structure
export interface AppObject {
  state: {
    getState: () => GameState;
    setState: (partial: Partial<GameState>) => void;
    subscribe: (callback: (state: GameState) => void) => () => void;
    actions: GameStateActions;
  };
  storage: StorageAPI;
  events: EventBus;
  EVENT_NAMES: EventNames;
  rules: GameRules;
  systems: GameSystems;
  ui: UISystem;
  data: GameData;
  performance: PerformanceMonitor;
}

// Game state actions interface
export interface GameStateActions {
  // Resource management
  addSips: (amount: NumericValue) => void;
  setSips: (amount: NumericValue) => void;
  addStraws: (amount: NumericValue) => void;
  setStraws: (amount: NumericValue) => void;
  addCups: (amount: NumericValue) => void;
  setCups: (amount: NumericValue) => void;
  addSuctions: (amount: NumericValue) => void;
  setSuctions: (amount: NumericValue) => void;

  // Upgrade management
  addWiderStraws: (amount: NumericValue) => void;
  setWiderStraws: (amount: NumericValue) => void;
  addBetterCups: (amount: NumericValue) => void;
  setBetterCups: (amount: NumericValue) => void;
  addFasterDrinks: (amount: NumericValue) => void;
  setFasterDrinks: (amount: NumericValue) => void;
  addCriticalClicks: (amount: NumericValue) => void;
  setCriticalClicks: (amount: NumericValue) => void;

  // Level and timing
  setLevel: (level: NumericValue) => void;
  addLevel: (amount: number) => void;
  setDrinkRate: (rate: number) => void;
  setDrinkProgress: (progress: number) => void;
  setLastDrinkTime: (time: number) => void;

  // Options
  updateOptions: (options: Partial<GameOptions>) => void;
  setOption: <K extends keyof GameOptions>(key: K, value: GameOptions[K]) => void;

  // Bulk operations
  setState: (partial: Partial<GameState>) => void;
  resetState: () => void;
  loadState: (state: Partial<GameState>) => void;
}

// Storage API interface
export interface StorageAPI {
  loadGame: () => SaveGameData | null;
  saveGame: (data: SaveGameData) => boolean;
  setJSON: (key: string, data: unknown) => void;
  getJSON: (key: string, defaultValue?: unknown) => unknown;
  getBoolean: (key: string, defaultValue?: boolean) => boolean;
  setBoolean: (key: string, value: boolean) => void;
  getString: (key: string, defaultValue?: string) => string;
  setString: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

// Save game data structure
export interface SaveGameData {
  sips: string | number;
  straws: string | number;
  cups: string | number;
  suctions: string | number;
  widerStraws: string | number;
  betterCups: string | number;
  fasterDrinks: string | number;
  criticalClicks: string | number;
  level: string | number;
  spd: string | number;
  strawSPD: string | number;
  cupSPD: string | number;
  drinkRate: number;
  drinkProgress: number;
  lastDrinkTime: number;
  lastSaveTime: number;
  sessionStartTime: number;
  totalPlayTime: number;
  totalSipsEarned: string | number;
  totalClicks: string | number;
  highestSipsPerSecond: string | number;
  currentClickStreak: number;
  bestClickStreak: number;
  criticalClickChance: number;
  criticalClickMultiplier: string | number;
  suctionClickBonus: string | number;
  fasterDrinksUpCounter: string | number;
  criticalClickUpCounter: string | number;
  options: GameOptions;
}

// Event bus interface
export interface EventBus {
  on: (event: string, callback: EventCallback) => void;
  off: (event: string, callback: EventCallback) => void;
  emit: (event: string, data?: unknown) => void;
  once: (event: string, callback: EventCallback) => void;
  removeAllListeners: (event?: string) => void;
}

export type EventCallback = (data?: unknown) => void;

// Event names structure
export interface EventNames {
  GAME: {
    LOADED: string;
    SAVED: string;
    DELETED: string;
    TICK: string;
  };
  CLICK: {
    SODA: string;
    CRITICAL: string;
  };
  ECONOMY: {
    SIPS_GAINED: string;
    PURCHASE: string;
    UPGRADE_PURCHASED: string;
  };
  FEATURE: {
    UNLOCKED: string;
  };
  UI: {
    TAB_SWITCHED: string;
    UPDATE_DISPLAY: string;
  };
  MUSIC: {
    PLAY: string;
    PAUSE: string;
    MUTE: string;
    UNMUTE: string;
    STREAM_CHANGED: string;
  };
  OPTIONS: {
    AUTOSAVE_TOGGLED: string;
    AUTOSAVE_INTERVAL_CHANGED: string;
    CLICK_SOUNDS_TOGGLED: string;
  };
}

// Game rules interface
export interface GameRules {
  clicks: ClickRules;
  purchases: PurchaseRules;
  economy: EconomyRules;
}

export interface ClickRules {
  calculateClickValue?: (baseValue: NumericValue, multipliers: NumericValue[]) => NumericValue;
  checkCriticalHit?: (chance: number) => boolean;
  applyClickBonus?: (value: NumericValue, bonus: NumericValue) => NumericValue;
}

export interface PurchaseRules {
  calculateCost?: (baseCost: NumericValue, count: NumericValue, multiplier: number) => NumericValue;
  canAfford?: (cost: NumericValue, resources: NumericValue) => boolean;
  processPurchase?: (cost: NumericValue, resources: NumericValue) => NumericValue;
}

export interface EconomyRules {
  computeStrawSPD?: (
    straws: NumericValue,
    baseSPD: number,
    upgrades: NumericValue,
    multiplier: number
  ) => NumericValue;
  computeCupSPD?: (
    cups: NumericValue,
    baseSPD: number,
    upgrades: NumericValue,
    multiplier: number
  ) => NumericValue;
  computeTotalSPD?: (strawSPD: NumericValue, cupSPD: NumericValue) => NumericValue;
}

// Game systems interface
export interface GameSystems {
  resources: ResourceSystem;
  purchases: PurchaseSystem;
  clicks: ClickSystem;
  autosave: AutosaveSystem;
  save: SaveSystem;
  options: OptionsSystem;
  loop: LoopSystem;
  audio: AudioSystem;
  gameInit: GameInitSystem;
  drink: DrinkSystem;
  unlocks?: UnlockSystem;
  dev?: DevSystem;
}

// Individual system interfaces
export interface ResourceSystem {
  recalcProduction?: (params: ProductionParams) => ProductionResult;
  updateResourceDisplay?: () => void;
}

export interface ProductionParams {
  straws: NumericValue;
  cups: NumericValue;
  widerStraws: NumericValue;
  betterCups: NumericValue;
  base: {
    strawBaseSPD: number;
    cupBaseSPD: number;
    baseSipsPerDrink: number;
  };
  multipliers: {
    widerStrawsPerLevel: number;
    betterCupsPerLevel: number;
  };
}

export interface ProductionResult {
  strawSPD: NumericValue;
  cupSPD: NumericValue;
  sipsPerDrink: NumericValue;
}

export interface PurchaseSystem {
  buyStraw?: () => boolean;
  buyCup?: () => boolean;
  buySuction?: () => boolean;
  buyWiderStraws?: () => boolean;
  buyBetterCups?: () => boolean;
  buyFasterDrinks?: () => boolean;
  buyCriticalClick?: () => boolean;
  levelUp?: () => boolean;
  validateExtremeValues?: () => void;
}

export interface ClickSystem {
  handleClick?: (event?: Event) => void;
  trackClick?: () => void;
  applyCriticalHit?: (baseValue: NumericValue) => NumericValue;
}

export interface AutosaveSystem {
  start?: () => void;
  stop?: () => void;
  trigger?: () => void;
}

export interface SaveSystem {
  save?: () => boolean;
  load?: () => boolean;
  export?: () => string;
  import?: (data: string) => boolean;
}

export interface OptionsSystem {
  updateAutosave?: (enabled: boolean) => void;
  updateAutosaveInterval?: (interval: number) => void;
  updateClickSounds?: (enabled: boolean) => void;
  updateMusic?: (enabled: boolean) => void;
}

export interface LoopSystem {
  start?: (callbacks: LoopCallbacks) => void;
  stop?: () => void;
  isRunning?: () => boolean;
}

export interface LoopCallbacks {
  updateDrinkProgress?: () => void;
  processDrink?: () => void;
  updateStats?: () => void;
  updatePlayTime?: () => void;
  updateLastSaveTime?: () => void;
}

export interface AudioSystem {
  button: ButtonAudioSystem;
}

export interface ButtonAudioSystem {
  initButtonAudioSystem?: () => void;
  playButtonClickSound?: () => void;
  updateButtonSoundsToggleButton?: () => void;
}

export interface GameInitSystem {
  initSplashScreen?: () => void;
  startGame?: () => void;
  startGameCore?: () => void;
  initOnDomReady?: () => void;
}

export interface DrinkSystem {
  processDrink?: () => void;
  updateDrinkProgress?: () => void;
}

export interface UnlockSystem {
  init?: () => void;
  checkAllUnlocks?: () => void;
  checkUnlock?: (unlockId: string) => boolean;
}

export interface DevSystem {
  addMassiveSips?: () => boolean;
  addHugeStraws?: () => boolean;
  addMassiveCups?: () => boolean;
  addExtremeResources?: () => boolean;
  testScientificNotation?: () => boolean;
  resetAllResources?: () => boolean;
}

// UI system interface
export interface UISystem {
  initializeUI?: () => void;
  updateTopSipCounter?: () => void;
  updateTopSipsPerDrink?: () => void;
  updateTopSipsPerSecond?: () => void;
  updateAllStats?: () => void;
  updatePurchasedCounts?: () => void;
  checkUpgradeAffordability?: () => void;
  updateDrinkProgress?: (progress: number, rate: number) => void;
  updatePlayTime?: () => void;
  updateLastSaveTime?: () => void;
  updateAllDisplays?: () => void;
  showClickFeedback?: (
    sipsGained: NumericValue,
    isCritical: boolean,
    x?: number,
    y?: number
  ) => void;
  showPurchaseFeedback?: (itemName: string, cost: NumericValue, x?: number, y?: number) => void;
  switchTab?: (tabName: string, event?: Event) => void;
}

// Game data interface
export interface GameData {
  upgrades?: UpgradeConfig;
  unlocks?: UnlockConfig;
}

export interface UpgradeConfig {
  [key: string]: UpgradeDefinition;
}

export interface UpgradeDefinition {
  name: string;
  baseCost: number;
  costMultiplier: number;
  baseSPD?: number;
  multiplierPerLevel?: number;
  description?: string;
}

export interface UnlockConfig {
  [key: string]: UnlockDefinition;
}

export interface UnlockDefinition {
  sips: number;
  clicks: number;
  description?: string;
}

// Performance monitor interface
export interface PerformanceMonitor {
  start?: (label: string) => void;
  end?: (label: string) => void;
  mark?: (label: string) => void;
  measure?: (name: string, startMark: string, endMark: string) => void;
  getMetrics?: () => PerformanceMetrics;
}

export interface PerformanceMetrics {
  [key: string]: {
    calls: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
  };
}

// Cost calculation result
export interface CostResult {
  straw: NumericValue;
  cup: NumericValue;
  suction: NumericValue;
  widerStraws: NumericValue;
  betterCups: NumericValue;
  fasterDrinks: NumericValue;
  criticalClick: NumericValue;
  fasterDrinksUp: NumericValue;
  levelUp: NumericValue;
}

// Click event data
export interface ClickEventData {
  gained: NumericValue;
  critical: boolean;
  clickX?: number;
  clickY?: number;
}

// Purchase event data
export interface PurchaseEventData {
  item: string;
  cost: NumericValue;
  clickX?: number;
  clickY?: number;
}

// Global window extensions
declare global {
  interface Window {
    App: AppObject;
    DOM_CACHE: DOMCache;
    EVENT_NAMES: EventNames;
    Decimal: typeof import('../core/numbers/decimal').Decimal;
    subscriptionManager: any;
    debounceManager: any;
    storage: StorageAPI;
    eventBus: EventBus;
    bus: EventBus;
    initOnDomReady: () => void;
    initGame: () => void;
    startGame: () => void;
    lastDrinkTime: number;
    lastSaveTime: number;
    drinkRate: number;
    // Legacy globals (for compatibility)
    sips: NumericValue;
    straws: NumericValue;
    cups: NumericValue;
    suctions: NumericValue;
    widerStraws: NumericValue;
    betterCups: NumericValue;
    fasterDrinks: NumericValue;
    criticalClicks: NumericValue;
    level: NumericValue;
    spd: NumericValue;
    strawSPD: NumericValue;
    cupSPD: NumericValue;
  }
}

// DOM Cache interface
export interface DOMCache {
  [key: string]:
    | HTMLElement
    | null
    | (() => void)
    | ((id: string) => HTMLElement | null)
    | (() => boolean);
  init(): void;
  get(id: string): HTMLElement | null;
  isReady(): boolean;
}

export default {};
