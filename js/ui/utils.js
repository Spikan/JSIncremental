// UI Utilities - Consolidated common UI functions
// This file contains all shared UI utilities to eliminate code duplication

/**
 * Consolidated number formatting utility
 * Handles Decimal objects and regular numbers with consistent formatting
 */
function formatNumber(value) {
    // If we have the global prettify function, use it (external libs)
    if (typeof window?.prettify === 'function') {
        try { return window.prettify(value); } catch {}
    }

    // Fallback formatting
    if (value == null) return '0';

    // Handle Decimal-like objects
    if (typeof value?.toNumber === 'function') {
        try { value = value.toNumber(); } catch {}
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        // Avoid float artifacts like 11.799999999 by rounding visually
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    if (typeof value === 'string') return value;
    if (typeof value?.toString === 'function') return value.toString();
    return String(value);
}

/**
 * Robust DOM element finder that tries multiple strategies
 */
export function findElement(elementId) {
    if (typeof document === 'undefined') return null;

    // Try direct ID lookup first
    let element = document.getElementById(elementId);
    if (element) return element;

    // Try data attribute
    element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (element) return element;

    return null;
}

/**
 * Enhanced button finder that handles multiple patterns
 */
export function findButton(buttonId) {
    if (typeof document === 'undefined') return null;

    // Try multiple strategies to find buttons
    let button = null;

    // Strategy 1: Direct ID lookup
    button = document.getElementById(buttonId);
    if (button) return button;

    // Strategy 2: Data attribute
    button = document.querySelector(`[data-button-id="${buttonId}"]`);
    if (button) return button;

    // Strategy 3: Onclick attribute (legacy support)
    button = document.querySelector(`button[onclick*="${buttonId}"]`);
    if (button) return button;

    // Strategy 4: Cost element pattern (for shop buttons)
    if (buttonId.startsWith('buy')) {
        const costElementId = buttonId.replace('buy', '') + 'Cost';
        const costElement = document.getElementById(costElementId);
        if (costElement) {
            button = costElement.closest('button');
        }
    } else if (buttonId.startsWith('upgrade')) {
        const costElementId = buttonId.replace('upgrade', '') + 'UpCost';
        const costElement = document.getElementById(costElementId);
        if (costElement) {
            button = costElement.closest('button');
        }
    }

    return button;
}

/**
 * Consolidated button state updater
 * Handles affordability states, cost display, and compact button variants
 */
export function updateButtonState(buttonId, isAffordable, cost) {
    if (typeof window === 'undefined') return;

    const button = findButton(buttonId);
    if (!button || !button.classList) return;

    // Update main button state
    button.disabled = !isAffordable;

    // Use CSS classes for state (more semantic) - with safety checks
    if (typeof button.classList.toggle === 'function') {
        button.classList.toggle('affordable', isAffordable);
        button.classList.toggle('unaffordable', !isAffordable);
        button.classList.toggle('disabled', !isAffordable);
    }

    // Update cost span if present - with safety checks
    if (typeof button.querySelector === 'function') {
        const costSpan = button.querySelector('.cost');
        if (costSpan && typeof cost !== 'undefined') {
            costSpan.textContent = formatNumber(cost);
        }
    }

    // Update button title for accessibility
    const formattedCost = formatNumber(cost);
    let currentSips = '0';
    try {
        const sipsNum = Number(window.App?.state?.getState?.()?.sips || 0);
        currentSips = formatNumber(sipsNum);
    } catch {}

    if (isAffordable) {
        button.title = `Click to purchase for ${formattedCost} Sips`;
    } else {
        button.title = `Costs ${formattedCost} Sips (You have ${currentSips})`;
    }

    // Handle compact button variants (legacy support)
    updateCompactButtonVariants(buttonId, isAffordable);
}

/**
 * Updates compact button variants for specific upgrade types
 */
function updateCompactButtonVariants(buttonId, isAffordable) {
    let compactSelector = null;

    // Map button IDs to their compact variants
    if (buttonId === 'buySuction' || buttonId === 'upgradeSuction') {
        compactSelector = '.clicking-upgrade-btn[onclick*="buySuction"], .clicking-upgrade-btn[onclick*="upgradeSuction"]';
    } else if (buttonId === 'buyCriticalClick' || buttonId === 'upgradeCriticalClick') {
        compactSelector = '.clicking-upgrade-btn[onclick*="buyCriticalClick"], .clicking-upgrade-btn[onclick*="upgradeCriticalClick"]';
    } else if (buttonId === 'buyFasterDrinks' || buttonId === 'upgradeFasterDrinks') {
        compactSelector = '.drink-speed-upgrade-btn[onclick*="buyFasterDrinks"], .drink-speed-upgrade-btn[onclick*="upgradeFasterDrinks"]';
    }

    if (compactSelector) {
        const compactButtons = document.querySelectorAll(compactSelector);
        compactButtons.forEach(button => {
            if (button && button.classList && typeof button.classList.toggle === 'function') {
                button.classList.toggle('affordable', isAffordable);
                button.classList.toggle('unaffordable', !isAffordable);
                button.classList.toggle('disabled', !isAffordable);
            }
        });
    }
}

/**
 * Consolidated cost display updater
 * Handles cost elements with affordability indicators
 */
export function updateCostDisplay(elementId, cost, isAffordable) {
    if (typeof window === 'undefined') return;

    const element = findElement(elementId);
    if (!element || !element.classList) return;

    // Update the cost display
    element.innerHTML = formatNumber(cost);

    // Apply affordability classes - with safety checks
    if (typeof element.classList.toggle === 'function') {
        element.classList.toggle('affordable', isAffordable);
        element.classList.toggle('unaffordable', !isAffordable);
    }
}

/**
 * Utility for safely accessing global game state
 */
export const GameState = {
    get sips() {
        if (typeof window === 'undefined') return 0;
        const st = window.App?.state?.getState?.();
        return (st && typeof st.sips !== 'undefined') ? st.sips : window.sips;
    },

    get level() {
        if (typeof window === 'undefined') return 1;
        const st = window.App?.state?.getState?.();
        return (st && typeof st.level !== 'undefined') ? st.level : window.level;
    },

    get sps() {
        if (typeof window === 'undefined') return 0;
        const st = window.App?.state?.getState?.();
        return (st && typeof st.sps !== 'undefined') ? st.sps : window.sps;
    },

    get drinkRate() {
        if (typeof window === 'undefined') return 0;
        const st = window.App?.state?.getState?.();
        return (st && typeof st.drinkRate !== 'undefined') ? st.drinkRate : window.drinkRate;
    }
};

// Backward compatibility exports
export const safePrettify = formatNumber;
export const prettify = formatNumber;
export { formatNumber };
