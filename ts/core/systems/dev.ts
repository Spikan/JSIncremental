// Dev system: unlock helpers, time travel, and resource tweaks (TypeScript)
// Enhanced with LargeNumber scaling test functions

import { LargeNumber } from '../numbers/large-number';
import { toLargeNumber, add } from '../numbers/migration-utils';

type Win = typeof window & {
  Decimal?: any;
  App?: any;
  GAME_CONFIG?: any;
  // Legacy/global mirrors (optional during migration)
  sips?: any;
  straws?: any;
  cups?: any;
  level?: any;
  drinkRate?: any;
  lastDrinkTime?: any;
  lastSaveTime?: any;
};

function toNum(v: any): number {
  return v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0);
}

export function unlockAll(): boolean {
  try {
    const w = window as Win;
    const fu = w.App?.systems?.unlocks;
    if (!fu) return false;
    const allFeatures = Object.keys(fu.unlockConditions || {});
    allFeatures.forEach(f => fu.unlockedFeatures.add(f));
    fu.updateFeatureVisibility?.();
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
      const currentSips = toNum(w.sips);
      const nextSips = currentSips + gain;
      w.sips = w.Decimal ? new w.Decimal(nextSips) : nextSips;
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
    w.sips = w.sips.plus ? w.sips.plus(amount) : toNum(w.sips) + Number(amount || 0);
    // Prefer action to keep LargeNumber in state when available
    try {
      w.App?.state?.actions?.setSips?.(w.sips);
    } catch (error) {
      w.App?.state?.setState?.({ sips: toNum(w.sips) });
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
          // Mirror to App.state minimally
          w.App?.state?.setState?.({
            sips: toNum(w.sips),
            straws: toNum(w.straws),
            cups: toNum(w.cups),
            level: toNum(w.level),
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

    // Create a LargeNumber with 1e500 sips (way beyond JavaScript limits)
    const massiveAmount = new LargeNumber('1e500');
    console.log(`Adding ${massiveAmount.toString()} sips`);

    // Add to current sips using LargeNumber system
    const currentSips = toLargeNumber(w.sips);
    const newSips = add(currentSips, massiveAmount);

    // Update the sips value - keep as LargeNumber for proper handling
    if (w.Decimal) {
      // For very large numbers, use LargeNumber directly, fallback to Decimal for smaller values
      if (Number.isFinite(newSips.toNumber())) {
        w.sips = new w.Decimal(newSips.toNumber());
      } else {
        // For extremely large numbers, store the LargeNumber directly
        w.sips = newSips;
      }
    } else {
      // For extremely large numbers, store the LargeNumber directly
      w.sips = newSips;
    }

    // Update state with LargeNumber value
    w.App?.state?.actions?.setSips?.(newSips);
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

    // Create a LargeNumber with 1e750 straws (demonstrating break_eternity.js)
    const hugeAmount = new LargeNumber('1e750');
    console.log(`Adding ${hugeAmount.toString()} straws`);

    // Add to current straws using LargeNumber system
    const currentStraws = toLargeNumber(w.straws);
    const newStraws = add(currentStraws, hugeAmount);

    // Update the straws value - keep as LargeNumber for proper handling
    if (w.Decimal) {
      // For very large numbers, use LargeNumber directly, fallback to Decimal for smaller values
      if (Number.isFinite(newStraws.toNumber())) {
        w.straws = new w.Decimal(newStraws.toNumber());
      } else {
        // For extremely large numbers, store the LargeNumber directly
        w.straws = newStraws;
      }
    } else {
      // For extremely large numbers, store the LargeNumber directly
      w.straws = newStraws;
    }

    // Update state with LargeNumber value
    w.App?.state?.actions?.setStraws?.(newStraws);
    w.App?.ui?.updateAllStats?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    w.App?.ui?.updateAllDisplays?.();

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

    // Create a LargeNumber with 1e1000 cups (extreme break_eternity.js test)
    const massiveAmount = new LargeNumber('1e1000');
    console.log(`Adding ${massiveAmount.toString()} cups`);

    // Add to current cups using LargeNumber system
    const currentCups = toLargeNumber(w.cups);
    const newCups = add(currentCups, massiveAmount);

    // Update the cups value - keep as LargeNumber for proper handling
    if (w.Decimal) {
      // For very large numbers, use LargeNumber directly, fallback to Decimal for smaller values
      if (Number.isFinite(newCups.toNumber())) {
        w.cups = new w.Decimal(newCups.toNumber());
      } else {
        // For extremely large numbers, store the LargeNumber directly
        w.cups = newCups;
      }
    } else {
      // For extremely large numbers, store the LargeNumber directly
      w.cups = newCups;
    }

    // Update state with LargeNumber value
    w.App?.state?.actions?.setCups?.(newCups);
    w.App?.ui?.updateAllStats?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    w.App?.ui?.updateAllDisplays?.();

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

    const extremeAmount = new LargeNumber('1e2000');

    // Add sips
    if (typeof w.sips !== 'undefined') {
      const currentSips = toLargeNumber(w.sips);
      const newSips = add(currentSips, extremeAmount);
      if (w.Decimal) {
        if (Number.isFinite(newSips.toNumber())) {
          w.sips = new w.Decimal(newSips.toNumber());
        } else {
          w.sips = newSips;
        }
      } else {
        w.sips = newSips;
      }
      w.App?.state?.actions?.setSips?.(newSips);
      console.log(`✅ Sips: ${newSips.toString()}`);
    }

    // Add straws
    if (typeof w.straws !== 'undefined') {
      const currentStraws = toLargeNumber(w.straws);
      const newStraws = add(currentStraws, extremeAmount);
      if (w.Decimal) {
        if (Number.isFinite(newStraws.toNumber())) {
          w.straws = new w.Decimal(newStraws.toNumber());
        } else {
          w.straws = newStraws;
        }
      } else {
        w.straws = newStraws;
      }
      w.App?.state?.actions?.setStraws?.(newStraws);
      console.log(`✅ Straws: ${newStraws.toString()}`);
    }

    // Add cups
    if (typeof w.cups !== 'undefined') {
      const currentCups = toLargeNumber(w.cups);
      const newCups = add(currentCups, extremeAmount);
      if (w.Decimal) {
        if (Number.isFinite(newCups.toNumber())) {
          w.cups = new w.Decimal(newCups.toNumber());
        } else {
          w.cups = newCups;
        }
      } else {
        w.cups = newCups;
      }
      w.App?.state?.actions?.setCups?.(newCups);
      console.log(`✅ Cups: ${newCups.toString()}`);
    }

    // Update UI
    w.App?.ui?.updateAllStats?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    w.App?.ui?.updateAllDisplays?.();

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
          const largeAmount = new LargeNumber(amount);
          const currentSips = toLargeNumber(w.sips);
          const newSips = add(currentSips, largeAmount);

          if (w.Decimal) {
            if (Number.isFinite(newSips.toNumber())) {
              w.sips = new w.Decimal(newSips.toNumber());
            } else {
              w.sips = newSips;
            }
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

    // Reset sips
    if (w.Decimal) {
      w.sips = new w.Decimal(0);
    } else {
      w.sips = 0;
    }

    // Reset straws
    if (w.Decimal) {
      w.straws = new w.Decimal(0);
    } else {
      w.straws = 0;
    }

    // Reset cups
    if (w.Decimal) {
      w.cups = new w.Decimal(0);
    } else {
      w.cups = 0;
    }

    // Update state and UI
    w.App?.state?.setState?.({
      sips: 0,
      straws: 0,
      cups: 0,
    });

    w.App?.ui?.updateAllStats?.();
    w.App?.ui?.checkUpgradeAffordability?.();

    console.log('✅ All resources reset to zero');
    return true;
  } catch (error) {
    console.warn('Dev function failed:', error);
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
    console.log('🔧 Dev tools exposed globally - try: addMassiveSips()');
  }
} catch (error) {
  console.warn('Failed to expose dev functions globally:', error);
}
