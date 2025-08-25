// Pure mutation helpers for direct Decimal values (TypeScript)
// Maximum performance with direct break_eternity.js operations

import { DecimalOps, Decimal } from '../numbers/large-number';
import { toDecimal, add, subtract, multiply } from '../numbers/migration-utils';

// Type for values that can be Decimal or converted to Decimal
export type NumericValue = number | string | Decimal | any;

/**
 * Add sips to current amount - returns Decimal for unlimited scaling
 */
export function addSips(currentSips: NumericValue, amount: NumericValue): Decimal {
  return add(currentSips, amount);
}

/**
 * Subtract sips from current amount - returns Decimal for unlimited scaling
 */
export function subtractSips(currentSips: NumericValue, amount: NumericValue): Decimal {
  return subtract(currentSips, amount);
}

/**
 * Increment a count by specified amount - returns Decimal for unlimited scaling
 */
export function incrementCount(currentCount: NumericValue, by: number = 1): Decimal {
  return add(currentCount, by);
}

/**
 * Multiply a value by specified factor - returns Decimal for unlimited scaling
 */
export function multiplyValue(value: NumericValue, factor: NumericValue): Decimal {
  return multiply(value, factor);
}

/**
 * Check if one value is greater than or equal to another
 */
export function isGreaterOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.greaterThanOrEqual(dec1, dec2);
}

/**
 * Check if one value is greater than another
 */
export function isGreater(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.greaterThan(dec1, dec2);
}

/**
 * Check if one value is less than or equal to another
 */
export function isLessOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.lessThanOrEqual(dec1, dec2);
}

/**
 * Check if one value is less than another
 */
export function isLess(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.lessThan(dec1, dec2);
}

/**
 * Check if two values are equal
 */
export function areEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.equal(dec1, dec2);
}

/**
 * Get the maximum of two values
 */
export function max(value1: NumericValue, value2: NumericValue): Decimal {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.greaterThanOrEqual(dec1, dec2) ? dec1 : dec2;
}

/**
 * Get the minimum of two values
 */
export function min(value1: NumericValue, value2: NumericValue): Decimal {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return DecimalOps.lessThanOrEqual(dec1, dec2) ? dec1 : dec2;
}

export {};
