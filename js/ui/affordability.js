// UI Affordability System
// Handles checking and updating button states based on resource availability
import { getUpgradesAndConfig } from '../core/systems/config-accessor';

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability() {
    // Safety checks - ensure game is fully initialized
    const { upgrades: dataUp, config } = getUpgradesAndConfig();

    // Get current sips from App.state (preferred)
    const currentSips = Number(window.App?.state?.getState?.()?.sips || 0);

    // If we still don't have sips, skip the affordability check (mute noisy log)
    if (currentSips === 0) {
        return;
    }

    // Create a mock sips object for gte comparison if needed
    const sipsForComparison = {
        gte: (value) => {
            const numValue = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value) || 0;
            return currentSips >= numValue;
        }
    };

    // Calculate all costs using rules if available, otherwise fallback to config
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
    // Critical click upgrade button doesn't exist, so don't try to update it
    // updateButtonState('upgradeCriticalClick', sipsForComparison.gte(costs.criticalClickUp), costs.criticalClickUp);
    updateButtonState('levelUp', sipsForComparison.gte(costs.levelUp), costs.levelUp);

    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', costs.straw, sipsForComparison.gte(costs.straw));
    updateCostDisplay('cupCost', costs.cup, sipsForComparison.gte(costs.cup));
    // Standard and compact cost displays
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
    // Critical click upgrade cost display doesn't exist, so don't try to update it
    // updateCostDisplay('criticalClickUpCost', costs.criticalClickUp, sipsForComparison.gte(costs.criticalClickUp));
    updateCostDisplay('levelUpCost', costs.levelUp, sipsForComparison.gte(costs.levelUp));
    // Legacy/compact id in DOM
    updateCostDisplay('levelCost', costs.levelUp, sipsForComparison.gte(costs.levelUp));
}

// Update shop button states based on current affordability
export function updateShopButtonStates() {
    // This function is a convenience wrapper around checkUpgradeAffordability
    // It ensures all shop buttons are updated with current affordability status
    checkUpgradeAffordability();
}

// Calculate all upgrade costs
function calculateAllCosts() {
    const { upgrades: dataUp, config } = getUpgradesAndConfig();
    const costs = {};

    // Helper function to safely get number value from multiple sources
    const safeToNumber = (globalVar, stateKey) => {
        // First try global variable
        if (typeof globalVar !== 'undefined') {
            if (typeof globalVar?.toNumber === 'function') return globalVar.toNumber();
            if (typeof globalVar === 'number') return globalVar;
            return Number(globalVar) || 0;
        }

        // Then try state
        if (window.App?.state) {
            try {
                const state = window.App.state.getState();
                const value = state[stateKey];
                if (typeof value?.toNumber === 'function') return value.toNumber();
                if (typeof value === 'number') return value;
                return Number(value) || 0;
            } catch {}
        }

        return 0;
    };

    // Straw cost
    const strawBaseCost = dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST ?? 5;
    const strawScaling = dataUp?.straws?.scaling ?? config.STRAW_SCALING ?? 1.08;
    const strawCount = Number(window.App?.state?.getState?.()?.straws || 0);
    costs.straw = window.App?.rules?.purchases?.nextStrawCost ?
        window.App.rules.purchases.nextStrawCost(strawCount, strawBaseCost, strawScaling) :
        Math.floor(strawBaseCost * Math.pow(strawScaling, strawCount));

    // Cup cost
    const cupBaseCost = dataUp?.cups?.baseCost ?? config.CUP_BASE_COST ?? 15;
    const cupScaling = dataUp?.cups?.scaling ?? config.CUP_SCALING ?? 1.15;
    const cupCount = Number(window.App?.state?.getState?.()?.cups || 0);
    costs.cup = window.App?.rules?.purchases?.nextCupCost ?
        window.App.rules.purchases.nextCupCost(cupCount, cupBaseCost, cupScaling) :
        Math.floor(cupBaseCost * Math.pow(cupScaling, cupCount));

    // Suction cost
    const suctionBaseCost = dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST ?? 40;
    const suctionScaling = dataUp?.suction?.scaling ?? config.SUCTION_SCALING ?? 1.12;
    costs.suction = Math.floor(suctionBaseCost * Math.pow(suctionScaling, Number(window.App?.state?.getState?.()?.suctions || 0)));

    // Faster drinks cost
    const fasterDrinksBaseCost = dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST ?? 80;
    const fasterDrinksScaling = dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING ?? 1.10;
    const fasterDrinksCount = Number(window.App?.state?.getState?.()?.fasterDrinks || 0);
    costs.fasterDrinks = Math.floor(fasterDrinksBaseCost * Math.pow(fasterDrinksScaling, fasterDrinksCount));

    // Critical click cost
    const criticalClickBaseCost = dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST ?? 60;
    const criticalClickScaling = dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING ?? 1.12;
    costs.criticalClick = Math.floor(criticalClickBaseCost * Math.pow(criticalClickScaling, Number(window.App?.state?.getState?.()?.criticalClicks || 0)));

    // Wider straws cost
    const widerStrawsBaseCost = dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST ?? 150;
    costs.widerStraws = widerStrawsBaseCost * (Number(window.App?.state?.getState?.()?.widerStraws || 0) + 1);

    // Better cups cost
    const betterCupsBaseCost = dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST ?? 400;
    costs.betterCups = betterCupsBaseCost * (Number(window.App?.state?.getState?.()?.betterCups || 0) + 1);

    // Faster drinks upgrade cost
    const fasterDrinksUpBaseCost = dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST ?? 1500;
    costs.fasterDrinksUp = fasterDrinksUpBaseCost * Number(window.App?.state?.getState?.()?.fasterDrinksUpCounter || 0);

    // Critical click upgrade cost - button doesn't exist, so don't calculate
    // costs.criticalClickUp = config.CRITICAL_CLICK_UPGRADE_BASE_COST * safeToNumber(window.criticalClickUpCounter);

    // Level up cost
    const levelUpBaseCost = config.LEVEL_UP_BASE_COST ?? 3000;
    costs.levelUp = levelUpBaseCost * Number(window.App?.state?.getState?.()?.level || 0);

    return costs;
}

// Import consolidated utilities
import { updateButtonState, updateCostDisplay, formatNumber } from './utils.js';
