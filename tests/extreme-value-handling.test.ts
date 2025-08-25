// Tests for improved extreme value handling with break_eternity.js
// Demonstrates the enhanced safety and reliability features

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { 
  safeToNumber, 
  safeToString, 
  isExtremeValue, 
  safeFormat,
  safeGte,
  safeAdd,
  safeMultiply,
  safeDivide,
  isValidDecimalString,
  getMagnitudeDescription
} from '../ts/core/numbers/safe-conversion';
import {
  DecimalErrorRecovery,
  ExtremeValueMonitor,
  setupGlobalErrorHandling
} from '../ts/core/numbers/error-recovery';

// Mock break_eternity.js for testing
const Decimal = (globalThis as any).Decimal;

describe('Safe Conversion Utilities', () => {
  beforeAll(() => {
    // Setup global error handling
    setupGlobalErrorHandling();
  });

  beforeEach(() => {
    // Reset performance monitor
    ExtremeValueMonitor.getInstance().reset();
  });

  describe('safeToNumber', () => {
    it('should safely convert normal values', () => {
      const normal = new Decimal(1000);
      expect(safeToNumber(normal)).toBe(1000);
    });

    it('should return fallback for extreme values', () => {
      const extreme = new Decimal('1e500');
      expect(safeToNumber(extreme)).toBe(0); // Fallback value
      expect(safeToNumber(extreme, 42)).toBe(42); // Custom fallback
    });

    it('should handle non-Decimal inputs', () => {
      expect(safeToNumber(1000)).toBe(1000);
      expect(safeToNumber('invalid')).toBe(0);
      expect(safeToNumber(null)).toBe(0);
    });
  });

  describe('safeToString', () => {
    it('should preserve precision for all values', () => {
      const normal = new Decimal(1000);
      const extreme = new Decimal('1e500');
      
      expect(safeToString(normal)).toBe('1000');
      expect(safeToString(extreme)).toBe('1e+500');
    });

    it('should handle non-Decimal inputs', () => {
      expect(safeToString(1000)).toBe('0');
      expect(safeToString('invalid')).toBe('0');
    });
  });

  describe('isExtremeValue', () => {
    it('should identify extreme values correctly', () => {
      const normal = new Decimal(1000);
      const large = new Decimal('1e100');
      const extreme = new Decimal('1e500');
      
      expect(isExtremeValue(normal)).toBe(false);
      expect(isExtremeValue(large)).toBe(false); // Still within safe range
      expect(isExtremeValue(extreme)).toBe(true);
    });

    it('should handle non-Decimal inputs', () => {
      expect(isExtremeValue(1000)).toBe(false);
      expect(isExtremeValue('invalid')).toBe(false);
    });
  });

  describe('safeFormat', () => {
    it('should format normal values with locale', () => {
      const normal = new Decimal(1234.56);
      expect(safeFormat(normal)).toMatch(/1,234\.56/);
    });

    it('should use scientific notation for large values', () => {
      const large = new Decimal('1e6');
      expect(safeFormat(large)).toBe('1e+6');
    });

    it('should preserve extreme values', () => {
      const extreme = new Decimal('1e500');
      expect(safeFormat(extreme)).toBe('1e+500');
    });
  });

  describe('Safe Arithmetic Operations', () => {
    it('should perform safe addition', () => {
      const a = new Decimal('1e100');
      const b = new Decimal('2e100');
      const result = safeAdd(a, b);
      expect(result.toString()).toBe('3e+100');
    });

    it('should perform safe multiplication', () => {
      const a = new Decimal('1e50');
      const b = new Decimal('2e50');
      const result = safeMultiply(a, b);
      expect(result.toString()).toBe('2e+100');
    });

    it('should perform safe division', () => {
      const a = new Decimal('1e100');
      const b = new Decimal('2');
      const result = safeDivide(a, b);
      expect(result.toString()).toBe('5e+99');
    });

    it('should handle division by zero', () => {
      const a = new Decimal('1e100');
      const b = new Decimal('0');
      const result = safeDivide(a, b);
      expect(result.toString()).toBe('0');
    });
  });

  describe('safeGte', () => {
    it('should compare values correctly', () => {
      const a = new Decimal('1e100');
      const b = new Decimal('5e99');
      
      expect(safeGte(a, b)).toBe(true);
      expect(safeGte(b, a)).toBe(false);
      expect(safeGte(a, a)).toBe(true);
    });

    it('should handle mixed types', () => {
      expect(safeGte(1000, 500)).toBe(true);
      expect(safeGte(new Decimal(1000), 500)).toBe(true);
    });
  });
});

describe('Input Validation', () => {
  describe('isValidDecimalString', () => {
    it('should validate regular numbers', () => {
      expect(isValidDecimalString('123')).toBe(true);
      expect(isValidDecimalString('-123.456')).toBe(true);
      expect(isValidDecimalString('0')).toBe(true);
    });

    it('should validate scientific notation', () => {
      expect(isValidDecimalString('1e100')).toBe(true);
      expect(isValidDecimalString('1.5e-50')).toBe(true);
      expect(isValidDecimalString('-2e+200')).toBe(true);
    });

    it('should validate break_eternity.js formats', () => {
      expect(isValidDecimalString('1e100e200')).toBe(true);
      expect(isValidDecimalString('e100')).toBe(true);
      expect(isValidDecimalString('e100e200')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidDecimalString('invalid')).toBe(false);
      expect(isValidDecimalString('1e')).toBe(false);
      expect(isValidDecimalString('e')).toBe(false);
      expect(isValidDecimalString('')).toBe(false);
    });
  });
});

