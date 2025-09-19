// Unlock Purchase System (TypeScript)
// Handles one-time purchases for feature unlocks

import { DecimalType, toDecimal, gte } from '../numbers/simplified';
import { useGameStore } from '../state/zustand-store';
import * as ui from '../../ui/index';
import { FEATURE_UNLOCKS as unlockSystem } from '../../feature-unlocks';
import { optimizedEventBus } from '../../services/optimized-event-bus';
import { errorHandler } from '../error-handling/error-handler';

export interface UnlockPurchaseResult {
  success: boolean;
  spent?: DecimalType;
  message?: string;
}

export interface UnlockCosts {
  [key: string]: DecimalType;
}

/**
 * Get the cost for unlocking a specific feature
 */
export function getUnlockCost(featureName: string): DecimalType {
  // const w = (typeof window !== 'undefined' ? (window as any) : {}) as any;
  const config = (window as any).GAME_CONFIG || {};

  // Map feature names to config keys
  const featureToConfigKey: Record<string, string> = {
    suction: 'SUCTION',
    criticalClick: 'CRITICAL_CLICK',
    fasterDrinks: 'FASTER_DRINKS',
    straws: 'STRAWS',
    cups: 'CUPS',
    widerStraws: 'WIDER_STRAWS',
    betterCups: 'BETTER_CUPS',
    levelUp: 'LEVEL_UP',
    shop: 'SHOP',
    stats: 'STATS',
    god: 'GOD',
    unlocks: 'UNLOCKS_TAB',
  };

  const configKey = featureToConfigKey[featureName] || featureName.toUpperCase();
  const cost = config.UNLOCK_PURCHASES?.[configKey] || 0;
  return toDecimal(cost);
}

/**
 * Get all unlock costs
 */
export function getAllUnlockCosts(): UnlockCosts {
  // const w = (typeof window !== 'undefined' ? (window as any) : {}) as any;
  const config = (window as any).GAME_CONFIG || {};
  const costs: UnlockCosts = {};

  if (config.UNLOCK_PURCHASES) {
    // Map config keys to feature names
    const configKeyToFeature: Record<string, string> = {
      SUCTION: 'suction',
      CRITICAL_CLICK: 'criticalClick',
      FASTER_DRINKS: 'fasterDrinks',
      STRAWS: 'straws',
      CUPS: 'cups',
      WIDER_STRAWS: 'widerStraws',
      BETTER_CUPS: 'betterCups',
      LEVEL_UP: 'levelUp',
      SHOP: 'shop',
      STATS: 'stats',
      GOD: 'god',
      UNLOCKS_TAB: 'unlocks',
    };

    Object.keys(config.UNLOCK_PURCHASES).forEach(configKey => {
      const featureName = configKeyToFeature[configKey] || configKey.toLowerCase();
      costs[featureName] = toDecimal(config.UNLOCK_PURCHASES[configKey]);
    });
  }

  return costs;
}

/**
 * Check if a feature can be purchased (affordable and not already unlocked)
 */
export function canPurchaseUnlock(featureName: string): { canPurchase: boolean; reason?: string } {
  try {
    const state = useGameStore.getState();

    if (!state) {
      return { canPurchase: false, reason: 'Game state not available' };
    }

    // Check if already unlocked
    const unlockedFeatures = unlockSystem.unlockedFeatures;
    if (unlockedFeatures?.has(featureName)) {
      return { canPurchase: false, reason: 'Already unlocked' };
    }

    // Check affordability
    const cost = getUnlockCost(featureName);
    const sips = toDecimal(state.sips || 0);

    if (!gte(sips, cost)) {
      return { canPurchase: false, reason: 'Not enough sips' };
    }

    return { canPurchase: true };
  } catch (error) {
    errorHandler.handleError(error, 'checkUnlockPurchaseAvailability', { featureName });
    return { canPurchase: false, reason: 'Error checking availability' };
  }
}

/**
 * Purchase a feature unlock
 */
