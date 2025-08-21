// UI Display Updates
// Handles all display updates for game stats, costs, and progress indicators

// Update cost display with affordability indicators
export function updateCostDisplay(elementId, cost, isAffordable) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = prettify(cost);
        element.classList.toggle('affordable', isAffordable);
        element.classList.toggle('unaffordable', !isAffordable);
    }
}

// Update button state based on affordability
export function updateButtonState(buttonId, isAffordable, cost) {
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

// Update the top sips per drink display
export function updateTopSipsPerDrink() {
    const topSipsPerDrinkElement = window.DOM_CACHE?.topSipsPerDrink;
    if (topSipsPerDrinkElement && window.sps) {
        topSipsPerDrinkElement.innerHTML = prettify(window.sps);
    }
}

// Update the top total sips per second display (passive production only)
export function updateTopSipsPerSecond() {
    const topSipsPerSecondElement = window.DOM_CACHE?.topSipsPerSecond;
    if (topSipsPerSecondElement && window.sps && window.drinkRate) {
        const drinkRateSeconds = window.drinkRate / 1000;
        const sipsPerSecond = window.sps.div(drinkRateSeconds);
        topSipsPerSecondElement.innerHTML = prettify(sipsPerSecond);
    }
}

// Update the critical click chance display
export function updateCriticalClickDisplay() {
    const criticalClickChanceCompact = document.getElementById('criticalClickChanceCompact');
    if (criticalClickChanceCompact && window.criticalClickChance) {
        const percentage = window.criticalClickChance.times(100).toFixed(1);
        criticalClickChanceCompact.textContent = `${percentage}%`;
    }
}

// Update drink speed display
export function updateDrinkSpeedDisplay() {
    // Update compact drink speed display elements
    const currentDrinkSpeedCompact = document.getElementById('currentDrinkSpeedCompact');
    if (currentDrinkSpeedCompact && window.drinkRate) {
        const drinkRateSeconds = window.drinkRate / 1000;
        currentDrinkSpeedCompact.textContent = drinkRateSeconds.toFixed(2) + 's';
    }
}

// Update autosave status display
export function updateAutosaveStatus() {
    const status = document.getElementById('autosaveStatus');
    if (status && window.autosaveEnabled !== undefined && window.autosaveInterval !== undefined) {
        if (window.autosaveEnabled) {
            status.textContent = `Autosave: ON (${window.autosaveInterval}s)`;
            status.className = 'autosave-on';
        } else {
            status.textContent = 'Autosave: OFF';
            status.className = 'autosave-off';
        }
    }
}

// Update drink progress bar
export function updateDrinkProgress(progress, drinkRate) {
    const progressFill = window.DOM_CACHE?.progressFill;
    const countdown = window.DOM_CACHE?.countdown;
    
    if (progressFill && typeof progress === 'number') {
        progressFill.style.width = `${Math.min(progress, 100)}%`;
    }
    
    if (countdown && drinkRate) {
        const remainingTime = Math.max(0, drinkRate - (progress / 100 * drinkRate));
        const remainingSeconds = (remainingTime / 1000).toFixed(1);
        countdown.textContent = `${remainingSeconds}s`;
    }
}

// Update the top current sips counter
export function updateTopSipCounter() {
    const topSipElement = window.DOM_CACHE?.topSipValue;
    if (topSipElement && window.sips) {
        topSipElement.innerHTML = prettify(window.sips);
    }
}

// Update the displayed level number
export function updateLevelNumber() {
    const levelEl = window.DOM_CACHE?.levelNumber;
    if (levelEl && window.level != null) {
        const val = typeof window.level?.toNumber === 'function' ? window.level.toNumber() : window.level;
        levelEl.innerHTML = String(val);
    }
}
