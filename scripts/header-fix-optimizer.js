import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original CSS file
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

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
  '.settings-modal-header',
];

function compactWhitespace(css) {
  return css
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/\s{3,}/g, ' ')
    .replace(/\s+$/gm, '')
    .replace(/^\s+/gm, '');
}

function isCriticalSelector(selector) {
  return criticalSelectors.some(critical => selector.includes(critical));
}

function collectDeduplicatedRules(css) {
  const rules = new Map();
  const ruleRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();

    if (
      selector.includes('@') ||
      selector.includes('/*') ||
      selector.includes(',') ||
      isCriticalSelector(selector)
    ) {
      continue;
    }

    if (rules.has(selector)) {
      mergeRuleProperties(rules, selector, properties);
      continue;
    }

    rules.set(selector, properties);
  }

  return rules;
}

function mergeRuleProperties(rules, selector, properties) {
  const existing = rules.get(selector);
  const existingProps = existing.split(';').filter(p => p.trim());
  const newProps = properties.split(';').filter(p => p.trim());
  const allProps = [...existingProps, ...newProps];
  const uniqueProps = new Map();

  allProps.forEach(prop => {
    const trimmed = prop.trim();
    if (!trimmed) {
      return;
    }

    const propName = trimmed.split(':')[0]?.trim();
    if (propName) {
      uniqueProps.set(propName, trimmed);
    }
  });

  rules.set(selector, Array.from(uniqueProps.values()).join('; '));
}

function collectCriticalRules(css) {
  const criticalRules = [];
  const criticalRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
  let criticalMatch;

  while ((criticalMatch = criticalRegex.exec(css)) !== null) {
    const selector = criticalMatch[1].trim();
    const properties = criticalMatch[2].trim();

    if (
      isCriticalSelector(selector) ||
      selector.includes('@media') ||
      selector.includes('@keyframes') ||
      selector.includes('@font-face') ||
      selector.includes('@import')
    ) {
      criticalRules.push(`${selector} {\n  ${properties.replace(/;/g, ';\n  ')};\n}`);
    }
  }

  return criticalRules;
}

function rebuildCSS(css, rules) {
  const criticalRules = collectCriticalRules(css);
  let rebuiltCSS = `${criticalRules.join('\n\n')}\n\n`;

  rules.forEach((properties, selector) => {
    rebuiltCSS += `${selector} {\n  ${properties.replace(/;/g, ';\n  ')};\n}\n\n`;
  });

  return rebuiltCSS;
}

function normalizeCSSFormatting(css) {
  return css
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/\s+$/gm, '')
    .replace(/;\s*}/g, '}')
    .replace(/,\s+/g, ',')
    .replace(/:\s+/g, ':')
    .replace(/;\s+/g, ';')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}');
}

// Header-fixed CSS optimization - preserves exact header layout
function headerFixOptimizeCSS(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const compactedCSS = compactWhitespace(withoutComments);
  const rules = collectDeduplicatedRules(compactedCSS);
  const rebuiltCSS = rebuildCSS(css, rules);
  return normalizeCSSFormatting(rebuiltCSS);
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
console.log(
  `Optimization reduction: ${(((cssContent.length - optimizedCSS.length) / cssContent.length) * 100).toFixed(1)}%`
);
console.log(
  `Total reduction: ${(((cssContent.length - minifiedCSS.length) / cssContent.length) * 100).toFixed(1)}%`
);
console.log(`Files saved to: ${outputPath} and ${minifiedPath}`);
