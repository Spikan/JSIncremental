// UI Affordability System (TypeScript)
// Handles checking and updating button states based on resource availability
import { getUpgradesAndConfig } from '../core/systems/config-accessor';
import { updateButtonState, updateCostDisplay, formatNumber } from './utils';

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability(): void {
    const { upgrades: dataUp, config } = getUpgradesAndConfig();

    const currentSips = Number((window as any).App?.state?.getState?.()?.sips || 0);
    if (currentSips === 0) {
        return;
    }

    const sipsForComparison = {
        gte: (value: any) => {
            const numValue = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value) || 0;
            return currentSips >= numValue;
        }
    };

    const costs = calculateAllCosts();

    // Update button states based on affordability
    updateButtonState('buyStraw', sipsForComparison.gte(costs.straw), costs.straw);
    updateButtonState('buyCup', sipsForComparison.gte(costs.cup), costs.cup);
    updateButtonState('buySuction', sipsForComparison.gte(costs.suction), costs.suction);
    updateButtonState('buyFasterDrinks', sipsForComparison.gte(costs.fasterDrinks), costs.fasterDrinks);
    updateButtonState('buyCriticalClick', sipsForComparison.gte(costs.criticalClick), costs.criticalClick);
    updateButtonState('buyWiderStraws', sipsForComparison.gte(costs.widerStraws), costs.widerStraws);
    updateButtonState('buyBetterCups', sipsForComparison.gte(costs.betterCups), costs.betterCups);
    updateButtonState('upgradeFasterDrinks', sipsForComparison.gte(costs.fasterDrinksUp), costs.fasterDrinksUp);
    // Critical click upgrade button doesn't exist
    updateButtonState('levelUp', sipsForComparison.gte(costs.levelUp), costs.levelUp);

    // Standard and compact cost displays
    updateCostDisplay('strawCost', costs.straw, sipsForComparison.gte(costs.straw));
    updateCostDisplay('cupCost', costs.cup, sipsForComparison.gte(costs.cup));
    updateCostDisplay('suctionCost', costs.suction, sipsForComparison.gte(costs.suction));
    updateCostDisplay('suctionCostCompact', costs.suction, sipsForComparison.gte(costs.suction));
    updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, sipsForComparison.gte(costs.fasterDrinks));
    updateCostDisplay('fasterDrinksCostCompact', costs.fasterDrinks, sipsForComparison.gte(costs.fasterDrinks));
    updateCostDisplay('criticalClickCost', costs.criticalClick, sipsForComparison.gte(costs.criticalClick));
    updateCostDisplay('criticalClickCostCompact', costs.criticalClick, sipsForComparison.gte(costs.criticalClick));
    updateCostDisplay('widerStrawsCost', costs.widerStraws, sipsForComparison.gte(costs.widerStraws));
    updateCostDisplay('betterCupsCost', costs.betterCups, sipsForComparison.gte(costs.betterCups));
    updateCostDisplay('fasterDrinksUpCost', costs.fasterDrinksUp, sipsForComparison.gte(costs.fasterDrinksUp));
    updateCostDisplay('fasterDrinksUpCostCompact', costs.fasterDrinksUp, sipsForComparison.gte(costs.fasterDrinksUp));
    updateCostDisplay('levelUpCost', costs.levelUp, sipsForComparison.gte(costs.levelUp));
    updateCostDisplay('levelCost', costs.levelUp, sipsForComparison.gte(costs.levelUp));
}

// Update shop button states based on current affordability
export function updateShopButtonStates(): void {
    checkUpgradeAffordability();
}

// Calculate all upgrade costs
function calculateAllCosts(): any {
    const { upgrades: dataUp, config } = getUpgradesAndConfig();
    const costs: any = {};

    // Straw cost
    const strawBaseCost = dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
    const strawScaling = dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;
    const strawCount = Number((window as any).App?.state?.getState?.()?.straws || 0);
    costs.straw = (window as any).App?.rules?.purchases?.nextStrawCost ?
        (window as any).App.rules.purchases.nextStrawCost(strawCount, strawBaseCost, strawScaling) :
        Math.floor(strawBaseCost * Math.pow(strawScaling, strawCount));

    // Cup cost
    const cupBaseCost = dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
    const cupScaling = dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;
    const cupCount = Number((window as any).App?.state?.getState?.()?.cups || 0);
    costs.cup = (window as any).App?.rules?.purchases?.nextCupCost ?
        (window as any).App.rules.purchases.nextCupCost(cupCount, cupBaseCost, cupScaling) :
        Math.floor(cupBaseCost * Math.pow(cupScaling, cupCount));

    // Suction cost
    const suctionBaseCost = dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40;
    const suctionScaling = dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12;
    costs.suction = Math.floor(suctionBaseCost * Math.pow(suctionScaling, Number((window as any).App?.state?.getState?.()?.suctions || 0)));

    // Faster drinks cost
    const fasterDrinksBaseCost = dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80;
    const fasterDrinksScaling = dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.10;
    const fasterDrinksCount = Number((window as any).App?.state?.getState?.()?.fasterDrinks || 0);
    costs.fasterDrinks = Math.floor(fasterDrinksBaseCost * Math.pow(fasterDrinksScaling, fasterDrinksCount));

    // Critical click cost
    const criticalClickBaseCost = dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST ?? 60;
    const criticalClickScaling = dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING ?? 1.12;
    costs.criticalClick = Math.floor(criticalClickBaseCost * Math.pow(criticalClickScaling, Number((window as any).App?.state?.getState?.()?.criticalClicks || 0)));

    // Wider straws cost
    const widerStrawsBaseCost = dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;
    costs.widerStraws = widerStrawsBaseCost * (Number((window as any).App?.state?.getState?.()?.widerStraws || 0) + 1);

    // Better cups cost
    const betterCupsBaseCost = dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;
    costs.betterCups = betterCupsBaseCost * (Number((window as any).App?.state?.getState?.()?.betterCups || 0) + 1);

    // Faster drinks upgrade cost
    const fasterDrinksUpBaseCost = dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 1500;
    costs.fasterDrinksUp = fasterDrinksUpBaseCost * Number((window as any).App?.state?.getState?.()?.fasterDrinksUpCounter || 0);

    // Level up cost
    const levelUpBaseCost = config.LEVEL_UP_BASE_COST ?? 3000;
    costs.levelUp = levelUpBaseCost * Number((window as any).App?.state?.getState?.()?.level || 0);

    return costs;
}


