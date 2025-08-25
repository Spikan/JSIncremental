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

// Test 3: The actual problematic extreme values
console.log('\n🧪 Testing THE EXACT extreme values that were broken...');
const extreme1 = new LargeNumber('1e2000');
console.log('1e2000:', extreme1.toString());
console.log('1e2000 toNumber():', extreme1.toNumber());
console.log('1e2000 type:', extreme1.getValueType());

const extreme2 = new LargeNumber('1e3000');
console.log('1e3000:', extreme2.toString());
console.log('1e3000 toNumber():', extreme2.toNumber());
console.log('1e3000 type:', extreme2.getValueType());

// Test 4: Arithmetic with extreme values (the real issue)
console.log('\n🧪 Testing extreme value arithmetic (the breaking point)...');
const addTest = extreme1.add(extreme1);
console.log('1e2000 + 1e2000:', addTest.toString());
console.log('Sum toNumber():', addTest.toNumber());
console.log('Sum type:', addTest.getValueType());

// Test 5: What happens when we convert extreme values to numbers?
console.log('\n🧪 Testing toNumber() behavior with extreme values...');
const extremeForNumber = new LargeNumber('1e400');
console.log('1e400 toString():', extremeForNumber.toString());
console.log('1e400 toNumber():', extremeForNumber.toNumber());
console.log('1e400 debug:', extremeForNumber.getDebugInfo());

// Test 3: Native number fallback
const nativeNum = new NativeNumber(42);
console.log('Native number:', nativeNum.toString());
console.log('Native number operations work:', nativeNum.add(nativeNum).toString());

// Make test function globally available for browser console
if (typeof window !== 'undefined') {
  (window as any).testExtremeValues = () => {
    console.log('🚀 RUNNING EXTREME VALUE TESTS...');
    // Re-run all the extreme value tests
    const extreme1 = new LargeNumber('1e2000');
    console.log('1e2000:', extreme1.toString());
    console.log('1e2000 toNumber():', extreme1.toNumber());

    const extreme2 = new LargeNumber('1e3000');
    console.log('1e3000:', extreme2.toString());
    console.log('1e3000 toNumber():', extreme2.toNumber());

    const addTest = extreme1.add(extreme1);
    console.log('1e2000 + 1e2000:', addTest.toString());

    return '✅ Tests completed - check console for results';
  };
  console.log('🔧 Call testExtremeValues() in browser console to test extreme values');
}

// Test 4: Check which library is being used
const testNum = new LargeNumber(1);
console.log('Using break_infinity:', testNum.getValueType() !== 'NativeNumber');
console.log(
  'Library available:',
  typeof (globalThis as any).BreakInfinity !== 'undefined' ||
    typeof (globalThis as any).Decimal !== 'undefined'
);

console.log('LargeNumber tests completed successfully!');
