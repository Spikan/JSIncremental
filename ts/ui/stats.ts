// UI Statistics Updates (TypeScript)
// Handles all statistics display updates for different tabs and categories

// Import consolidated utilities
import { formatNumber } from './utils';

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
  // Straws purchased
  const strawsPurchasedElement = (window as any).DOM_CACHE?.strawsPurchased as
    | HTMLElement
    | undefined;
  if (strawsPurchasedElement) {
    const v = Number((window as any).App?.state?.getState?.()?.straws || 0);
    strawsPurchasedElement.textContent = formatNumber(v);
  }
  // Cups purchased
  const cupsPurchasedElement = (window as any).DOM_CACHE?.cupsPurchased as HTMLElement | undefined;
  if (cupsPurchasedElement) {
    const v = Number((window as any).App?.state?.getState?.()?.cups || 0);
    cupsPurchasedElement.textContent = formatNumber(v);
  }
  // Suctions purchased
  const suctionsPurchasedElement = (window as any).DOM_CACHE?.suctionsPurchased as
    | HTMLElement
    | undefined;
  if (suctionsPurchasedElement) {
    const v = Number((window as any).App?.state?.getState?.()?.suctions || 0);
    suctionsPurchasedElement.textContent = formatNumber(v);
  }
  // Critical clicks purchased
  const criticalClicksPurchasedElement = (window as any).DOM_CACHE?.criticalClicksPurchased as
    | HTMLElement
    | undefined;
  if (criticalClicksPurchasedElement) {
    const v = Number((window as any).App?.state?.getState?.()?.criticalClicks || 0);
    criticalClicksPurchasedElement.textContent = formatNumber(v);
  }
}

// Update achievement-related statistics
export function updateAchievementStats(): void {
  // Current level
  const currentLevelElement = (window as any).DOM_CACHE?.currentLevel as HTMLElement | undefined;
  if (currentLevelElement) {
    const level = Number((window as any).App?.state?.getState?.()?.level || 1);
    currentLevelElement.textContent = String(level);
  }
  // Total upgrades (sum of all upgrade counters)
  const totalUpgradesElement = (window as any).DOM_CACHE?.totalUpgrades as HTMLElement | undefined;
  if (totalUpgradesElement) {
    const st = (window as any).App?.state?.getState?.() || {};
    const widerStraws = Number((st as any).widerStraws || 0);
    const betterCups = Number((st as any).betterCups || 0);
    const suctionUpCounter = Number((st as any).suctionUpCounter || 0);
    const fasterDrinksUpCounter = Number((st as any).fasterDrinksUpCounter || 0);
    const criticalClickUpCounter = Number((st as any).criticalClickUpCounter || 0);
    const totalUpgrades =
      widerStraws + betterCups + suctionUpCounter + fasterDrinksUpCounter + criticalClickUpCounter;
    totalUpgradesElement.textContent = formatNumber(totalUpgrades);
  }
  // Faster drinks owned
  const fasterDrinksOwnedElement = (window as any).DOM_CACHE?.fasterDrinksOwned as
    | HTMLElement
    | undefined;
  if (fasterDrinksOwnedElement) {
    const owned = Number((window as any).App?.state?.getState?.()?.fasterDrinks || 0);
    fasterDrinksOwnedElement.textContent = formatNumber(owned);
  }
}
