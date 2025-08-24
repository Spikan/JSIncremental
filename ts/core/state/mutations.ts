// Pure mutation helpers for LargeNumber values (TypeScript)
// Enhanced for unlimited scaling with break_infinity support

import { LargeNumber } from '../numbers/large-number';
import { toLargeNumber, add, subtract, multiply } from '../numbers/migration-utils';

// Type for values that can be LargeNumber or converted to LargeNumber
export type NumericValue = number | string | LargeNumber | any;

/**
 * Add sips to current amount - returns LargeNumber for unlimited scaling
 */
export function addSips(currentSips: NumericValue, amount: NumericValue): LargeNumber {
  return add(currentSips, amount);
}

/**
 * Subtract sips from current amount - returns LargeNumber for unlimited scaling
 */
export function subtractSips(currentSips: NumericValue, amount: NumericValue): LargeNumber {
  return subtract(currentSips, amount);
}

/**
 * Increment a count by specified amount - returns LargeNumber for unlimited scaling
 */
export function incrementCount(currentCount: NumericValue, by: number = 1): LargeNumber {
  return add(currentCount, by);
}

/**
 * Multiply a value by specified factor - returns LargeNumber for unlimited scaling
 */
export function multiplyValue(value: NumericValue, factor: NumericValue): LargeNumber {
  return multiply(value, factor);
}

/**
 * Check if one value is greater than or equal to another
 */
export function isGreaterOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.gte(ln2);
}

/**
 * Check if one value is greater than another
 */
export function isGreater(value1: NumericValue, value2: NumericValue): boolean {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.gt(ln2);
}

/**
 * Check if one value is less than or equal to another
 */
export function isLessOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.lte(ln2);
}

/**
 * Check if one value is less than another
 */
export function isLess(value1: NumericValue, value2: NumericValue): boolean {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.lt(ln2);
}

/**
 * Check if two values are equal
 */
export function areEqual(value1: NumericValue, value2: NumericValue): boolean {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.eq(ln2);
}

/**
 * Get the maximum of two values
 */
export function max(value1: NumericValue, value2: NumericValue): LargeNumber {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.gte(ln2) ? ln1 : ln2;
}

/**
 * Get the minimum of two values
 */
export function min(value1: NumericValue, value2: NumericValue): LargeNumber {
  const ln1 = toLargeNumber(value1);
  const ln2 = toLargeNumber(value2);
  return ln1.lte(ln2) ? ln1 : ln2;
}

export {};
