// Quick test to verify the Decimal conversion fix
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

// Test data that would cause NaN before the fix
const testData = {
  sips: new Decimal(1000),
  straws: new Decimal(5),
  cups: new Decimal(3),
  widerStraws: new Decimal(2),
  betterCups: new Decimal(1),
  suctions: new Decimal(3),
  criticalClicks: new Decimal(2),
  fasterDrinks: new Decimal(1),
  lastSaveTime: Date.now(),
  totalClicks: 150,
  level: 1
};

// Test the conversion function (simulating the fixed performSaveSnapshot)
function convertForSave(obj) {
  return {
    sips: String(obj.sips),
    straws: (obj.straws && typeof obj.straws.toNumber === 'function') ? obj.straws.toNumber() : Number(obj.straws || 0),
    cups: (obj.cups && typeof obj.cups.toNumber === 'function') ? obj.cups.toNumber() : Number(obj.cups || 0),
    widerStraws: String(obj.widerStraws || 0),
    betterCups: String(obj.betterCups || 0),
    suctions: String(obj.suctions || 0),
    criticalClicks: String(obj.criticalClicks || 0),
    fasterDrinks: String(obj.fasterDrinks || 0),
    lastSaveTime: obj.lastSaveTime,
    totalClicks: obj.totalClicks,
    level: obj.level
  };
}

const converted = convertForSave(testData);
console.log('Converted data:', converted);

// Test validation
const result = validateGameSave(converted);
console.log('Validation result:', result ? 'SUCCESS - No NaN errors!' : 'FAILED - Still has NaN issues');
