import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original CSS file
const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Analyze CSS file
function analyzeCSS(css) {
  const analysis = {
    totalLines: css.split('\n').length,
    totalCharacters: css.length,
    mediaQueries: [],
    cssVariables: [],
    duplicateValues: {},
    unusedVariables: [],
    optimizationOpportunities: []
  };
  
  // Find all media queries
  const mediaRegex = /@media\s*\(([^)]+)\)\s*\{/g;
  let match;
  while ((match = mediaRegex.exec(css)) !== null) {
    analysis.mediaQueries.push(match[1].trim());
  }
  
  // Find all CSS variables
  const variableRegex = /--[a-zA-Z0-9-]+:\s*[^;]+;/g;
  const variables = css.match(variableRegex) || [];
  analysis.cssVariables = variables.map(v => v.trim());
  
  // Find duplicate values
  const colorRegex = /#[0-9a-fA-F]{3,6}/g;
  const colors = css.match(colorRegex) || [];
  const colorCounts = {};
  colors.forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count > 3) {
      analysis.duplicateValues[color] = count;
    }
  });
  
  // Find font-size duplicates
  const fontSizeRegex = /font-size:\s*([0-9.]+rem)/g;
  const fontSizes = css.match(fontSizeRegex) || [];
  const fontSizeCounts = {};
  fontSizes.forEach(size => {
    const value = size.match(/([0-9.]+rem)/)[1];
    fontSizeCounts[value] = (fontSizeCounts[value] || 0) + 1;
  });
  
  Object.entries(fontSizeCounts).forEach(([size, count]) => {
    if (count > 2) {
      analysis.duplicateValues[size] = count;
    }
  });
  
  // Find padding/margin duplicates
  const spacingRegex = /(padding|margin):\s*([0-9.]+rem)/g;
  const spacing = css.match(spacingRegex) || [];
  const spacingCounts = {};
  spacing.forEach(space => {
    const value = space.match(/([0-9.]+rem)/)[1];
    spacingCounts[value] = (spacingCounts[value] || 0) + 1;
  });
  
  Object.entries(spacingCounts).forEach(([space, count]) => {
    if (count > 3) {
      analysis.duplicateValues[space] = count;
    }
  });
  
  // Check for unused variables
  analysis.cssVariables.forEach(variable => {
    const varName = variable.split(':')[0].trim();
    const usageRegex = new RegExp(`var\\(${varName}\\)`, 'g');
    const usage = css.match(usageRegex) || [];
    if (usage.length === 0) {
      analysis.unusedVariables.push(varName);
    }
  });
  
  // Calculate optimization opportunities
  const totalDuplicates = Object.values(analysis.duplicateValues).reduce((sum, count) => sum + count, 0);
  const unusedVarCount = analysis.unusedVariables.length;
  const mediaQueryCount = analysis.mediaQueries.length;
  
  analysis.optimizationOpportunities = [
    `Remove ${unusedVarCount} unused CSS variables`,
    `Consolidate ${mediaQueryCount} media queries`,
    `Replace ${totalDuplicates} duplicate values with variables`,
    `Remove redundant CSS rules`,
    `Optimize selector specificity`
  ];
  
  return analysis;
}

// Run analysis
const analysis = analyzeCSS(cssContent);

console.log('CSS Analysis Results:');
console.log('====================');
console.log(`Total lines: ${analysis.totalLines}`);
console.log(`Total characters: ${analysis.totalCharacters.toLocaleString()}`);
console.log(`Media queries: ${analysis.mediaQueries.length}`);
console.log(`CSS variables: ${analysis.cssVariables.length}`);
console.log(`Unused variables: ${analysis.unusedVariables.length}`);
console.log('\nDuplicate values:');
Object.entries(analysis.duplicateValues).forEach(([value, count]) => {
  console.log(`  ${value}: ${count} times`);
});
console.log('\nUnused variables:');
analysis.unusedVariables.forEach(variable => {
  console.log(`  ${variable}`);
});
console.log('\nOptimization opportunities:');
analysis.optimizationOpportunities.forEach(opportunity => {
  console.log(`  - ${opportunity}`);
});

// Calculate potential savings
const estimatedSavings = {
  unusedVariables: analysis.unusedVariables.length * 50, // ~50 chars per variable
  duplicateValues: Object.values(analysis.duplicateValues).reduce((sum, count) => sum + (count - 1) * 20, 0), // ~20 chars per duplicate
  mediaQueryConsolidation: analysis.mediaQueries.length * 30, // ~30 chars per media query
  whitespaceOptimization: analysis.totalCharacters * 0.05 // 5% from whitespace
};

const totalEstimatedSavings = Object.values(estimatedSavings).reduce((sum, savings) => sum + savings, 0);
const percentageSavings = (totalEstimatedSavings / analysis.totalCharacters * 100).toFixed(1);

console.log('\nEstimated optimization potential:');
console.log(`Unused variables: ${estimatedSavings.unusedVariables} characters`);
console.log(`Duplicate values: ${estimatedSavings.duplicateValues} characters`);
console.log(`Media query consolidation: ${estimatedSavings.mediaQueryConsolidation} characters`);
console.log(`Whitespace optimization: ${estimatedSavings.whitespaceOptimization} characters`);
console.log(`Total estimated savings: ${totalEstimatedSavings} characters (${percentageSavings}%)`);

// Save analysis to file
const analysisPath = path.join(__dirname, '..', 'css', 'analysis-report.json');
fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
console.log(`\nAnalysis saved to: ${analysisPath}`);
