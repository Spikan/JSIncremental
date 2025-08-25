// Automated script to fix remaining migration syntax errors
const fs = require('fs');

const files = [
  'ts/core/systems/clicks-system.ts',
  'ts/core/systems/dev.ts',
  'ts/core/systems/drink-system.ts',
  'ts/core/systems/purchases-system.ts',
  'ts/main.ts',
  'ts/ui/utils.ts',
  'ts/core/numbers/test-large-number.ts',
  'ts/core/systems/save-game-loader.ts',
];

console.log('🔧 Starting targeted syntax fix...\n');

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Fix pattern: DecimalOps.toSafeNumber(variable)value) -> DecimalOps.toSafeNumber(variable)
    const pattern1 = /DecimalOps\.toSafeNumber\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)value\)/g;
    const pattern1Matches = (content.match(pattern1) || []).length;
    content = content.replace(pattern1, 'DecimalOps.toSafeNumber($1)');
    changes += pattern1Matches;

    // Fix pattern: DecimalOps.toSafeNumber(variable)value)) -> DecimalOps.toSafeNumber(variable))
    const pattern2 = /DecimalOps\.toSafeNumber\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)value\)\)/g;
    const pattern2Matches = (content.match(pattern2) || []).length;
    content = content.replace(pattern2, 'DecimalOps.toSafeNumber($1))');
    changes += pattern2Matches;

    // Fix pattern: DecimalOps.toSafeNumber(variable)value) -> DecimalOps.toSafeNumber(variable)
    const pattern3 = /DecimalOps\.toSafeNumber\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)value\)/g;
    const pattern3Matches = (content.match(pattern3) || []).length;
    content = content.replace(pattern3, 'DecimalOps.toSafeNumber($1)');
    changes += pattern3Matches;

    // Fix pattern: DecimalOps.toSafeNumber(v)value) -> DecimalOps.toSafeNumber(v)
    const pattern4 = /DecimalOps\.toSafeNumber\(v\)value\)/g;
    const pattern4Matches = (content.match(pattern4) || []).length;
    content = content.replace(pattern4, 'DecimalOps.toSafeNumber(v)');
    changes += pattern4Matches;

    // Fix pattern: variableDecimalOps.toSafeNumber( -> DecimalOps.toSafeNumber(variable)
    const pattern5 = /([a-zA-Z_$][a-zA-Z0-9_$]*)DecimalOps\.toSafeNumber\(/g;
    const pattern5Matches = (content.match(pattern5) || []).length;
    content = content.replace(pattern5, 'DecimalOps.toSafeNumber($1');
    changes += pattern5Matches;

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(
        '✅ ' +
          filePath +
          ': ' +
          changes +
          ' changes made (' +
          pattern1Matches +
          ' p1, ' +
          pattern2Matches +
          ' p2, ' +
          pattern3Matches +
          ' p3, ' +
          pattern4Matches +
          ' p4, ' +
          pattern5Matches +
          ' p5)'
      );
    } else {
      console.log('ℹ️  ' + filePath + ': No changes needed');
    }
  } else {
    console.log('⚠️  ' + filePath + ': File not found');
  }
});

console.log('\n🎉 Targeted syntax fix completed!');
