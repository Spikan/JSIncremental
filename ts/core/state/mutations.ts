// Pure mutation helpers for direct Decimal values (TypeScript)
// Maximum performance with direct break_eternity.js operations

// Direct break_eternity.js access
import { toDecimal, add, subtract, multiply } from '../numbers/migration-utils';
import { DecimalType } from '../numbers/decimal-utils';

// Type for values that can be Decimal or converted to Decimal
export type NumericValue = number | string | DecimalType;

/**
 * Add sips to current amount - returns Decimal for unlimited scaling
 */
export function addSips(currentSips: NumericValue, amount: NumericValue): DecimalType {
  return add(currentSips, amount);
}

/**
 * Subtract sips from current amount - returns Decimal for unlimited scaling
 */
export function subtractSips(currentSips: NumericValue, amount: NumericValue): DecimalType {
  return subtract(currentSips, amount);
}

/**
 * Increment a count by specified amount - returns Decimal for unlimited scaling
 */
export function incrementCount(currentCount: NumericValue, by: number = 1): DecimalType {
  return add(currentCount, by);
}

/**
 * Multiply a value by specified factor - returns Decimal for unlimited scaling
 */
export function multiplyValue(value: NumericValue, factor: NumericValue): DecimalType {
  return multiply(value, factor);
}

/**
 * Check if one value is greater than or equal to another
 */
export function isGreaterOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.gte(dec2);
}

/**
 * Check if one value is greater than another
 */
export function isGreater(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.gt(dec2);
}

/**
 * Check if one value is less than or equal to another
 */
export function isLessOrEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.lte(dec2);
}

/**
 * Check if one value is less than another
 */
export function isLess(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.lt(dec2);
}

/**
 * Check if two values are equal
 */
export function areEqual(value1: NumericValue, value2: NumericValue): boolean {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.eq(dec2);
}

/**
 * Get the maximum of two values
 */
export function max(value1: NumericValue, value2: NumericValue): DecimalType {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.gte(dec2) ? dec1 : dec2;
}

/**
 * Get the minimum of two values
 */
export function min(value1: NumericValue, value2: NumericValue): DecimalType {
  const dec1 = toDecimal(value1);
  const dec2 = toDecimal(value2);
  return dec1.lte(dec2) ? dec1 : dec2;
}

export {};
