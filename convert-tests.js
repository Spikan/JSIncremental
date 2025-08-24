#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common type declarations that might be needed across tests
const commonTypes = `
declare global {
  var window: {
    App?: any;
    Decimal?: any;
    localStorage?: Storage;
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  };
  var document: {
    getElementById?: (id: string) => HTMLElement | null;
    querySelector?: (selectors: string) => Element | null;
    addEventListener?: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  };
  var console: {
    log?: (...data: any[]) => void;
    warn?: (...data: any[]) => void;
    error?: (...data: any[]) => void;
  };
}
`;

// Get all .js test files
const testDir = path.join(__dirname, 'tests');
const testFiles = fs.readdirSync(testDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(testDir, file));

console.log(`Found ${testFiles.length} test files to convert:`);
testFiles.forEach(file => console.log(`  - ${path.basename(file)}`));

testFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has type declarations or imports that suggest it's already converted
  if (content.includes('declare global') || content.includes(': ')) {
    console.log(`Skipping ${path.basename(filePath)} - already has type info`);
    return;
  }

  // Add common type declarations after imports
  const lines = content.split('\n');
  let insertIndex = 0;

  // Find the first non-import, non-comment, non-empty line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('import') && !line.startsWith('//') && !line.startsWith('/*') && line !== '') {
      insertIndex = i;
      break;
    }
  }

  // Insert type declarations
  lines.splice(insertIndex, 0, '', commonTypes, '');

  // Write the updated content
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent);

  // Rename file to .ts
  const newPath = filePath.replace('.js', '.ts');
  fs.renameSync(filePath, newPath);

  console.log(`Converted ${path.basename(filePath)} → ${path.basename(newPath)}`);
});

console.log('\nConversion complete! Run "npm run typecheck" to verify TypeScript compilation.');
