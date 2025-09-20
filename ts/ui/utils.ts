// UI Utilities - TypeScript version

export type DecimalLike = {
  toNumber?: () => number;
  toString?: () => string;
};

import { formatNumber as formatDecimal } from '../core/numbers/simplified';
import { useGameStore } from '../core/state/zustand-store';
import { errorHandler } from '../core/error-handling/error-handler';

/**
 * Enhanced number formatting system following idle game best practices
 * Supports scientific notation, abbreviations (K, M, B, T), and proper Decimal handling
 */
export function formatNumber(value: any): string {
  try {
    // Fast-path null/undefined
    if (value == null) return '0';

    // If this looks like a Decimal (has toNumber), use core formatter directly
    if (value && typeof (value as DecimalLike).toNumber === 'function') {
      const formatted = formatDecimal(value);
      return postProcessDecimals(formatted);
    }

    // Plain numbers
    if (typeof value === 'number' && Number.isFinite(value)) {
      return formatLargeNumber(value);
    }

    // Strings: do NOT run through core formatter to avoid recursion on exotic values
    if (typeof value === 'string') {
      return postProcessDecimals(value);
    }

    // Fallback: try to stringify non-Decimal objects safely
    if (value && typeof (value as any).toString === 'function') {
      const s = String((value as any).toString());
      const n = Number(s);
      if (Number.isFinite(n)) return formatLargeNumber(n);
      return postProcessDecimals(s);
    }

    return String(value);
  } catch (error) {
    // Last-resort: never recurse from error handler; return a safe string
    errorHandler.handleError(error, 'formatWithDecimal', {
      value: (() => {
        try {
          return value?.toString?.();
        } catch {
          return '<unprintable>';
        }
      })(),
    });
    try {
      if (typeof value === 'number') return formatLargeNumber(value);
      return String(value ?? '0');
    } catch {
      return '0';
    }
  }
}

/**
 * Format large numbers with idle game conventions
 * Uses K, M, B, T abbreviations and scientific notation for extreme values
 */
export function formatLargeNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';

  const absNum = Math.abs(num);

  // Handle very small numbers
  if (absNum < 0.01 && absNum > 0) {
    return num.toExponential(2);
  }

  // Helper: truncate to two decimals without rounding
  const trunc2 = (value: number) => {
    const factor = 100;
    return Math.trunc(value * factor) / factor;
  };

  // Handle normal range with abbreviations
  if (absNum >= 1e15) {
    return num.toExponential(2);
  } else if (absNum >= 1e12) {
    const scaled = trunc2(num / 1e12);
    return scaled.toFixed(2) + 'T';
  } else if (absNum >= 1e9) {
    const scaled = trunc2(num / 1e9);
    return scaled.toFixed(2) + 'B';
  } else if (absNum >= 1e6) {
    const scaled = trunc2(num / 1e6);
    return scaled.toFixed(2) + 'M';
  } else if (absNum >= 1e3) {
    const scaled = trunc2(num / 1e3);
    return scaled.toFixed(2) + 'K';
  } else if (absNum >= 1) {
    return trunc2(num).toFixed(2);
  } else {
    return trunc2(num).toFixed(2);
  }
}

/**
 * Format numbers for display in cost displays (more compact)
 */
export function formatCostNumber(value: any): string {
  const formatted = formatNumber(value);
  // Remove unnecessary decimal places for costs
  return formatted.replace(/\.00([KMBT]?)$/, '$1');
}

/**
 * Format numbers for display in statistics (more precise)
 */
export function formatStatNumber(value: any): string {
  return formatNumber(value);
}

/**
 * Format numbers for display in progress indicators
 */
export function formatProgressNumber(value: any): string {
  const formatted = formatNumber(value);
  // Ensure progress numbers are always positive and readable
  return formatted.replace(/^-/, '');
}

/**
 * Post-process a formatted number string to ensure two-decimal precision for UI.
 * - Plain numbers: force exactly 2 decimals (e.g., 3 -> 3.00, 3.1 -> 3.10)
 * - Abbreviations (K/M/B/T): ensure 2 decimals before the suffix
 * - Exponential: ensure mantissa has 2 decimals
 * Other strings are returned unchanged.
 */
