// UI Statistics Updates (TypeScript)
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils';
import { toDecimal } from '../core/numbers';

// Update play time display
export function updatePlayTime(): void {
  if (typeof window === 'undefined') return;
  const playTimeElement = (window as any).DOM_CACHE?.playTime as HTMLElement | undefined;
  try {
    const state = (window as any).App?.state?.getState?.();
    if (playTimeElement && state) {
      const totalMs = Number(state.totalPlayTime || (window as any).totalPlayTime || 0);
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
    console.warn('Failed to update stats display:', error);
  }
}

// Update last save time display
export function updateLastSaveTime(): void {
  const lastSaveElement = (window as any).DOM_CACHE?.lastSaveTime as HTMLElement | undefined;
  try {
    const lastSaveMs = Number(
      (window as any).App?.state?.getState?.()?.lastSaveTime || (window as any).lastSaveTime || 0
    );
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
    console.warn('Failed to update stats display:', error);
  }
}

// Update all statistics (main coordinator function)
export function updateAllStats(): void {
  // Only update stats if the stats tab is active and elements exist
  if ((window as any).DOM_CACHE?.statsTab?.classList?.contains('active')) {
    updateTimeStats();
    updateClickStats();
    updateEconomyStats();
    updateShopStats();
    updateAchievementStats();
  }
}

// Update time-related statistics
export function updateTimeStats(): void {
  // Total play time (including previous sessions)
  const totalPlayTimeElement = (window as any).DOM_CACHE?.totalPlayTime as HTMLElement | undefined;
  if (totalPlayTimeElement) {
    const totalMs = Number((window as any).App?.state?.getState?.()?.totalPlayTime || 0);
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
  const sessionTimeElement = (window as any).DOM_CACHE?.sessionTime as HTMLElement | undefined;
  if (sessionTimeElement) {
    const start = Number((window as any).App?.state?.getState?.()?.sessionStartTime || 0);
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
  const totalClicksElement = (window as any).DOM_CACHE?.totalClicks as HTMLElement | undefined;
  if (totalClicksElement) {
    const clicks = Number((window as any).App?.state?.getState?.()?.totalClicks || 0);
    totalClicksElement.textContent = formatNumber(clicks);
  }
  // Critical clicks
  const criticalClicksElement = (window as any).DOM_CACHE?.criticalClicksStats as
    | HTMLElement
    | undefined;
  if (criticalClicksElement) {
    const crit = Number((window as any).App?.state?.getState?.()?.criticalClicks || 0);
    criticalClicksElement.textContent = formatNumber(crit);
  }
  // Click streak
  const clickStreakElement = (window as any).DOM_CACHE?.clickStreak as HTMLElement | undefined;
  if (clickStreakElement) {
    const st = (window as any).App?.state?.getState?.() || {};
    clickStreakElement.textContent = String(Number((st as any).currentClickStreak || 0));
  }
  // Best click streak
  const bestClickStreakElement = (window as any).DOM_CACHE?.bestClickStreak as
    | HTMLElement
    | undefined;
  if (bestClickStreakElement) {
    const st = (window as any).App?.state?.getState?.() || {};
    bestClickStreakElement.textContent = String(Number((st as any).bestClickStreak || 0));
  }
}

// Update economy-related statistics
export function updateEconomyStats(): void {
  // Total sips earned
  const totalSipsEarnedElement = (window as any).DOM_CACHE?.totalSipsEarned as
    | HTMLElement
    | undefined;
  if (totalSipsEarnedElement) {
    const total = Number((window as any).App?.state?.getState?.()?.totalSipsEarned || 0);
    totalSipsEarnedElement.textContent = formatNumber(total);
  }
  // Highest sips per second
  const highestSipsPerSecondElement = (window as any).DOM_CACHE?.highestSipsPerSecond as
    | HTMLElement
    | undefined;
  if (highestSipsPerSecondElement) {
    const high = Number((window as any).App?.state?.getState?.()?.highestSipsPerSecond || 0);
    highestSipsPerSecondElement.textContent = formatNumber(high);
  }
}

// Update shop-related statistics
export function updateShopStats(): void {
  // Reduce logging frequency for memory optimization
  const shouldLog = Math.random() < 0.05; // Only log 5% of the time
  if (shouldLog) console.log('📊 updateShopStats() called');

  // Debug: Log current state values
  const state = (window as any).App?.state?.getState?.();
  if (state) {
    if (shouldLog)
      console.log('🔍 Current state values:', {
        straws: state.straws,
        cups: state.cups,
        sips: state.sips,
      });
  }

  // Always call updatePurchasedCounts regardless of tab state
  updatePurchasedCounts();
  // Straws purchased
  const strawsPurchasedElement = (window as any).DOM_CACHE?.strawsPurchased as
    | HTMLElement
    | undefined;
  if (strawsPurchasedElement) {
    const v = (window as any).App?.state?.getState?.()?.straws || 0;
    if (shouldLog)
      console.log('🔍 updateShopStats: Straws value =', v, 'formatted =', formatNumber(v));
    strawsPurchasedElement.textContent = formatNumber(v);
  } else {
    console.warn('🚫 updateShopStats: strawsPurchasedElement not found in DOM_CACHE');
  }
  // Cups purchased
  const cupsPurchasedElement = (window as any).DOM_CACHE?.cupsPurchased as HTMLElement | undefined;
  if (cupsPurchasedElement) {
    const v = (window as any).App?.state?.getState?.()?.cups || 0;
    if (shouldLog)
      console.log('🔍 updateShopStats: Cups value =', v, 'formatted =', formatNumber(v));
    cupsPurchasedElement.textContent = formatNumber(v);
  } else {
    console.warn('🚫 updateShopStats: cupsPurchasedElement not found in DOM_CACHE');
  }
  // Suctions purchased
  const suctionsPurchasedElement = (window as any).DOM_CACHE?.suctionsPurchased as
    | HTMLElement
    | undefined;
  if (suctionsPurchasedElement) {
    const v = (window as any).App?.state?.getState?.()?.suctions || 0;
    suctionsPurchasedElement.textContent = formatNumber(v);
  }
  // Critical clicks purchased
  const criticalClicksPurchasedElement = (window as any).DOM_CACHE?.criticalClicksPurchased as
    | HTMLElement
    | undefined;
  if (criticalClicksPurchasedElement) {
    const v = (window as any).App?.state?.getState?.()?.criticalClicks || 0;
    criticalClicksPurchasedElement.textContent = formatNumber(v);
  }
}

// Update achievement-related statistics
export function updateAchievementStats(): void {
  // Current level
  const currentLevelElement = (window as any).DOM_CACHE?.currentLevel as HTMLElement | undefined;
  if (currentLevelElement) {
    const level = (window as any).App?.state?.getState?.()?.level || 1;
    currentLevelElement.textContent = formatNumber(level);
  }
  // Total upgrades (sum of all upgrade counters)
  const totalUpgradesElement = (window as any).DOM_CACHE?.totalUpgrades as HTMLElement | undefined;
  if (totalUpgradesElement) {
    const st = (window as any).App?.state?.getState?.() || {};
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
  const fasterDrinksOwnedElement = (window as any).DOM_CACHE?.fasterDrinksOwned as
    | HTMLElement
    | undefined;
  if (fasterDrinksOwnedElement) {
    const owned = (window as any).App?.state?.getState?.()?.fasterDrinks || 0;
    fasterDrinksOwnedElement.textContent = formatNumber(owned);
  }

  // Update purchased item counts in shop displays
  updatePurchasedCounts();
}

// Update purchased item counts in shop displays
export function updatePurchasedCounts(): void {
  // Reduce console logging frequency to optimize memory usage
  const shouldLog = Math.random() < 0.1; // Only log 10% of the time
  if (shouldLog) if (shouldLog) console.log('📊 updatePurchasedCounts() called');

  if (typeof window === 'undefined') return;

  const state = (window as any).App?.state?.getState?.();
  if (!state) {
    if (shouldLog) if (shouldLog) console.log('📊 No state available');
    return;
  }
  if (shouldLog)
    if (shouldLog) console.log('📊 Current state:', { straws: state.straws, cups: state.cups });

  // Check DOM_CACHE availability
  if (!(window as any).DOM_CACHE) {
    if (shouldLog) if (shouldLog) console.log('📊 DOM_CACHE not available');
    return;
  }

  // Update straws purchased count
  const strawsPurchasedElement = (window as any).DOM_CACHE?.strawsPurchased as
    | HTMLElement
    | undefined;
  if (shouldLog)
    if (shouldLog)
      console.log(
        '🔍 strawsPurchasedElement:',
        strawsPurchasedElement,
        'exists:',
        !!strawsPurchasedElement
      );
  if (strawsPurchasedElement) {
    const straws = state.straws || 0;
    if (shouldLog)
      if (shouldLog) console.log('🔍 Raw straws value:', straws, 'type:', typeof straws);
    const strawsValue = typeof straws === 'object' && straws.toString ? straws.toString() : straws;
    if (shouldLog) if (shouldLog) console.log('🔍 Processed straws value:', strawsValue);
    const formattedStraws = formatNumber(strawsValue);
    if (shouldLog) if (shouldLog) console.log('🔍 Formatted straws:', formattedStraws);
    strawsPurchasedElement.textContent = formattedStraws;
    if (shouldLog)
      if (shouldLog)
        console.log('✅ Updated straws:', strawsValue, 'element:', strawsPurchasedElement);
  } else {
    if (shouldLog) if (shouldLog) console.log('❌ strawsPurchased element not found');
  }

  // Update cups purchased count
  const cupsPurchasedElement = (window as any).DOM_CACHE?.cupsPurchased as HTMLElement | undefined;
  if (shouldLog)
    if (shouldLog)
      console.log(
        '🔍 cupsPurchasedElement:',
        cupsPurchasedElement,
        'exists:',
        !!cupsPurchasedElement
      );
  if (cupsPurchasedElement) {
    const cups = state.cups || 0;
    if (shouldLog) if (shouldLog) console.log('🔍 Raw cups value:', cups, 'type:', typeof cups);
    const cupsValue = typeof cups === 'object' && cups.toString ? cups.toString() : cups;
    if (shouldLog) if (shouldLog) console.log('🔍 Processed cups value:', cupsValue);
    const formattedCups = formatNumber(cupsValue);
    if (shouldLog) if (shouldLog) console.log('🔍 Formatted cups:', formattedCups);
    cupsPurchasedElement.textContent = formattedCups;
    if (shouldLog)
      if (shouldLog) console.log('✅ Updated cups:', cupsValue, 'element:', cupsPurchasedElement);
  } else {
    if (shouldLog) if (shouldLog) console.log('❌ cupsPurchased element not found');
  }

  // Update wider straws purchased count
  const widerStrawsPurchasedElement = (window as any).DOM_CACHE?.widerStrawsPurchased as
    | HTMLElement
    | undefined;
  if (widerStrawsPurchasedElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsValue =
      typeof widerStraws === 'object' && widerStraws.toString
        ? widerStraws.toString()
        : widerStraws;
    widerStrawsPurchasedElement.textContent = formatNumber(widerStrawsValue);
    if (shouldLog)
      console.log(
        '✅ Updated widerStraws:',
        widerStrawsValue,
        'element:',
        widerStrawsPurchasedElement
      );
  } else {
    if (shouldLog) console.log('❌ widerStrawsPurchased element not found');
  }

  // Update better cups purchased count
  const betterCupsPurchasedElement = (window as any).DOM_CACHE?.betterCupsPurchased as
    | HTMLElement
    | undefined;
  if (betterCupsPurchasedElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsValue =
      typeof betterCups === 'object' && betterCups.toString ? betterCups.toString() : betterCups;
    betterCupsPurchasedElement.textContent = formatNumber(betterCupsValue);
    if (shouldLog)
      console.log(
        '✅ Updated betterCups:',
        betterCupsValue,
        'element:',
        betterCupsPurchasedElement
      );
  } else {
    if (shouldLog) console.log('❌ betterCupsPurchased element not found');
  }

  // Update shop display elements (widerStraws and betterCups)
  const shopWiderStrawsElement = (window as any).DOM_CACHE?.widerStraws as HTMLElement | undefined;
  if (shopWiderStrawsElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsValue =
      typeof widerStraws === 'object' && widerStraws.toString
        ? widerStraws.toString()
        : widerStraws;
    shopWiderStrawsElement.textContent = formatNumber(widerStrawsValue);
    if (shouldLog)
      console.log(
        '✅ Updated shop widerStraws:',
        widerStrawsValue,
        'element:',
        shopWiderStrawsElement
      );
  } else {
    if (shouldLog) console.log('❌ shop widerStraws element not found');
  }

  const shopBetterCupsElement = (window as any).DOM_CACHE?.betterCups as HTMLElement | undefined;
  if (shopBetterCupsElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsValue =
      typeof betterCups === 'object' && betterCups.toString ? betterCups.toString() : betterCups;
    shopBetterCupsElement.textContent = formatNumber(betterCupsValue);
    if (shouldLog)
      console.log(
        '✅ Updated shop betterCups:',
        betterCupsValue,
        'element:',
        shopBetterCupsElement
      );
  } else {
    if (shouldLog) console.log('❌ shop betterCups element not found');
  }

  // Update total production indicators
  const totalStrawSPDElement = (window as any).DOM_CACHE?.totalStrawSPD as HTMLElement | undefined;
  if (totalStrawSPDElement) {
    const straws = state.straws || 0;
    const strawSPD = state.strawSPD || 0;

    // Use toDecimal helper for better memory efficiency
    const strawsLarge = toDecimal(straws);
    const strawSPDLarge = toDecimal(strawSPD);
    const totalStrawProduction = strawsLarge.multiply(strawSPDLarge);
    const totalStrawValue = totalStrawProduction.toString();
    totalStrawSPDElement.textContent = formatNumber(totalStrawValue);
    if (shouldLog)
      console.log('✅ Updated totalStrawSPD:', totalStrawValue, 'element:', totalStrawSPDElement);
  } else {
    if (shouldLog) console.log('❌ totalStrawSPD element not found');
  }

  const totalWiderStrawsSPDElement = (window as any).DOM_CACHE?.totalWiderStrawsSPD as
    | HTMLElement
    | undefined;
  if (totalWiderStrawsSPDElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsValue =
      typeof widerStraws === 'object' && widerStraws.toString
        ? widerStraws.toString()
        : widerStraws;
    totalWiderStrawsSPDElement.textContent = formatNumber(widerStrawsValue * 0.6); // Base multiplier
    if (shouldLog)
      console.log(
        '✅ Updated totalWiderStrawsSPD:',
        widerStrawsValue * 0.6,
        'element:',
        totalWiderStrawsSPDElement
      );
  } else {
    if (shouldLog) console.log('❌ totalWiderStrawsSPD element not found');
  }

  const totalCupSPDElement = (window as any).DOM_CACHE?.totalCupSPD as HTMLElement | undefined;
  if (totalCupSPDElement) {
    const cups = state.cups || 0;
    const cupSPD = state.cupSPD || 0;

    // Use toDecimal helper for better memory efficiency
    const cupsLarge = toDecimal(cups);
    const cupSPDLarge = toDecimal(cupSPD);
    const totalCupProduction = cupsLarge.multiply(cupSPDLarge);
    const totalCupValue = totalCupProduction.toString();
    totalCupSPDElement.textContent = formatNumber(totalCupValue);
    if (shouldLog)
      console.log('✅ Updated totalCupSPD:', totalCupValue, 'element:', totalCupSPDElement);
  } else {
    if (shouldLog) console.log('❌ totalCupSPD element not found');
  }

  const totalBetterCupsSPDElement = (window as any).DOM_CACHE?.totalBetterCupsSPD as
    | HTMLElement
    | undefined;
  if (totalBetterCupsSPDElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsValue =
      typeof betterCups === 'object' && betterCups.toString ? betterCups.toString() : betterCups;
    totalBetterCupsSPDElement.textContent = formatNumber(betterCupsValue * 1.2); // Base multiplier
    if (shouldLog)
      console.log(
        '✅ Updated totalBetterCupsSPD:',
        betterCupsValue * 1.2,
        'element:',
        totalBetterCupsSPDElement
      );
  } else {
    if (shouldLog) console.log('❌ totalBetterCupsSPD element not found');
  }

  // Update suctions purchased count
  const suctionsPurchasedElement = (window as any).DOM_CACHE?.suctionsPurchased as
    | HTMLElement
    | undefined;
  if (suctionsPurchasedElement) {
    const suctions = state.suctions || 0;
    const suctionsValue =
      typeof suctions === 'object' && suctions.toString ? suctions.toString() : suctions;
    suctionsPurchasedElement.textContent = formatNumber(suctionsValue);
    if (shouldLog)
      console.log('✅ Updated suctions:', suctionsValue, 'element:', suctionsPurchasedElement);
  } else {
    if (shouldLog) console.log('❌ suctionsPurchased element not found');
  }

  // Update shop display elements for suctions and criticalClicks (if they exist)
  const shopSuctionsElement = (window as any).DOM_CACHE?.suctions as HTMLElement | undefined;
  if (shopSuctionsElement) {
    const suctions = state.suctions || 0;
    const suctionsValue =
      typeof suctions === 'object' && suctions.toString ? suctions.toString() : suctions;
    shopSuctionsElement.textContent = formatNumber(suctionsValue);
    if (shouldLog)
      console.log('✅ Updated shop suctions:', suctionsValue, 'element:', shopSuctionsElement);
  } else {
    if (shouldLog) console.log('❌ shop suctions element not found (expected for this item)');
  }

  const shopCriticalClicksElement = (window as any).DOM_CACHE?.criticalClicks as
    | HTMLElement
    | undefined;
  if (shopCriticalClicksElement) {
    const criticalClicks = state.criticalClicks || 0;
    const criticalClicksValue =
      typeof criticalClicks === 'object' && criticalClicks.toString
        ? criticalClicks.toString()
        : criticalClicks;
    shopCriticalClicksElement.textContent = formatNumber(criticalClicksValue);
    if (shouldLog)
      console.log(
        '✅ Updated shop criticalClicks:',
        criticalClicksValue,
        'element:',
        shopCriticalClicksElement
      );
  } else {
    if (shouldLog) console.log('❌ shop criticalClicks element not found (expected for this item)');
  }

  // Update critical clicks purchased count
  const criticalClicksPurchasedDisplayElement = (window as any).DOM_CACHE
    ?.criticalClicksPurchased as HTMLElement | undefined;
  if (criticalClicksPurchasedDisplayElement) {
    const criticalClicks = state.criticalClicks || 0;
    const criticalClicksValue =
      typeof criticalClicks === 'object' && criticalClicks.toString
        ? criticalClicks.toString()
        : criticalClicks;
    criticalClicksPurchasedDisplayElement.textContent = formatNumber(criticalClicksValue);
    if (shouldLog)
      console.log(
        '✅ Updated criticalClicks:',
        criticalClicksValue,
        'element:',
        criticalClicksPurchasedDisplayElement
      );
  } else {
    if (shouldLog) console.log('❌ criticalClicksPurchased element not found');
  }

  if (shouldLog) console.log('🎉 updatePurchasedCounts completed');

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
