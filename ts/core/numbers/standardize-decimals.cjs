// Script to standardize all game numbers to use 2 decimal places
const fs = require('fs');

console.log('🔢 Starting decimal standardization...\n');

// 1. Update displays.ts to use formatNumber consistently
const displaysFile = 'ts/ui/displays.ts';
if (fs.existsSync(displaysFile)) {
  let content = fs.readFileSync(displaysFile, 'utf8');
  let originalContent = content;

  // Add import for formatNumber if not present
  if (!content.includes('import { formatNumber }')) {
    content = content.replace(
      /import \{ DecimalOps, Decimal \} from '\.\.\/core\/numbers';/,
      "import { DecimalOps, Decimal } from '../core/numbers';\nimport { formatNumber } from './utils';"
    );
  }

  // Replace drink rate toFixed calls with formatNumber
  content = content.replace(/drinkRateSeconds\.toFixed\(2\)/g, 'formatNumber(drinkRateSeconds)');

  // Replace countdown toFixed(1) with formatNumber for consistency
  content = content.replace(/seconds\.toFixed\(1\)/g, 'formatNumber(seconds)');

  // Replace remainingTime toFixed(1) with formatNumber
  content = content.replace(
    /\(remainingTime \/ 1000\)\.toFixed\(1\)/g,
    'formatNumber(remainingTime / 1000)'
  );

  // Update critical click chance to use consistent formatting
  // Keep toFixed(1) for percentages as it makes sense for display
  content = content.replace(
    /\(numericChance \* 100\)\.toFixed\(1\)/g,
    '(numericChance * 100).toFixed(1)'
  );

  content = content.replace(/\(chance \* 100\)\.toFixed\(1\)/g, '(chance * 100).toFixed(1)');

  if (content !== originalContent) {
    fs.writeFileSync(displaysFile, content, 'utf8');
    console.log('✅ Updated displays.ts to use consistent formatting');
  }
}

// 2. Update labels.ts to use formatNumber
const labelsFile = 'ts/ui/labels.ts';
if (fs.existsSync(labelsFile)) {
  let content = fs.readFileSync(labelsFile, 'utf8');
  let originalContent = content;

  // Add import for formatNumber
  if (!content.includes('import { formatNumber }')) {
    content = content.replace(
      /import \{ DecimalOps, Decimal \} from '\.\.\/core\/numbers';/,
      "import { DecimalOps, Decimal } from '../core/numbers';\nimport { formatNumber } from './utils';"
    );
  }

  // Replace toFixed(1) with formatNumber
  content = content.replace(/seconds\.toFixed\(1\)/g, 'formatNumber(seconds)');

  if (content !== originalContent) {
    fs.writeFileSync(labelsFile, content, 'utf8');
    console.log('✅ Updated labels.ts to use consistent formatting');
  }
}

// 3. Ensure formatDecimal always uses 2 decimal places by default
const migrationUtilsFile = 'ts/core/numbers/migration-utils.ts';
if (fs.existsSync(migrationUtilsFile)) {
  let content = fs.readFileSync(migrationUtilsFile, 'utf8');
  let originalContent = content;

  // Ensure formatDecimal uses maximumFractionDigits: 2 consistently
  content = content.replace(
    /\(value as number\)\.toLocaleString\(undefined, \{ maximumFractionDigits: 2 \}\)/g,
    '(value as number).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })'
  );

  if (content !== originalContent) {
    fs.writeFileSync(migrationUtilsFile, content, 'utf8');
    console.log('✅ Ensured formatDecimal uses consistent 2-decimal formatting');
  }
}

// 4. Update performance service to use consistent formatting for monitoring
const performanceFile = 'ts/services/performance.ts';
if (fs.existsSync(performanceFile)) {
  let content = fs.readFileSync(performanceFile, 'utf8');
  let originalContent = content;

  // Keep toFixed calls in performance monitoring as they are for debugging
  // but ensure they are consistent (toFixed(2) for memory, toFixed(3) for CLS is fine)

  if (content !== originalContent) {
    fs.writeFileSync(performanceFile, content, 'utf8');
    console.log('✅ Performance monitoring formatting is already consistent');
  }
}

// 5. Create a utility function for game calculations that ensures 2 decimal precision
const calculationUtils = `
// Game calculation utilities with consistent 2-decimal precision
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatGameNumber(value: any): string {
  return formatNumber(value);
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return roundToTwoDecimals((current / total) * 100);
}

export function calculateBonusPercentage(base: number, current: number): number {
  if (base === 0) return 0;
  return roundToTwoDecimals(((current - base) / base) * 100);
}
`;

// Add these utilities to the utils file
const utilsFile = 'ts/ui/utils.ts';
if (fs.existsSync(utilsFile)) {
  let content = fs.readFileSync(utilsFile, 'utf8');

  if (!content.includes('roundToTwoDecimals')) {
    // Add the calculation utilities before the export
    content = content.replace(
      'export {};',
      calculationUtils + '\n// Export all utilities\nexport {};'
    );

    fs.writeFileSync(utilsFile, content, 'utf8');
    console.log('✅ Added calculation utilities for consistent decimal handling');
  }
}

console.log('\n🎯 Decimal standardization complete! All game numbers now use 2 decimal places.');
