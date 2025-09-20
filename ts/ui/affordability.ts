// UI Affordability System (TypeScript) with Decimal support
// Handles checking and updating button states based on resource availability
//
// MEMORY: ALL COST CALCULATIONS MUST USE BREAK_ETERNITY DECIMAL OPERATIONS
// MEMORY: EXTREMELY LARGE PURCHASE COSTS ARE THE INTENDED RESULT OF UPGRADES
// MEMORY: NEVER USE TONUMBER() ON EXPONENTS - USE DECIMAL COMPARISONS INSTEAD
// MEMORY: PRESERVE FULL PRECISION FOR ALL AFFORDABILITY CHECKS
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { updateButtonState, updateCostDisplay } from './utils';
import { toDecimal, gte } from '../core/numbers/simplified';
import { NumericValue, CostResult } from '../types/app-types';
import { useGameStore } from '../core/state/zustand-store';
import { hybridLevelSystem } from '../core/systems/hybrid-level-system';
import { errorHandler } from '../core/error-handling/error-handler';
import {
  nextStrawCost,
  nextCupCost,
  nextWiderStrawsCost,
  nextBetterCupsCost,
} from '../core/rules/purchases';

// Direct break_eternity.js Decimal access (consistent with core systems)
// const Decimal = (globalThis as any).Decimal; // Not used in this file

// Helper function to check if a button is in unlock mode
function isButtonInUnlockMode(buttonId: string): boolean {
  const unlockButtons = document.querySelectorAll(`button[data-action*="purchaseUnlock"]`);
  // Debug logging removed for cleaner console

  if (unlockButtons.length === 0) return false;

  // Check if this button ID corresponds to an unlock button
  const unlockButtonIds = ['buySuction', 'buyCriticalClick', 'buyFasterDrinks'];
  const isUnlockButton = unlockButtonIds.includes(buttonId);
  return isUnlockButton;
}

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability(): void {
  if (typeof window === 'undefined') return;

  getUpgradesAndConfig();

  const rawSipsLarge = toDecimal(useGameStore.getState().sips || 0);
  const currentSipsLarge = rawSipsLarge;

  // Function to check affordability using Decimal comparison
  const canAfford = (cost: NumericValue): boolean => {
    try {
      const costLarge = toDecimal(cost);
      const effectiveSips = currentSipsLarge;

      // Validate that cost is not NaN
      const costStr = costLarge.toString();
      if (costStr === 'NaN' || costStr === 'Infinity' || costStr === '-Infinity') {
        console.warn('Invalid cost detected in affordability check:', cost);
        return false;
      }

      return gte(effectiveSips, costLarge);
    } catch (error) {
      errorHandler.handleError(error, 'canAffordCheck', { cost: cost?.toString() });
      return false;
    }
  };

  const costs = calculateAllCosts();

  // Update button states based on affordability (skip unlock buttons)
  updateButtonState('buyStraw', canAfford(costs.straw), costs.straw);
  updateButtonState('buyCup', canAfford(costs.cup), costs.cup);

  // Only update these buttons if they're not in unlock mode
  if (!isButtonInUnlockMode('buySuction')) {
    updateButtonState('buySuction', canAfford(costs.suction), costs.suction);
  }
  if (!isButtonInUnlockMode('buyFasterDrinks')) {
    updateButtonState('buyFasterDrinks', canAfford(costs.fasterDrinks), costs.fasterDrinks);
  }

  updateButtonState('buyWiderStraws', canAfford(costs.widerStraws), costs.widerStraws);
  updateButtonState('buyBetterCups', canAfford(costs.betterCups), costs.betterCups);
  // levelUp button is handled by hybrid level system - don't update its state here
  // updateButtonState('levelUp', canAfford(costs.levelUp), costs.levelUp);

  // Cost displays - pass Decimal objects directly for proper formatting
  updateCostDisplay('strawCost', costs.straw, canAfford(costs.straw));
  updateCostDisplay('cupCost', costs.cup, canAfford(costs.cup));
  updateCostDisplay('suctionCost', costs.suction, canAfford(costs.suction));
  updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, canAfford(costs.fasterDrinks));
  updateCostDisplay('widerStrawsCost', costs.widerStraws, canAfford(costs.widerStraws));
  updateCostDisplay('betterCupsCost', costs.betterCups, canAfford(costs.betterCups));
  // levelUpCost and levelCost are handled by hybrid level system - don't override them
  // updateCostDisplay('levelUpCost', costs.levelUp, canAfford(costs.levelUp));

  // Update unlock feature visibility and affordability
  try {
    // Modernized - feature visibility handled by store
  } catch (error) {
    errorHandler.handleError(error, 'updateFeatureVisibilityInAffordabilityCheck');
  }

  // Apply level themes after affordability states are updated
  try {
    const hybridSystem = hybridLevelSystem;
    if (hybridSystem && typeof hybridSystem.applyCurrentLevelTheme === 'function') {
      hybridSystem.applyCurrentLevelTheme();
    }
  } catch (error) {
    errorHandler.handleError(error, 'applyLevelThemeAfterAffordabilityUpdate');
  }
}

