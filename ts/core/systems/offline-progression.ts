// Offline Progression System: Calculate and award offline earnings
import { toDecimal } from '../numbers/simplified';
import { logger } from '../../services/logger';
import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';

export interface OfflineProgressionResult {
  timeAway: number;
  sipsEarned: string; // Using string to preserve Decimal precision
  drinksProcessed: number;
  cappedAt: number; // Maximum offline time allowed
  wasActive: boolean;
}

export interface OfflineProgressionConfig {
  maxOfflineHours?: number; // Maximum hours of offline progression (default: 8)
  minOfflineMinutes?: number; // Minimum minutes away to show modal (default: 1)
  offlineEfficiency?: number; // Efficiency multiplier for offline earnings (default: 1.0)
}

/**
 * Calculate offline progression earnings
 */
export function calculateOfflineProgression(
  config: OfflineProgressionConfig = {}
): OfflineProgressionResult {
  const { maxOfflineHours = 8, minOfflineMinutes = 1, offlineEfficiency = 1.0 } = config;

  try {
    const w: any = window as any;
    const state = useGameStore.getState();

    // Get current time and last save time
    const now = Date.now();
    const lastSaveTime = Number(state.lastSaveTime || now);
    const timeAway = Math.max(0, now - lastSaveTime);

    // Convert to minutes for easier comparison
    const minutesAway = timeAway / (1000 * 60);

    logger.info(`Offline progression check: ${minutesAway.toFixed(1)} minutes away`);

    // If not away long enough, no offline progression
    if (minutesAway < minOfflineMinutes) {
      return {
        timeAway,
        sipsEarned: '0',
        drinksProcessed: 0,
        cappedAt: maxOfflineHours * 60 * 60 * 1000,
        wasActive: false,
      };
    }

    // Cap offline time to prevent exploitation
    const maxOfflineTime = maxOfflineHours * 60 * 60 * 1000; // Convert to milliseconds
    const cappedTime = Math.min(timeAway, maxOfflineTime);

    // Get production values
    const drinkRate = Number(state.drinkRate || w.drinkRate || 5000); // Default 5 seconds
    const spd = toDecimal(state.spd || w.spd || 1); // Sips per drink

    // Calculate how many drinks would have been processed
    const totalDrinks = Math.floor(cappedTime / drinkRate);

    if (totalDrinks === 0) {
      return {
        timeAway,
        sipsEarned: '0',
        drinksProcessed: 0,
        cappedAt: maxOfflineTime,
        wasActive: false,
      };
    }

    // Calculate total offline earnings
    const sipsPerDrink = spd.mul(offlineEfficiency);
    const totalOfflineSips = sipsPerDrink.mul(totalDrinks);

    logger.info(
      `Offline calculation: ${totalDrinks} drinks × ${sipsPerDrink.toString()} SPD = ${totalOfflineSips.toString()} sips`
    );

    return {
      timeAway,
      sipsEarned: totalOfflineSips.toString(),
      drinksProcessed: totalDrinks,
      cappedAt: maxOfflineTime,
      wasActive: true,
    };
  } catch (error) {
    logger.error('Failed to calculate offline progression:', error);
    return {
      timeAway: 0,
      sipsEarned: '0',
      drinksProcessed: 0,
      cappedAt: 8 * 60 * 60 * 1000,
      wasActive: false,
    };
  }
}

/**
 * Apply offline progression earnings to the game state
 */
export function applyOfflineProgression(result: OfflineProgressionResult): boolean {
  if (!result.wasActive || result.sipsEarned === '0') {
    return false;
  }

  try {
    const state = useGameStore.getState();

    // Add offline sips to current sips
    const currentSips = state.sips || toDecimal(0);
    const offlineSips = toDecimal(result.sipsEarned);
    const newSips = currentSips.add(offlineSips);

    // Update total sips earned
    const currentTotal = state.totalSipsEarned || toDecimal(0);
    const newTotal = currentTotal.add(offlineSips);

    // Update state
    useGameStore.setState({
      sips: newSips,
      totalSipsEarned: newTotal,
      lastSaveTime: Date.now(), // Update last save time to prevent double-counting
    });

    // Update UI displays
    ui.updateTopSipsPerDrink?.();
    ui.updateTopSipsPerSecond?.();
    ui.updateAllStats?.();

    logger.info(`Applied offline progression: +${result.sipsEarned} sips`);
    return true;
  } catch (error) {
    logger.error('Failed to apply offline progression:', error);
    return false;
  }
}

/**
 * Format time duration for display
 */
export function formatOfflineTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Check and process offline progression on game load
 */
export function processOfflineProgression(
  config: OfflineProgressionConfig = {}
): OfflineProgressionResult | null {
  try {
    const result = calculateOfflineProgression(config);

    if (result.wasActive) {
      logger.info(`Processing offline progression: ${formatOfflineTime(result.timeAway)} away`);
      applyOfflineProgression(result);
      return result;
    }

    return null;
  } catch (error) {
    logger.error('Failed to process offline progression:', error);
    return null;
  }
}
