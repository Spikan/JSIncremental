// Final cleanup script to fix remaining migration errors
const fs = require('fs');

// Fix import paths in UI files
const uiFiles = [
  'ts/ui/affordability.ts',
  'ts/ui/displays.ts',
  'ts/ui/stats.ts',
  'ts/ui/utils.ts'
];

console.log('🔧 Starting final cleanup...\n');

// Fix import paths
uiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Fix import paths
    if (content.includes("from '../numbers/migration-utils'")) {
      content = content.replace(
        /from '\.\.\/numbers\/migration-utils'/g,
        "from '../../core/numbers/migration-utils'"
      );
      changes++;
    }

    if (content.includes("from '../numbers/large-number'")) {
      content = content.replace(
        /from '\.\.\/numbers\/large-number'/g,
        "from '../../core/numbers/large-number'"
      );
      changes++;
    }

    // Fix function references
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

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ ' + filePath + ': ' + changes + ' changes made');
    } else {
      console.log('ℹ️  ' + filePath + ': No changes needed');
    }
  } else {
    console.log('⚠️  ' + filePath + ': File not found');
  }
});

// Fix missing imports in core files
const coreFiles = [
  'ts/core/systems/dev.ts',
  'ts/core/state/zustand-store.ts'
];

coreFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Add missing import for 'add' function
    if (content.includes('add(') && !content.includes("import { add }")) {
      // Find the migration-utils import line and add 'add' to it
      const importPattern = /import \{([^}]+)\} from ['"].*migration-utils['"]/;
      if (importPattern.test(content)) {
        content = content.replace(importPattern, (match, imports) => {
          if (!imports.includes('add')) {
            return match.replace(imports, imports + ', add');
          }
          return match;
        });
        changes++;
      }
    }

    // Add missing import for 'gte' function
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
      console.log('✅ ' + filePath + ': ' + changes + ' imports added');
    } else {
      console.log('ℹ️  ' + filePath + ': No import changes needed');
    }
  } else {
    console.log('⚠️  ' + filePath + ': File not found');
  }
});

// Fix selector signatures that still need work
const selectorFile = 'ts/core/state/zustand-store.ts';
if (fs.existsSync(selectorFile)) {
  let content = fs.readFileSync(selectorFile, 'utf8');
  let originalContent = content;

  // Fix the identity function signature issue - replace (value) => value with proper type
  content = content.replace(
    /\(value\) => value,/g,
    '(value: number) => value,'
  );

  // Fix createSelector calls that might be missing the third parameter
  content = content.replace(
    /createSelector\(\s*\n\s*([^,]+),\s*\n\s*\(value: number\) => value,\s*\n\s*'([^']+)'\s*\n\)/g,
    'createSelector(\n  $1,\n  (value: number) => value,\n  0,\n  "$2"\n)'
  );

  if (content !== originalContent) {
    fs.writeFileSync(selectorFile, content, 'utf8');
    console.log('✅ ' + selectorFile + ': Fixed selector signatures');
  } else {
    console.log('ℹ️  ' + selectorFile + ': No selector changes needed');
  }
}

console.log('\n🎉 Final cleanup completed! Run `npm run type-check` to verify.');
