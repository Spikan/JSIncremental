// UI Affordability System
// Handles checking and updating button states based on resource availability

// Main function to check upgrade affordability and update UI
export function checkUpgradeAffordability() {
    // Safety checks - ensure game is fully initialized
    if (!window.sips || !window.GAME_CONFIG || !window.App?.data?.upgrades) {
        console.log('UI: Game not fully initialized yet, skipping affordability check');
        return;
    }
    
    // Additional safety check for sips object
    if (typeof window.sips.gte !== 'function') {
        console.log('UI: Sips object not ready yet, skipping affordability check');
        return;
    }
    
    const config = window.GAME_CONFIG.BALANCE || {};
    const dataUp = window.App.data.upgrades;
    
    // Calculate all costs using rules if available, otherwise fallback to config
    const costs = calculateAllCosts(config, dataUp);
    
    // Update button states based on affordability
    updateButtonState('buyStraw', window.sips.gte(costs.straw), costs.straw);
    updateButtonState('buyCup', window.sips.gte(costs.cup), costs.cup);
    updateButtonState('buySuction', window.sips.gte(costs.suction), costs.suction);
    updateButtonState('buyFasterDrinks', window.sips.gte(costs.fasterDrinks), costs.fasterDrinks);
    updateButtonState('buyCriticalClick', window.sips.gte(costs.criticalClick), costs.criticalClick);
    updateButtonState('buyWiderStraws', window.sips.gte(costs.widerStraws), costs.widerStraws);
    updateButtonState('buyBetterCups', window.sips.gte(costs.betterCups), costs.betterCups);
    updateButtonState('upgradeFasterDrinks', window.sips.gte(costs.fasterDrinksUp), costs.fasterDrinksUp);
    updateButtonState('upgradeCriticalClick', window.sips.gte(costs.criticalClickUp), costs.criticalClickUp);
    updateButtonState('levelUp', window.sips.gte(costs.levelUp), costs.levelUp);
    
    // Update cost displays with affordability indicators
    updateCostDisplay('strawCost', costs.straw, window.sips.gte(costs.straw));
    updateCostDisplay('cupCost', costs.cup, window.sips.gte(costs.cup));
    updateCostDisplay('suctionCost', costs.suction, window.sips.gte(costs.suction));
    updateCostDisplay('fasterDrinksCost', costs.fasterDrinks, window.sips.gte(costs.fasterDrinks));
    updateCostDisplay('criticalClickCost', costs.criticalClick, window.sips.gte(costs.criticalClick));
    updateCostDisplay('widerStrawsCost', costs.widerStraws, window.sips.gte(costs.widerStraws));
    updateCostDisplay('betterCupsCost', costs.betterCups, window.sips.gte(costs.betterCups));
    updateCostDisplay('fasterDrinksUpCost', costs.fasterDrinksUp, window.sips.gte(costs.fasterDrinksUp));
    updateCostDisplay('criticalClickUpCost', costs.criticalClickUp, window.sips.gte(costs.criticalClickUp));
    updateCostDisplay('levelUpCost', costs.levelUp, window.sips.gte(costs.levelUp));
}

