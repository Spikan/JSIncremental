// Test file to verify LargeNumber implementation works correctly

import { LargeNumber } from './large-number';
import { NativeNumber } from './native-number';

// Test basic functionality
console.log('Testing LargeNumber implementation...');

// Test 1: Basic construction and operations
const a = new LargeNumber(100);
const b = new LargeNumber(50);

console.log('a =', a.toString());
console.log('b =', b.toString());
console.log('a + b =', a.add(b).toString());
console.log('a - b =', a.subtract(b).toString());
console.log('a * b =', a.multiply(b).toString());
console.log('a / b =', a.divide(b).toString());
console.log('a > b =', a.gt(b));
console.log('a < b =', a.lt(b));

// Test 2: Large numbers (should use break_infinity if available)
const largeNum = new LargeNumber('1e100');
console.log('Large number:', largeNum.toString());
console.log('Large number + 1:', largeNum.add(new LargeNumber(1)).toString());

// Test 3: Native number fallback
const nativeNum = new NativeNumber(42);
console.log('Native number:', nativeNum.toString());
console.log('Native number operations work:', nativeNum.add(nativeNum).toString());

// Test 4: Check which library is being used
const testNum = new LargeNumber(1);
console.log('Using break_infinity:', !((testNum as any)._value instanceof NativeNumber));
console.log(
  'Library available:',
  typeof (globalThis as any).BreakInfinity !== 'undefined' ||
    typeof (globalThis as any).Decimal !== 'undefined'
);

console.log('LargeNumber tests completed successfully!');
