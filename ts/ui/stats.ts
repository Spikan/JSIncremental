// UI Statistics Updates (TypeScript)
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils';
import { toDecimal } from '../core/numbers';
import { computeStrawSPD, computeCupSPD } from '../core/rules/economy';
import { domQuery } from '../services/dom-query';
import { useGameStore } from '../core/state/zustand-store';
import { errorHandler } from '../core/error-handling/error-handler';

// Update play time display
export function updatePlayTime(): void {
  if (typeof window === 'undefined') return;
  const playTimeElement = domQuery.getById('playTime') as HTMLElement | undefined;
  try {
    const state = useGameStore.getState();
    if (playTimeElement && state) {
      const totalMs = Number(state.totalPlayTime || 0);
      const totalSeconds = Math.floor(totalMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (hours > 0) {
        playTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        playTimeElement.textContent = `${minutes}m ${seconds}s`;
      } else {
        playTimeElement.textContent = `${seconds}s`;
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'updateStatsDisplay', { function: 'updatePlayTime' });
  }
}

// Update last save time display
export function updateLastSaveTime(): void {
  const lastSaveElement = domQuery.getById('lastSaveTime') as HTMLElement | undefined;
  try {
    const lastSaveMs = Number(useGameStore.getState().lastSaveTime || 0);
    if (lastSaveElement && lastSaveMs) {
      const now = new Date();
      const lastSave = new Date(lastSaveMs);
      const diffSeconds = Math.floor((Number(now) - Number(lastSave)) / 1000);
      if (diffSeconds < 60) {
        lastSaveElement.textContent = `${diffSeconds}s ago`;
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        lastSaveElement.textContent = `${minutes}m ago`;
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        lastSaveElement.textContent = `${hours}h ago`;
      }
    }
  } catch (error) {
    errorHandler.handleError(error, 'updateStatsDisplay', { function: 'updateLastSaveTime' });
  }
}

// Update all statistics (main coordinator function)
export function updateAllStats(): void {
  // Always update stats - no tab checking needed
  updateTimeStats();
  updateClickStats();
  updateEconomyStats();
  updateShopStats();
  updateAchievementStats();
}

// Update time-related statistics
export function updateTimeStats(): void {
  // Total play time (including previous sessions)
  const totalPlayTimeElement = domQuery.getById('totalPlayTime') as HTMLElement | undefined;
  if (totalPlayTimeElement) {
    const totalMs = Number(useGameStore.getState().totalPlayTime || 0);
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      totalPlayTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      totalPlayTimeElement.textContent = `${minutes}m ${seconds}s`;
    } else {
      totalPlayTimeElement.textContent = `${seconds}s`;
    }
  }
  // Current session time
  const sessionTimeElement = domQuery.getById('sessionTime') as HTMLElement | undefined;
  if (sessionTimeElement) {
    const start = Number(useGameStore.getState().sessionStartTime || 0);
    if (start) {
      const sessionTime = Date.now() - start;
      const sessionSeconds = Math.floor(sessionTime / 1000);
      const hours = Math.floor(sessionSeconds / 3600);
      const minutes = Math.floor((sessionSeconds % 3600) / 60);
      const seconds = sessionSeconds % 60;
      if (hours > 0) {
        sessionTimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        sessionTimeElement.textContent = `${minutes}m ${seconds}s`;
      } else {
        sessionTimeElement.textContent = `${seconds}s`;
      }
    }
  }
}

// Update click-related statistics
export function updateClickStats(): void {
  // Total clicks
  const totalClicksElement = domQuery.getById('totalClicks') as HTMLElement | undefined;
  if (totalClicksElement) {
    // Modernized - state handled by store
    const clicks = useGameStore.getState().totalClicks || 0;
    totalClicksElement.textContent = formatNumber(clicks);
  }
  // Critical clicks
  const criticalClicksElement = domQuery.getById('criticalClicksStats') as HTMLElement | undefined;
  if (criticalClicksElement) {
    // Modernized - state handled by store
    const crit = useGameStore.getState().totalClicks || 0; // Using totalClicks as fallback
    criticalClicksElement.textContent = formatNumber(crit);
  }
  // Click streak
  const clickStreakElement = domQuery.getById('clickStreak') as HTMLElement | undefined;
  if (clickStreakElement) {
    // Modernized - state handled by store
    const st = useGameStore.getState();
    clickStreakElement.textContent = String(Number(st.currentClickStreak || 0));
  }
  // Best click streak
  const bestClickStreakElement = domQuery.getById('bestClickStreak') as HTMLElement | undefined;
  if (bestClickStreakElement) {
    // Modernized - state handled by store
    const st = useGameStore.getState();
    bestClickStreakElement.textContent = String(Number(st.bestClickStreak || 0));
  }
}

// Update economy-related statistics
export function updateEconomyStats(): void {
  // Total sips earned
  const totalSipsEarnedElement = domQuery.getById('totalSipsEarned') as HTMLElement | undefined;
  if (totalSipsEarnedElement) {
    // Modernized - state handled by store
    const total = useGameStore.getState().totalSipsEarned || 0;
    totalSipsEarnedElement.textContent = formatNumber(total);
  }
  // Highest sips per second
  const highestSipsPerSecondElement = domQuery.getById('highestSipsPerSecond') as
    | HTMLElement
    | undefined;
  if (highestSipsPerSecondElement) {
    // Modernized - state handled by store
    const high = useGameStore.getState().highestSipsPerSecond || 0;
    highestSipsPerSecondElement.textContent = formatNumber(high);
  }
}

// Update shop-related statistics
export function updateShopStats(): void {
  try {
    // Always call updatePurchasedCounts regardless of tab state
    updatePurchasedCounts();
    // Straws purchased
    const strawsPurchasedElement = domQuery.getById('straws') as HTMLElement | undefined;
    if (strawsPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().straws || 0;
      strawsPurchasedElement.textContent = formatNumber(v);
    }
    // Cups purchased
    const cupsPurchasedElement = domQuery.getById('cups') as HTMLElement | undefined;
    if (cupsPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().cups || 0;
      cupsPurchasedElement.textContent = formatNumber(v);
    }

    // Update purchased item counts in shop displays
    updatePurchasedCounts();

    // Update enhancement values for upgrade displays
    updateEnhancementValues();
  } catch (error) {
    errorHandler.handleError(error, 'updateShopStats', { critical: true });
  }
}

// Update achievement-related statistics
export function updateAchievementStats(): void {
  // Current level
  const currentLevelElement = domQuery.getById('currentLevel') as HTMLElement | undefined;
  if (currentLevelElement) {
    // Modernized - state handled by store
    const level = useGameStore.getState().level || 1;
    currentLevelElement.textContent = formatNumber(level);
  }
  // Total upgrades (sum of all upgrade counters)
  const totalUpgradesElement = domQuery.getById('totalUpgrades') as HTMLElement | undefined;
  if (totalUpgradesElement) {
    // Modernized - state handled by store
    const st = useGameStore.getState();
    const widerStraws = (st as any).widerStraws || 0;
    const betterCups = (st as any).betterCups || 0;
    const suctionUpCounter = (st as any).suctionUpCounter || 0;
    const fasterDrinksUpCounter = (st as any).fasterDrinksUpCounter || 0;
    const criticalClickUpCounter = (st as any).criticalClickUpCounter || 0;
    const totalUpgrades =
      widerStraws + betterCups + suctionUpCounter + fasterDrinksUpCounter + criticalClickUpCounter;
    totalUpgradesElement.textContent = formatNumber(totalUpgrades);
  }
  // Faster drinks owned
  const fasterDrinksOwnedElement = domQuery.getById('fasterDrinksOwned') as HTMLElement | undefined;
  if (fasterDrinksOwnedElement) {
    // Modernized - state handled by store
    const owned = useGameStore.getState().fasterDrinks || 0;
    fasterDrinksOwnedElement.textContent = formatNumber(owned);
  }
}

// Update enhancement values for upgrade displays
export function updateEnhancementValues(): void {
  // Modernized - state handled by store
  const state = useGameStore.getState();
  if (!state) {
    return;
  }

  // Update base production values to show what you actually get
  const strawSPDElement = domQuery.getById('strawSPD') as HTMLElement | undefined;
  if (strawSPDElement) {
    const straws = state.straws || 0;
    const widerStraws = state.widerStraws || 0;
    const baseSPD = 2.0; // From upgrades.json
    const widerMultiplierPerLevel = 0.5; // From upgrades.json

    // Use actual game logic with all bonuses
    const actualStrawSPD = computeStrawSPD(straws, baseSPD, widerStraws, widerMultiplierPerLevel);

    strawSPDElement.textContent = formatNumber(actualStrawSPD.toString());
  }

  const cupSPDElement = domQuery.getById('cupSPD') as HTMLElement | undefined;
  if (cupSPDElement) {
    const cups = state.cups || 0;
    const betterCups = state.betterCups || 0;
    const baseSPD = 5.0; // From upgrades.json
    const betterMultiplierPerLevel = 1.0; // From upgrades.json

    // Use actual game logic with all bonuses
    const actualCupSPD = computeCupSPD(cups, baseSPD, betterCups, betterMultiplierPerLevel);

    cupSPDElement.textContent = formatNumber(actualCupSPD.toString());
  }

  // Update Wider Straws enhancement display
  const widerStrawsSPDElement = domQuery.getById('widerStrawsSPD') as HTMLElement | undefined;
  if (widerStrawsSPDElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsLarge = toDecimal(widerStraws);
    // Calculate the actual multiplier effect: 1 + (widerStraws * 0.2)
    const multiplierPerLevel = 0.2; // From upgrades.json
    const enhancementMultiplier = toDecimal(1).add(widerStrawsLarge.mul(multiplierPerLevel));
    const enhancementPercent = enhancementMultiplier.sub(1).mul(100);

    widerStrawsSPDElement.textContent = `+${formatNumber(enhancementPercent.toString())}%`;
  }

  // Update Better Cups enhancement display
  const betterCupsSPDElement = domQuery.getById('betterCupsSPD') as HTMLElement | undefined;
  if (betterCupsSPDElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsLarge = toDecimal(betterCups);
    // Calculate the actual multiplier effect: 1 + (betterCups * 0.3)
    const multiplierPerLevel = 0.3; // From upgrades.json
    const enhancementMultiplier = toDecimal(1).add(betterCupsLarge.mul(multiplierPerLevel));
    const enhancementPercent = enhancementMultiplier.sub(1).mul(100);

    betterCupsSPDElement.textContent = `+${formatNumber(enhancementPercent.toString())}%`;
  }
}

// Update purchased item counts in shop displays
export function updatePurchasedCounts(): void {
  // Reduce console logging frequency to optimize memory usage
  const shouldLog = false; // Debug logging disabled

  if (typeof window === 'undefined') return;

  // Modernized - state handled by store
  const state = useGameStore.getState();
  if (!state) {
    return;
  }

  // Silent state check - no logging needed

  // Check DOM availability
  if (typeof document === 'undefined') {
    return;
  }

  // Update straws purchased count
  const strawsPurchasedElement = domQuery.getById('straws') as HTMLElement | undefined;
  if (strawsPurchasedElement) {
    const straws = state.straws || 0;
    const strawsValue = typeof straws === 'object' && straws.toString ? straws.toString() : straws;
    const formattedStraws = formatNumber(strawsValue);
    strawsPurchasedElement.textContent = formattedStraws;
  }

  // Update cups purchased count
  const cupsPurchasedElement = domQuery.getById('cups') as HTMLElement | undefined;
  if (cupsPurchasedElement) {
    const cups = state.cups || 0;
    const cupsValue = typeof cups === 'object' && cups.toString ? cups.toString() : cups;
    const formattedCups = formatNumber(cupsValue);
    cupsPurchasedElement.textContent = formattedCups;
  }

  // Update wider straws purchased count
  const widerStrawsElement = domQuery.getById('widerStraws') as HTMLElement | undefined;
  if (widerStrawsElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsValue =
      typeof widerStraws === 'object' && widerStraws.toString
        ? widerStraws.toString()
        : widerStraws;
    widerStrawsElement.textContent = formatNumber(widerStrawsValue);
  } else {
    if (shouldLog) console.log('❌ widerStraws element not found');
  }

  // Update better cups purchased count
  const betterCupsElement = domQuery.getById('betterCups') as HTMLElement | undefined;
  if (betterCupsElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsValue =
      typeof betterCups === 'object' && betterCups.toString ? betterCups.toString() : betterCups;
    betterCupsElement.textContent = formatNumber(betterCupsValue);
  } else {
    if (shouldLog) console.log('❌ betterCups element not found');
  }

  // Note: Shop display elements are the same as the purchased elements above

  // Silent completion - no logging needed

  // Make function available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).testShopCounts = () => {
      if (shouldLog) console.log('🧪 Manual test of shop counts...');
      updatePurchasedCounts();
    };
    if (shouldLog)
      console.log('💡 Call testShopCounts() in console to manually test shop displays');
  }
}
