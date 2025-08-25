// Test file to verify LargeNumber implementation works correctly

import { LargeNumber } from './large-number';
import { NativeNumber } from './native-number';

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
  console.log('1e2000 type:', extreme1.getValueType());

  const extreme2 = new LargeNumber('1e3000');
  console.log('1e3000:', extreme2.toString());
  console.log('1e3000 toNumber():', extreme2.toNumber());
  console.log('1e3000 type:', extreme2.getValueType());

  // Test arithmetic
  const sum = extreme1.add(extreme1);
  console.log('1e2000 + 1e2000:', sum.toString());
  console.log('Sum toNumber():', sum.toNumber());
  console.log('Sum type:', sum.getValueType());

  console.log('=== END TESTS ===');
}

// Run tests on load
runExtremeValueTests();

// Make available for browser console
if (typeof window !== 'undefined') {
  (window as any).testExtremeValues = runExtremeValueTests;
}

console.log('LargeNumber tests completed successfully!');
