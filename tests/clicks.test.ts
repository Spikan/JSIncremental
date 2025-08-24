import { describe, it, expect, beforeEach } from 'vitest';
import { computeClick } from '../ts/core/rules/clicks';

declare global {
  var window: {
    Decimal: any;
  };
}

// Mock Decimal for tests
beforeEach(() => {
    window.Decimal = class MockDecimal {
        constructor(value) {
            this.value = value;
        }
        
        plus(other) {
            const otherValue = other instanceof MockDecimal ? other.value : other;
            return new MockDecimal(this.value + otherValue);
        }
        
        times(other) {
            const otherValue = other instanceof MockDecimal ? other.value : other;
            return new MockDecimal(this.value * otherValue);
        }
        
        toString() {
            return String(this.value);
        }
        
        toNumber() {
            return this.value;
        }
    };
});

describe('computeClick', () => {
    it('adds suction bonus to base', () => {
        const result = computeClick({
            baseClick: 10,
            suctionBonus: 5,
            criticalChance: 0,
            criticalMultiplier: 1
        });
        
        expect(result.gained).toBe('15');
        expect(result.critical).toBe(false);
    });
    
    it('applies critical multiplier when rng < chance', () => {
        const result = computeClick({
            baseClick: 10,
            suctionBonus: 5,
            criticalChance: 1, // 100% chance
            criticalMultiplier: 2
        });
        
        expect(result.gained).toBe('30'); // (10 + 5) * 2
        expect(result.critical).toBe(true);
    });
});