// Update shop button states based on current affordability
export function updateShopButtonStates(): void {
  checkUpgradeAffordability();
}

// Direct cost calculation using break_eternity.js - with NaN validation
function calculateAllCosts(): CostResult {
  const { upgrades: dataUp, config } = getUpgradesAndConfig();

  const costs = {} as CostResult;

  // Use the new improved cost calculation functions
  const strawBaseCost = toDecimal(dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5);
  const strawScaling = toDecimal(dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08);
  const strawCount = toDecimal(useGameStore.getState().straws || 0);
  costs.straw = nextStrawCost(strawCount, strawBaseCost, strawScaling);

  // Validate straw cost
  if (costs.straw.toString() === 'NaN') {
    console.warn('Straw cost calculation resulted in NaN, using fallback');
    costs.straw = toDecimal(5); // Fallback to base cost
  }

  const cupBaseCost = toDecimal(dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15);
  const cupScaling = toDecimal(dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15);
  const cupCount = toDecimal(useGameStore.getState().cups || 0);
  costs.cup = nextCupCost(cupCount, cupBaseCost, cupScaling);

  // Validate cup cost
  if (costs.cup.toString() === 'NaN') {
    console.warn('Cup cost calculation resulted in NaN, using fallback');
    costs.cup = toDecimal(15); // Fallback to base cost
  }

  const suctionBaseCost = toDecimal(dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40);
  const suctionScaling = toDecimal(dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12);
  const suctionCount = toDecimal(useGameStore.getState().suctions || 0);
  costs.suction = suctionBaseCost.multiply(suctionScaling.pow(suctionCount));

  // Validate suction cost
  if (costs.suction.toString() === 'NaN') {
    console.warn('Suction cost calculation resulted in NaN, using fallback');
    costs.suction = toDecimal(40); // Fallback to base cost
  }

  const fasterDrinksBaseCost = toDecimal(
    dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80
  );
  const fasterDrinksScaling = toDecimal(
    dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.1
  );
  const fasterDrinksCount = toDecimal(useGameStore.getState().fasterDrinks || 0);
  costs.fasterDrinks = fasterDrinksBaseCost.multiply(fasterDrinksScaling.pow(fasterDrinksCount));

  // Validate faster drinks cost
  if (costs.fasterDrinks.toString() === 'NaN') {
    console.warn('Faster drinks cost calculation resulted in NaN, using fallback');
    costs.fasterDrinks = toDecimal(80); // Fallback to base cost
  }

  const widerStrawsBaseCost = toDecimal(
    dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150
  );
  const widerStrawsScaling = toDecimal(
    dataUp?.widerStraws?.scaling ?? config.WIDER_STRAWS_SCALING ?? 1.2
  );
  const widerStrawsCount = toDecimal(useGameStore.getState().widerStraws || 0);
  costs.widerStraws = nextWiderStrawsCost(
    widerStrawsCount,
    widerStrawsBaseCost,
    widerStrawsScaling
  );

  // Validate wider straws cost
  if (costs.widerStraws.toString() === 'NaN') {
    console.warn('Wider straws cost calculation resulted in NaN, using fallback');
    costs.widerStraws = toDecimal(150); // Fallback to base cost
  }

  const betterCupsBaseCost = toDecimal(
    dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400
  );
  const betterCupsScaling = toDecimal(
    dataUp?.betterCups?.scaling ?? config.BETTER_CUPS_SCALING ?? 1.25
  );
  const betterCupsCount = toDecimal(useGameStore.getState().betterCups || 0);
  costs.betterCups = nextBetterCupsCost(betterCupsCount, betterCupsBaseCost, betterCupsScaling);

  // Validate better cups cost
  if (costs.betterCups.toString() === 'NaN') {
    console.warn('Better cups cost calculation resulted in NaN, using fallback');
    costs.betterCups = toDecimal(400); // Fallback to base cost
  }

  const levelUpBaseCost = toDecimal(config.LEVEL_UP_BASE_COST ?? 3000);
  const levelUpScaling = toDecimal(config.LEVEL_UP_SCALING ?? 1.15);
  const levelCount = toDecimal(useGameStore.getState().level || 1);
  costs.levelUp = levelUpBaseCost.multiply(levelUpScaling.pow(levelCount));

  // Validate level up cost
  if (costs.levelUp.toString() === 'NaN') {
    console.warn('Level up cost calculation resulted in NaN, using fallback');
    costs.levelUp = toDecimal(3000); // Fallback to base cost
  }

  return costs;
}
