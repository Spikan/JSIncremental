// UI Utilities - TypeScript version

export type DecimalLike = {
  toNumber?: () => number;
  toString?: () => string;
};

import { formatDecimal, cleanExtremeDecimals } from '../core/numbers/decimal-utils';

export function formatNumber(value: any): string {
  try {
    // Try using the new Decimal formatting first, but post-process to ensure 2 decimal places
    const formatted = formatDecimal(value);
    return postProcessDecimals(formatted);
  } catch (error) {
    console.warn('Failed to format with Decimal, falling back:', error);
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
      // Only convert to number if it's within safe range to preserve extreme values
      const numValue = (value as DecimalLike).toNumber!();
      if (isFinite(numValue) && Math.abs(numValue) < 1e15) {
        value = numValue;
      }
      // For extreme values, keep as Decimal and use toString()
    } catch (error) {
      console.warn('Failed to convert decimal to number:', error);
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Handle very large numbers with scientific notation
    if (Math.abs(value) >= 1e6) {
      return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  }

  if (typeof value === 'string') return postProcessDecimals(value);
  if (value && typeof value.toString === 'function') return postProcessDecimals(value.toString());
  return String(value);
}

/**
 * Post-process a formatted number string to ensure it has at most 2 decimal places
 * Uses intelligent cleanup for trailing decimals and precision artifacts
 */
function postProcessDecimals(formatted: string): string {
  // Use the intelligent decimal cleanup function for consistency
  return cleanExtremeDecimals(formatted);
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
    // Use sips directly - formatNumber will handle Decimal properly
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
    // Safe Decimal to number conversion - preserve extreme values
    if (sipsValue && typeof sipsValue.toNumber === 'function') {
      const rawNumber = sipsValue.toNumber();
      if (Number.isFinite(rawNumber) && Math.abs(rawNumber) < 1e15) {
        return rawNumber;
      } else {
        // For extreme values, return a safe fallback instead of truncating
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
    // Safe Decimal to number conversion - preserve extreme values
    if (spdValue && typeof spdValue.toNumber === 'function') {
      const numValue = spdValue.toNumber();
      if (Number.isFinite(numValue) && Math.abs(numValue) < 1e15) {
        return numValue;
      } else {
        // For extreme values, return a safe fallback instead of truncating
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

// Game calculation utilities with consistent 2-decimal precision
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatGameNumber(value: any): string {
  return formatNumber(value);
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return roundToTwoDecimals((current / total) * 100);
}

export function calculateBonusPercentage(base: number, current: number): number {
  if (base === 0) return 0;
  return roundToTwoDecimals(((current - base) / base) * 100);
}

export {};
