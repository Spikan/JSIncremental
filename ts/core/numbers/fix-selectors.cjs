// Fix selector signatures in zustand-store.ts
const fs = require('fs');

const filePath = 'ts/core/state/zustand-store.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all single-line selectors that are missing the third argument
content = content.replace(
  /export const use(\w+) = createSelector\(state => ([^,]+), '(\w+)'\);/g,
  "export const use$1 = createSelector(\n  state => $2,\n  (value) => value,\n  '$3'\n);"
);

// Fix multi-line selectors that are missing the third argument
content = content.replace(
  /export const use(\w+) = createSelector\(\n  ([^,]+),\n  '(\w+)'\n\);/g,
  "export const use$1 = createSelector(\n  $2,\n  (value) => value,\n  '$3'\n);"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed selector signatures in zustand-store.ts');
