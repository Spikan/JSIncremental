// UI Affordability System (TypeScript) with LargeNumber support
// Handles checking and updating button states based on resource availability
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { updateButtonState, updateCostDisplay } from './utils';
import { toLargeNumber, gte } from '../core/numbers/migration-utils';
import { LargeNumber } from '../core/numbers/large-number';

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability(): void {
  if (typeof window === 'undefined') return;
  getUpgradesAndConfig();

  const currentSipsLarge = toLargeNumber((window as any).App?.state?.getState?.()?.sips || 0);
  // Check if current sips is effectively zero
  if (currentSipsLarge.lte(new LargeNumber(0))) {
    return;
  }

  // Function to check affordability using LargeNumber comparison
  const canAfford = (cost: any): boolean => {
    const costLarge = toLargeNumber(cost);
    return gte(currentSipsLarge, costLarge);
  };

  const costs = calculateAllCosts();

  // Update button states based on affordability
  updateButtonState('buyStraw', canAfford(costs.straw), costs.straw);
  updateButtonState('buyCup', canAfford(costs.cup), costs.cup);
  updateButtonState('buySuction', canAfford(costs.suction), costs.suction);
  updateButtonState('buyFasterDrinks', canAfford(costs.fasterDrinks), costs.fasterDrinks);
  updateButtonState('buyCriticalClick', canAfford(costs.criticalClick), costs.criticalClick);
  updateButtonState('buyWiderStraws', canAfford(costs.widerStraws), costs.widerStraws);
  updateButtonState('buyBetterCups', canAfford(costs.betterCups), costs.betterCups);
  updateButtonState('upgradeFasterDrinks', canAfford(costs.fasterDrinksUp), costs.fasterDrinksUp);
  // Critical click upgrade button doesn't exist
  updateButtonState('levelUp', canAfford(costs.levelUp), costs.levelUp);

  // Standard and compact cost displays
  updateCostDisplay('strawCost', costs.straw, canAfford(costs.straw));
  updateCostDisplay('cupCost', costs.cup, canAfford(costs.cup));
  updateCostDisplay('suctionCost', costs.suction, canAfford(costs.suction));
  updateCostDisplay('suctionCostCompact', costs.suction, canAfford(costs.suction));
  updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, canAfford(costs.fasterDrinks));
  updateCostDisplay('fasterDrinksCostCompact', costs.fasterDrinks, canAfford(costs.fasterDrinks));
  updateCostDisplay('criticalClickCost', costs.criticalClick, canAfford(costs.criticalClick));
  updateCostDisplay(
    'criticalClickCostCompact',
    costs.criticalClick,
    canAfford(costs.criticalClick)
  );
  updateCostDisplay('widerStrawsCost', costs.widerStraws, canAfford(costs.widerStraws));
  updateCostDisplay('betterCupsCost', costs.betterCups, canAfford(costs.betterCups));
  updateCostDisplay('fasterDrinksUpCost', costs.fasterDrinksUp, canAfford(costs.fasterDrinksUp));
  updateCostDisplay(
    'fasterDrinksUpCostCompact',
    costs.fasterDrinksUp,
    canAfford(costs.fasterDrinksUp)
  );
  updateCostDisplay('levelUpCost', costs.levelUp, canAfford(costs.levelUp));
  updateCostDisplay('levelCost', costs.levelUp, canAfford(costs.levelUp));
}

// Update shop button states based on current affordability
export function updateShopButtonStates(): void {
  checkUpgradeAffordability();
}

