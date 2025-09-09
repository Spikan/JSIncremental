// Dev system: unlock helpers, time travel, and resource tweaks (TypeScript)
// Enhanced with Decimal scaling test functions
//
// MEMORY: DEV FUNCTIONS SHOULD GENERATE EXTREMELY LARGE VALUES AS INTENDED
// MEMORY: NEVER CONVERT EXTREME VALUES TO JAVASCRIPT NUMBERS WHEN STORING
// MEMORY: PRESERVE FULL DECIMAL PRECISION IN ALL DEV OPERATIONS
// MEMORY: EXTREME VALUE TESTING IS A CORE FEATURE - DO NOT SANITIZE

// Direct break_eternity.js access
const Decimal = (globalThis as any).Decimal;
import { toDecimal, add } from '../numbers/migration-utils';
import { recalcProduction } from './resources';

type Win = typeof window & {
  Decimal?: any;
  App?: any;
  GAME_CONFIG?: any;
  // Legacy/global mirrors (optional during migration)
  sips?: any;
  straws?: any;
  cups?: any;
  spd?: any;
  level?: any;
  drinkRate?: any;
  lastDrinkTime?: any;
  lastSaveTime?: any;
};

export function unlockAll(): boolean {
  try {
    const w = window as Win;
    const fu = w.App?.systems?.unlocks;
    if (!fu) return false;
    const allFeatures = Object.keys(fu.unlockConditions || {});
    allFeatures.forEach(f => fu.unlockedFeatures.add(f));
    fu.updateFeatureVisibility?.();
    fu.saveUnlockedFeatures?.();
    fu.updateUnlocksTab?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function unlockShop(): boolean {
  try {
    const w = window as Win;
    const fu = w.App?.systems?.unlocks;
    if (!fu) return false;
    fu.unlockedFeatures.add('shop');
    fu.updateFeatureVisibility?.();
    fu.saveUnlockedFeatures?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function unlockUpgrades(): boolean {
  try {
    const w = window as Win;
    const fu = w.App?.systems?.unlocks;
    if (!fu) return false;
    ['widerStraws', 'betterCups', 'fasterDrinks', 'criticalClick', 'suction'].forEach(f =>
      fu.unlockedFeatures.add(f)
    );
    fu.updateFeatureVisibility?.();
    fu.saveUnlockedFeatures?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function resetUnlocks(): boolean {
  try {
    const w = window as Win;
    const fu = w.App?.systems?.unlocks;
    if (!fu) return false;
    fu.unlockedFeatures.clear();
    fu.unlockedFeatures.add('soda');
    fu.unlockedFeatures.add('options');
    fu.unlockedFeatures.add('dev');
    fu.updateFeatureVisibility?.();
    fu.updateUnlocksTab?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function addTime(milliseconds: number): boolean {
  try {
    const w = window as Win;
    const ms = Number(milliseconds) || 0;
    if (!ms) return false;
    const st = w.App?.state?.getState?.() || {};
    const rate = Number(st.drinkRate || w.drinkRate || 1000);
    const now = Date.now();
    const totalElapsed = ms;
    const drinks = Math.floor(totalElapsed / Math.max(rate, 1));
    const remainder = totalElapsed % Math.max(rate, 1);
    if (drinks > 0) {
      const config = w.GAME_CONFIG?.BALANCE || {};
      const spdVal =
        st && typeof st.spd !== 'undefined'
          ? Number(st.spd)
          : Number(config.BASE_SIPS_PER_DRINK || 1);
      const gain = spdVal * drinks;
      // Preserve extreme values - don't convert to regular numbers
      const currentSips = toDecimal(w.sips);
      const gainDecimal = toDecimal(gain);
      const nextSips = add(currentSips, gainDecimal);
      w.sips = nextSips;
      const prevTotal = Number(st.totalSipsEarned || 0);
      w.App?.state?.setState?.({ sips: nextSips, totalSipsEarned: prevTotal + gain });
    }
    const nextLast = now - remainder;
    w.lastDrinkTime = nextLast;
    const prevPlay = Number(st.totalPlayTime || 0);
    w.App?.state?.setState?.({ lastDrinkTime: nextLast, totalPlayTime: prevPlay + ms });
    w.App?.ui?.updateDrinkProgress?.();
    w.App?.ui?.updateTopSipCounter?.();
    w.App?.ui?.updateTopSipsPerSecond?.();
    const prevSave = Number(st.lastSaveTime || w.lastSaveTime || Date.now());
    const nextSave = prevSave - ms;
    w.lastSaveTime = nextSave;
    w.App?.state?.setState?.({ lastSaveTime: nextSave });
    w.App?.ui?.updateLastSaveTime?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function addSips(amount: number): boolean {
  try {
    const w = window as Win;
    if (typeof w.sips === 'undefined' || w.sips === null) return false;
    // Preserve extreme values - use Decimal arithmetic
    if (w.sips.plus) {
      w.sips = w.sips.plus(amount);
    } else {
      const currentSips = toDecimal(w.sips);
      const gainDecimal = toDecimal(amount);
      w.sips = add(currentSips, gainDecimal);
    }
    // Prefer action to keep Decimal in state when available
    try {
      w.App?.state?.actions?.setSips?.(w.sips);
    } catch (error) {
      w.App?.state?.setState?.({ sips: w.sips });
    }
    w.App?.ui?.updateTopSipCounter?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function toggleDevMode(): boolean {
  try {
    (window as Win).App?.systems?.unlocks?.toggleDevMode?.();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function toggleGodMode(): boolean {
  try {
    /* hook here if needed */ return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function showDebugInfo(): boolean {
  try {
    const w = window as Win;
    console.log('🐛 Debug Info:', { sips: w.sips, straws: w.straws, cups: w.cups, app: w.App });
    const st = w.App?.state?.getState?.();
    console.log('State snapshot:', st);
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function exportSave(): boolean {
  try {
    const w = window as Win;
    const st = w.App?.state?.getState?.() || {};
    const saveData: any = {
      sips: String(st.sips ?? w.sips?.toString?.() ?? 0),
      straws: String(st.straws ?? w.straws?.toString?.() ?? 0),
      cups: String(st.cups ?? w.cups?.toString?.() ?? 0),
      level: String(st.level ?? w.level?.toString?.() ?? 1),
      timestamp: Date.now(),
    };
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soda-clicker-save-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

export function openImportDialog(): boolean {
  try {
    const w = window as Win;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = function (e: any) {
      const file = e?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev: any) {
        try {
          const saveData = JSON.parse(ev?.target?.result || '{}');
          if (saveData.sips != null)
            w.sips = w.Decimal ? new w.Decimal(saveData.sips) : Number(saveData.sips);
          if (saveData.straws != null)
            w.straws = w.Decimal ? new w.Decimal(saveData.straws) : Number(saveData.straws);
          if (saveData.cups != null)
            w.cups = w.Decimal ? new w.Decimal(saveData.cups) : Number(saveData.cups);
          if (saveData.level != null)
            w.level = w.Decimal ? new w.Decimal(saveData.level) : Number(saveData.level);
          // Mirror to App.state minimally - preserve extreme values
          w.App?.state?.setState?.({
            sips: w.sips,
            straws: w.straws,
            cups: w.cups,
            level: w.level,
          });
          w.App?.ui?.updateAllStats?.();
          w.App?.ui?.checkUpgradeAffordability?.();
        } catch (error) {
          console.warn('Failed to import save data:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

// Large Number Scaling Test Functions
// These functions help test the break_eternity.js integration with very large numbers

/**
 * Add a massive amount of sips (1e500) to test large number scaling
 */
export function addMassiveSips(): boolean {
  try {
    const w = window as Win;
    console.log('🚀 Adding massive sips (1e500)...');

    if (!w.sips) return false;

    // Create a Decimal with 1e500 sips (way beyond JavaScript limits)
    const massiveAmount = new Decimal('1e500');
    console.log(`Adding ${massiveAmount.toString()} sips`);

    // Add to current sips using Decimal system
    const currentSips = toDecimal(w.sips);
    const newSips = add(currentSips, massiveAmount);

    // Update the sips value - keep as Decimal for proper handling
    if (w.Decimal) {
      // Preserve extreme values - always use Decimal directly for sips
      w.sips = newSips;
    } else {
      // For extremely large numbers, store the Decimal directly
      w.sips = newSips;
    }

    // Update state with Decimal value
    w.App?.state?.actions?.setSips?.(newSips);

    // SPD doesn't change with just sips, but ensure state is consistent
    const state = w.App?.state?.getState?.();
    if (state) {
      updateSPDFromResources(
        state.straws || 0,
        state.cups || 0,
        state.widerStraws || 0,
        state.betterCups || 0
      );
    }

    w.App?.ui?.updateTopSipCounter?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    w.App?.ui?.updateAllDisplays?.();

    console.log(`✅ New sips total: ${newSips.toString()}`);
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Add a huge number of straws (1e750) to test scaling
 */
export function addHugeStraws(): boolean {
  try {
    const w = window as Win;
    console.log('🚀 Adding huge straws (1e750)...');

    if (typeof w.straws === 'undefined' || w.straws === null) return false;

    // Create a Decimal with 1e750 straws (demonstrating break_eternity.js)
    const hugeAmount = new Decimal('1e750');
    console.log(`Adding ${hugeAmount.toString()} straws`);

    // Add to current straws using Decimal system
    const currentStraws = toDecimal(w.straws);
    const newStraws = add(currentStraws, hugeAmount);

    // Always update Zustand state first (this is what UI reads from)
    w.App?.state?.actions?.setStraws?.(newStraws);

    // Also update window property for compatibility
    try {
      // Preserve extreme values - direct assignment
      w.straws = newStraws;
    } catch (error) {
      // Fallback: just set the Decimal directly
      w.straws = newStraws;
      console.warn('Failed to set window.straws, using Decimal directly:', error);
    }

    // Update SPD with the new straw values
    const state = w.App?.state?.getState?.();
    if (state) {
      updateSPDFromResources(
        state.straws || newStraws,
        state.cups || 0,
        state.widerStraws || 0,
        state.betterCups || 0
      );
    }

    // Update UI with a small delay to ensure state is settled
    setTimeout(() => {
      w.App?.ui?.updateAllStats?.();
      w.App?.ui?.updatePurchasedCounts?.();
      w.App?.ui?.checkUpgradeAffordability?.();
      w.App?.ui?.updateAllDisplays?.();
    }, 10);

    console.log(`✅ New straws total: ${newStraws.toString()}`);
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Add a massive number of cups (1e1000) to test scaling
 */
export function addMassiveCups(): boolean {
  try {
    const w = window as Win;
    console.log('🚀 Adding massive cups (1e1000)...');

    if (typeof w.cups === 'undefined' || w.cups === null) return false;

    // Create a Decimal with 1e1000 cups (extreme break_eternity.js test)
    const massiveAmount = new Decimal('1e1000');
    console.log(`Adding ${massiveAmount.toString()} cups`);

    // Add to current cups using Decimal system
    const currentCups = toDecimal(w.cups);
    const newCups = add(currentCups, massiveAmount);

    // Always update Zustand state first (this is what UI reads from)
    w.App?.state?.actions?.setCups?.(newCups);

    // Also update window property for compatibility
    try {
      // Preserve extreme values - direct assignment
      w.cups = newCups;
    } catch (error) {
      // Fallback: just set the Decimal directly
      w.cups = newCups;
      console.warn('Failed to set window.cups, using Decimal directly:', error);
    }

    // Update SPD with the new cup values
    const state = w.App?.state?.getState?.();
    if (state) {
      updateSPDFromResources(
        state.straws || 0,
        state.cups || newCups,
        state.widerStraws || 0,
        state.betterCups || 0
      );
    }

    // Update UI with a small delay to ensure state is settled
    setTimeout(() => {
      w.App?.ui?.updateAllStats?.();
      w.App?.ui?.updatePurchasedCounts?.();
      w.App?.ui?.checkUpgradeAffordability?.();
      w.App?.ui?.updateAllDisplays?.();
    }, 10);

    console.log(`✅ New cups total: ${newCups.toString()}`);
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Add extreme amounts of all resources (1e2000 each) for maximum scaling test
 */
export function addExtremeResources(): boolean {
  try {
    const w = window as Win;
    console.log('🚀 Adding extreme resources (1e2000 each)...');

    const extremeAmount = new Decimal('1e2000');

    // Add sips
    if (typeof w.sips !== 'undefined') {
      const currentSips = toDecimal(w.sips);
      const newSips = add(currentSips, extremeAmount);
      if (w.Decimal && newSips) {
        try {
          // Preserve extreme values - direct assignment
          w.sips = newSips;
        } catch (error) {
          console.warn('Error converting sips to safe number:', error);
          w.sips = newSips;
        }
      } else {
        w.sips = newSips;
      }
      w.App?.state?.actions?.setSips?.(newSips);
      console.log(`✅ Sips: ${newSips?.toString?.() || 'unknown'}`);
    }

    // Add straws
    if (typeof w.straws !== 'undefined') {
      const currentStraws = toDecimal(w.straws);
      const newStraws = add(currentStraws, extremeAmount);

      // Always update Zustand state first (this is what UI reads from)
      w.App?.state?.actions?.setStraws?.(newStraws);

      // Also update window property for compatibility
      try {
        // Preserve extreme values - direct assignment
        w.straws = newStraws;
      } catch (error) {
        // Fallback: just set the Decimal directly
        w.straws = newStraws;
        console.warn('Failed to set window.straws, using Decimal directly:', error);
      }

      console.log(`✅ Straws: ${newStraws.toString()}`);
    }

    // Add cups
    if (typeof w.cups !== 'undefined') {
      const currentCups = toDecimal(w.cups);
      const newCups = add(currentCups, extremeAmount);

      // Always update Zustand state first (this is what UI reads from)
      w.App?.state?.actions?.setCups?.(newCups);

      // Also update window property for compatibility
      try {
        // Preserve extreme values - direct assignment
        w.cups = newCups;
      } catch (error) {
        // Fallback: just set the Decimal directly
        w.cups = newCups;
        console.warn('Failed to set window.cups, using Decimal directly:', error);
      }

      console.log(`✅ Cups: ${newCups.toString()}`);
    }

    // Validate extreme values after adding them
    import('./purchases-system.ts')
      .then(module => {
        module.validateExtremeValues?.();
      })
      .catch(error => {
        console.warn('Failed to validate extreme values:', error);
      });

    // Update SPD with the new extreme values
    const state = w.App?.state?.getState?.();
    if (state) {
      const finalStraws = state.straws || extremeAmount;
      const finalCups = state.cups || extremeAmount;
      const finalWiderStraws = state.widerStraws || 0;
      const finalBetterCups = state.betterCups || 0;

      updateSPDFromResources(finalStraws, finalCups, finalWiderStraws, finalBetterCups);
    }

    // Update UI with a small delay to ensure state is settled
    setTimeout(() => {
      console.log('🔄 Dev tools UI update starting...');
      w.App?.ui?.updateAllStats?.();
      w.App?.ui?.updatePurchasedCounts?.();
      w.App?.ui?.checkUpgradeAffordability?.();
      w.App?.ui?.updateAllDisplays?.();
      console.log('🔄 Dev tools UI update completed');
    }, 10);

    console.log('✅ Extreme resources added successfully!');
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Test the scientific notation display by adding progressively larger amounts
 */
export function testScientificNotation(): boolean {
  try {
    const w = window as Win;
    console.log('🧪 Testing scientific notation display...');

    const testAmounts = ['1e100', '1e500', '1e1000', '1e2000', '1e5000'];

    testAmounts.forEach((amount, index) => {
      setTimeout(() => {
        if (w.sips) {
          const largeAmount = new Decimal(amount);
          const currentSips = toDecimal(w.sips);
          const newSips = add(currentSips, largeAmount);

          if (w.Decimal) {
            // Preserve extreme values - direct assignment
            w.sips = newSips;
          } else {
            w.sips = newSips;
          }

          w.App?.state?.actions?.setSips?.(newSips);
          w.App?.ui?.updateTopSipCounter?.();

          console.log(`📊 Scientific notation test ${index + 1}: ${newSips.toString()}`);
        }
      }, index * 1000); // Stagger the additions
    });

    console.log('✅ Scientific notation test initiated');
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Reset all resources to zero for clean testing
 */
export function resetAllResources(): boolean {
  try {
    const w = window as Win;
    console.log('🔄 Resetting all resources to zero...');

    // Always update Zustand state first (this is what UI reads from)
    w.App?.state?.setState?.({
      sips: new Decimal(0),
      straws: new Decimal(0),
      cups: new Decimal(0),
    });

    // Also update window properties for compatibility
    if (w.Decimal) {
      w.sips = new w.Decimal(0);
      w.straws = new w.Decimal(0);
      w.cups = new w.Decimal(0);
    } else {
      w.sips = 0;
      w.straws = 0;
      w.cups = 0;
    }

    w.App?.ui?.updateAllStats?.();
    w.App?.ui?.checkUpgradeAffordability?.();

    console.log('✅ All resources reset to zero');
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
    return false;
  }
}

/**
 * Update SPD after resource changes (similar to purchase functions)
 * This properly recalculates and updates SPD using the same method as normal purchases
 */
export function updateSPDFromResources(
  straws: any,
  cups: any,
  widerStraws: any = 0,
  betterCups: any = 0
): boolean {
  try {
    const w = window as Win;
    console.log('🔄 Updating SPD from resource values...');

    // Recalculate production with the new values
    const result = recalcProduction({
      straws: straws,
      cups: cups,
      widerStraws: widerStraws,
      betterCups: betterCups,
    });

    if (!result || !result.sipsPerDrink) {
      console.warn('SPD calculation failed - no result returned');
      return false;
    }

    // Update SPD in state (same pattern as purchase functions)
    w.App?.state?.actions?.setSPD?.(result.sipsPerDrink);
    w.App?.state?.actions?.setStrawSPD?.(result.strawSPD);
    w.App?.state?.actions?.setCupSPD?.(result.cupSPD);

    // Also update via setState as fallback (same pattern as purchase functions)
    w.App?.state?.setState?.({
      strawSPD: result.strawSPD,
      cupSPD: result.cupSPD,
      spd: result.sipsPerDrink,
    });

    // Update window properties for compatibility
    if (w.Decimal && result.sipsPerDrink) {
      w.spd = result.sipsPerDrink;
    }

    console.log(`✅ SPD updated: ${result.sipsPerDrink?.toString?.() || 'unknown'}`);
    return true;
  } catch (error) {
    console.warn('SPD update failed:', error);
    return false;
  }
}

/**
 * Recalculate SPD (Sips Per Drink) based on current resources
 * This is needed when dev tools add resources but don't trigger SPD recalculation
 * @deprecated Use updateSPDFromResources() instead for better reliability
 */
export function recalculateSPD(): boolean {
  try {
    const w = window as Win;
    console.log('🔄 Recalculating SPD based on current resources...');

    // Get current resource values from state
    const state = w.App?.state?.getState?.();
    if (!state) {
      console.warn('Could not get game state for SPD recalculation');
      return false;
    }

    return updateSPDFromResources(
      state.straws || 0,
      state.cups || 0,
      state.widerStraws || 0,
      state.betterCups || 0
    );
  } catch (error) {
    console.warn('SPD recalculation failed:', error);
    return false;
  }
}

// Expose dev functions globally for console access
try {
  if (typeof window !== 'undefined') {
    (window as any).addMassiveSips = addMassiveSips;
    (window as any).addHugeStraws = addHugeStraws;
    (window as any).addMassiveCups = addMassiveCups;
    (window as any).addExtremeResources = addExtremeResources;
    (window as any).testScientificNotation = testScientificNotation;
    (window as any).resetAllResources = resetAllResources;
    (window as any).recalculateSPD = recalculateSPD;
    (window as any).updateSPDFromResources = updateSPDFromResources;
    (window as any).testNumberFormatting = testNumberFormatting;
    console.log('🔧 Dev tools exposed globally - try: addMassiveSips()');
  }
} catch (error) {
  console.warn('Failed to expose dev functions globally:', error);
}

/**
 * Test function to verify SPD indicators update with extreme values
 * This function can be called from console to test the fix
 */
export function testSPDIndicators(): boolean {
  try {
    console.log('🧪 Testing SPD indicators with extreme values...');

    const w = window as Win;

    // Reset resources first
    console.log('Resetting resources...');
    w.App?.state?.actions?.setSips?.(new Decimal(0));
    w.App?.state?.actions?.setStraws?.(new Decimal(0));
    w.App?.state?.actions?.setCups?.(new Decimal(0));

    // Wait a bit for state to settle
    setTimeout(() => {
      console.log('Adding extreme resources...');
      const extremeAmount = new Decimal('1e500');

      // Add extreme straws and cups (these affect SPD)
      w.App?.state?.actions?.setStraws?.(extremeAmount);
      w.App?.state?.actions?.setCups?.(extremeAmount);

      // Update SPD with extreme values
      console.log('Updating SPD...');
      updateSPDFromResources(extremeAmount, extremeAmount, 0, 0);

      // Check the results
      setTimeout(() => {
        const state = w.App?.state?.getState?.();
        console.log('Test results:', {
          straws: state?.straws?.toString?.(),
          cups: state?.cups?.toString?.(),
          spd: state?.spd?.toString?.(),
          drinkRate: state?.drinkRate,
        });

        // Calculate expected SPS
        if (state?.spd && state?.drinkRate) {
          const drinkRateSeconds = state.drinkRate / 1000;
          const sps = state.spd.divide(new Decimal(drinkRateSeconds));
          console.log('Expected SPS:', sps.toString());
        }

        console.log('✅ SPD indicator test completed');
      }, 100);
    }, 100);

    return true;
  } catch (error) {
    console.warn('SPD indicator test failed:', error);
    return false;
  }
}

/**
 * Test function to demonstrate 2-decimal place formatting
 * Call this from console: testNumberFormatting()
 */
export function testNumberFormatting(): boolean {
  try {
    console.log('🧮 Testing 2-decimal place number formatting...');

    // Test our improved cleanExtremeDecimals function first
    console.log('🧮 Testing cleanExtremeDecimals function:');
    import('../numbers/decimal-utils').then(({ cleanExtremeDecimals }) => {
      const extremeTestCases = [
        '1000000000000000000000.0000000000000000001',
        '1.0000000000000000000000000000000000000001',
        '999999999999999.999999999999999999999999',
        '123.0000000000000000000000000000000000000001',
        '1.0000000000000000000000000000000000000000000001',
        '999999999999999999999999999999.999999999',
        '1000.0000000000000000000000000000000000000001',
      ];

      extremeTestCases.forEach((testCase, index) => {
        const cleaned = cleanExtremeDecimals(testCase);
        const improvement =
          testCase.length > cleaned.length
            ? ` (reduced by ${testCase.length - cleaned.length} chars!)`
            : '';
        console.log(`  Extreme ${index + 1}: ${testCase} → ${cleaned}${improvement}`);
      });

      console.log('✅ cleanExtremeDecimals test completed!');
    });

    // Import the formatting function
    import('../../ui/utils').then(({ formatNumber }) => {
      const testValues = [
        // Regular numbers
        1.23456,
        12.789,
        123.456789,
        1234.56789,
        123456.789,
        1234567.89,
        1.1,
        1.0,
        0.123456,
        0.00123456,
        // Decimal objects
        new Decimal('123.456789'),
        new Decimal('1234567.891234'),
        new Decimal('1.23456789'),
        new Decimal('0.123456789'),
        // Extreme values that might have trailing decimals
        new Decimal('1e1000'),
        new Decimal('2.123456789e500'),
        new Decimal('1.0000000000000001e308'),
        new Decimal('999999999999999999999999999999.999999999'),
        new Decimal('1.0000000000000000000000000000001e100'),
        // Values with precision artifacts that should be cleaned up
        new Decimal('1000000000000000000000.0000000000000000001'),
        new Decimal('1.0000000000000000000000000000000000000001'),
        new Decimal('999999999999999.999999999999999999999999'),
        new Decimal('1e10').plus(new Decimal('0.0000000000000000000001')),
      ];

      console.log('📊 Test Results (showing decimal cleanup):');
      testValues.forEach((value, index) => {
        const formatted = formatNumber(value);
        const originalStr = value.toString ? value.toString() : String(value);
        const improvement = originalStr.length > formatted.length ? ' (cleaned!)' : '';
        console.log(`  ${index + 1}. ${originalStr.padEnd(30)} → ${formatted}${improvement}`);
      });

      console.log('✅ Number formatting test completed!');
      console.log('💡 All numbers should be limited to 2 decimal places (or fewer)');
    });

    return true;
  } catch (error) {
    console.warn('Number formatting test failed:', error);
    return false;
  }
}

// Expose test function globally
if (typeof window !== 'undefined') {
  (window as any).testSPDIndicators = testSPDIndicators;
  (window as any).testEruda = toggleEruda;
}

// ========================================
// DEBUG TOOLS FUNCTIONS
// ========================================

let erudaLoaded = false;
let erudaInstance: any = null;
let erudaVisible = false;

/**
 * Toggle Eruda mobile debug console
 */
export function toggleEruda(): boolean {
  try {
    // Check if Eruda is already available globally
    if (!erudaLoaded && (window as any).eruda) {
      console.log('📱 Eruda already available globally, using existing instance');
      erudaInstance = (window as any).eruda;
      if (erudaInstance && typeof erudaInstance.init === 'function') {
        try {
          erudaInstance.init();
          erudaLoaded = true;
          erudaVisible = true;
          updateErudaButtonState(true);
          console.log('🐛 Eruda mobile debug console activated from global instance');
          return true;
        } catch (initError) {
          console.error('❌ Eruda global initialization failed:', initError);
        }
      }
    }

    if (!erudaLoaded) {
      // Load Eruda dynamically
      console.log('📱 Loading Eruda from CDN...');
      const script = document.createElement('script');
      script.src = '//cdn.jsdelivr.net/npm/eruda';
      script.onload = () => {
        console.log('📱 Eruda script loaded, initializing...');
        erudaInstance = (window as any).eruda;
        if (erudaInstance && typeof erudaInstance.init === 'function') {
          try {
            erudaInstance.init();
            erudaLoaded = true;
            erudaVisible = true;
            updateErudaButtonState(true);
            console.log('🐛 Eruda mobile debug console loaded and activated');
            console.log('📱 Eruda instance:', erudaInstance);
            console.log('📱 Eruda methods available:', Object.getOwnPropertyNames(erudaInstance));
            console.log('📱 Eruda show method:', typeof erudaInstance.show);
            console.log('📱 Eruda hide method:', typeof erudaInstance.hide);
            
            // Add some test data to verify console is working
            console.log('🧪 Test data for Eruda console:');
            console.log('   - Current time:', new Date().toISOString());
            console.log('   - User agent:', navigator.userAgent);
            console.log('   - Window size:', window.innerWidth + 'x' + window.innerHeight);
            console.log('   - Game state available:', !!(window as any).App?.state);
          } catch (initError) {
            console.error('❌ Eruda initialization failed:', initError);
            updateErudaButtonState(false);
          }
        } else {
          console.error('❌ Eruda not available or invalid:', erudaInstance);
          updateErudaButtonState(false);
        }
      };
      script.onerror = () => {
        console.error('❌ Failed to load Eruda debug console');
        updateErudaButtonState(false);
      };
      document.head.appendChild(script);
    } else {
      // Toggle existing Eruda instance
      if (erudaInstance) {
        if (erudaVisible) {
          erudaInstance.hide();
          erudaVisible = false;
          updateErudaButtonState(false);
          console.log('🐛 Eruda mobile debug console hidden');
        } else {
          erudaInstance.show();
          erudaVisible = true;
          updateErudaButtonState(true);
          console.log('🐛 Eruda mobile debug console shown');
        }
      } else {
        console.warn('⚠️ Eruda instance not available for toggle');
      }
    }
    return true;
  } catch (error) {
    console.warn('Failed to toggle Eruda:', error);
    return false;
  }
}

/**
 * Clear browser console
 */
export function clearConsole(): boolean {
  try {
    console.clear();
    console.log('🧹 Console cleared');
    return true;
  } catch (error) {
    console.warn('Failed to clear console:', error);
    return false;
  }
}

/**
 * Export current game state as JSON
 */
export function exportState(): boolean {
  try {
    const w = window as Win;
    const state = w.App?.state?.getState?.();
    if (!state) {
      console.warn('No game state available to export');
      return false;
    }

    const stateJson = JSON.stringify(state, null, 2);
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `soda-clicker-state-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('💾 Game state exported successfully');
    return true;
  } catch (error) {
    console.warn('Failed to export state:', error);
    return false;
  }
}

/**
 * Run performance test
 */
export function performanceTest(): boolean {
  try {
    console.log('⚡ Starting performance test...');

    const startTime = performance.now();
    const iterations = 10000;

    // Test basic arithmetic operations
    for (let i = 0; i < iterations; i++) {
      const testValue = Math.random() * 1000;
      Math.sqrt(testValue);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`⚡ Performance test completed:`);
    console.log(`   - ${iterations} operations in ${duration.toFixed(2)}ms`);
    console.log(`   - Average: ${(duration / iterations).toFixed(4)}ms per operation`);
    console.log(`   - Operations per second: ${Math.round(iterations / (duration / 1000))}`);

    return true;
  } catch (error) {
    console.warn('Performance test failed:', error);
    return false;
  }
}

/**
 * Update Eruda button state
 */
function updateErudaButtonState(active: boolean): void {
  try {
    const button = document.getElementById('erudaToggleBtn');
    if (button) {
      const textElement = button.querySelector('.dev-btn-text');
      if (textElement) {
        if (active) {
          button.classList.add('active');
          textElement.textContent = 'Hide Debug Console';
        } else {
          button.classList.remove('active');
          textElement.textContent = 'Mobile Debug Console';
        }
      }
    }
  } catch (error) {
    console.warn('Failed to update Eruda button state:', error);
  }
}
