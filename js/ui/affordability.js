// UI Affordability System
// Handles checking and updating button states based on resource availability

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability() {
    // Safety checks - ensure game is fully initialized
    if (!window.GAME_CONFIG || !window.App?.data?.upgrades || !window.App?.state) {
        console.log('UI: Game not fully initialized yet, skipping affordability check');
        return;
    }

    // Get current state using selectors
    const currentState = window.App.state.getState();
    const sips = selectors.sips(currentState);

    if (sips < 0) {
        console.log('UI: Invalid sips value, skipping affordability check');
        return;
    }
    
    const config = window.GAME_CONFIG.BALANCE || {};
    const dataUp = window.App.data.upgrades;
    
    // Calculate all costs using rules if available, otherwise fallback to config
    const costs = calculateAllCosts(config, dataUp, currentState);
    
    // Update button states based on affordability using state-derived sips
    updateButtonState('buyStraw', sips >= costs.straw, costs.straw);
    updateButtonState('buyCup', sips >= costs.cup, costs.cup);
    updateButtonState('buySuction', sips >= costs.suction, costs.suction);
    updateButtonState('buyFasterDrinks', sips >= costs.fasterDrinks, costs.fasterDrinks);
    updateButtonState('buyCriticalClick', sips >= costs.criticalClick, costs.criticalClick);
    updateButtonState('buyWiderStraws', sips >= costs.widerStraws, costs.widerStraws);
    updateButtonState('buyBetterCups', sips >= costs.betterCups, costs.betterCups);
    updateButtonState('upgradeFasterDrinks', sips >= costs.fasterDrinksUp, costs.fasterDrinksUp);
    updateButtonState('upgradeCriticalClick', sips >= costs.criticalClickUp, costs.criticalClickUp);
    updateButtonState('levelUp', sips >= costs.levelUp, costs.levelUp);
    
    // Update cost displays with affordability indicators using state-derived sips
    updateCostDisplay('strawCost', costs.straw, sips >= costs.straw);
    updateCostDisplay('cupCost', costs.cup, sips >= costs.cup);
    updateCostDisplay('suctionCost', costs.suction, sips >= costs.suction);
    updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, sips >= costs.fasterDrinks);
    updateCostDisplay('criticalClickCost', costs.criticalClick, sips >= costs.criticalClick);
    updateCostDisplay('widerStrawsCost', costs.widerStraws, sips >= costs.widerStraws);
    updateCostDisplay('betterCupsCost', costs.betterCups, sips >= costs.betterCups);
    updateCostDisplay('fasterDrinksUpCost', costs.fasterDrinksUp, sips >= costs.fasterDrinksUp);
    updateCostDisplay('criticalClickUpCost', costs.criticalClickUp, sips >= costs.criticalClickUp);
    updateCostDisplay('levelUpCost', costs.levelUp, sips >= costs.levelUp);
}

// Calculate all upgrade costs
function calculateAllCosts(config, dataUp, currentState) {
    const costs = {};

    // Get current resource counts from state
    const straws = selectors.straws(currentState);
    const cups = selectors.cups(currentState);
    const suctions = selectors.suctions(currentState);
    const widerStraws = selectors.widerStraws(currentState);
    const betterCups = selectors.betterCups(currentState);
    const fasterDrinks = selectors.fasterDrinks(currentState);
    const criticalClicks = selectors.criticalClicks(currentState);
    const level = selectors.level(currentState);

    // Straw cost
    const strawBaseCost = dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST;
    const strawScaling = dataUp?.straws?.scaling ?? config.STRAW_SCALING;
    costs.straw = window.App?.rules?.purchases?.nextStrawCost ?
        window.App.rules.purchases.nextStrawCost(straws, strawBaseCost, strawScaling) :
        Math.floor(strawBaseCost * Math.pow(strawScaling, straws));
    
    // Cup cost
    const cupBaseCost = dataUp?.cups?.baseCost ?? config.CUP_BASE_COST;
    const cupScaling = dataUp?.cups?.scaling ?? config.CUP_SCALING;
    costs.cup = window.App?.rules?.purchases?.nextCupCost ?
        window.App.rules.purchases.nextCupCost(cups, cupBaseCost, cupScaling) :
        Math.floor(cupBaseCost * Math.pow(cupScaling, cups));

    // Suction cost
    const suctionBaseCost = dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST;
    const suctionScaling = dataUp?.suction?.scaling ?? config.SUCTION_SCALING;
    costs.suction = Math.floor(suctionBaseCost * Math.pow(suctionScaling, suctions));

    // Faster drinks cost
    const fasterDrinksBaseCost = dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
    const fasterDrinksScaling = dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;
    costs.fasterDrinks = Math.floor(fasterDrinksBaseCost * Math.pow(fasterDrinksScaling, fasterDrinks));

    // Critical click cost
    const criticalClickBaseCost = dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
    const criticalClickScaling = dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;
    costs.criticalClick = Math.floor(criticalClickBaseCost * Math.pow(criticalClickScaling, criticalClicks));

    // Wider straws cost
    costs.widerStraws = (dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST) * widerStraws;

    // Better cups cost
    costs.betterCups = (dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST) * betterCups;

    // Faster drinks upgrade cost (using a placeholder counter for now)
    costs.fasterDrinksUp = (dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST) * fasterDrinks;

    // Critical click upgrade cost (using a placeholder counter for now)
    costs.criticalClickUp = config.CRITICAL_CLICK_UPGRADE_BASE_COST * criticalClicks;

    // Level up cost
    costs.levelUp = config.LEVEL_UP_BASE_COST * Math.pow(config.LEVEL_UP_SCALING, level);
    
    return costs;
}

// Import consolidated utilities and state selectors
import { updateButtonState, updateCostDisplay, formatNumber } from './utils.js';
import { selectors } from '../core/state/selectors.js';
