// Final comprehensive fix for remaining migration errors
const fs = require('fs');

console.log('🔧 Starting final comprehensive fix...\n');

// 1. Fix selector signatures - remove the extra 4th parameter
const selectorFile = 'ts/core/state/zustand-store.ts';
if (fs.existsSync(selectorFile)) {
  let content = fs.readFileSync(selectorFile, 'utf8');
  let originalContent = content;

  // Fix the createSelector calls that have 4 arguments instead of 3
  content = content.replace(
    /createSelector\(\s*\n\s*([^,]+),\s*\n\s*\(value: number\) => value,\s*\n\s*0,\s*\n\s*"([^"]+)"\s*\n\)/g,
    'createSelector(\n  $1,\n  (value: number) => value,\n  "$2"\n)'
  );

  // Fix the computed selector that tries to add functions
  content = content.replace(
    /total: sips \+ straws \+ cups \+ suctions/g,
    'total: sips() + straws() + cups() + suctions()'
  );

  content = content.replace(
    /totalSPD: strawSPD \+ cupSPD/g,
    'totalSPD: strawSPD() + cupSPD()'
  );

  content = content.replace(
    /effectiveMultiplier: criticalClickMultiplier \+ suctionClickBonus/g,
    'effectiveMultiplier: criticalClickMultiplier() + suctionClickBonus()'
  );

  if (content !== originalContent) {
    fs.writeFileSync(selectorFile, content, 'utf8');
    console.log('✅ Fixed selector signatures in zustand-store.ts');
  }
}

// 2. Fix import paths for UI files (they were already fixed but double-check)
const uiFiles = [
  'ts/ui/affordability.ts',
  'ts/ui/displays.ts',
  'ts/ui/stats.ts',
  'ts/ui/utils.ts'
];

uiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Double-check import paths are correct
    if (content.includes("from '../numbers/")) {
      content = content.replace(/from '\.\.\/numbers\//g, "from '../../core/numbers/");
      changes++;
    }

    // Fix function references that might still be wrong
    if (content.includes('formatLargeNumber')) {
      content = content.replace(/formatLargeNumber/g, 'formatDecimal');
      changes++;
    }

    if (content.includes('toLargeNumber')) {
      content = content.replace(/toLargeNumber/g, 'toDecimal');
      changes++;
    }

    if (content.includes('isLargeNumber')) {
      content = content.replace(/isLargeNumber/g, 'isDecimal');
      changes++;
    }

    // Add missing gte import if needed
    if (content.includes('gte(') && !content.includes("import { gte }")) {
      const importPattern = /import \{([^}]+)\} from ['"].*migration-utils['"]/;
      if (importPattern.test(content)) {
        content = content.replace(importPattern, (match, imports) => {
          if (!imports.includes('gte')) {
            return match.replace(imports, imports + ', gte');
          }
          return match;
        });
        changes++;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ ' + filePath + ': ' + changes + ' additional fixes made');
    }
  }
});

// 3. Fix missing DecimalOps imports in files that need it
const filesNeedingDecimalOps = [
  'ts/core/systems/drink-system.ts',
  'ts/core/systems/save-game-loader.ts',
  'ts/main.ts'
];

filesNeedingDecimalOps.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Add DecimalOps import if DecimalOps is used but not imported
    if (content.includes('DecimalOps.') && !content.includes("import { DecimalOps }")) {
      // Find a good place to add the import (after existing imports)
      const importMatch = content.match(/import.*from.*;\n/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const insertPoint = content.indexOf(lastImport) + lastImport.length;
        const importStatement = "import { DecimalOps } from '../numbers/large-number';\n";
        content = content.slice(0, insertPoint) + importStatement + content.slice(insertPoint);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ ' + filePath + ': Added missing DecimalOps import');
      }
    }
  }
});

// 4. Fix the index.ts file - remove duplicate Decimal export
const indexFile = 'ts/core/numbers/index.ts';
if (fs.existsSync(indexFile)) {
  let content = fs.readFileSync(indexFile, 'utf8');
  let originalContent = content;

  // Remove the duplicate Decimal type export
  content = content.replace(/export type \{ Decimal \} from '\.\/large-number';\n/g, '');

  // Fix the Numbers object to properly export the imported values
  const exportPattern = /export const Numbers = \{[\s\S]*?\};/;
  content = content.replace(exportPattern, `export const Numbers = {
  // Direct Decimal operations
  DecimalOps,
  Decimal,
  isDecimal,

  // Migration utilities (with legacy aliases)
  toDecimal,
  toNumber,
  formatDecimal,

  // Comparison utilities
  gte,
  gt,
  lte,
  lt,
  eq,

  // Arithmetic utilities
  add,
  subtract,
  multiply,
  divide,
  pow,

  // Legacy aliases
  toLargeNumber,
  isLargeNumber,
};`);

  if (content !== originalContent) {
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('✅ Fixed index.ts exports and removed duplicates');
  }
}

console.log('\n🎉 Final comprehensive fix completed! Run `npm run type-check` to verify.');
