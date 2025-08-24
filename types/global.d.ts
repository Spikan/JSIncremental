// Global ambient declarations to enable TypeScript checking over JS files

// Minimal Decimal-like interface compatible with production and test stubs
interface DecimalLike {
  toNumber(): number;
  toString(): string;
  plus(_value: number | string | DecimalLike): DecimalLike;
  minus?(_value: number | string | DecimalLike): DecimalLike;
  times(_value: number | string | DecimalLike): DecimalLike;
  div?(_value: number | string | DecimalLike): DecimalLike;
  gte?(_value: number | string | DecimalLike): boolean;
  gt?(_value: number | string | DecimalLike): boolean;
  lte?(_value: number | string | DecimalLike): boolean;
  lt?(_value: number | string | DecimalLike): boolean;
}

interface DecimalCtor {
  new (_value: number | string | DecimalLike): DecimalLike;
}

type EventHandler<T = unknown> = (_payload: T) => void;

interface EventBusGeneric {
  on(_event: string, _handler: EventHandler<unknown>): () => void;
  off(_event: string, _handler: EventHandler<unknown>): void;
  emit(_event: string, _payload?: unknown): void;
}

interface GameOptions {
  autosaveEnabled: boolean;
  autosaveInterval: number; // seconds
  clickSoundsEnabled: boolean;
  musicEnabled: boolean;
  musicStreamPreferences?: Record<string, boolean> | { preferred?: string; fallbacks?: string[] };
}

interface GameState {
  sips: number;
  straws: number;
  cups: number;
  suctions: number;
  widerStraws: number;
  betterCups: number;
  fasterDrinks: number;
  criticalClicks: number;
  level: number;
  sps: number;
  strawSPD: number;
  cupSPD: number;
  drinkRate: number;
  drinkProgress: number;
  lastDrinkTime: number;
  // newly centralized
  criticalClickChance: number;
  criticalClickMultiplier: number;
  suctionClickBonus: number;
  fasterDrinksUpCounter: number;
  criticalClickUpCounter: number;
  lastSaveTime: number;
  sessionStartTime: number;
  totalSipsEarned: number;
  totalClicks: number;
  highestSipsPerSecond: number;
  totalPlayTime: number;
  options: GameOptions;
}

interface Store<T> {
  getState(): T;
  setState(_partial: Partial<T>): void;
  subscribe(_listener: (_state: T) => void): () => void;
}

// Type for store actions (exported for future use)
export interface StoreActions<T> {
  setState: (_partial: Partial<T>) => void;
  resetState: () => void;
  loadState: (_state: Partial<T>) => void;
}

type ButtonAudioAPI = {
  initButtonAudioSystem?: () => void;
  toggleButtonSounds?: () => void;
  updateButtonSoundsToggleButton?: () => void;
  playButtonClickSound?: () => void;
  playButtonPurchaseSound?: () => void;
  playButtonCriticalClickSound?: () => void;
  playSodaClickSound?: () => void;
  playLevelUpSound?: () => void;
  playTabSwitchSound?: () => void;
  getButtonSoundsEnabled?: () => boolean;
};

type SystemsAPI = {
  resources?: Record<string, unknown>;
  purchases?: Record<string, unknown>;
  clicks?: Record<string, unknown>;
  autosave?: Record<string, unknown>;
  save?: Record<string, unknown>;
  options?: Record<string, unknown>;
  loop?: Record<string, unknown>;
  audio?: { button?: ButtonAudioAPI };
  gameInit?: Record<string, unknown>;
  drink?: Record<string, unknown>;
};

interface AppNamespace {
  state: Store<GameState>;
  storage: unknown;
  events: EventBusGeneric;
  EVENT_NAMES: Record<string, unknown>;
  rules: Record<string, unknown>;
  systems: SystemsAPI;
  ui: Record<string, unknown>;
  data: Record<string, unknown>;
  stateBridge?: Record<string, unknown>;
}

interface GameConfig {
  BALANCE: Record<string, number> & {
    STRAW_BASE_SPD: number;
    CUP_BASE_SPD: number;
    BASE_SIPS_PER_DRINK: number;
    SUCTION_CLICK_BONUS: number;
  };
  TIMING: Record<string, number>;
  LIMITS: Record<string, number>;
}

