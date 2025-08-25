// UI Affordability System (TypeScript) with Decimal support
// Handles checking and updating button states based on resource availability
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { updateButtonState, updateCostDisplay } from './utils';
import { toDecimal, gte, Decimal } from '../core/numbers';

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability(): void {
  if (typeof window === 'undefined') return;
  getUpgradesAndConfig();

  const rawSipsLarge = toDecimal((window as any).App?.state?.getState?.()?.sips || 0);

  // Debug logging for extreme value diagnosis
  console.log('🔍 checkUpgradeAffordability: Current sips =', rawSipsLarge.toString());

  // Use sips value as-is for affordability calculations (preserve extreme values)
  const currentSipsLarge = rawSipsLarge;

  // Log extreme values for monitoring (don't sanitize)
  if (!isFinite(Number(rawSipsLarge.toString()))) {
    console.log('🔥 checkUpgradeAffordability: Extreme sips detected:', rawSipsLarge.toString());
  }

  // Function to check affordability using Decimal comparison
  const canAfford = (cost: any): boolean => {
    try {
      const costLarge = toDecimal(cost);

      // Use sips as-is for comparison (no arbitrary cost limits)
      const effectiveSips = currentSipsLarge;

      // Always do proper Decimal comparison regardless of magnitude
      // Extreme values should be handled properly by the Decimal library
      const result = gte(effectiveSips, costLarge);

      // Log extreme costs for monitoring
      if (!isFinite(Number(costLarge.toString()))) {
        console.log('🔥 Extreme cost detected:', costLarge.toString());
      }

      console.log(
        '🔍 canAfford check: sips =',
        effectiveSips.toString(),
        'cost =',
        costLarge.toString(),
        'result =',
        result
      );
      return result;
    } catch (error) {
      console.warn('🚫 Error in canAfford check:', error);
      // Default to affordable if there's an error to prevent permanent disabling
      return true;
    }
  };

  const costs = calculateAllCosts();

  // Log costs for debugging extreme value issues
  console.log('🔍 Calculated costs:', {
    straw: costs.straw?.toString(),
    cup: costs.cup?.toString(),
    suction: costs.suction?.toString(),
    criticalClick: costs.criticalClick?.toString(),
    widerStraws: costs.widerStraws?.toString(),
    betterCups: costs.betterCups?.toString(),
  });

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

// Calculate all upgrade costs with Decimal support
function calculateAllCosts(): any {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();
  const costs: any = {};

  // Straw cost - use Decimal calculation with extreme value protection
  const strawBaseCost = toDecimal(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toDecimal(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toDecimal((window as any).App?.state?.getState?.()?.straws || 0);

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

  // Cup cost - use Decimal calculation with extreme value protection
  const cupBaseCost = toDecimal(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toDecimal(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toDecimal((window as any).App?.state?.getState?.()?.cups || 0);

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

  // Suction cost - use Decimal calculation with extreme value protection
  const suctionBaseCost = toDecimal(
    dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40
  );
  const suctionScaling = toDecimal(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toDecimal((window as any).App?.state?.getState?.()?.suctions || 0);

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

  // Faster drinks cost - use Decimal calculation with extreme value protection
  const fasterDrinksBaseCost = toDecimal(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toDecimal(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toDecimal(
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

  // Critical click cost - use Decimal calculation with extreme value protection
  const criticalClickBaseCost = toDecimal(
    dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST ?? 60
  );
  const criticalClickScaling = toDecimal(
    dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING ?? 1.12
  );
  const criticalClickCount = toDecimal(
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

  // Wider straws cost - use Decimal calculation
  const widerStrawsBaseCost = toDecimal(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsCount = toDecimal(
    (window as any).App?.state?.getState?.()?.widerStraws || 0
  );
  costs.widerStraws = widerStrawsBaseCost.multiply(widerStrawsCount.add(new Decimal(1)));

  // Better cups cost - use Decimal calculation
  const betterCupsBaseCost = toDecimal(
    dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400
  );
  const betterCupsCount = toDecimal((window as any).App?.state?.getState?.()?.betterCups || 0);
  costs.betterCups = betterCupsBaseCost.multiply(betterCupsCount.add(new Decimal(1)));

  // Faster drinks upgrade cost - use Decimal calculation
  const fasterDrinksUpBaseCost = toDecimal(
    dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 1500
  );
  const fasterDrinksUpCount = toDecimal(
    (window as any).App?.state?.getState?.()?.fasterDrinksUpCounter || 0
  );
  costs.fasterDrinksUp = fasterDrinksUpBaseCost.multiply(fasterDrinksUpCount);

  // Level up cost - use Decimal calculation
  const levelUpBaseCost = toDecimal(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelCount = toDecimal((window as any).App?.state?.getState?.()?.level || 0);
  costs.levelUp = levelUpBaseCost.multiply(levelCount);

  return costs;
}
