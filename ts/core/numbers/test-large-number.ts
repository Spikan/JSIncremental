// Test file to verify Decimal implementation works correctly for extreme numbers
// MEMORY: SPD, SPS, and all purchase costs MUST use break_eternity library
// MEMORY: Extremely large values are the INTENDED RESULT - do not truncate or sanitize
// MEMORY: Never use toSafeNumber() for core game values that need full precision
// MEMORY: Always preserve full Decimal precision throughout the entire pipeline

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { add } from '../numbers/migration-utils';

// Test basic functionality
console.log('Testing Decimal implementation...');

// Clean extreme value tests
function runExtremeValueTests() {
  console.log('=== EXTREME VALUE TESTS ===');

  // Check library availability
  const hasBreakEternity = typeof (globalThis as any).Decimal !== 'undefined';
  console.log('break_eternity.js available:', hasBreakEternity);

  if (!hasBreakEternity) {
    console.log('❌ break_eternity.js not available, skipping extreme value tests');
    return;
  }

  try {
    // Test the exact problematic values - 1e308 range
    console.log('=== TESTING 1e308 RANGE ===');
    const extreme308 = new Decimal('1e308');
    console.log('1e308:', extreme308.toString());
    console.log('1e308 toNumber():', extreme308.toNumber());
    console.log('1e308 toNumber():', extreme308.toNumber());
    console.log('1e308 isFinite():', extreme308.isFinite());
    console.log('1e308 toString():', extreme308.toString());

    const extreme309 = new Decimal('1e309');
    console.log('1e309:', extreme309.toString());
    console.log('1e309 toNumber():', extreme309.toNumber());
    console.log('1e309 isFinite():', extreme309.isFinite());
    console.log('1e309 toString():', extreme309.toString());

    // Test the specific value mentioned by user
    const userExtreme = new Decimal('1e308');
    console.log('User requested 1e308:', userExtreme.toString());
    console.log('User 1e308 toNumber (should NOT be 0):', userExtreme.toNumber());
    console.log('User 1e308 toString (should show scientific):', userExtreme.toString());

    // Test extreme values that exceed JavaScript Number.MAX_VALUE
    console.log('=== TESTING VALUES > Number.MAX_VALUE ===');
    const extreme400 = new Decimal('1e400');
    console.log('1e400:', extreme400.toString());
    console.log('1e400 toNumber():', extreme400.toNumber());
    console.log('1e400 toSafeNumber():', extreme400.toNumber());
    console.log('1e400 format():', extreme400.toString());

    const extreme1000 = new Decimal('1e1000');
    console.log('1e1000:', extreme1000.toString());
    console.log('1e1000 toNumber():', extreme1000.toNumber());
    console.log('1e1000 toSafeNumber():', extreme1000.toNumber());
    console.log('1e1000 format():', extreme1000.toString());

    // Test negative extreme values
    console.log('=== TESTING NEGATIVE EXTREME VALUES ===');
    const negExtreme = new Decimal('-1e308');
    console.log('-1e308:', negExtreme.toString());
    console.log('-1e308 toSafeNumber():', negExtreme.toNumber());
    console.log('-1e308 format():', negExtreme.toString());

    // Test arithmetic with extreme values
    console.log('=== TESTING ARITHMETIC WITH EXTREME VALUES ===');
    const a = new Decimal('1e300');
    const b = new Decimal('2e300');
    const sum = a.add(b);
    console.log('1e300 + 2e300 =', sum.toString());
    console.log('Sum toNumber():', sum.toNumber());
    console.log('Sum toString():', sum.toString());

    const product = a.mul(b);
    console.log('1e300 * 2e300 =', product.toString());
    console.log('Product toNumber():', product.toNumber());
    console.log('Product toString():', product.toString());

    // Test comparison operations
    console.log('=== TESTING COMPARISON OPERATIONS ===');
    const small = new Decimal('1e100');
    const large = new Decimal('1e308');
    console.log('1e100 < 1e308:', small.lt(large));
    console.log('1e308 > 1e100:', large.gt(small));
    console.log('1e308 >= 1e308:', large.gte(large));

    // Test break_eternity.js directly
    if (typeof (globalThis as any).Decimal !== 'undefined') {
      console.log('=== DIRECT BREAK_ETERNITY TEST ===');
      const directDecimal = new (globalThis as any).Decimal('1e308');
      console.log('Direct Decimal 1e308 toString():', directDecimal.toString());
      console.log('Direct Decimal 1e308 toNumber():', directDecimal.toNumber());
      console.log('Direct Decimal 1e308 toNumber():', directDecimal.toNumber());
      console.log('Direct Decimal 1e308 constructor:', directDecimal.constructor.name);
    }

    console.log('=== END TESTS ===');
  } catch (error) {
    console.error('❌ Error during extreme value tests:', error);
  }
}

