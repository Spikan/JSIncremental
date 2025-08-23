// Dev system: unlock helpers, time travel, and resource tweaks (TypeScript)

type Win = typeof window & {
  FEATURE_UNLOCKS?: any;
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

function toNum(v: any): number { return (v && typeof v.toNumber === 'function') ? v.toNumber() : Number(v || 0); }

export function unlockAll(): boolean {
  try {
    const w = window as Win;
    const fu = w.FEATURE_UNLOCKS;
    if (!fu) return false;
    const allFeatures = Object.keys(fu.unlockConditions || {});
    allFeatures.forEach((f) => fu.unlockedFeatures.add(f));
    fu.updateFeatureVisibility?.();
    fu.updateUnlocksTab?.();
    return true;
  } catch { return false; }
}

export function unlockShop(): boolean {
  try {
    const w = window as Win;
    const fu = w.FEATURE_UNLOCKS;
    if (!fu) return false;
    fu.unlockedFeatures.add('shop');
    fu.updateFeatureVisibility?.();
    return true;
  } catch { return false; }
}

export function unlockUpgrades(): boolean {
  try {
    const w = window as Win;
    const fu = w.FEATURE_UNLOCKS;
    if (!fu) return false;
    ['widerStraws','betterCups','fasterDrinks','criticalClick','suction'].forEach((f)=> fu.unlockedFeatures.add(f));
    fu.updateFeatureVisibility?.();
    return true;
  } catch { return false; }
}

export function resetUnlocks(): boolean {
  try {
    const w = window as Win;
    const fu = w.FEATURE_UNLOCKS;
    if (!fu) return false;
    fu.unlockedFeatures.clear();
    fu.unlockedFeatures.add('soda');
    fu.unlockedFeatures.add('options');
    fu.unlockedFeatures.add('dev');
    fu.updateFeatureVisibility?.();
    fu.updateUnlocksTab?.();
    return true;
  } catch { return false; }
}

export function addTime(milliseconds: number): boolean {
  try {
    const w = window as Win;
    const ms = Number(milliseconds) || 0; if (!ms) return false;
    const st = w.App?.state?.getState?.() || {};
    const rate = Number(st.drinkRate || w.drinkRate || 1000);
    const now = Date.now();
    const last = Number(st.lastDrinkTime ?? w.lastDrinkTime ?? now);
    const totalElapsed = ms;
    const drinks = Math.floor(totalElapsed / Math.max(rate, 1));
    const remainder = totalElapsed % Math.max(rate, 1);
    if (drinks > 0) {
      const config = w.GAME_CONFIG?.BALANCE || {};
      const spsVal = (st && typeof st.sps !== 'undefined') ? Number(st.sps) : Number((config.BASE_SIPS_PER_DRINK) || 1);
      const gain = spsVal * drinks;
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
  } catch { return false; }
}

export function addSips(amount: number): boolean {
  try {
    const w = window as Win;
    if (!w.sips) return false;
    w.sips = w.sips.plus ? w.sips.plus(amount) : toNum(w.sips) + Number(amount || 0);
    w.App?.state?.setState?.({ sips: toNum(w.sips) });
    w.App?.ui?.updateTopSipCounter?.();
    w.App?.ui?.checkUpgradeAffordability?.();
    return true;
  } catch { return false; }
}

export function toggleDevMode(): boolean {
  try { (window as Win).FEATURE_UNLOCKS?.toggleDevMode?.(); return true; } catch { return false; }
}

export function toggleGodMode(): boolean {
  try { /* hook here if needed */ return true; } catch { return false; }
}

export function showDebugInfo(): boolean {
  try {
    const w = window as Win;
    console.log('🐛 Debug Info:', { sips: w.sips, straws: w.straws, cups: w.cups, app: w.App });
    const st = w.App?.state?.getState?.();
    console.log('State snapshot:', st);
    return true;
  } catch { return false; }
}

export function exportSave(): boolean {
  try {
    const w = window as Win;
    const st = w.App?.state?.getState?.() || {};
    const saveData: any = {
      sips: String(st.sips ?? (w.sips?.toString?.() ?? 0)),
      straws: String(st.straws ?? (w.straws?.toString?.() ?? 0)),
      cups: String(st.cups ?? (w.cups?.toString?.() ?? 0)),
      level: String(st.level ?? (w.level?.toString?.() ?? 1)),
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
  } catch { return false; }
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
          if (saveData.sips != null) w.sips = w.Decimal ? new w.Decimal(saveData.sips) : Number(saveData.sips);
          if (saveData.straws != null) w.straws = w.Decimal ? new w.Decimal(saveData.straws) : Number(saveData.straws);
          if (saveData.cups != null) w.cups = w.Decimal ? new w.Decimal(saveData.cups) : Number(saveData.cups);
          if (saveData.level != null) w.level = w.Decimal ? new w.Decimal(saveData.level) : Number(saveData.level);
          // Mirror to App.state minimally
          w.App?.state?.setState?.({
            sips: toNum(w.sips),
            straws: toNum(w.straws),
            cups: toNum(w.cups),
            level: toNum(w.level),
          });
          w.App?.ui?.updateAllStats?.();
          w.App?.ui?.checkUpgradeAffordability?.();
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
    return true;
  } catch { return false; }
}


