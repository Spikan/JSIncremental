// Test script to verify the null value fix
import { validateGameSave } from './js/core/validation/schemas.js';

// Mock Decimal class
class Decimal {
  constructor(value) {
    this.value = Number(value);
  }

  toNumber() {
    return this.value;
  }

  toString() {
    return this.value.toString();
  }
}

// Mock window object with game variables
const mockWindow = {
  sips: new Decimal(1000),
  straws: new Decimal(5),
  cups: new Decimal(3),
  widerStraws: new Decimal(2),
  betterCups: new Decimal(1),
  suctions: new Decimal(3),
  criticalClicks: new Decimal(2),
  fasterDrinks: new Decimal(1),
  totalSipsEarned: new Decimal(500),
  drinkRate: 1.5,
  lastDrinkTime: Date.now(),
  drinkProgress: 0.5,
  totalClicks: 150,
  level: new Decimal(2)
};

// Simulate the performSaveSnapshot function
function performSaveSnapshot(window) {
  return {
    sips: String(window.sips || 0),
    straws: (window.straws && typeof window.straws.toNumber === 'function') ? window.straws.toNumber() : Number(window.straws || 0),
    cups: (window.cups && typeof window.cups.toNumber === 'function') ? window.cups.toNumber() : Number(window.cups || 0),
    widerStraws: String(window.widerStraws || 0),
    betterCups: String(window.betterCups || 0),
    suctions: String(window.suctions || 0),
    criticalClicks: String(window.criticalClicks || 0),
    fasterDrinks: String(window.fasterDrinks || 0),
    totalSipsEarned: String(window.totalSipsEarned || 0),
    drinkRate: Number(window.drinkRate || 0),
    lastDrinkTime: Number(window.lastDrinkTime || 0),
    drinkProgress: Number(window.drinkProgress || 0),
    lastSaveTime: Date.now(),
    totalClicks: Number(window.totalClicks || 0),
    level: (window.level && typeof window.level.toNumber === 'function') ? window.level.toNumber() : Number(window.level || 1)
  };
}

const savedData = performSaveSnapshot(mockWindow);
console.log('Saved data:', savedData);

// Test validation
const result = validateGameSave(savedData);
console.log('Validation result:', result ? 'SUCCESS - No null errors!' : 'FAILED - Still has null issues');

if (!result) {
  console.log('Failed validation. Checking for null values...');
  Object.entries(savedData).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      console.log(`Found ${value} for key: ${key}`);
    }
  });
}
