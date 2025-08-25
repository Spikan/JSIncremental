// Migration script to convert LargeNumber to direct Decimal operations
// Run this script to systematically update all LargeNumber references

const fs = require('fs');
const path = require('path');

// Files that need migration (based on grep results)
const filesToMigrate = [
  'ts/ui/stats.ts',
  'ts/core/systems/dev.ts',
  'ts/ui/affordability.ts',
  'ts/core/systems/purchases-system.ts',
  'ts/ui/utils.ts',
  'ts/ui/displays.ts',
  'ts/core/systems/clicks-system.ts',
  'ts/main.ts',
  'ts/core/numbers/test-large-number.ts',
  'ts/core/state/mutations.ts',
  'ts/core/numbers/migration-utils.ts',
  'ts/core/state/shape.ts',
  'ts/core/state/zustand-store.ts',
  'ts/core/numbers/index.ts',
  'ts/core/rules/clicks.ts',
  'ts/core/systems/resources.ts',
  'ts/core/state/bridge.ts',
  'ts/core/rules/purchases.ts',
  'ts/core/systems/drink-system.ts',
  'ts/core/systems/save-game-loader.ts',
];

// Migration patterns
const migrationPatterns = [
  // Import statements
  {
    pattern: /import \{ LargeNumber \} from ['"].*large-number['"]/g,
    replacement: "import { DecimalOps, Decimal } from '../numbers/large-number'",
  },
  {
    pattern: /import \{.*toLargeNumber.*\} from ['"].*migration-utils['"]/g,
    replacement: "import { toDecimal } from '../numbers/migration-utils'",
  },
  {
    pattern: /import \{.*LargeNumber.*\} from ['"].*migration-utils['"]/g,
    replacement: "import { DecimalOps, Decimal } from '../numbers/large-number'",
  },

  // Type annotations
  {
    pattern: /number \| LargeNumber/g,
    replacement: 'number | Decimal',
  },
  {
    pattern: /LargeNumber \| number/g,
    replacement: 'Decimal | number',
  },
  {
    pattern: /LargeNumber/g,
    replacement: 'Decimal',
  },

  // Constructor calls
  {
    pattern: /new LargeNumber\(([^)]+)\)/g,
    replacement: 'DecimalOps.create($1)',
  },

  // Common arithmetic patterns
  {
    pattern: /\.add\(new LargeNumber\(([^)]+)\)\)/g,
    replacement: '.add(DecimalOps.create($1))',
  },
  {
    pattern: /\.subtract\(new LargeNumber\(([^)]+)\)\)/g,
    replacement: '.subtract(DecimalOps.create($1))',
  },
  {
    pattern: /\.multiply\(new LargeNumber\(([^)]+)\)\)/g,
    replacement: '.multiply(DecimalOps.create($1))',
  },
  {
    pattern: /\.divide\(new LargeNumber\(([^)]+)\)\)/g,
    replacement: '.divide(DecimalOps.create($1))',
  },

  // Function calls
  {
    pattern: /toLargeNumber\(/g,
    replacement: 'toDecimal(',
  },
  {
    pattern: /\.toNumber\(\)/g,
    replacement: 'DecimalOps.toSafeNumber(',
  },

  // Static method calls
  {
    pattern: /LargeNumber\.from\(/g,
    replacement: 'DecimalOps.create(',
  },
  {
    pattern: /LargeNumber\.add\(/g,
    replacement: 'DecimalOps.add(',
  },
  {
    pattern: /LargeNumber\.subtract\(/g,
    replacement: 'DecimalOps.subtract(',
  },
  {
    pattern: /LargeNumber\.multiply\(/g,
    replacement: 'DecimalOps.multiply(',
  },
  {
    pattern: /LargeNumber\.divide\(/g,
    replacement: 'DecimalOps.divide(',
  },
];

function migrateFile(filePath) {
  try {
    console.log(`Migrating ${filePath}...`);

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changesMade = 0;

    // Apply each migration pattern
    migrationPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        changesMade += matches.length;
      }
    });

    // Special handling for comparison methods that need DecimalOps.create
    content = content.replace(/(\.gte|\.lte|\.gt|\.lt|\.eq)\(([^)]+)\)/g, (match, method, args) => {
      // Only wrap with DecimalOps.create if args don't already contain it
      if (!args.includes('DecimalOps.create') && !args.includes('new Decimal')) {
        return `${method}(DecimalOps.create(${args}))`;
      }
      return match;
    });

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: ${changesMade} changes made`);
      return true;
    } else {
      console.log(`ℹ️  ${filePath}: No changes needed`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function runMigration() {
  console.log('🚀 Starting LargeNumber to Decimal migration...\n');

  let totalFiles = 0;
  let changedFiles = 0;
  let totalChanges = 0;

  filesToMigrate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      totalFiles++;
      const changes = migrateFile(filePath);
      if (changes) {
        changedFiles++;
      }
    } else {
      console.log(`⚠️  ${filePath}: File not found`);
    }
  });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files changed: ${changedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - changedFiles}`);

  if (changedFiles > 0) {
    console.log('\n✅ Migration completed! Please run type-check to verify.');
  } else {
    console.log('\nℹ️  All files are already up to date.');
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { migrateFile, runMigration };