function postProcessDecimals(formatted: string): string {
  try {
    if (typeof formatted !== 'string') return String(formatted ?? '0');
    const s = formatted.trim();

    // Helper: ensure exactly two decimals without rounding (truncate/pad)
    const ensureTwoDecimalsNoRound = (numString: string): string => {
      const negative = numString.startsWith('-');
      const core = negative ? numString.slice(1) : numString;
      const parts = core.split('.');
      const integerPart = parts[0] || '0';
      const decimalPart = (parts[1] || '').slice(0, 2).padEnd(2, '0');
      const result = `${integerPart}.${decimalPart}`;
      return negative ? `-${result}` : result;
    };

    // Handle K/M/B/T suffixes: ensure two decimals before the suffix
    const suffixMatch = s.match(/^(-?\d+(?:\.\d+)?)([KMBT])$/i);
    if (suffixMatch) {
      const numPart = (suffixMatch[1] ?? '0') as string;
      const suffix = (suffixMatch[2] || '') as string;
      // Truncate/pad without rounding to avoid crossing thresholds visually
      const normalized = ensureTwoDecimalsNoRound(numPart);
      return normalized + suffix.toUpperCase();
    }

    // Handle exponential notation: normalize to two-decimal mantissa
    if (/^-?\d+(?:\.\d+)?e[+\-]?\d+$/i.test(s)) {
      const n = Number(s);
      if (!Number.isFinite(n)) return s;
      return n.toExponential(2);
    }

    // Handle plain numeric strings: force exactly two decimals
    if (/^-?\d+(?:\.\d+)?$/.test(s)) {
      // Truncate/pad to two decimals without rounding
      return ensureTwoDecimalsNoRound(s);
    }

    // Otherwise, return unchanged
    return s;
  } catch {
    return String(formatted ?? '0');
  }
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

export function updateButtonState(buttonId: string, isAffordable: boolean, cost?: any): void {
  if (typeof window === 'undefined') return;
  const button = findButton(buttonId);
  if (!button || !(button as HTMLElement).classList) return;

  // Skip buttons that are in unlock mode (have data-action starting with "purchaseUnlock:")
  const dataAction = (button as HTMLElement).getAttribute('data-action');
  if (dataAction && dataAction.startsWith('purchaseUnlock:')) {
    return;
  }

  (button as HTMLButtonElement).disabled = !isAffordable;
  try {
    const cls = (button as HTMLElement).classList;
    cls.toggle('affordable', isAffordable);
    cls.toggle('unaffordable', !isAffordable);
    cls.toggle('disabled', !isAffordable);
  } catch (error) {
    errorHandler.handleError(error, 'updateButtonClasses', {
      buttonId: (button as HTMLElement)?.id,
      isAffordable,
    });
  }
  try {
    const costSpan = (button as HTMLElement).querySelector('.cost') as HTMLElement | null;
    if (costSpan != null && typeof cost !== 'undefined') {
      costSpan.textContent = formatNumber(cost);
    }
  } catch (error) {
    errorHandler.handleError(error, 'updateCostDisplay', {
      buttonId: button?.id,
      cost: cost?.toString(),
    });
  }
  const formattedCost = formatCostNumber(cost as any);
  let currentSips = '0';
  try {
    const st = useGameStore.getState();
    // Use sips directly - formatNumber will handle Decimal properly
    currentSips = formatStatNumber(st?.sips || 0);
  } catch (error) {
    errorHandler.handleError(error, 'getCurrentSipsForButtonTitle', { buttonId: button?.id });
  }
  (button as HTMLElement).title = isAffordable
    ? `Click to purchase for ${formattedCost} Sips`
    : `Costs ${formattedCost} Sips (You have ${currentSips})`;
  updateCompactButtonVariants(buttonId, isAffordable);
}

function updateCompactButtonVariants(buttonId: string, isAffordable: boolean): void {
  let compactSelector: string | null = null;
  if (buttonId === 'buySuction' || buttonId === 'upgradeSuction') {
    compactSelector =
      '.clicking-upgrade-btn[data-action="buySuction"], .clicking-upgrade-btn[data-action="upgradeSuction"]';
  } else if (buttonId === 'buyFasterDrinks') {
    compactSelector = '.drink-speed-upgrade-btn[data-action="buyFasterDrinks"]';
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
    errorHandler.handleError(error, 'updateCompactButtonVariants', { buttonId });
  }
}

export function updateCostDisplay(elementId: string, cost: any, isAffordable: boolean): void {
  if (typeof window === 'undefined') return;
  const element = findElement(elementId) as HTMLElement | null;

  if (!element || !(element as HTMLElement).classList) return;

  const formattedCost = formatCostNumber(cost);
  element.innerHTML = formattedCost;
  try {
    const cls = element.classList;
    cls.toggle('affordable', isAffordable);
    cls.toggle('unaffordable', !isAffordable);
  } catch (error) {
    errorHandler.handleError(error, 'updateCostDisplayClasses', {
      elementId,
      cost: cost?.toString(),
      isAffordable,
    });
  }
}

export const GameState = {
  get sips(): number | any {
    if (typeof window === 'undefined') return 0;
    const st = useGameStore.getState();
    const sipsValue = st && typeof st.sips !== 'undefined' ? st.sips : 0;
    // CRITICAL FIX: Don't truncate extreme values to 0 - return the Decimal for proper formatting
    if (sipsValue && typeof sipsValue.toNumber === 'function') {
      const rawNumber = sipsValue.toNumber();
      if (Number.isFinite(rawNumber) && Math.abs(rawNumber) < 1e15) {
        return rawNumber;
      } else {
        // For extreme values, return the Decimal object so formatNumber can handle it properly
        return sipsValue;
      }
    }
    return Number(sipsValue || 0);
  },
  get level(): number {
    if (typeof window === 'undefined') return 1;
    const st = useGameStore.getState();
    return st && typeof st.level !== 'undefined' ? Number(st.level || 1) : 1;
  },
  get spd(): number | any {
    if (typeof window === 'undefined') return 0;
    const st = useGameStore.getState();
    const spdValue = st && typeof st.spd !== 'undefined' ? st.spd : 0;
    // CRITICAL FIX: Don't truncate extreme values to 0 - return the Decimal for proper formatting
    if (spdValue && typeof spdValue.toNumber === 'function') {
      const numValue = spdValue.toNumber();
      if (Number.isFinite(numValue) && Math.abs(numValue) < 1e15) {
        return numValue;
      } else {
        // For extreme values, return the Decimal object so formatNumber can handle it properly
        return spdValue;
      }
    }
    return Number(spdValue || 0);
  },
  get drinkRate(): number {
    if (typeof window === 'undefined') return 0;
    const st = useGameStore.getState();
    return st && typeof st.drinkRate !== 'undefined' ? st.drinkRate : 0;
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
