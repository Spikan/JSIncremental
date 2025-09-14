// Feature unlocks system (TypeScript)

import { unlockPurchases } from './core/systems/unlock-purchases';

type UnlockCondition = { sips: number; clicks: number };
type UnlockMap = Record<string, UnlockCondition>;

console.log('=== FEATURE-UNLOCKS.TS LOADING ===');

// Expose reset function globally for debugging
if (typeof window !== 'undefined') {
  (window as any).resetAllUnlocks = () => {
    FEATURE_UNLOCKS.resetAllUnlocks();
  };
}

export const FEATURE_UNLOCKS = {
  unlockedFeatures: new Set<string>(['soda', 'options', 'dev']),
  devMode: false,
  _updatingFeatureVisibility: false,
  _updatingUpgradeVisibility: false,
  get unlockConditions(): UnlockMap {
    // Legacy threshold-based unlocks - kept for backward compatibility
    // but no longer used for auto-unlocking
    const data = (window as any).App?.data?.unlocks as UnlockMap | undefined;
    if (data) return data;
    const config: any = (window as any).GAME_CONFIG || {};
    return {
      suction: config.UNLOCKS?.SUCTION || { sips: 25, clicks: 8 },
      criticalClick: config.UNLOCKS?.CRITICAL_CLICK || { sips: 100, clicks: 20 },
      fasterDrinks: config.UNLOCKS?.FASTER_DRINKS || { sips: 200, clicks: 30 },
      straws: config.UNLOCKS?.STRAWS || { sips: 500, clicks: 50 },
      cups: config.UNLOCKS?.CUPS || { sips: 1000, clicks: 80 },
      widerStraws: config.UNLOCKS?.WIDER_STRAWS || { sips: 2000, clicks: 120 },
      betterCups: config.UNLOCKS?.BETTER_CUPS || { sips: 5000, clicks: 200 },
      levelUp: config.UNLOCKS?.LEVEL_UP || { sips: 3000, clicks: 150 },
      shop: config.UNLOCKS?.SHOP || { sips: 500, clicks: 30 },
      stats: config.UNLOCKS?.STATS || { sips: 1000, clicks: 60 },
      god: config.UNLOCKS?.GOD || { sips: 5000, clicks: 300 },
      unlocks: config.UNLOCKS?.UNLOCKS_TAB || { sips: 25, clicks: 8 },
    } as UnlockMap;
  },

  // Get available features for unlock purchase system
  get availableFeatures(): string[] {
    const config: any = (window as any).GAME_CONFIG || {};
    const configKeys = Object.keys(config.UNLOCK_PURCHASES || {});

    // Map config keys to feature names
    const keyMapping: Record<string, string> = {
      SUCTION: 'suction',
      CRITICAL_CLICK: 'criticalClick',
      FASTER_DRINKS: 'fasterDrinks',
      STRAWS: 'straws',
      CUPS: 'cups',
      WIDER_STRAWS: 'widerStraws',
      BETTER_CUPS: 'betterCups',
      LEVEL_UP: 'levelUp',
      SHOP: 'shop',
      STATS: 'stats',
      GOD: 'god',
      UNLOCKS_TAB: 'unlocks',
    };

    return configKeys.map(key => keyMapping[key] || key.toLowerCase()).filter(Boolean);
  },
  init() {
    try {
      // Load previously unlocked features from storage
      this.loadUnlockedFeatures();
      console.log('FEATURE_UNLOCKS system initialized with loaded state');

      // Update UI to reflect current unlock state (with delay to ensure DOM is ready)
      setTimeout(() => {
        this.updateFeatureVisibility();
        this.updateUnlocksTab();
        // Trigger affordability check to ensure buttons are properly marked as affordable
        try {
          (window as any).App?.ui?.checkUpgradeAffordability?.();
        } catch (error) {
          console.warn('Failed to check upgrade affordability on init:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to initialize FEATURE_UNLOCKS system:', error);
      // Fallback to default state if loading fails
      this.unlockedFeatures = new Set<string>(['soda', 'options', 'dev']);
      // Still update UI even with fallback state
      setTimeout(() => {
        this.updateFeatureVisibility();
        this.updateUnlocksTab();
        // Trigger affordability check to ensure buttons are properly marked as affordable
        try {
          (window as any).App?.ui?.checkUpgradeAffordability?.();
        } catch (error) {
          console.warn('Failed to check upgrade affordability on init fallback:', error);
        }
      }, 100);
    }
  },
  checkUnlocks(sips: any, clicks: number): string[] {
    const out: string[] = [];
    const entries = Object.keys(this.unlockConditions) as string[];
    for (const feature of entries) {
      const cond = (this.unlockConditions as UnlockMap)[feature];
      if (!cond) continue;
      const sipsMet = sips?.gte ? sips.gte(cond.sips) : Number(sips || 0) >= cond.sips;
      const clicksMet = Number(clicks || 0) >= cond.clicks;
      if (!this.unlockedFeatures.has(feature) && sipsMet && clicksMet) out.push(feature);
    }
    return out;
  },
  checkUnlock(featureName: string): boolean {
    if (this.devMode) return true;
    if (this.unlockedFeatures.has(featureName)) return true;

    // Auto-unlock system disabled - only manual purchases unlock features
    // This method now only checks if a feature is unlocked, doesn't auto-unlock
    return false;
  },
  toggleDevMode(): boolean {
    this.devMode = !this.devMode;
    if (this.devMode) {
      Object.keys(this.unlockConditions).forEach(f => this.unlockedFeatures.add(f));
      this.saveUnlockedFeatures();
    }
    this.updateFeatureVisibility();
    this.updateUnlocksTab();
    return this.devMode;
  },
  unlockFeature(feature: string): boolean {
    // Check if feature is available for unlock (either in old conditions or new purchase system)
    const isInOldSystem = this.unlockConditions[feature];
    const isInNewSystem = this.availableFeatures.includes(feature);

    if (isInOldSystem || isInNewSystem) {
      this.unlockedFeatures.add(feature);
      this.showUnlockNotification(feature);
      this.updateFeatureVisibility();
      this.saveUnlockedFeatures();
      try {
        (window as any).App?.events?.emit?.((window as any).App?.EVENT_NAMES?.FEATURE?.UNLOCKED, {
          feature,
        });
      } catch (error) {
        console.warn('Failed to emit feature unlocked event:', error);
      }
      return true;
    }
    return false;
  },
  showUnlockNotification(feature: string) {
    try {
      const notification = document.createElement('div');
      notification.className = 'unlock-notification';
      notification.innerHTML = `
        <div class="unlock-notification-content">
          <div class="unlock-notification-icon">🔓</div>
          <div class="unlock-notification-text">
            <div class="unlock-notification-title">New Feature Unlocked!</div>
            <div class="unlock-notification-feature">${feature}</div>
          </div>
        </div>
      `;

      // Add styles for better visibility
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
      `;

      document.body.appendChild(notification);

      // Play unlock sound
      try {
        (window as any).App?.systems?.audio?.button?.playLevelUpSound?.();
      } catch (error) {
        // Sound error - continue without sound
      }

      const duration = 3000; // 3 seconds
      setTimeout(() => {
        try {
          notification.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => notification.remove(), 300);
        } catch (error) {
          // Error handling - logging removed for production
        }
      }, duration);
    } catch (error) {
      // Error handling - logging removed for production
    }
  },
  updateFeatureVisibility() {
    // Prevent recursive calls that could cause infinite loops
    if (this._updatingFeatureVisibility) {
      return;
    }
    this._updatingFeatureVisibility = true;

    try {
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach((btn: Element) => {
        const dataAction = (btn as HTMLElement).getAttribute('data-action') || '';
        const isSwitch = dataAction.startsWith('switchTab:');
        const isPurchase = dataAction.startsWith('purchaseUnlock:');
        const tabName = isSwitch
          ? dataAction.split(':')[1]
          : isPurchase
            ? dataAction.split(':')[1]
            : null;
        if (!tabName || tabName === 'soda') return;

        // Options and Dev are always available; do not gate behind unlocks
        if (tabName === 'options' || tabName === 'dev') {
          (btn as HTMLElement).style.display = 'inline-block';
          try {
            (btn as HTMLElement).classList.remove('locked');
          } catch (error) {
            console.warn('Failed to remove locked class from button:', error);
          }
          return;
        }

        const isUnlocked = this.unlockedFeatures.has(tabName);
        // Always show buttons, but mark them as locked/unlocked
        (btn as HTMLElement).style.display = 'inline-block';
        try {
          (btn as HTMLElement).classList.toggle('locked', !isUnlocked);
          (btn as HTMLElement).classList.toggle('unlocked', isUnlocked);
        } catch (error) {
          console.warn('Failed to toggle locked class on button:', error);
        }

        // Update button content to show unlock cost if locked
        if (!isUnlocked) {
          // Always update unlock buttons to refresh affordability state
          this.updateTabButtonForUnlock(btn as HTMLElement, tabName);
        } else {
          this.updateTabButtonForUnlocked(btn as HTMLElement, tabName);
        }
      });

      // Also update mobile tab items
      const mobileTabItems = document.querySelectorAll('.mobile-tab-item');
      mobileTabItems.forEach((item: Element) => {
        const dataAction = (item as HTMLElement).getAttribute('data-action') || '';
        const isSwitch = dataAction.startsWith('switchTab:');
        const isPurchase = dataAction.startsWith('purchaseUnlock:');
        const tabName = isSwitch
          ? dataAction.split(':')[1]
          : isPurchase
            ? dataAction.split(':')[1]
            : null;
        if (!tabName || tabName === 'soda') return;

        // Options and Dev are always available
        if (tabName === 'options' || tabName === 'dev') {
          (item as HTMLElement).classList.remove('locked');
          return;
        }

        const isUnlocked = this.unlockedFeatures.has(tabName);
        (item as HTMLElement).classList.toggle('locked', !isUnlocked);
        (item as HTMLElement).classList.toggle('unlocked', isUnlocked);

        if (!isUnlocked) {
          // Always update unlock buttons to refresh affordability state
          this.updateMobileTabForUnlock(item as HTMLElement, tabName);
        } else {
          this.updateMobileTabForUnlocked(item as HTMLElement, tabName);
        }
      });
      this.updateUpgradeVisibility();
    } catch (error) {
      console.warn('Failed to update feature visibility:', error);
    } finally {
      this._updatingFeatureVisibility = false;
    }
  },
  updateUpgradeVisibility() {
    // Prevent recursive calls that could cause infinite loops
    if (this._updatingUpgradeVisibility) {
      return;
    }
    this._updatingUpgradeVisibility = true;

    const qs = (sel: string) => document.querySelector(sel) as HTMLElement | null;

    // Update suction upgrade
    const suction = qs('.upgrade-card:first-child');
    if (suction) {
      const isUnlocked = this.unlockedFeatures.has('suction');
      suction.style.display = 'block';
      this.updateUpgradeButtonForUnlock(suction, 'suction', isUnlocked);
    }

    // Update critical click upgrade
    const critical = qs('.upgrade-card:last-child');
    if (critical) {
      const isUnlocked = this.unlockedFeatures.has('criticalClick');
      critical.style.display = 'block';
      this.updateUpgradeButtonForUnlock(critical, 'criticalClick', isUnlocked);
    }

    // Update faster drinks upgrade
    const faster = qs('.drink-speed-upgrade-container');
    if (faster) {
      const isUnlocked = this.unlockedFeatures.has('fasterDrinks');
      faster.style.display = 'block';
      this.updateUpgradeButtonForUnlock(faster, 'fasterDrinks', isUnlocked);
    }

    // Update level up
    const levelUp = document.getElementById('levelUpDiv');
    if (levelUp) {
      const isUnlocked = this.unlockedFeatures.has('levelUp');
      (levelUp as HTMLElement).style.display = 'block';
      this.updateUpgradeButtonForUnlock(levelUp as HTMLElement, 'levelUp', isUnlocked);
    }

    // Update shop items
    const shopItems = document.querySelectorAll('.upgrade-card');
    shopItems.forEach((item, index) => {
      let featureName = '';
      if (index === 0) featureName = 'straws';
      else if (index === 1) featureName = 'widerStraws';
      else if (index === 2) featureName = 'cups';
      else if (index === 3) featureName = 'betterCups';

      if (featureName) {
        const isUnlocked = this.unlockedFeatures.has(featureName);
        (item as HTMLElement).style.display = 'block';
        this.updateUpgradeButtonForUnlock(item as HTMLElement, featureName, isUnlocked);
      }
    });

    this._updatingUpgradeVisibility = false;
  },
  saveUnlockedFeatures() {
    try {
      const arr = Array.from(this.unlockedFeatures);
      const app: any = (window as any).App;
      if (app?.storage?.setJSON) app.storage.setJSON('unlockedFeatures', arr);
      else localStorage.setItem('unlockedFeatures', JSON.stringify(arr));
    } catch (e) {
      try {
        console.warn('saveUnlockedFeatures failed', e);
      } catch (error) {
        console.warn('Failed to log saveUnlockedFeatures error:', error);
      }
    }
  },
  loadUnlockedFeatures() {
    try {
      const app: any = (window as any).App;
      let saved: any = null;
      if (app?.storage?.getJSON) saved = app.storage.getJSON('unlockedFeatures', null);
      else {
        const raw = localStorage.getItem('unlockedFeatures');
        if (raw) saved = JSON.parse(raw);
      }

      if (saved && Array.isArray(saved)) {
        // Load all saved features - they should be valid since they were saved by the system
        this.unlockedFeatures = new Set<string>(saved);

        // Ensure basic upgrades are always unlocked
        const basicUpgrades = ['straws', 'cups', 'widerStraws', 'betterCups', 'levelUp'];
        basicUpgrades.forEach(upgrade => this.unlockedFeatures.add(upgrade));

        console.log('Loaded unlocked features:', Array.from(this.unlockedFeatures));
      } else {
        // Only set default features if no saved data exists
        this.unlockedFeatures = new Set<string>([
          'soda',
          'options',
          'dev',
          'straws',
          'cups',
          'widerStraws',
          'betterCups',
          'levelUp',
        ]);
        console.log('No saved features found, using defaults:', Array.from(this.unlockedFeatures));
      }
    } catch (e) {
      try {
        console.error('Error loading unlocked features:', e);
      } catch (error) {
        console.warn('Failed to log loadUnlockedFeatures error:', error);
      }
      this.unlockedFeatures = new Set<string>(['soda', 'options', 'dev']);
    }
  },
  reset() {
    this.unlockedFeatures = new Set<string>(['soda', 'options', 'dev']);
    try {
      const app: any = (window as any).App;
      if (app?.storage?.remove) app.storage.remove('unlockedFeatures');
      else localStorage.removeItem('unlockedFeatures');
    } catch (error) {
      console.warn('Failed to remove unlocked features from storage:', error);
    }
    this.updateFeatureVisibility();
  },

  // Reset unlock system to ensure only default features are unlocked
  resetUnlockSystem() {
    console.log('Resetting unlock system to default state...');
    this.unlockedFeatures = new Set<string>(['soda', 'options', 'dev']);
    this.saveUnlockedFeatures();
    this.updateFeatureVisibility();
    this.updateUnlocksTab();
  },

  // Force reset all unlock data and clear storage
  forceResetUnlockSystem() {
    console.log('Force resetting unlock system - clearing all data...');
    this.unlockedFeatures = new Set<string>(['soda', 'options', 'dev']);

    // Clear all storage
    try {
      const app: any = (window as any).App;
      if (app?.storage?.remove) {
        app.storage.remove('unlockedFeatures');
      } else {
        localStorage.removeItem('unlockedFeatures');
      }
    } catch (error) {
      console.warn('Failed to clear unlock storage:', error);
    }

    this.saveUnlockedFeatures();
    this.updateFeatureVisibility();
    this.updateUnlocksTab();
  },

  // Global function to reset unlock system (accessible from console)
  resetAllUnlocks() {
    console.log('Resetting all unlocks to default state...');
    this.forceResetUnlockSystem();
    console.log(
      'Unlock system reset complete. Only soda, options, and dev tabs should be unlocked.'
    );
  },
  checkAllUnlocks() {
    // Auto-unlock system disabled - only manual purchases unlock features
    // This function now only updates the UI, doesn't perform auto-unlocks
    this.updateUnlocksTab();
  },
  updateUnlocksTab() {
    const unlocksGrid = document.getElementById('unlocksGrid');
    if (!unlocksGrid) return;

    // Simple progress overview since costs are now on buttons
    const totalFeatures = this.availableFeatures.length;
    const unlockedCount = this.unlockedFeatures.size - 3; // Subtract soda, options, dev
    const progressPercent = Math.round((unlockedCount / totalFeatures) * 100);

    unlocksGrid.innerHTML = `
      <div class="unlocks-overview">
        <div class="unlocks-progress-header">
          <h3>Feature Unlock Progress</h3>
          <div class="unlocks-progress-stats">
            <span class="unlocked-count">${unlockedCount}</span>
            <span class="progress-separator">/</span>
            <span class="total-count">${totalFeatures}</span>
            <span class="progress-percent">(${progressPercent}%)</span>
          </div>
        </div>
        
        <div class="unlocks-progress-bar">
          <div class="unlocks-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        
        <div class="unlocks-info">
          <p>💡 <strong>Tip:</strong> Unlock costs are now shown directly on buttons and tabs!</p>
          <p>Click any locked feature to see its unlock cost and purchase it.</p>
        </div>
        
        <div class="unlocks-features-list">
          <h4>Available Features:</h4>
          <div class="feature-grid">
            ${this.availableFeatures
              .map(feature => {
                const isUnlocked = this.unlockedFeatures.has(feature);
                const purchaseInfo = this.getUnlockPurchaseInfo(feature);
                const costText =
                  typeof (window as any).prettify !== 'undefined'
                    ? (window as any).prettify(Number(purchaseInfo.cost.toString()))
                    : purchaseInfo.cost.toString();

                return `
                  <div class="feature-item ${isUnlocked ? 'unlocked' : 'locked'}">
                    <span class="feature-icon">${isUnlocked ? '✅' : '🔒'}</span>
                    <span class="feature-name">${feature}</span>
                    ${!isUnlocked ? `<span class="feature-cost">${costText} Sips</span>` : ''}
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.updateUnlocksProgress();
  },
  updateUnlocksProgress() {
    const w: any = window as any;
    const st = w.App?.state?.getState?.() || {};
    if (typeof st.sips === 'undefined' || typeof st.totalClicks === 'undefined') return;
    const total = this.availableFeatures.length;
    const unlocked = this.unlockedFeatures.size - 3; // Subtract soda, options, dev
    const pct = (unlocked / total) * 100;
    const progressElement = document.getElementById('unlocksProgress');
    const progressFillElement = document.getElementById('unlocksProgressFill');
    if (progressElement) progressElement.textContent = `${unlocked}/${total}`;
    if (progressFillElement) (progressFillElement as HTMLElement).style.width = `${pct}%`;
  },

  // New methods for unlock purchase system
  getUnlockCost(featureName: string) {
    return unlockPurchases.getCost(featureName);
  },

  canPurchaseUnlock(featureName: string) {
    return unlockPurchases.canPurchase(featureName);
  },

  purchaseUnlock(featureName: string) {
    return unlockPurchases.execute(featureName);
  },

  getUnlockPurchaseInfo(featureName: string) {
    return unlockPurchases.getInfo(featureName);
  },

  getAllUnlockPurchaseInfo() {
    return unlockPurchases.getAllInfo();
  },

  // Check if feature is available for purchase (not unlocked and affordable)
  isFeatureAvailableForPurchase(featureName: string): boolean {
    const info = this.getUnlockPurchaseInfo(featureName);
    return info.canPurchase;
  },

  // Get all features available for purchase
  getAvailableFeaturesForPurchase(): string[] {
    const allInfo = this.getAllUnlockPurchaseInfo();
    if (!allInfo) return [];
    return Object.keys(allInfo).filter(feature => allInfo[feature]?.canPurchase);
  },

  // Update tab button to show unlock cost when locked
  updateTabButtonForUnlock(button: HTMLElement, tabName: string) {
    const purchaseInfo = this.getUnlockPurchaseInfo(tabName);
    const cost = purchaseInfo.cost;
    const canPurchase = purchaseInfo.canPurchase;

    // Get feature info for display
    const featureInfo: Record<string, { icon: string; name: string }> = {
      shop: { icon: '🛒', name: 'Shop & Upgrades' },
      stats: { icon: '📊', name: 'Statistics' },
      god: { icon: '🙏', name: 'Talk to God' },
      unlocks: { icon: '🔓', name: 'Unlocks' },
    };

    const info = featureInfo[tabName] || { icon: '❓', name: tabName };
    const costText =
      typeof (window as any).prettify !== 'undefined'
        ? (window as any).prettify(Number(cost.toString()))
        : cost.toString();

    // Update button content
    button.innerHTML = `
      <span class="tab-icon">${info.icon}</span>
      <span class="tab-label">${info.name}</span>
      <span class="tab-unlock-cost">${costText} Sips</span>
    `;

    // Update data-action to purchase unlock
    button.setAttribute('data-action', `purchaseUnlock:${tabName}`);

    // Add appropriate classes
    button.classList.remove('unlocked');
    button.classList.add('locked');
    if (canPurchase) {
      button.classList.add('affordable');
    } else {
      button.classList.remove('affordable');
    }
  },

  // Update tab button to show normal unlocked state
  updateTabButtonForUnlocked(button: HTMLElement, tabName: string) {
    const featureInfo: Record<string, { icon: string; name: string }> = {
      shop: { icon: '🛒', name: 'Shop & Upgrades' },
      stats: { icon: '📊', name: 'Statistics' },
      god: { icon: '🙏', name: 'Talk to God' },
      unlocks: { icon: '🔓', name: 'Unlocks' },
    };

    const info = featureInfo[tabName] || { icon: '❓', name: tabName };

    // Update button content
    button.innerHTML = `
      <span class="tab-icon">${info.icon}</span>
      <span class="tab-label">${info.name}</span>
    `;

    // Update data-action back to switch tab
    button.setAttribute('data-action', `switchTab:${tabName}`);

    // Add appropriate classes
    button.classList.remove('locked', 'affordable');
    button.classList.add('unlocked');
  },

  // Update mobile tab to show unlock cost when locked
  updateMobileTabForUnlock(item: HTMLElement, tabName: string) {
    const purchaseInfo = this.getUnlockPurchaseInfo(tabName);
    const cost = purchaseInfo.cost;
    const canPurchase = purchaseInfo.canPurchase;

    // Get feature info for display
    const featureInfo: Record<string, { icon: string; name: string }> = {
      shop: { icon: '🛒', name: 'Shop' },
      stats: { icon: '📊', name: 'Stats' },
      god: { icon: '🙏', name: 'God' },
      unlocks: { icon: '🔓', name: 'Unlocks' },
    };

    const info = featureInfo[tabName] || { icon: '❓', name: tabName };
    const costText =
      typeof (window as any).prettify !== 'undefined'
        ? (window as any).prettify(Number(cost.toString()))
        : cost.toString();

    // Update item content
    item.innerHTML = `
      <div class="mobile-tab-icon">${info.icon}</div>
      <div class="mobile-tab-label">${info.name}</div>
      <div class="mobile-tab-unlock-cost">${costText}</div>
    `;

    // Update data-action to purchase unlock
    item.setAttribute('data-action', `purchaseUnlock:${tabName}`);

    // Add appropriate classes
    item.classList.remove('unlocked');
    item.classList.add('locked');
    if (canPurchase) {
      item.classList.add('affordable');
    } else {
      item.classList.remove('affordable');
    }
  },

  // Update mobile tab to show normal unlocked state
  updateMobileTabForUnlocked(item: HTMLElement, tabName: string) {
    const featureInfo: Record<string, { icon: string; name: string }> = {
      shop: { icon: '🛒', name: 'Shop' },
      stats: { icon: '📊', name: 'Stats' },
      god: { icon: '🙏', name: 'God' },
      unlocks: { icon: '🔓', name: 'Unlocks' },
    };

    const info = featureInfo[tabName] || { icon: '❓', name: tabName };

    // Update item content
    item.innerHTML = `
      <div class="mobile-tab-icon">${info.icon}</div>
      <div class="mobile-tab-label">${info.name}</div>
    `;

    // Update data-action back to switch tab
    item.setAttribute('data-action', `switchTab:${tabName}`);

    // Add appropriate classes
    item.classList.remove('locked', 'affordable');
    item.classList.add('unlocked');
  },

  // Update upgrade button to show unlock cost when locked
  updateUpgradeButtonForUnlock(container: HTMLElement, featureName: string, isUnlocked: boolean) {
    if (isUnlocked) {
      // Restore normal upgrade functionality
      this.restoreUpgradeButton(container, featureName);
      return;
    }

    const purchaseInfo = this.getUnlockPurchaseInfo(featureName);
    const cost = purchaseInfo.cost;
    const canPurchase = purchaseInfo.canPurchase;

    // Get feature info for display
    const featureInfo: Record<string, { icon: string; name: string }> = {
      suction: { icon: '💨', name: 'Suction Upgrade' },
      criticalClick: { icon: '⚡', name: 'Critical Click' },
      fasterDrinks: { icon: '⚡', name: 'Faster Drinks' },
      straws: { icon: '🥤', name: 'Straws' },
      widerStraws: { icon: '🥤', name: 'Wider Straws' },
      cups: { icon: '☕', name: 'Cups' },
      betterCups: { icon: '☕', name: 'Better Cups' },
      levelUp: { icon: '⭐', name: 'Level Up' },
    };

    const info = featureInfo[featureName] || { icon: '❓', name: featureName };
    const costText =
      typeof (window as any).prettify !== 'undefined'
        ? (window as any).prettify(Number(cost.toString()))
        : cost.toString();

    // Find the button within the container
    const button = container.querySelector('button') as HTMLElement;
    if (!button) return;

    // Update button content to show unlock cost
    button.innerHTML = `
      <div class="upgrade-icon">${info.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${info.name}</div>
        <div class="upgrade-unlock-cost">Unlock: ${costText} Sips</div>
      </div>
    `;

    // Update data-action to purchase unlock
    button.setAttribute('data-action', `purchaseUnlock:${featureName}`);

    // Add appropriate classes
    button.classList.remove('affordable');
    button.classList.add('locked');
    if (canPurchase) {
      button.classList.add('affordable');
    }

    // Hide stats/effects when locked
    const stats = container.querySelector('.upgrade-stats, .upgrade-effect');
    if (stats) {
      (stats as HTMLElement).style.display = 'none';
    }
  },

  // Restore upgrade button to normal functionality
  restoreUpgradeButton(container: HTMLElement, featureName: string) {
    const button = container.querySelector('button') as HTMLElement;
    if (!button) return;

    // Restore original data-action based on feature
    const actionMap: Record<string, string> = {
      suction: 'buySuction',
      criticalClick: 'buyCriticalClick',
      fasterDrinks: 'buyFasterDrinks',
      straws: 'buyStraw',
      widerStraws: 'buyWiderStraws',
      cups: 'buyCup',
      betterCups: 'buyBetterCups',
      levelUp: 'levelUp',
    };

    const action = actionMap[featureName];
    if (action) {
      button.setAttribute('data-action', action);
    }

    // Remove lock classes
    button.classList.remove('locked', 'affordable');

    // Show stats/effects when unlocked
    const stats = container.querySelector('.upgrade-stats, .upgrade-effect');
    if (stats) {
      (stats as HTMLElement).style.display = '';
    }

    // Restore normal button content structure
    const costElementId = this.getCostElementId(featureName);
    button.innerHTML = `<div class="upgrade-cost"><span id="${costElementId}">0</span> Sips</div>`;

    // Trigger UI update to restore normal button content
    try {
      (window as any).App?.ui?.updateAllDisplays?.();
      // Also trigger affordability check to update costs immediately
      (window as any).App?.ui?.checkUpgradeAffordability?.();
    } catch (error) {
      console.warn('Failed to update displays after unlock:', error);
    }
  },

  // Get the cost element ID for a feature
  getCostElementId(featureName: string): string {
    const costElementMap: Record<string, string> = {
      suction: 'suctionCost',
      criticalClick: 'criticalClickCost',
      fasterDrinks: 'fasterDrinksCost',
      straws: 'strawCost',
      widerStraws: 'widerStrawsCost',
      cups: 'cupCost',
      betterCups: 'betterCupsCost',
      levelUp: 'levelUpCost',
    };
    return costElementMap[featureName] || `${featureName}Cost`;
  },
};

// No global attach; loaded into App.systems.unlocks by ts/index.ts
