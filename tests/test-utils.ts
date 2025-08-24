// Enhanced test utilities for better testing experience
import { LargeNumber } from '../ts/core/numbers/large-number';

/**
 * Test helper to compare LargeNumber objects with expected numbers
 */
export function expectLargeNumberToEqual(received: LargeNumber | any, expected: number): void {
  if (received instanceof LargeNumber) {
    expect(received.toNumber()).toBe(expected);
  } else {
    expect(received).toBe(expected);
  }
}

/**
 * Test helper to compare LargeNumber objects with expected strings
 */
export function expectLargeNumberToEqualString(received: LargeNumber | any, expected: string): void {
  if (received instanceof LargeNumber) {
    expect(received.toString()).toBe(expected);
  } else {
    expect(received).toBe(expected);
  }
}

/**
 * Test helper to check if a value is a LargeNumber
 */
export function expectIsLargeNumber(value: any): void {
  expect(value).toBeInstanceOf(LargeNumber);
}

/**
 * Test helper to get the numeric value from a LargeNumber or return the value directly
 */
export function getNumericValue(value: LargeNumber | number | string): number {
  if (value instanceof LargeNumber) {
    return value.toNumber();
  }
  return Number(value);
}

/**
 * Setup test environment for Zustand store testing
 */
export function setupTestEnvironment() {
  // Mock window and document if not available
  if (typeof window === 'undefined') {
    (global as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    } as any;
  }

  if (typeof document === 'undefined') {
    (global as any).document = {
      createElement: () => ({}),
      body: { appendChild: () => {} },
    } as any;
  }

  return {
    cleanup: () => {
      // Cleanup function
    }
  };
}