// Calculate all upgrade costs with LargeNumber support
function calculateAllCosts(): any {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();
  const costs: any = {};

  // Straw cost - use LargeNumber calculation with extreme value protection
  const strawBaseCost = toLargeNumber(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toLargeNumber(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toLargeNumber((window as any).App?.state?.getState?.()?.straws || 0);

  // Use safe exponent conversion with cap for extreme values
  let strawExponent = 0;
  try {
    const rawExponent = (strawCount as any).toNumber?.();
    if (Number.isFinite(rawExponent) && rawExponent >= 0) {
      // Cap exponent to prevent astronomical costs from extreme values
      strawExponent = Math.min(rawExponent, 1000); // Reasonable cap for gameplay
    }
  } catch (error) {
    console.warn('🚫 calculateAllCosts: Error calculating straw exponent:', error);
  }
  costs.straw = strawBaseCost.multiply(strawScaling.pow(strawExponent));

  // Cup cost - use LargeNumber calculation with extreme value protection
  const cupBaseCost = toLargeNumber(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toLargeNumber(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toLargeNumber((window as any).App?.state?.getState?.()?.cups || 0);

  // Use safe exponent conversion with cap for extreme values
  let cupExponent = 0;
  try {
    const rawExponent = (cupCount as any).toNumber?.();
    if (Number.isFinite(rawExponent) && rawExponent >= 0) {
      // Cap exponent to prevent astronomical costs from extreme values
      cupExponent = Math.min(rawExponent, 1000); // Reasonable cap for gameplay
    }
  } catch (error) {
    console.warn('🚫 calculateAllCosts: Error calculating cup exponent:', error);
  }
  costs.cup = cupBaseCost.multiply(cupScaling.pow(cupExponent));

  // Suction cost - use LargeNumber calculation with extreme value protection
  const suctionBaseCost = toLargeNumber(
    dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40
  );
  const suctionScaling = toLargeNumber(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toLargeNumber((window as any).App?.state?.getState?.()?.suctions || 0);

  // Use safe exponent conversion with cap for extreme values
  let suctionExponent = 0;
  try {
    const rawExponent = (suctionCount as any).toNumber?.();
    if (Number.isFinite(rawExponent) && rawExponent >= 0) {
      // Cap exponent to prevent astronomical costs from extreme values
      suctionExponent = Math.min(rawExponent, 1000); // Reasonable cap for gameplay
    }
  } catch (error) {
    console.warn('🚫 calculateAllCosts: Error calculating suction exponent:', error);
  }
  costs.suction = suctionBaseCost.multiply(suctionScaling.pow(suctionExponent));

  // Faster drinks cost - use LargeNumber calculation with extreme value protection
  const fasterDrinksBaseCost = toLargeNumber(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toLargeNumber(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toLargeNumber(
    (window as any).App?.state?.getState?.()?.fasterDrinks || 0
  );

  // Use safe exponent conversion with cap for extreme values
  let fasterDrinksExponent = 0;
  try {
    const rawExponent = (fasterDrinksCount as any).toNumber?.();
    if (Number.isFinite(rawExponent) && rawExponent >= 0) {
      // Cap exponent to prevent astronomical costs from extreme values
      fasterDrinksExponent = Math.min(rawExponent, 1000); // Reasonable cap for gameplay
    }
  } catch (error) {
    console.warn('🚫 calculateAllCosts: Error calculating fasterDrinks exponent:', error);
  }
  costs.fasterDrinks = fasterDrinksBaseCost.multiply(fasterDrinksScaling.pow(fasterDrinksExponent));

  // Critical click cost - use LargeNumber calculation with extreme value protection
  const criticalClickBaseCost = toLargeNumber(
    dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST ?? 60
  );
  const criticalClickScaling = toLargeNumber(
    dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING ?? 1.12
  );
  const criticalClickCount = toLargeNumber(
    (window as any).App?.state?.getState?.()?.criticalClicks || 0
  );

  // Use safe exponent conversion with cap for extreme values
  let criticalClickExponent = 0;
  try {
    const rawExponent = (criticalClickCount as any).toNumber?.();
    if (Number.isFinite(rawExponent) && rawExponent >= 0) {
      // Cap exponent to prevent astronomical costs from extreme values
      criticalClickExponent = Math.min(rawExponent, 1000); // Reasonable cap for gameplay
    }
  } catch (error) {
    console.warn('🚫 calculateAllCosts: Error calculating criticalClick exponent:', error);
  }
  costs.criticalClick = criticalClickBaseCost.multiply(
    criticalClickScaling.pow(criticalClickExponent)
  );

  // Wider straws cost - use LargeNumber calculation
  const widerStrawsBaseCost = toLargeNumber(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsCount = toLargeNumber(
    (window as any).App?.state?.getState?.()?.widerStraws || 0
  );
  costs.widerStraws = widerStrawsBaseCost.multiply(widerStrawsCount.add(new LargeNumber(1)));

  // Better cups cost - use LargeNumber calculation
  const betterCupsBaseCost = toLargeNumber(
    dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400
  );
  const betterCupsCount = toLargeNumber((window as any).App?.state?.getState?.()?.betterCups || 0);
  costs.betterCups = betterCupsBaseCost.multiply(betterCupsCount.add(new LargeNumber(1)));

  // Faster drinks upgrade cost - use LargeNumber calculation
  const fasterDrinksUpBaseCost = toLargeNumber(
    dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 1500
  );
  const fasterDrinksUpCount = toLargeNumber(
    (window as any).App?.state?.getState?.()?.fasterDrinksUpCounter || 0
  );
  costs.fasterDrinksUp = fasterDrinksUpBaseCost.multiply(fasterDrinksUpCount);

  // Level up cost - use LargeNumber calculation
  const levelUpBaseCost = toLargeNumber(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelCount = toLargeNumber((window as any).App?.state?.getState?.()?.level || 0);
  costs.levelUp = levelUpBaseCost.multiply(levelCount);

  return costs;
}