// Calculate all upgrade costs
function calculateAllCosts(config, dataUp) {
    const costs = {};
    
    // Helper function to safely get number value
    const safeToNumber = (value) => {
        if (!value) return 0;
        if (typeof value.toNumber === 'function') return value.toNumber();
        if (typeof value === 'number') return value;
        return Number(value) || 0;
    };
    
    // Straw cost
    const strawBaseCost = dataUp?.straws?.baseCost ?? config.STRAW_BASE_COST;
    const strawScaling = dataUp?.straws?.scaling ?? config.STRAW_SCALING;
    const strawCount = safeToNumber(window.straws);
    costs.straw = window.App?.rules?.purchases?.nextStrawCost ?
        window.App.rules.purchases.nextStrawCost(strawCount, strawBaseCost, strawScaling) :
        Math.floor(strawBaseCost * Math.pow(strawScaling, strawCount));
    
    // Cup cost
    const cupBaseCost = dataUp?.cups?.baseCost ?? config.CUP_BASE_COST;
    const cupScaling = dataUp?.cups?.scaling ?? config.CUP_SCALING;
    const cupCount = safeToNumber(window.cups);
    costs.cup = window.App?.rules?.purchases?.nextCupCost ?
        window.App.rules.purchases.nextCupCost(cupCount, cupBaseCost, cupScaling) :
        Math.floor(cupBaseCost * Math.pow(cupScaling, cupCount));
    
    // Suction cost
    const suctionBaseCost = dataUp?.suction?.baseCost ?? config.SUCTION_BASE_COST;
    const suctionScaling = dataUp?.suction?.scaling ?? config.SUCTION_SCALING;
    costs.suction = Math.floor(suctionBaseCost * Math.pow(suctionScaling, safeToNumber(window.suctions)));
    
    // Faster drinks cost
    const fasterDrinksBaseCost = dataUp?.fasterDrinks?.baseCost ?? config.FASTER_DRINKS_BASE_COST;
    const fasterDrinksScaling = dataUp?.fasterDrinks?.scaling ?? config.FASTER_DRINKS_SCALING;
    costs.fasterDrinks = Math.floor(fasterDrinksBaseCost * Math.pow(fasterDrinksScaling, safeToNumber(window.fasterDrinks)));
    
    // Critical click cost
    const criticalClickBaseCost = dataUp?.criticalClick?.baseCost ?? config.CRITICAL_CLICK_BASE_COST;
    const criticalClickScaling = dataUp?.criticalClick?.scaling ?? config.CRITICAL_CLICK_SCALING;
    costs.criticalClick = Math.floor(criticalClickBaseCost * Math.pow(criticalClickScaling, safeToNumber(window.criticalClicks)));
    
    // Wider straws cost
    costs.widerStraws = (dataUp?.widerStraws?.baseCost ?? config.WIDER_STRAWS_BASE_COST) * safeToNumber(window.widerStraws);
    
    // Better cups cost
    costs.betterCups = (dataUp?.betterCups?.baseCost ?? config.BETTER_CUPS_BASE_COST) * safeToNumber(window.betterCups);
    
    // Faster drinks upgrade cost
    costs.fasterDrinksUp = (dataUp?.fasterDrinks?.upgradeBaseCost ?? config.FASTER_DRINKS_UPGRADE_BASE_COST) * safeToNumber(window.fasterDrinksUpCounter);
    
    // Critical click upgrade cost
    costs.criticalClickUp = config.CRITICAL_CLICK_UPGRADE_BASE_COST * safeToNumber(window.criticalClickUpCounter);
    
    // Level up cost
    costs.levelUp = config.LEVEL_UP_BASE_COST * safeToNumber(window.level);
    
    return costs;
}

// Update button state based on affordability
function updateButtonState(buttonId, isAffordable, cost) {
    // Try multiple selectors to find the button
    const button = document.getElementById(buttonId) || 
                  document.querySelector(`[data-button-id="${buttonId}"]`) ||
                  document.querySelector(`button[onclick*="${buttonId}"]`);
    
    if (button) {
        button.disabled = !isAffordable;
        button.classList.toggle('affordable', isAffordable);
        button.classList.toggle('unaffordable', !isAffordable);
        
        // Update button text with cost if it has a cost span
        const costSpan = button.querySelector('.cost');
        if (costSpan && typeof cost !== 'undefined') {
            costSpan.textContent = prettify(cost);
        }
    }
}

// Update cost display with affordability indicators
function updateCostDisplay(elementId, cost, isAffordable) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = prettify(cost);
        element.classList.toggle('affordable', isAffordable);
        element.classList.toggle('unaffordable', !isAffordable);
    }
}
