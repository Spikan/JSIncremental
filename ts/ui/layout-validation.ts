/**
 * Layout Validation Script
 * Validates that the new sidebar layout is working correctly
 */

export function validateSidebarLayout(): boolean {
  console.log('🔍 Validating sidebar layout...');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check main game content structure
  const mainGameContent = document.querySelector('.main-game-content');
  if (!mainGameContent) {
    errors.push('Main game content container not found');
  }

  // Check main content area
  const mainContentArea = document.querySelector('.main-content-area');
  if (!mainContentArea) {
    errors.push('Main content area not found');
  }

  // Check sidebar
  const gameSidebar = document.querySelector('.game-sidebar');
  if (!gameSidebar) {
    errors.push('Game sidebar not found');
  }

  // Check soda button
  const sodaButton = document.getElementById('sodaButton');
  if (!sodaButton) {
    errors.push('Soda button not found');
  }

  // Check sidebar sections
  const expectedSections = ['upgrades', 'shop', 'stats', 'settings', 'god'];
  expectedSections.forEach(sectionId => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (!section) {
      errors.push(`Sidebar section '${sectionId}' not found`);
    }
  });

  // Check sidebar toggle button
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (!sidebarToggle) {
    warnings.push('Sidebar toggle button not found (may be hidden on desktop)');
  }

  // Check responsive design
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    console.log('📱 Mobile layout detected');

    // Check if sidebar is properly positioned for mobile
    if (gameSidebar) {
      const computedStyle = window.getComputedStyle(gameSidebar);
      const position = computedStyle.position;
      if (position !== 'fixed') {
        warnings.push('Sidebar should be fixed positioned on mobile');
      }
    }
  } else {
    console.log('🖥️ Desktop layout detected');

    // Check if sidebar is properly positioned for desktop
    if (gameSidebar) {
      const computedStyle = window.getComputedStyle(gameSidebar);
      const position = computedStyle.position;
      if (position === 'fixed') {
        warnings.push('Sidebar should not be fixed positioned on desktop');
      }
    }
  }

  // Check CSS grid layout
  if (mainGameContent) {
    const computedStyle = window.getComputedStyle(mainGameContent);
    const display = computedStyle.display;
    if (display !== 'grid') {
      warnings.push('Main game content should use CSS grid layout');
    }
  }

  // Report results
  if (errors.length > 0) {
    console.error('❌ Layout validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Layout validation warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0) {
    console.log('✅ Sidebar layout validation passed!');
    return true;
  }

  return false;
}

export function validateSidebarNavigation(): boolean {
  console.log('🔍 Validating sidebar navigation...');

  const errors: string[] = [];

  // Check if sidebar navigation manager is available
  if (typeof (window as any).sidebarNavigation === 'undefined') {
    errors.push('Sidebar navigation manager not available on window object');
  }

  // Check section headers have proper data attributes
  const sectionHeaders = document.querySelectorAll('.section-header[data-action]');
  if (sectionHeaders.length === 0) {
    errors.push('No section headers with data-action attributes found');
  }

  // Check section content areas
  const sectionContents = document.querySelectorAll('.section-content');
  if (sectionContents.length === 0) {
    errors.push('No section content areas found');
  }

  // Report results
  if (errors.length > 0) {
    console.error('❌ Sidebar navigation validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  console.log('✅ Sidebar navigation validation passed!');
  return true;
}

export function validateGameFunctionality(): boolean {
  console.log('🔍 Validating game functionality...');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Test header elements exist and are updatable
  const headerElements = ['topSipValue', 'topSipsPerDrink', 'topSipsPerSecond'];
  headerElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      errors.push(`Header element '${id}' not found`);
    }
  });

  // Test upgrade elements exist
  const upgradeElements = [
    'suctionCost',
    'fasterDrinksCost',
    'strawCost',
    'cupCost',
    'widerStrawsCost',
    'betterCupsCost',
    'levelCost',
  ];
  upgradeElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      errors.push(`Upgrade element '${id}' not found`);
    }
  });

  // Test stat elements exist
  const statElements = [
    'clickValue',
    'suctionClickBonusCompact',
    'currentDrinkSpeedCompact',
    'straws',
    'cups',
    'widerStraws',
    'betterCups',
    'totalStrawProduction',
    'totalCupProduction',
    'totalPassiveProduction',
  ];
  statElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      errors.push(`Stat element '${id}' not found`);
    }
  });

  // Test sidebar sections exist
  const sidebarSections = ['upgrades', 'shop', 'stats', 'settings', 'god'];
  sidebarSections.forEach(sectionId => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (!section) {
      errors.push(`Sidebar section '${sectionId}' not found`);
    }
  });

  // Test if App state is available
  if (typeof (window as any).App === 'undefined') {
    warnings.push('App object not available - game may not be fully initialized');
  }

  // Test if sidebar navigation is available
  if (typeof (window as any).sidebarNavigation === 'undefined') {
    warnings.push('Sidebar navigation not available on window object');
  }

  // Report results
  if (errors.length > 0) {
    console.error('❌ Game functionality validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Game functionality validation warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0) {
    console.log('✅ Game functionality validation passed!');
    return true;
  }

  return false;
}

export function runFullLayoutValidation(): boolean {
  console.log('🚀 Running full layout validation...');

  const layoutValid = validateSidebarLayout();
  const navigationValid = validateSidebarNavigation();
  const functionalityValid = validateGameFunctionality();

  const allValid = layoutValid && navigationValid && functionalityValid;

  if (allValid) {
    console.log('🎉 All validations passed! The refactor is working correctly.');
  } else {
    console.log('❌ Some validations failed. Please check the errors above.');
  }

  return allValid;
}

// Auto-run validation when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runFullLayoutValidation, 1000); // Wait for initialization
    });
  } else {
    setTimeout(runFullLayoutValidation, 1000);
  }
}
