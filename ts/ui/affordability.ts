// UI Affordability System (TypeScript) with Decimal support
// Handles checking and updating button states based on resource availability
//
// MEMORY: ALL COST CALCULATIONS MUST USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE PURCHASE COSTS ARE THE INTENDED RESULT OF UPGRADES
// MEMORY: NEVER USE TONUMBER() ON EXPONENTS - USE DECIMAL COMPARISONS INSTEAD
// MEMORY: PRESERVE FULL PRECISION FOR ALL AFFORDABILITY CHECKS
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { updateButtonState, updateCostDisplay } from './utils';
import { toDecimal, gte } from '../core/numbers/migration-utils';

// Direct break_eternity.js Decimal access
const Decimal = (globalThis as any).Decimal;

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability(): void {
  if (typeof window === 'undefined') return;

  getUpgradesAndConfig();

  const rawSipsLarge = toDecimal((window as any).App?.state?.getState?.()?.sips || 0);
  const currentSipsLarge = rawSipsLarge;

  // Function to check affordability using Decimal comparison
  const canAfford = (cost: any): boolean => {
    const costLarge = toDecimal(cost);
    const effectiveSips = currentSipsLarge;
    return gte(effectiveSips, costLarge);
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
  updateButtonState('levelUp', canAfford(costs.levelUp), costs.levelUp);

  // Cost displays
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

// Direct cost calculation using break_eternity.js - no safety nets
function calculateAllCosts(): any {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();
  const costs: any = {};

  // Direct Decimal operations - break_eternity.js handles all edge cases
  const strawBaseCost = toDecimal(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toDecimal(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toDecimal((window as any).App?.state?.getState?.()?.straws || 0);
  costs.straw = strawBaseCost.multiply(strawScaling.pow(strawCount));

  const cupBaseCost = toDecimal(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toDecimal(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toDecimal((window as any).App?.state?.getState?.()?.cups || 0);
  costs.cup = cupBaseCost.multiply(cupScaling.pow(cupCount));

  const suctionBaseCost = toDecimal(dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40);
  const suctionScaling = toDecimal(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toDecimal((window as any).App?.state?.getState?.()?.suctions || 0);
  costs.suction = suctionBaseCost.multiply(suctionScaling.pow(suctionCount));

  const fasterDrinksBaseCost = toDecimal(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toDecimal(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toDecimal((window as any).App?.state?.getState?.()?.fasterDrinks || 0);
  costs.fasterDrinks = fasterDrinksBaseCost.multiply(fasterDrinksScaling.pow(fasterDrinksCount));

  const criticalClickBaseCost = toDecimal(
    dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST ?? 60
  );
  const criticalClickScaling = toDecimal(
    dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING ?? 1.12
  );
  const criticalClickCount = toDecimal(
    (window as any).App?.state?.getState?.()?.criticalClicks || 0
  );
  costs.criticalClick = criticalClickBaseCost.multiply(
    criticalClickScaling.pow(criticalClickCount)
  );

  const widerStrawsBaseCost = toDecimal(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsCount = toDecimal((window as any).App?.state?.getState?.()?.widerStraws || 0);
  costs.widerStraws = widerStrawsBaseCost.multiply(widerStrawsCount.add(new Decimal(1)));

  const betterCupsBaseCost = toDecimal(
    dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400
  );
  const betterCupsCount = toDecimal((window as any).App?.state?.getState?.()?.betterCups || 0);
  costs.betterCups = betterCupsBaseCost.multiply(betterCupsCount.add(new Decimal(1)));

  const fasterDrinksUpBaseCost = toDecimal(
    dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 1500
  );
  const fasterDrinksUpCount = toDecimal(
    (window as any).App?.state?.getState?.()?.fasterDrinksUpCounter || 0
  );
  costs.fasterDrinksUp = fasterDrinksUpBaseCost.multiply(fasterDrinksUpCount);

  const levelUpBaseCost = toDecimal(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelCount = toDecimal((window as any).App?.state?.getState?.()?.level || 0);
  costs.levelUp = levelUpBaseCost.multiply(levelCount);

  return costs;
}
