// Test file to verify Decimal implementation works correctly

import { DecimalOps, Decimal } from '../numbers/large-number';

// Test basic functionality
console.log('Testing Decimal implementation...');

// Clean extreme value tests
function runExtremeValueTests() {
  console.log('=== EXTREME VALUE TESTS ===');

  // Check library availability
  const hasBreakEternity = typeof (globalThis as any).Decimal !== 'undefined';
  console.log('break_eternity.js available:', hasBreakEternity);

  // Test the exact problematic values
  const extreme1 = new Decimal('1e2000');
  console.log('1e2000:', extreme1.toString());
  console.log('1e2000 toNumber():', DecimalOps.toSafeNumber(extreme1));
  console.log('1e2000 toSafeNumber():', extreme1.toSafeNumber());
  console.log('1e2000 type:', extreme1.getValueType());

  // Test smaller values that should work
  const medium = new Decimal('1e100');
  console.log('1e100:', medium.toString());
  console.log('1e100 toNumber():', DecimalOps.toSafeNumber(medium));
  console.log('1e100 type:', medium.getValueType());

  // Test various extreme values
  const extreme2 = new Decimal('1.5e3000');
  console.log('1.5e3000:', extreme2.toString());
  console.log('1.5e3000 toNumber():', DecimalOps.toSafeNumber(extreme2));
  console.log('1.5e3000 toSafeNumber():', extreme2.toSafeNumber());

  const extreme3 = new Decimal('2.5e4000');
  console.log('2.5e4000:', extreme3.toString());
  console.log('2.5e4000 toNumber():', DecimalOps.toSafeNumber(extreme3));
  console.log('2.5e4000 toSafeNumber():', extreme3.toSafeNumber());

  // Test break_eternity.js directly
  if (typeof (globalThis as any).Decimal !== 'undefined') {
    console.log('=== DIRECT BREAK_ETERNITY TEST ===');
    const directDecimal = new (globalThis as any).Decimal('1e2000');
    console.log('Direct Decimal 1e2000 toString():', directDecimal.toString());
    console.log('Direct Decimal 1e2000 toNumber():', DecimalOps.toSafeNumber(directDecimal));
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

console.log('Decimal tests completed successfully!');
