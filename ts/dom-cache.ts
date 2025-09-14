// DOM Cache - Centralized DOM element management (TypeScript)

type MaybeEl = HTMLElement | null;

const DOM_CACHE: {
  levelNumber: MaybeEl;
  levelText: MaybeEl;
  sodaButton: MaybeEl;
  topSipValue: MaybeEl;
  topSipsPerDrink: MaybeEl;
  topSipsPerSecond: MaybeEl;
  musicPlayer: MaybeEl;
  musicToggleBtn: MaybeEl;
  musicMuteBtn: MaybeEl;
  musicStatus: MaybeEl;
  musicStreamSelect: MaybeEl;
  currentStreamInfo: MaybeEl;
  shopDiv: MaybeEl;
  widerStraws: MaybeEl;
  betterCups: MaybeEl;
  widerStrawsSPD: MaybeEl;
  betterCupsSPD: MaybeEl;
  totalStrawSPD: MaybeEl;
  totalWiderStrawsSPD: MaybeEl;
  totalCupSPD: MaybeEl;
  totalBetterCupsSPD: MaybeEl;
  strawSPD: MaybeEl;
  cupSPD: MaybeEl;
  statsTab: MaybeEl;
  progressFill: MaybeEl;
  countdown: MaybeEl;
  playTime: MaybeEl;
  lastSaveTime: MaybeEl;
  totalPlayTime: MaybeEl;
  sessionTime: MaybeEl;
  daysSinceStart: MaybeEl;
  totalClicks: MaybeEl;
  clicksPerSecond: MaybeEl;
  bestClickStreak: MaybeEl;
  totalSipsEarned: MaybeEl;
  currentSipsPerSecond: MaybeEl;
  highestSipsPerSecond: MaybeEl;
  strawsPurchased: MaybeEl;
  cupsPurchased: MaybeEl;
  widerStrawsPurchased: MaybeEl;
  betterCupsPurchased: MaybeEl;
  suctionsPurchased: MaybeEl;
  criticalClicksPurchased: MaybeEl;
  currentLevel: MaybeEl;
  totalUpgrades: MaybeEl;
  fasterDrinksOwned: MaybeEl;
  levelUpDiv: MaybeEl;
  init: () => void;
  get: (id: string) => MaybeEl;
  isReady: () => boolean;
} = {
  levelNumber: null,
  levelText: null,
  sodaButton: null,
  topSipValue: null,
  topSipsPerDrink: null,
  topSipsPerSecond: null,
  musicPlayer: null,
  musicToggleBtn: null,
  musicMuteBtn: null,
  musicStatus: null,
  musicStreamSelect: null,
  currentStreamInfo: null,
  shopDiv: null,
  widerStraws: null,
  betterCups: null,
  widerStrawsSPD: null,
  betterCupsSPD: null,
  totalStrawSPD: null,
  totalWiderStrawsSPD: null,
  totalCupSPD: null,
  totalBetterCupsSPD: null,
  strawSPD: null,
  cupSPD: null,
  statsTab: null,
  progressFill: null,
  countdown: null,
  playTime: null,
  lastSaveTime: null,
  totalPlayTime: null,
  sessionTime: null,
  daysSinceStart: null,
  totalClicks: null,
  clicksPerSecond: null,
  bestClickStreak: null,
  totalSipsEarned: null,
  currentSipsPerSecond: null,
  highestSipsPerSecond: null,
  strawsPurchased: null,
  cupsPurchased: null,
  widerStrawsPurchased: null,
  betterCupsPurchased: null,
  suctionsPurchased: null,
  criticalClicksPurchased: null,
  currentLevel: null,
  totalUpgrades: null,
  fasterDrinksOwned: null,
  levelUpDiv: null,
  init() {
    console.log('Initializing DOM cache...');
    this.levelNumber = document.getElementById('levelNumber');
    this.levelText = document.getElementById('levelText');
    this.sodaButton = document.getElementById('sodaButton');
    this.topSipValue = document.getElementById('topSipValue');
    this.topSipsPerDrink = document.getElementById('topSipsPerDrink');
    this.topSipsPerSecond = document.getElementById('topSipsPerSecond');
    this.musicPlayer = document.querySelector('.music-player') as HTMLElement | null;
    this.musicToggleBtn = document.getElementById('musicToggleBtn');
    this.musicMuteBtn = document.getElementById('musicMuteBtn');
    this.musicStatus = document.getElementById('musicStatus');
    this.musicStreamSelect = document.getElementById('musicStreamSelect');
    this.currentStreamInfo = document.getElementById('currentStreamInfo');
    this.shopDiv = document.getElementById('shopDiv');
    this.widerStraws = document.getElementById('widerStraws');
    this.betterCups = document.getElementById('betterCups');
    this.widerStrawsSPD = document.getElementById('widerStrawsSPD');
    this.betterCupsSPD = document.getElementById('betterCupsSPD');
    this.totalStrawSPD = document.getElementById('totalStrawSPD');
    this.totalWiderStrawsSPD = document.getElementById('totalWiderStrawsSPD');
    this.totalCupSPD = document.getElementById('totalCupSPD');
    this.totalBetterCupsSPD = document.getElementById('totalBetterCupsSPD');
    this.strawSPD = document.getElementById('strawSPD');
    this.cupSPD = document.getElementById('cupSPD');
    this.statsTab = document.getElementById('statsTab');
    this.progressFill = document.getElementById('drinkProgressFill');
    this.countdown = document.getElementById('drinkCountdown');
    this.playTime = document.getElementById('playTime');
    this.lastSaveTime = document.getElementById('lastSaveTime');
    this.totalPlayTime = document.getElementById('totalPlayTime');
    this.sessionTime = document.getElementById('sessionTime');
    this.daysSinceStart = document.getElementById('daysSinceStart');
    this.totalClicks = document.getElementById('totalClicks');
    this.clicksPerSecond = document.getElementById('clicksPerSecond');
    this.bestClickStreak = document.getElementById('bestClickStreak');
    this.totalSipsEarned = document.getElementById('totalSipsEarned');
    this.currentSipsPerSecond = document.getElementById('currentSipsPerSecond');
    this.highestSipsPerSecond = document.getElementById('highestSipsPerSecond');
    this.strawsPurchased = document.getElementById('straws');
    this.cupsPurchased = document.getElementById('cups');
    console.log('🔍 DOM_CACHE init: straws element =', this.strawsPurchased);
    console.log('🔍 DOM_CACHE init: cups element =', this.cupsPurchased);
    this.widerStrawsPurchased = document.getElementById('widerStrawsPurchased');
    this.betterCupsPurchased = document.getElementById('betterCupsPurchased');
    this.suctionsPurchased = document.getElementById('suctionsPurchased');
    this.criticalClicksPurchased = document.getElementById('criticalClicksPurchased');
    this.currentLevel = document.getElementById('currentLevel');
    this.totalUpgrades = document.getElementById('totalUpgrades');
    this.fasterDrinksOwned = document.getElementById('fasterDrinksOwned');
    this.levelUpDiv = document.getElementById('levelUpDiv');
    console.log('DOM cache initialized successfully');
  },
  get(_id: string) {
    return document.getElementById(_id);
  },
  isReady() {
    return !!(this.sodaButton && this.shopDiv);
  },
};

// Expose globally
try {
  (window as any).DOM_CACHE = DOM_CACHE;
} catch (error) {
  console.warn('Failed to expose DOM_CACHE globally:', error);
}

// Auto-initialize when DOM is ready if not already initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - initializing DOM_CACHE');
    if (!DOM_CACHE.isReady()) DOM_CACHE.init();
  });
} else {
  console.log('DOM already loaded - initializing DOM_CACHE');
  if (!DOM_CACHE.isReady()) DOM_CACHE.init();
}

export {};