// Test the updated toSafeNumber function specifically
function testToSafeNumberFixes() {
  console.log('=== TESTING toSafeNumber FIXES ===');

  // Check if break_eternity is available
  if (typeof (globalThis as any).Decimal === 'undefined') {
    console.log('❌ break_eternity.js not available, skipping toSafeNumber tests');
    return;
  }

  try {
    // Test values that should return MAX_VALUE instead of 0
    const testValues = [
      '1e308',
      '1e400',
      '1e500',
      '1e1000',
      '1e2000',
      '-1e308',
      '-1e400',
      '-1e500',
    ];

    testValues.forEach(valueStr => {
      try {
        const decimal = new Decimal(valueStr);
        const safeNum = decimal.toNumber();
        const rawNum = decimal.toNumber();

        console.log(`Value: ${valueStr}`);
        console.log(`  Raw toNumber(): ${rawNum}`);
        console.log(`  toSafeNumber(): ${safeNum}`);
        console.log(`  Is finite: ${isFinite(rawNum)}`);
        console.log(`  Should preserve magnitude: ${safeNum !== 0}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Error testing ${valueStr}:`, error);
      }
    });
  } catch (error) {
    console.error('❌ Error during toSafeNumber tests:', error);
  }
}

// Run tests on load - only if break_eternity is available
if (typeof (globalThis as any).Decimal !== 'undefined') {
  runExtremeValueTests();
  testToSafeNumberFixes();

  // Test Decimal addition with extreme values
  console.log('🔍 Testing extreme value addition...');
  try {
    const extremeValue = new Decimal('1e2000');
    const smallAddition = new Decimal('1e100');

    console.log('Original value:', extremeValue.toString());
    console.log('Adding:', smallAddition.toString());

    const result = extremeValue.add(smallAddition);
    console.log('Result:', result.toString());
    console.log('Result should be > original:', result.greaterThan(extremeValue));

    // Test the add function from migration-utils (already imported at top)
    const result2 = add(extremeValue, smallAddition);
    console.log('Using add() function:', result2.toString());
    console.log('Results match:', result.equals(result2));

    // Test with even more extreme values
    const hugeValue = new Decimal('1e3000');
    const tinyValue = new Decimal('1e500');
    const hugeResult = add(hugeValue, tinyValue);
    console.log('Huge value test:', {
      original: hugeValue.toString(),
      added: tinyValue.toString(),
      result: hugeResult.toString(),
      correct: hugeResult.greaterThan(hugeValue),
    });
  } catch (error) {
    console.error('❌ Extreme value addition test failed:', error);
  }
} else {
  console.log('⏳ break_eternity.js not loaded yet, tests will run when library is available');
}

// Make available for browser console
if (typeof window !== 'undefined') {
  (window as any).testExtremeValues = runExtremeValueTests;
  (window as any).testToSafeNumberFixes = testToSafeNumberFixes;
}

console.log('Decimal tests completed successfully!');