declare global {
  const Decimal: DecimalCtor;
  const DOM_CACHE: {
    levelNumber: HTMLElement | null;
    levelText: HTMLElement | null;
    sodaButton: HTMLElement | null;
    topSipValue: HTMLElement | null;
    topSipsPerDrink: HTMLElement | null;
    topSipsPerSecond: HTMLElement | null;
    musicPlayer: HTMLElement | null;
    musicToggleBtn: HTMLElement | null;
    musicMuteBtn: HTMLElement | null;
    musicStatus: HTMLElement | null;
    musicStreamSelect: HTMLElement | null;
    currentStreamInfo: HTMLElement | null;
    shopDiv: HTMLElement | null;
    widerStraws: HTMLElement | null;
    betterCups: HTMLElement | null;
    widerStrawsSPD: HTMLElement | null;
    betterCupsSPD: HTMLElement | null;
    totalWiderStrawsSPD: HTMLElement | null;
    totalBetterCupsSPD: HTMLElement | null;
    statsTab: HTMLElement | null;
    progressFill: HTMLElement | null;
    countdown: HTMLElement | null;
    playTime: HTMLElement | null;
    lastSaveTime: HTMLElement | null;
    totalPlayTime: HTMLElement | null;
    sessionTime: HTMLElement | null;
    daysSinceStart: HTMLElement | null;
    totalClicks: HTMLElement | null;
    clicksPerSecond: HTMLElement | null;
    bestClickStreak: HTMLElement | null;
    totalSipsEarned: HTMLElement | null;
    currentSipsPerSecond: HTMLElement | null;
    highestSipsPerSecond: HTMLElement | null;
    strawsPurchased: HTMLElement | null;
    cupsPurchased: HTMLElement | null;
    widerStrawsPurchased: HTMLElement | null;
    betterCupsPurchased: HTMLElement | null;
    suctionsPurchased: HTMLElement | null;
    criticalClicksPurchased: HTMLElement | null;
    currentLevel: HTMLElement | null;
    totalUpgrades: HTMLElement | null;
    fasterDrinksOwned: HTMLElement | null;
    levelUpDiv: HTMLElement | null;
    init: () => void;
    get: (_id: string) => HTMLElement | null;
    isReady: () => boolean;
  };
  interface Window {
    App: AppNamespace;
    GAME_CONFIG: GameConfig;
    Decimal: DecimalCtor;
    DOM_CACHE: {
      levelNumber: HTMLElement | null;
      levelText: HTMLElement | null;
      sodaButton: HTMLElement | null;
      topSipValue: HTMLElement | null;
      topSipsPerDrink: HTMLElement | null;
      topSipsPerSecond: HTMLElement | null;
      musicPlayer: HTMLElement | null;
      musicToggleBtn: HTMLElement | null;
      musicMuteBtn: HTMLElement | null;
      musicStatus: HTMLElement | null;
      musicStreamSelect: HTMLElement | null;
      currentStreamInfo: HTMLElement | null;
      shopDiv: HTMLElement | null;
      widerStraws: HTMLElement | null;
      betterCups: HTMLElement | null;
      widerStrawsSPD: HTMLElement | null;
      betterCupsSPD: HTMLElement | null;
      totalWiderStrawsSPD: HTMLElement | null;
      totalBetterCupsSPD: HTMLElement | null;
      statsTab: HTMLElement | null;
      progressFill: HTMLElement | null;
      countdown: HTMLElement | null;
      playTime: HTMLElement | null;
      lastSaveTime: HTMLElement | null;
      totalPlayTime: HTMLElement | null;
      sessionTime: HTMLElement | null;
      daysSinceStart: HTMLElement | null;
      totalClicks: HTMLElement | null;
      clicksPerSecond: HTMLElement | null;
      bestClickStreak: HTMLElement | null;
      totalSipsEarned: HTMLElement | null;
      currentSipsPerSecond: HTMLElement | null;
      highestSipsPerSecond: HTMLElement | null;
      strawsPurchased: HTMLElement | null;
      cupsPurchased: HTMLElement | null;
      widerStrawsPurchased: HTMLElement | null;
      betterCupsPurchased: HTMLElement | null;
      suctionsPurchased: HTMLElement | null;
      criticalClicksPurchased: HTMLElement | null;
      currentLevel: HTMLElement | null;
      totalUpgrades: HTMLElement | null;
      fasterDrinksOwned: HTMLElement | null;
      levelUpDiv: HTMLElement | null;
      init: () => void;
      get: (_id: string) => HTMLElement | null;
      isReady: () => boolean;
    };
    FEATURE_UNLOCKS: Record<string, unknown>;
    validateGameSave?: (_data: unknown) => unknown;
    validateGameOptions?: (_data: unknown) => unknown;
  }
}

export {};