export function purchaseUnlock(featureName: string): UnlockPurchaseResult {
  try {
    // const w: any = window as any;
    const state = useGameStore.getState();

    if (!state) {
      return { success: false, message: 'Game state not available' };
    }

    // Check if already unlocked
    const unlockedFeatures = unlockSystem.unlockedFeatures;
    if (unlockedFeatures?.has(featureName)) {
      return { success: false, message: 'Feature already unlocked' };
    }

    // Get cost and check affordability
    const cost = getUnlockCost(featureName);
    const sips = toDecimal(state.sips || 0);

    if (!gte(sips, cost)) {
      return {
        success: false,
        message: `Not enough sips. Need ${cost.toString()}, have ${sips.toString()}`,
      };
    }

    // Deduct cost from sips
    const newSips = sips.sub(cost);

    // Update state
    try {
      const actions = useGameStore.getState().actions;
      if (actions?.setSips) {
        actions.setSips(newSips);
      } else {
        // Fallback to direct state update
        useGameStore.setState({ sips: newSips });
      }
    } catch (error) {
      errorHandler.handleError(error, 'updateSipsAfterUnlockPurchase', {
        featureName,
        cost,
        newSips,
      });
      return { success: false, message: 'Failed to update sips' };
    }

    // Unlock the feature
    try {
      // unlockSystem is already imported
      if (unlockSystem?.unlockFeature) {
        unlockSystem.unlockFeature(featureName);
      } else {
        return { success: false, message: 'Unlock system not available' };
      }
    } catch (error) {
      errorHandler.handleError(error, 'unlockFeature', { featureName });
      return { success: false, message: 'Failed to unlock feature' };
    }

    // Emit purchase event
    try {
      optimizedEventBus.emit('feature:unlocked', {
        feature: featureName,
        timestamp: Date.now(),
      });
    } catch (error) {
      errorHandler.handleError(error, 'emitUnlockPurchaseEvent', { featureName });
    }

    return {
      success: true,
      spent: cost,
      message: `Successfully unlocked ${featureName}`,
    };
  } catch (error) {
    errorHandler.handleError(error, 'purchaseUnlock', { featureName });
    return { success: false, message: 'Unexpected error occurred' };
  }
}

/**
 * Get unlock purchase information for UI display
 */
export function getUnlockPurchaseInfo(featureName: string): {
  cost: DecimalType;
  canPurchase: boolean;
  reason?: string;
  isUnlocked: boolean;
} {
  const cost = getUnlockCost(featureName);
  const { canPurchase, reason } = canPurchaseUnlock(featureName);

  const unlockedFeatures = unlockSystem.unlockedFeatures;
  const isUnlocked = unlockedFeatures?.has(featureName) || false;

  const result: {
    cost: DecimalType;
    canPurchase: boolean;
    reason?: string;
    isUnlocked: boolean;
  } = {
    cost,
    canPurchase: canPurchase && !isUnlocked,
    isUnlocked,
  };

  if (isUnlocked) {
    result.reason = 'Already unlocked';
  } else if (reason) {
    result.reason = reason;
  }

  return result;
}

/**
 * Get all unlock purchase information for UI display
 */
export function getAllUnlockPurchaseInfo(): Record<
  string,
  {
    cost: DecimalType;
    canPurchase: boolean;
    reason?: string;
    isUnlocked: boolean;
  }
> {
  // const w = (typeof window !== 'undefined' ? (window as any) : {}) as any;
  const config = (window as any).GAME_CONFIG || {};
  const info: Record<string, any> = {};

  if (config.UNLOCK_PURCHASES) {
    // Map config keys to feature names
    const configKeyToFeature: Record<string, string> = {
      SUCTION: 'suction',
      CRITICAL_CLICK: 'criticalClick',
      FASTER_DRINKS: 'fasterDrinks',
      STRAWS: 'straws',
      CUPS: 'cups',
      WIDER_STRAWS: 'widerStraws',
      BETTER_CUPS: 'betterCups',
      LEVEL_UP: 'levelUp',
      SHOP: 'shop',
      STATS: 'stats',
      GOD: 'god',
      UNLOCKS_TAB: 'unlocks',
    };

    Object.keys(config.UNLOCK_PURCHASES).forEach(configKey => {
      const featureName = configKeyToFeature[configKey] || configKey.toLowerCase();
      info[featureName] = getUnlockPurchaseInfo(featureName);
    });
  }

  return info;
}

/**
 * Execute unlock purchase (for button actions)
 */
export function executeUnlockPurchase(featureName: string): boolean {
  console.log(`[DEBUG] executeUnlockPurchase called for: ${featureName}`);
  const result = purchaseUnlock(featureName);
  console.log(`[DEBUG] purchaseUnlock result:`, result);

  if (result.success) {
    console.log(`[DEBUG] Purchase successful, updating UI`);
    // Update UI displays
    try {
      ui.updateAllDisplays?.();
      ui.checkUpgradeAffordability?.();
      ui.updateShopButtonStates?.();
      // Also update feature visibility to reflect the unlock
      unlockSystem?.updateFeatureVisibility?.();
    } catch (error) {
      errorHandler.handleError(error, 'updateUIAfterUnlockPurchase', { featureName });
    }

    return true;
  } else {
    errorHandler.handleError(
      new Error(`Failed to purchase unlock ${featureName}: ${result.message}`),
      'purchaseUnlock',
      { featureName, message: result.message }
    );
    return false;
  }
}

// Export for global access
export const unlockPurchases = {
  getCost: getUnlockCost,
  getAllCosts: getAllUnlockCosts,
  canPurchase: canPurchaseUnlock,
  purchase: purchaseUnlock,
  getInfo: getUnlockPurchaseInfo,
  getAllInfo: getAllUnlockPurchaseInfo,
  execute: executeUnlockPurchase,
};
