// UI Statistics Updates (TypeScript)
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils';
import { toDecimal } from '../core/numbers';
import { computeStrawSPD, computeCupSPD } from '../core/rules/economy';
import { domQuery } from '../services/dom-query';
import { useGameStore } from '../core/state/zustand-store';

// Update play time display
export function updatePlayTime(): void {
  if (typeof window === 'undefined') return;
  const playTimeElement = domQuery.getById('playTime') as HTMLElement | undefined;
  try {
    const state = useGameStore.getState();
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
  const lastSaveElement = domQuery.getById('lastSaveTime') as HTMLElement | undefined;
  try {
    const lastSaveMs = Number(
      useGameStore.getState().lastSaveTime || (window as any).lastSaveTime || 0
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
  if (domQuery.getById('statsTab')?.classList?.contains('active')) {
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
    const crit = useGameStore.getState().criticalClicks || 0;
    criticalClicksElement.textContent = formatNumber(crit);
  }
  // Click streak
  const clickStreakElement = domQuery.getById('clickStreak') as HTMLElement | undefined;
  if (clickStreakElement) {
    // Modernized - state handled by store
    const st = useGameStore.getState();
    clickStreakElement.textContent = String(Number((st as any).currentClickStreak || 0));
  }
  // Best click streak
  const bestClickStreakElement = domQuery.getById('bestClickStreak') as HTMLElement | undefined;
  if (bestClickStreakElement) {
    // Modernized - state handled by store
    const st = useGameStore.getState();
    bestClickStreakElement.textContent = String(Number((st as any).bestClickStreak || 0));
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
  // console.log('🔍 updateShopStats: Function called');
  try {
    // Debug logging disabled for cleaner console
    const shouldLog = false;
    if (shouldLog) console.log('📊 updateShopStats() called');

    // Debug: Log current state values
    // Modernized - state handled by store
    const state = useGameStore.getState();
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
    const strawsPurchasedElement = domQuery.getById('strawsPurchased') as HTMLElement | undefined;
    if (strawsPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().straws || 0;
      if (shouldLog)
        console.log('🔍 updateShopStats: Straws value =', v, 'formatted =', formatNumber(v));
      strawsPurchasedElement.textContent = formatNumber(v);
    } else {
      console.warn('🚫 updateShopStats: strawsPurchasedElement not found');
    }
    // Cups purchased
    const cupsPurchasedElement = domQuery.getById('cupsPurchased') as HTMLElement | undefined;
    if (cupsPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().cups || 0;
      if (shouldLog)
        console.log('🔍 updateShopStats: Cups value =', v, 'formatted =', formatNumber(v));
      cupsPurchasedElement.textContent = formatNumber(v);
    } else {
      console.warn('🚫 updateShopStats: cupsPurchasedElement not found');
    }
    // Suctions purchased
    const suctionsPurchasedElement = domQuery.getById('suctionsPurchased') as
      | HTMLElement
      | undefined;
    if (suctionsPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().suctions || 0;
      suctionsPurchasedElement.textContent = formatNumber(v);
    }
    // Critical clicks purchased
    const criticalClicksPurchasedElement = domQuery.getById('criticalClicksPurchased') as
      | HTMLElement
      | undefined;
    if (criticalClicksPurchasedElement) {
      // Modernized - state handled by store
      const v = useGameStore.getState().criticalClicks || 0;
      criticalClicksPurchasedElement.textContent = formatNumber(v);
    }

    // Update purchased item counts in shop displays
    updatePurchasedCounts();

    // Update enhancement values for upgrade displays
    console.log('🔍 updateShopStats: About to call updateEnhancementValues');
    updateEnhancementValues();
  } catch (error) {
    console.error('🔍 updateShopStats: Error occurred:', error);
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
  console.log('🔍 updateEnhancementValues: Function called');
  // Modernized - state handled by store
  const state = {}; // TODO: Get from store
  if (!state) {
    console.log('🔍 updateEnhancementValues: No state available');
    return;
  }

  console.log('🔍 updateEnhancementValues: State available', {
    straws: state.straws,
    cups: state.cups,
    widerStraws: state.widerStraws,
    betterCups: state.betterCups,
  });

  // Update base production values to show what you actually get
  const strawSPDElement = domQuery.getById('strawSPD') as HTMLElement | undefined;
  console.log('🔍 strawSPDElement found:', !!strawSPDElement);
  if (strawSPDElement) {
    const straws = state.straws || 0;
    const widerStraws = state.widerStraws || 0;
    const baseSPD = 2.0; // From upgrades.json
    const widerMultiplierPerLevel = 0.5; // From upgrades.json

    // Use actual game logic with all bonuses
    const actualStrawSPD = computeStrawSPD(straws, baseSPD, widerStraws, widerMultiplierPerLevel);

    console.log('🔍 Straw production calculation (with bonuses):', {
      straws,
      widerStraws,
      baseSPD,
      widerMultiplierPerLevel,
      actualStrawSPD: actualStrawSPD.toString(),
      formatted: formatNumber(actualStrawSPD.toString()),
    });
    strawSPDElement.textContent = formatNumber(actualStrawSPD.toString());
  } else {
    console.log('🔍 strawSPDElement not found');
  }

  const cupSPDElement = domQuery.getById('cupSPD') as HTMLElement | undefined;
  console.log('🔍 cupSPDElement found:', !!cupSPDElement);
  if (cupSPDElement) {
    const cups = state.cups || 0;
    const betterCups = state.betterCups || 0;
    const baseSPD = 5.0; // From upgrades.json
    const betterMultiplierPerLevel = 1.0; // From upgrades.json

    // Use actual game logic with all bonuses
    const actualCupSPD = computeCupSPD(cups, baseSPD, betterCups, betterMultiplierPerLevel);

    console.log('🔍 Cup production calculation (with bonuses):', {
      cups,
      betterCups,
      baseSPD,
      betterMultiplierPerLevel,
      actualCupSPD: actualCupSPD.toString(),
      formatted: formatNumber(actualCupSPD.toString()),
    });
    cupSPDElement.textContent = formatNumber(actualCupSPD.toString());
  } else {
    console.log('🔍 cupSPDElement not found');
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
  if (shouldLog) console.log('📊 updatePurchasedCounts() called');

  if (typeof window === 'undefined') return;

  // Modernized - state handled by store
  const state = {}; // TODO: Get from store
  if (!state) {
    if (shouldLog) console.log('📊 No state available');
    return;
  }
  if (shouldLog) console.log('📊 Current state:', { straws: state.straws, cups: state.cups });

  // Check DOM availability
  if (typeof document === 'undefined') {
    if (shouldLog) console.log('📊 Document not available');
    return;
  }

  // Update straws purchased count
  const strawsPurchasedElement = domQuery.getById('strawsPurchased') as HTMLElement | undefined;
  if (shouldLog)
    console.log(
      '🔍 strawsPurchasedElement:',
      strawsPurchasedElement,
      'exists:',
      !!strawsPurchasedElement
    );
  if (strawsPurchasedElement) {
    const straws = state.straws || 0;
    if (shouldLog) console.log('🔍 Raw straws value:', straws, 'type:', typeof straws);
    const strawsValue = typeof straws === 'object' && straws.toString ? straws.toString() : straws;
    if (shouldLog) console.log('🔍 Processed straws value:', strawsValue);
    const formattedStraws = formatNumber(strawsValue);
    if (shouldLog) console.log('🔍 Formatted straws:', formattedStraws);
    strawsPurchasedElement.textContent = formattedStraws;
    if (shouldLog)
      console.log('✅ Updated straws:', strawsValue, 'element:', strawsPurchasedElement);
  } else {
    if (shouldLog) console.log('❌ strawsPurchased element not found');
  }

  // Update cups purchased count
  const cupsPurchasedElement = domQuery.getById('cupsPurchased') as HTMLElement | undefined;
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
  const widerStrawsElement = domQuery.getById('widerStraws') as HTMLElement | undefined;
  if (widerStrawsElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsValue =
      typeof widerStraws === 'object' && widerStraws.toString
        ? widerStraws.toString()
        : widerStraws;
    widerStrawsElement.textContent = formatNumber(widerStrawsValue);
    if (shouldLog)
      console.log('✅ Updated widerStraws:', widerStrawsValue, 'element:', widerStrawsElement);
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
    if (shouldLog)
      console.log('✅ Updated betterCups:', betterCupsValue, 'element:', betterCupsElement);
  } else {
    if (shouldLog) console.log('❌ betterCups element not found');
  }

  // Note: Shop display elements are the same as the purchased elements above

  // Update total production indicators
  const totalStrawSPDElement = domQuery.getById('totalStrawSPD') as HTMLElement | undefined;
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

  const totalWiderStrawsSPDElement = domQuery.getById('totalWiderStrawsSPD') as
    | HTMLElement
    | undefined;
  if (totalWiderStrawsSPDElement) {
    const widerStraws = state.widerStraws || 0;
    const widerStrawsSPD = state.widerStrawsSPD || 0;
    const widerStrawsLarge = toDecimal(widerStraws);
    const widerStrawsSPDLarge = toDecimal(widerStrawsSPD);
    const totalWiderStrawsProduction = widerStrawsLarge.multiply(widerStrawsSPDLarge);
    totalWiderStrawsSPDElement.textContent = formatNumber(totalWiderStrawsProduction.toString());
    if (shouldLog)
      console.log(
        '✅ Updated totalWiderStrawsSPD:',
        totalWiderStrawsProduction.toString(),
        'element:',
        totalWiderStrawsSPDElement
      );
  } else {
    if (shouldLog) console.log('❌ totalWiderStrawsSPD element not found');
  }

  const totalCupSPDElement = domQuery.getById('totalCupSPD') as HTMLElement | undefined;
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

  const totalBetterCupsSPDElement = domQuery.getById('totalBetterCupsSPD') as
    | HTMLElement
    | undefined;
  if (totalBetterCupsSPDElement) {
    const betterCups = state.betterCups || 0;
    const betterCupsSPD = state.betterCupsSPD || 0;
    const betterCupsLarge = toDecimal(betterCups);
    const betterCupsSPDLarge = toDecimal(betterCupsSPD);
    const totalBetterCupsProduction = betterCupsLarge.multiply(betterCupsSPDLarge);
    totalBetterCupsSPDElement.textContent = formatNumber(totalBetterCupsProduction.toString());
    if (shouldLog)
      console.log(
        '✅ Updated totalBetterCupsSPD:',
        totalBetterCupsProduction.toString(),
        'element:',
        totalBetterCupsSPDElement
      );
  } else {
    if (shouldLog) console.log('❌ totalBetterCupsSPD element not found');
  }

  // Update suctions purchased count
  const suctionsPurchasedElement = domQuery.getById('suctionsPurchased') as HTMLElement | undefined;
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
  const shopSuctionsElement = domQuery.getById('suctions') as HTMLElement | undefined;
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

  const shopCriticalClicksElement = domQuery.getById('criticalClicks') as HTMLElement | undefined;
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
  const criticalClicksPurchasedElement = domQuery.getById('criticalClicksPurchased') as
    | HTMLElement
    | undefined;
  if (criticalClicksPurchasedElement) {
    const criticalClicks = state.criticalClicks || 0;
    const criticalClicksValue =
      typeof criticalClicks === 'object' && criticalClicks.toString
        ? criticalClicks.toString()
        : criticalClicks;
    criticalClicksPurchasedElement.textContent = formatNumber(criticalClicksValue);
    if (shouldLog)
      console.log(
        '✅ Updated criticalClicks:',
        criticalClicksValue,
        'element:',
        criticalClicksPurchasedElement
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
