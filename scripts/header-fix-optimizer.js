import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original CSS file
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Header-fixed CSS optimization - preserves exact header layout
function headerFixOptimizeCSS(css) {
  let optimized = css;
  
  // 1. Remove comments (biggest single win - 26KB)
  optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 2. Remove excessive whitespace (33KB potential)
  optimized = optimized
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Remove multiple empty lines
    .replace(/\s{3,}/g, ' ') // Replace 3+ spaces with single space
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/^\s+/gm, ''); // Remove leading whitespace
  
  // 3. Remove duplicate CSS rules but preserve ALL header-related rules exactly
  const rules = new Map();
  const ruleRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
  let match;
  
  // Critical selectors that should never be merged or modified
  const criticalSelectors = [
    '.game-header',
    '.header-main-content',
    '.level-indicator',
    '.currency-display',
    '.settings-cogwheel',
    '.header-drink-progress',
    '.level-box-clickable',
    '.level-number',
    '.level-label',
    '.level-text',
    '.level-up-info',
    '.cost-number',
    '.cost-currency',
    '.level-up-label',
    '.currency-display-compact',
    '.currency-primary',
    '.currency-secondary',
    '.currency-item-compact',
    '.currency-icon',
    '.currency-value',
    '.currency-value-small',
    '.drink-progress-row',
    '.drink-progress-info',
    '.drink-countdown',
    '.drink-progress-bar',
    '.faster-drinks-btn',
    '.settings-modal-header'
  ];
  
  while ((match = ruleRegex.exec(optimized)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();
    
    // Skip complex selectors, keyframes, media queries, and critical selectors
    if (selector.includes('@') || 
        selector.includes('/*') || 
        selector.includes(',') ||
        criticalSelectors.some(critical => selector.includes(critical))) {
      continue;
    }
    
    if (rules.has(selector)) {
      // Merge properties, removing duplicates
      const existing = rules.get(selector);
      const existingProps = existing.split(';').filter(p => p.trim());
      const newProps = properties.split(';').filter(p => p.trim());
      
      const allProps = [...existingProps, ...newProps];
      const uniqueProps = new Map();
      
      allProps.forEach(prop => {
        const trimmed = prop.trim();
        if (trimmed) {
          const propName = trimmed.split(':')[0]?.trim();
          if (propName) {
            uniqueProps.set(propName, trimmed);
          }
        }
      });
      
      rules.set(selector, Array.from(uniqueProps.values()).join('; '));
    } else {
      rules.set(selector, properties);
    }
  }
  
  // 4. Rebuild CSS - preserve ALL original rules for critical selectors
  let rebuiltCSS = '';
  
  // First, add ALL the critical rules from original CSS exactly as they are
  const criticalRules = [];
  const criticalRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
  let criticalMatch;
  
  while ((criticalMatch = criticalRegex.exec(css)) !== null) {
    const selector = criticalMatch[1].trim();
    const properties = criticalMatch[2].trim();
    
    if (criticalSelectors.some(critical => selector.includes(critical)) ||
        selector.includes('@media') ||
        selector.includes('@keyframes') ||
        selector.includes('@font-face') ||
        selector.includes('@import')) {
      criticalRules.push(`${selector} {\n  ${properties.replace(/;/g, ';\n  ')};\n}`);
    }
  }
  
  rebuiltCSS = criticalRules.join('\n\n') + '\n\n';
  
  // Then add the deduplicated rules
  rules.forEach((properties, selector) => {
    rebuiltCSS += `${selector} {\n  ${properties.replace(/;/g, ';\n  ')};\n}\n\n`;
  });
  
  // 5. Clean up formatting
  rebuiltCSS = rebuiltCSS
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Remove multiple empty lines
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/,\s+/g, ',') // Remove spaces after commas
    .replace(/:\s+/g, ':') // Remove spaces after colons
    .replace(/;\s+/g, ';') // Remove spaces after semicolons
    .replace(/\{\s+/g, '{') // Remove spaces after opening brace
    .replace(/\s+\}/g, '}'); // Remove spaces before closing brace
  
  return rebuiltCSS;
}

// Create minified version
function minifyCSS(css) {
  return css
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/,\s+/g, ',') // Remove spaces after commas
    .replace(/:\s+/g, ':') // Remove spaces after colons
    .replace(/;\s+/g, ';') // Remove spaces after semicolons
    .replace(/\{\s+/g, '{') // Remove spaces after opening brace
    .replace(/\s+\}/g, '}') // Remove spaces before closing brace
    .trim();
}

// Run header-fixed optimization
const optimizedCSS = headerFixOptimizeCSS(cssContent);
const minifiedCSS = minifyCSS(optimizedCSS);

// Write both versions
const outputPath = path.join(__dirname, '..', 'css', 'style-header-fixed.css');
const minifiedPath = path.join(__dirname, '..', 'css', 'style-header-fixed-minified.css');

fs.writeFileSync(outputPath, optimizedCSS);
fs.writeFileSync(minifiedPath, minifiedCSS);

console.log('Header-fixed CSS optimization complete!');
console.log(`Original size: ${cssContent.length} characters`);
console.log(`Optimized size: ${optimizedCSS.length} characters`);
console.log(`Minified size: ${minifiedCSS.length} characters`);
console.log(`Optimization reduction: ${((cssContent.length - optimizedCSS.length) / cssContent.length * 100).toFixed(1)}%`);
console.log(`Total reduction: ${((cssContent.length - minifiedCSS.length) / cssContent.length * 100).toFixed(1)}%`);
console.log(`Files saved to: ${outputPath} and ${minifiedPath}`);
