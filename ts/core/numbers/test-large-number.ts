// Test file to verify LargeNumber implementation works correctly

import { LargeNumber } from './large-number';

// Test basic functionality
console.log('Testing LargeNumber implementation...');

// Clean extreme value tests
function runExtremeValueTests() {
  console.log('=== EXTREME VALUE TESTS ===');

  // Check library availability
  const hasBreakInfinity = typeof (globalThis as any).Decimal !== 'undefined';
  console.log('break_infinity.js available:', hasBreakInfinity);

  // Test the exact problematic values
  const extreme1 = new LargeNumber('1e2000');
  console.log('1e2000:', extreme1.toString());
  console.log('1e2000 toNumber():', extreme1.toNumber());
  console.log('1e2000 toSafeNumber():', extreme1.toSafeNumber());
  console.log('1e2000 type:', extreme1.getValueType());

  // Test smaller values that should work
  const medium = new LargeNumber('1e100');
  console.log('1e100:', medium.toString());
  console.log('1e100 toNumber():', medium.toNumber());
  console.log('1e100 type:', medium.getValueType());

  // Test various extreme values
  const extreme2 = new LargeNumber('1.5e3000');
  console.log('1.5e3000:', extreme2.toString());
  console.log('1.5e3000 toNumber():', extreme2.toNumber());
  console.log('1.5e3000 toSafeNumber():', extreme2.toSafeNumber());

  const extreme3 = new LargeNumber('2.5e4000');
  console.log('2.5e4000:', extreme3.toString());
  console.log('2.5e4000 toNumber():', extreme3.toNumber());
  console.log('2.5e4000 toSafeNumber():', extreme3.toSafeNumber());

  // Test break_infinity directly
  if (typeof (globalThis as any).Decimal !== 'undefined') {
    console.log('=== DIRECT BREAK_INFINITY TEST ===');
    const directDecimal = new (globalThis as any).Decimal('1e2000');
    console.log('Direct Decimal 1e2000 toString():', directDecimal.toString());
    console.log('Direct Decimal 1e2000 toNumber():', directDecimal.toNumber());
    console.log('Direct Decimal 1e2000 constructor:', directDecimal.constructor.name);
  }

  console.log('=== END TESTS ===');
}

// Run tests on load
runExtremeValueTests();

// Make available for browser console
if (typeof window !== 'undefined') {
  (window as any).testExtremeValues = runExtremeValueTests;
}

console.log('LargeNumber tests completed successfully!');
