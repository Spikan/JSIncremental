// Final comprehensive error fix script
const fs = require('fs');

console.log('🔧 Starting comprehensive error fix...\n');

// 1. Fix the duplicate Decimal identifier issue in index.ts
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

// 2. Fix selector issues in zustand-store.ts
const selectorFile = 'ts/core/state/zustand-store.ts';
if (fs.existsSync(selectorFile)) {
  let content = fs.readFileSync(selectorFile, 'utf8');
  let originalContent = content;

  // Fix the selector functions - they should just return the value directly, not as identity functions
  content = content.replace(
    /\(value: number\) => value,/g,
    'value => value,'
  );

  // Fix the computed selector calls to pass the value parameter
  content = content.replace(
    /total: sips\(\) \+ straws\(\) \+ cups\(\) \+ suctions\(\)/g,
    'total: sips(state) + straws(state) + cups(state) + suctions(state)'
  );

  content = content.replace(
    /totalSPD: strawSPD\(\) \+ cupSPD\(\)/g,
    'totalSPD: strawSPD(state) + cupSPD(state)'
  );

  content = content.replace(
    /effectiveMultiplier: criticalClickMultiplier\(\) \+ suctionClickBonus\(\)/g,
    'effectiveMultiplier: criticalClickMultiplier(state) + suctionClickBonus(state)'
  );

  if (content !== originalContent) {
    fs.writeFileSync(selectorFile, content, 'utf8');
    console.log('✅ Fixed selector signatures in zustand-store.ts');
  }
}

// 3. Fix import path issues in main.ts
const mainFile = 'ts/main.ts';
if (fs.existsSync(mainFile)) {
  let content = fs.readFileSync(mainFile, 'utf8');
  let originalContent = content;

  // Fix the import path
  content = content.replace(
    /from '\.\.\/numbers\/large-number'/g,
    "from './core/numbers/large-number'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(mainFile, content, 'utf8');
    console.log('✅ Fixed import path in main.ts');
  }
}

// 4. Fix UI import paths (double-check)
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

    // Ensure import paths are correct
    if (content.includes("from '../numbers/")) {
      content = content.replace(/from '\.\.\/numbers\//g, "from '../../core/numbers/");
    }

    // Fix any spacing issues in imports
    content = content.replace(/import \{ toDecimal , gte\}/g, 'import { toDecimal, gte }');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Fixed imports in ' + filePath);
    }
  }
});

// 5. Fix migration-utils.ts type issues
const migrationUtilsFile = 'ts/core/numbers/migration-utils.ts';
if (fs.existsSync(migrationUtilsFile)) {
  let content = fs.readFileSync(migrationUtilsFile, 'utf8');
  let originalContent = content;

  // Fix the type assertion for the value parameter
  content = content.replace(
    /export function formatDecimal\(value: NumericValue\): string \{[\s\S]*?\}/g,
    `export function formatDecimal(value: NumericValue): string {
  if (isDecimal(value)) {
    return DecimalOps.format(value);
  }

  // Handle regular numbers
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

// 6. Clean up unused imports across files
const filesToClean = [
  'ts/core/rules/clicks.ts',
  'ts/core/state/mutations.ts',
  'ts/core/state/shape.ts',
  'ts/core/systems/purchases-system.ts',
  'ts/core/systems/resources.ts',
  'ts/ui/affordability.ts',
  'ts/ui/displays.ts',
  'ts/ui/utils.ts'
];

filesToClean.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove unused DecimalOps imports
    if (content.includes('DecimalOps') && !content.match(/DecimalOps\./)) {
      content = content.replace(/, DecimalOps/g, '');
      content = content.replace(/DecimalOps, /g, '');
      content = content.replace(/import \{ DecimalOps \} from [^;]+;\n/g, '');
    }

    // Remove unused isDecimal imports
    if (content.includes('isDecimal') && !content.match(/isDecimal\(/)) {
      content = content.replace(/, isDecimal/g, '');
      content = content.replace(/isDecimal, /g, '');
      content = content.replace(/import \{ isDecimal \} from [^;]+;\n/g, '');
    }

    // Remove unused Decimal imports
    if (content.includes('Decimal') && !content.match(/Decimal[^O]/) && !content.includes('DecimalOps')) {
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

// 7. Fix performance-utils.ts import
const perfFile = 'ts/core/numbers/performance-utils.ts';
if (fs.existsSync(perfFile)) {
  let content = fs.readFileSync(perfFile, 'utf8');
  let originalContent = content;

  // Fix the import to use the new API
  content = content.replace(
    /import \{ LargeNumber \} from '\.\/large-number'/g,
    "import { DecimalOps, Decimal } from './large-number'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(perfFile, content, 'utf8');
    console.log('✅ Fixed import in performance-utils.ts');
  }
}

// 8. Clean up migration script files (they have warnings)
const scriptFiles = [
  'ts/core/numbers/migrate-large-numbers.js',
  'ts/core/numbers/fix-syntax-errors.cjs',
  'ts/core/numbers/final-cleanup.cjs',
  'ts/core/numbers/final-fix.cjs'
];

scriptFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Add type annotations to fix warnings
    content = content.replace(
      /function migrateFile\(filePath\) \{/g,
      'function migrateFile(filePath: string) {'
    );

    // Remove unused variables
    content = content.replace(/const path = require\('path'\);\n/g, '');
    content = content.replace(/let totalChanges = 0;\n/g, '');

    // Fix error handling
    content = content.replace(
      /console\.error\(`❌ Error migrating \${filePath}:`, error\.message\);/g,
      "console.error(`❌ Error migrating ${filePath}:`, error);"
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Cleaned script file ' + filePath);
    }
  }
});

console.log('\n🎉 Comprehensive error fix completed! Run `npm run type-check` to verify.');