describe('Magnitude Description', () => {
  it('should categorize values correctly', () => {
    expect(getMagnitudeDescription(new Decimal(0))).toBe('Zero');
    expect(getMagnitudeDescription(new Decimal(0.5))).toBe('Tiny');
    expect(getMagnitudeDescription(new Decimal(100))).toBe('Small');
    expect(getMagnitudeDescription(new Decimal(5000))).toBe('Medium');
    expect(getMagnitudeDescription(new Decimal('1e6'))).toBe('Large');
    expect(getMagnitudeDescription(new Decimal('1e500'))).toBe('Extreme');
  });
});

describe('Error Recovery', () => {
  describe('DecimalErrorRecovery', () => {
    it('should recover from string conversion errors', () => {
      const result = DecimalErrorRecovery.handleConversionError('invalid', 'test');
      expect(result.toString()).toBe('0');
    });

    it('should extract numeric parts from strings', () => {
      const result = DecimalErrorRecovery.handleConversionError('abc123def', 'test');
      expect(result.toString()).toBe('123');
    });

    it('should validate calculation results', () => {
      const valid = new Decimal(1000);
      const extreme = new Decimal('1e500');
      
      expect(DecimalErrorRecovery.validateCalculation(valid, 'test')).toBe(true);
      expect(DecimalErrorRecovery.validateCalculation(extreme, 'test')).toBe(true);
    });

    it('should validate input types', () => {
      expect(DecimalErrorRecovery.validateInputs(1000, 500, 'add')).toBe(true);
      expect(DecimalErrorRecovery.validateInputs(new Decimal(1000), 500, 'add')).toBe(true);
      expect(DecimalErrorRecovery.validateInputs('invalid', 500, 'add')).toBe(false);
    });
  });
});

describe('Performance Monitoring', () => {
  describe('ExtremeValueMonitor', () => {
    it('should track extreme value usage', () => {
      const monitor = ExtremeValueMonitor.getInstance();
      monitor.reset();
      
      const extreme = new Decimal('1e500');
      
      // Simulate multiple operations
      for (let i = 0; i < 10; i++) {
        monitor.checkPerformance(extreme, 'test-operation');
      }
      
      const stats = monitor.getStats();
      expect(stats.extremeValueCount).toBe(10);
      expect(stats.operationCounts['test-operation']).toBe(10);
    });

    it('should warn about high usage', () => {
      const monitor = ExtremeValueMonitor.getInstance();
      monitor.reset();
      
      const extreme = new Decimal('1e500');
      
      // Simulate high usage
      for (let i = 0; i < 150; i++) {
        monitor.checkPerformance(extreme, 'high-usage');
      }
      
      const stats = monitor.getStats();
      expect(stats.warnings).toBeGreaterThan(0);
    });

    it('should detect when optimization is needed', () => {
      const monitor = ExtremeValueMonitor.getInstance();
      monitor.reset();
      
      const extreme = new Decimal('1e500');
      
      // Simulate moderate usage
      for (let i = 0; i < 60; i++) {
        monitor.checkPerformance(extreme, 'moderate-usage');
      }
      
      expect(monitor.needsOptimization()).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle real-world extreme value scenarios', () => {
    // Simulate late-game progression
    const baseSPD = new Decimal('1e100');
    const multiplier = new Decimal('1e50');
    const time = 1000;
    
    // Calculate production over time
    const production = safeMultiply(baseSPD, multiplier);
    const totalProduction = safeMultiply(production, time);
    
    // Verify calculations maintain precision
    expect(isExtremeValue(totalProduction)).toBe(true);
    expect(safeToString(totalProduction)).toMatch(/e\+/);
    
    // Verify performance monitoring
    const monitor = ExtremeValueMonitor.getInstance();
    const stats = monitor.getStats();
    expect(stats.extremeValueCount).toBeGreaterThan(0);
  });

  it('should handle cost calculations with extreme values', () => {
    // Simulate expensive upgrades
    const baseCost = new Decimal('1e200');
    const scaling = new Decimal('1.15');
    const level = 100;
    
    // Calculate cost with exponential scaling
    let cost = baseCost;
    for (let i = 0; i < level; i++) {
      cost = safeMultiply(cost, scaling);
    }
    
    // Verify cost is extreme but calculable
    expect(isExtremeValue(cost)).toBe(true);
    expect(safeToString(cost)).toMatch(/e\+/);
    
    // Verify affordability check works
    const playerSips = new Decimal('1e300');
    expect(safeGte(playerSips, cost)).toBe(true);
  });

  it('should handle save/load with extreme values', () => {
    const extremeValue = new Decimal('1e500');
    
    // Simulate save
    const savedString = safeToString(extremeValue);
    expect(savedString).toBe('1e+500');
    
    // Simulate load
    const loadedValue = new Decimal(savedString);
    expect(loadedValue.toString()).toBe('1e+500');
    expect(isExtremeValue(loadedValue)).toBe(true);
  });
});

describe('Edge Cases', () => {
  it('should handle values at JavaScript limits', () => {
    const atLimit = new Decimal('1e308');
    const overLimit = new Decimal('1e309');
    
    expect(isExtremeValue(atLimit)).toBe(false); // At limit but still safe
    expect(isExtremeValue(overLimit)).toBe(true); // Over limit
  });

  it('should handle negative extreme values', () => {
    const negativeExtreme = new Decimal('-1e500');
    
    expect(isExtremeValue(negativeExtreme)).toBe(true);
    expect(safeToString(negativeExtreme)).toBe('-1e+500');
  });

  it('should handle zero and very small values', () => {
    const zero = new Decimal(0);
    const tiny = new Decimal('1e-100');
    
    expect(isExtremeValue(zero)).toBe(false);
    expect(isExtremeValue(tiny)).toBe(false);
    expect(safeToNumber(zero)).toBe(0);
    expect(safeToNumber(tiny)).toBe(0); // Too small for JavaScript
  });
});