import { describe, it, expect } from 'vitest';
import { validateUnlocks, validateUpgrades, validateGameSave, validateGameOptions } from '../js/core/validation/schemas.js';

describe('Validation Schemas', () => {
    describe('Unlocks Schema', () => {
        it('should validate valid unlocks data', () => {
            const validData = {
                suction: { sips: 25, clicks: 8 },
                criticalClick: { sips: 100, clicks: 20 },
                fasterDrinks: { sips: 200, clicks: 30 },
                straws: { sips: 500, clicks: 50 },
                cups: { sips: 1000, clicks: 80 },
                widerStraws: { sips: 2000, clicks: 120 },
                betterCups: { sips: 5000, clicks: 200 },
                levelUp: { sips: 3000, clicks: 150 },
                shop: { sips: 500, clicks: 30 },
                stats: { sips: 1000, clicks: 60 },
                god: { sips: 5000, clicks: 300 },
                unlocks: { sips: 25, clicks: 8 }
            };
            
            const result = validateUnlocks(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid unlocks data', () => {
            const invalidData = {
                suction: { sips: -1, clicks: 8 }, // Negative sips
                criticalClick: { sips: 100, clicks: 20 }
            };
            
            const result = validateUnlocks(invalidData);
            expect(result).toBeNull();
        });
    });

    describe('Upgrades Schema', () => {
        it('should validate valid upgrades data', () => {
            const validData = {
                straws: { baseCost: 5, scaling: 1.15, baseSPD: 0.6, multiplierPerLevel: 0.2 },
                widerStraws: { baseCost: 150, scaling: 1.18, multiplierPerLevel: 0.2 },
                cups: { baseCost: 15, scaling: 1.17, baseSPD: 1.2, multiplierPerLevel: 0.3 },
                betterCups: { baseCost: 400, scaling: 1.22, multiplierPerLevel: 0.3 },
                suction: { baseCost: 40, scaling: 1.16 },
                fasterDrinks: { baseCost: 80, scaling: 1.2, upgradeBaseCost: 1500 },
                criticalClick: { baseCost: 60, scaling: 1.22 }
            };
            
            const result = validateUpgrades(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid upgrades data', () => {
            const invalidData = {
                straws: { baseCost: -5, scaling: 1.15 }, // Negative cost
                widerStraws: { baseCost: 150, scaling: 0.5 } // Scaling < 1
            };
            
            const result = validateUpgrades(invalidData);
            expect(result).toBeNull();
        });
    });

    describe('Game Save Schema', () => {
        it('should validate valid game save data', () => {
            const validData = {
                sips: { value: 1000 },
                straws: 5,
                cups: 3,
                widerStraws: { value: 2 },
                betterCups: { value: 1 },
                suctions: { value: 3 },
                criticalClicks: { value: 2 },
                fasterDrinks: { value: 1 },
                lastSaveTime: Date.now(),
                totalClicks: 150,
                level: 1
            };
            
            const result = validateGameSave(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid game save data', () => {
            const invalidData = {
                sips: { value: 1000 },
                straws: -1, // Negative straws
                cups: 3
            };
            
            const result = validateGameSave(invalidData);
            expect(result).toBeNull();
        });
    });

    describe('Game Options Schema', () => {
        it('should validate valid game options data', () => {
            const validData = {
                autosaveEnabled: true,
                autosaveInterval: 5000,
                clickSoundsEnabled: true,
                musicEnabled: false,
                musicStreamPreferences: { stream1: true, stream2: false }
            };
            
            const result = validateGameOptions(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid game options data', () => {
            const invalidData = {
                autosaveEnabled: true,
                autosaveInterval: 500, // Too low
                clickSoundsEnabled: true,
                musicEnabled: false
            };
            
            const result = validateGameOptions(invalidData);
            expect(result).toBeNull();
        });
    });
});
