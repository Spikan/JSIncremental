// UI Utilities - TypeScript version

export type DecimalLike = {
  toNumber?: () => number;
  toString?: () => string;
};

import { formatLargeNumber } from '../core/numbers/migration-utils';

export function formatNumber(value: any): string {
  try {
    // Try using the new LargeNumber formatting first, but post-process to ensure 2 decimal places
    const formatted = formatLargeNumber(value);
    return postProcessDecimals(formatted);
  } catch (error) {
    console.warn('Failed to format with LargeNumber, falling back:', error);
  }

  // Legacy formatting for backward compatibility
  try {
    if (typeof (window as any)?.prettify === 'function') {
      try {
        const formatted = (window as any).prettify(value);
        return postProcessDecimals(formatted);
      } catch (error) {
        console.warn('Failed to prettify value:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to format value:', error);
  }

  if (value == null) return '0';

  if (value && typeof (value as DecimalLike).toNumber === 'function') {
    try {
      value = (value as DecimalLike).toNumber!();
    } catch (error) {
      console.warn('Failed to convert decimal to number:', error);
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Handle very large numbers with scientific notation
    if (Math.abs(value) >= 1e6) {
      return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  if (typeof value === 'string') return postProcessDecimals(value);
  if (value && typeof value.toString === 'function') return postProcessDecimals(value.toString());
  return String(value);
}

/**
 * Post-process a formatted number string to ensure it has at most 2 decimal places
 */
function postProcessDecimals(formatted: string): string {
  // If it's scientific notation, keep it as is
  if (formatted.includes('e') || formatted.includes('E')) {
    return formatted;
  }

  // If it contains a decimal point, limit to 2 decimal places
  if (formatted.includes('.')) {
    const parts = formatted.split('.');
    if (parts.length === 2 && parts[0] && parts[1]) {
      // Limit decimal part to 2 digits
      parts[1] = parts[1].substring(0, 2);
      // Remove trailing zeros
      while (parts[1].endsWith('0') && parts[1].length > 0) {
        parts[1] = parts[1].slice(0, -1);
      }
      // If no decimal part left, remove the decimal point
      if (parts[1].length === 0) {
        return parts[0];
      }
      return parts.join('.');
    }
  }

  return formatted;
}

export function findElement(elementId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let element = document.getElementById(elementId);
  if (element) return element as HTMLElement;
  element = document.querySelector(`[data-element-id="${elementId}"]`);
  if (element) return element as HTMLElement;
  return null;
}

export function findButton(buttonId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let button: Element | null = null;
  button = document.getElementById(buttonId);
  if (button) return button as HTMLElement;
  // Strategy: data-action exact match on a button
  button = document.querySelector(`button[data-action="${buttonId}"]`);
  if (button) return button as HTMLElement;
  // Strategy: any element with data-action, prefer its containing button
  const actionEl = document.querySelector(`[data-action="${buttonId}"]`);
  if (actionEl) {
    const parentBtn = (actionEl as HTMLElement).closest('button');
    if (parentBtn) return parentBtn as HTMLElement;
    return actionEl as HTMLElement;
  }
  button = document.querySelector(`[data-button-id="${buttonId}"]`);
  if (button) return button as HTMLElement;
  button = document.querySelector(`button[onclick*="${buttonId}"]`);
  if (button) return button as HTMLElement;
  if (buttonId.startsWith('buy')) {
    const costElementId = `${buttonId.replace('buy', '')}Cost`;
    const costElement = document.getElementById(costElementId);
    if (costElement) {
      const parentButton = costElement.closest('button');
      if (parentButton) return parentButton as HTMLElement;
    }
  } else if (buttonId.startsWith('upgrade')) {
    const costElementId = `${buttonId.replace('upgrade', '')}UpCost`;
    const costElement = document.getElementById(costElementId);
    if (costElement) {
      const parentButton = costElement.closest('button');
      if (parentButton) return parentButton as HTMLElement;
    }
  }
  return null;
}

export function updateButtonState(buttonId: string, isAffordable: boolean, cost?: number): void {
  if (typeof window === 'undefined') return;
  const button = findButton(buttonId);
  if (!button || !(button as any).classList) return;
  (button as HTMLButtonElement).disabled = !isAffordable;
  try {
    (button as any).classList.toggle('affordable', isAffordable);
    (button as any).classList.toggle('unaffordable', !isAffordable);
    (button as any).classList.toggle('disabled', !isAffordable);
  } catch (error) {
    console.warn('Failed to update button classes:', error);
  }
  try {
    const costSpan = (button as HTMLElement).querySelector('.cost') as HTMLElement | null;
    if (costSpan != null && typeof cost !== 'undefined') {
      costSpan.textContent = formatNumber(cost);
    }
  } catch (error) {
    console.warn('Failed to update cost display:', error);
  }
  const formattedCost = formatNumber(cost as any);
  let currentSips = '0';
  try {
    const st = (window as any).App?.state?.getState?.();
    // Use sips directly - formatNumber will handle LargeNumber properly
    currentSips = formatNumber(st?.sips || 0);
  } catch (error) {
    console.warn('Failed to get current sips for button title:', error);
  }
  (button as any).title = isAffordable
    ? `Click to purchase for ${formattedCost} Sips`
    : `Costs ${formattedCost} Sips (You have ${currentSips})`;
  updateCompactButtonVariants(buttonId, isAffordable);
}

function updateCompactButtonVariants(buttonId: string, isAffordable: boolean): void {
  let compactSelector: string | null = null;
  if (buttonId === 'buySuction' || buttonId === 'upgradeSuction') {
    compactSelector =
      '.clicking-upgrade-btn[data-action="buySuction"], .clicking-upgrade-btn[data-action="upgradeSuction"]';
  } else if (buttonId === 'buyCriticalClick' || buttonId === 'upgradeCriticalClick') {
    compactSelector =
      '.clicking-upgrade-btn[data-action="buyCriticalClick"], .clicking-upgrade-btn[data-action="upgradeCriticalClick"]';
  } else if (buttonId === 'buyFasterDrinks' || buttonId === 'upgradeFasterDrinks') {
    compactSelector =
      '.drink-speed-upgrade-btn[data-action="buyFasterDrinks"], .drink-speed-upgrade-btn[data-action="upgradeFasterDrinks"]';
  }
  if (!compactSelector) return;
  try {
    const compactButtons = document.querySelectorAll(compactSelector);
    compactButtons.forEach(button => {
      const el = button as HTMLElement;
      el.classList.toggle('affordable', isAffordable);
      el.classList.toggle('unaffordable', !isAffordable);
      el.classList.toggle('disabled', !isAffordable);
    });
  } catch (error) {
    console.warn('Failed to update compact button variants:', error);
  }
}

export function updateCostDisplay(elementId: string, cost: number, isAffordable: boolean): void {
  if (typeof window === 'undefined') return;
  const element = findElement(elementId) as HTMLElement | null;
  if (!element || !(element as any).classList) return;
  element.innerHTML = formatNumber(cost);
  try {
    element.classList.toggle('affordable', isAffordable);
    element.classList.toggle('unaffordable', !isAffordable);
  } catch (error) {
    console.warn('Failed to update cost display classes:', error);
  }
}

export const GameState = {
  get sips(): number {
    if (typeof window === 'undefined') return 0;
    const st = (window as any).App?.state?.getState?.();
    const sipsValue = st && typeof st.sips !== 'undefined' ? st.sips : (window as any).sips;
    // Convert LargeNumber to number safely
    if (sipsValue && typeof sipsValue.toNumber === 'function') {
      try {
        const numValue = sipsValue.toNumber();
        return Number.isFinite(numValue) ? numValue : 0;
      } catch (error) {
        console.warn('Failed to convert sips to number:', error);
        return 0;
      }
    }
    return Number(sipsValue || 0);
  },
  get level(): number {
    if (typeof window === 'undefined') return 1;
    const st = (window as any).App?.state?.getState?.();
    return st && typeof st.level !== 'undefined'
      ? Number(st.level || 1)
      : Number((window as any).level || 1);
  },
  get spd(): number {
    if (typeof window === 'undefined') return 0;
    const st = (window as any).App?.state?.getState?.();
    const spdValue = st && typeof st.spd !== 'undefined' ? st.spd : (window as any).spd;
    // Convert LargeNumber to number safely
    if (spdValue && typeof spdValue.toNumber === 'function') {
      try {
        const numValue = spdValue.toNumber();
        return Number.isFinite(numValue) ? numValue : 0;
      } catch (error) {
        console.warn('Failed to convert spd to number:', error);
        return 0;
      }
    }
    return Number(spdValue || 0);
  },
  get drinkRate(): number {
    if (typeof window === 'undefined') return 0;
    const st = (window as any).App?.state?.getState?.();
    return st && typeof st.drinkRate !== 'undefined' ? st.drinkRate : (window as any).drinkRate;
  },
};

export const safePrettify = formatNumber;
export const prettify = formatNumber;
