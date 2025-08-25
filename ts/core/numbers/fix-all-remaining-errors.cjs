// Comprehensive script to fix all remaining TypeScript errors
const fs = require('fs');

console.log('🔧 Starting comprehensive error elimination...\n');

// 1. Fix duplicate Decimal identifier in index.ts
const indexFile = 'ts/core/numbers/index.ts';
if (fs.existsSync(indexFile)) {
  let content = fs.readFileSync(indexFile, 'utf8');
  let originalContent = content;

  // Remove the duplicate type export line
  content = content.replace(/export type \{ Decimal \} from '\.\/large-number';\n/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('✅ Fixed duplicate Decimal identifier in index.ts');
  }
}

// 2. Fix selector signatures in zustand-store.ts
const selectorFile = 'ts/core/state/zustand-store.ts';
if (fs.existsSync(selectorFile)) {
  let content = fs.readFileSync(selectorFile, 'utf8');
  let originalContent = content;

  // Fix the selector functions to have proper type annotations
  content = content.replace(/  value => value,/g, '  (value: number) => value,');

  // Fix the computed selector calls to use proper function references
  content = content.replace(
    /total: sips\(state\) \+ straws\(state\) \+ cups\(state\) \+ suctions\(state\),/g,
    'total: (state) => sips(state) + straws(state) + cups(state) + suctions(state),'
  );

  content = content.replace(
    /totalSPD: strawSPD\(state\) \+ cupSPD\(state\),/g,
    'totalSPD: (state) => strawSPD(state) + cupSPD(state),'
  );

  content = content.replace(
    /effectiveMultiplier: criticalClickMultiplier\(state\) \+ suctionClickBonus\(state\),/g,
    'effectiveMultiplier: (state) => criticalClickMultiplier(state) + suctionClickBonus(state),'
  );

  if (content !== originalContent) {
    fs.writeFileSync(selectorFile, content, 'utf8');
    console.log('✅ Fixed selector signatures in zustand-store.ts');
  }
}

// 3. Fix import paths in UI files
const uiFiles = ['ts/ui/affordability.ts', 'ts/ui/displays.ts', 'ts/ui/stats.ts', 'ts/ui/utils.ts'];

uiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix import paths - these should work with the current structure
    if (content.includes("from '../../core/numbers/")) {
      // The paths should actually be correct, but let's double-check
      // If there are issues, it might be a TypeScript resolution problem
      // Let's ensure the imports are from the index file instead
      content = content.replace(
        /from '\.\.\/\.\.\/core\/numbers\/large-number'/g,
        "from '../../core/numbers'"
      );
      content = content.replace(
        /from '\.\.\/\.\.\/core\/numbers\/migration-utils'/g,
        "from '../../core/numbers'"
      );
    }

    // Remove unused Decimal import from utils.ts
    if (filePath.includes('utils.ts')) {
      content = content.replace(
        /import \{ DecimalOps, Decimal \} from '\.\.\/\.\.\/core\/numbers\/large-number';/g,
        "import { DecimalOps } from '../../core/numbers';"
      );
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Fixed imports in ' + filePath);
    }
  }
});

// 4. Fix unused match parameters in large-number.ts
const largeNumberFile = 'ts/core/numbers/large-number.ts';
if (fs.existsSync(largeNumberFile)) {
  let content = fs.readFileSync(largeNumberFile, 'utf8');
  let originalContent = content;

  // Replace unused match parameters with underscore
  content = content.replace(/\(match, arg\) =>/g, '(_match, arg) =>');

  content = content.replace(/\(match, after\) =>/g, '(_match, after) =>');

  content = content.replace(/\(match\) =>/g, '(_match) =>');

  if (content !== originalContent) {
    fs.writeFileSync(largeNumberFile, content, 'utf8');
    console.log('✅ Fixed unused parameters in large-number.ts');
  }
}

// 5. Fix type issues in migration-utils.ts
const migrationUtilsFile = 'ts/core/numbers/migration-utils.ts';
if (fs.existsSync(migrationUtilsFile)) {
  let content = fs.readFileSync(migrationUtilsFile, 'utf8');
  let originalContent = content;

  // Fix the type assertion issue by using proper type guards
  content = content.replace(
    /export function formatDecimal\(value: NumericValue\): string \{[\s\S]*?\}/g,
    `export function formatDecimal(value: NumericValue): string {
  if (isDecimal(value)) {
    return DecimalOps.format(value);
  }

  // Handle regular numbers with proper type checking
  if (typeof value === 'number') {
    if (value >= 1e6 || value <= -1e6) {
      return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return String(value || 0);
}`
  );

  if (content !== originalContent) {
    fs.writeFileSync(migrationUtilsFile, content, 'utf8');
    console.log('✅ Fixed type issues in migration-utils.ts');
  }
}

// 6. Clean up unused variables in migration script
const migrateScript = 'ts/core/numbers/migrate-large-numbers.js';
if (fs.existsSync(migrateScript)) {
  let content = fs.readFileSync(migrateScript, 'utf8');
  let originalContent = content;

  // Remove unused path import
  content = content.replace(/const path = require\('path'\);\n/g, '');

  // Remove unused totalChanges variable
  content = content.replace(/let totalChanges = 0;\n/g, '');

  // Remove reference to totalChanges
  content = content.replace(/totalChanges \+= /g, '');

  // Fix parameter type annotation (remove it since it's JS)
  content = content.replace(
    /function migrateFile\(filePath: string\) \{/g,
    'function migrateFile(filePath) {'
  );

  if (content !== originalContent) {
    fs.writeFileSync(migrateScript, content, 'utf8');
    console.log('✅ Cleaned up migration script');
  }
}

// 7. Clean up any remaining unused imports across core files
const coreFiles = [
  'ts/core/rules/clicks.ts',
  'ts/core/state/mutations.ts',
  'ts/core/state/shape.ts',
  'ts/core/systems/purchases-system.ts',
  'ts/core/systems/resources.ts',
];

coreFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove unused imports
    if (content.includes('DecimalOps') && !content.match(/DecimalOps\./)) {
      content = content.replace(/, DecimalOps/g, '');
      content = content.replace(/DecimalOps, /g, '');
      content = content.replace(/import \{ DecimalOps \} from [^;]+;\n/g, '');
    }

    if (content.includes('isDecimal') && !content.match(/isDecimal\(/)) {
      content = content.replace(/, isDecimal/g, '');
      content = content.replace(/isDecimal, /g, '');
      content = content.replace(/import \{ isDecimal \} from [^;]+;\n/g, '');
    }

    if (
      content.includes('Decimal') &&
      !content.match(/Decimal[^O]/) &&
      !content.includes('DecimalOps')
    ) {
      content = content.replace(/, Decimal/g, '');
      content = content.replace(/Decimal, /g, '');
      content = content.replace(/import \{ Decimal \} from [^;]+;\n/g, '');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Cleaned unused imports in ' + filePath);
    }
  }
});

console.log('\n🎯 All errors should now be eliminated! Run `npm run type-check` to verify.');
