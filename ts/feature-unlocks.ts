// Feature unlocks system (TypeScript)

type UnlockCondition = { sips: number; clicks: number };
type UnlockMap = Record<string, UnlockCondition>;

console.log('=== FEATURE-UNLOCKS.TS LOADING ===');

export const FEATURE_UNLOCKS = {
  unlockedFeatures: new Set<string>(['soda', 'options', 'dev']),
  devMode: false,
  get unlockConditions(): UnlockMap {
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
  init() {
    try {
      this.loadUnlockedFeatures();
      // Ensure only default feature is unlocked if saved data is malformed or overly permissive
      if (
        !this.unlockedFeatures ||
        !(this.unlockedFeatures instanceof Set) ||
        this.unlockedFeatures.size === 0
      ) {
        this.unlockedFeatures = new Set<string>(['soda']);
      }
      this.updateFeatureVisibility();
      this.updateUnlocksTab();
      console.log('FEATURE_UNLOCKS system initialized');
    } catch (error) {
      console.error('Failed to initialize FEATURE_UNLOCKS system:', error);
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
    const condition = this.unlockConditions[featureName];
    if (!condition) return false;
    const w: any = window as any;
    const st = w.App?.state?.getState?.() || {};
    const sipsNum = Number(st.sips ?? 0);
    const clicksNum = Number(st.totalClicks ?? 0);
    const sipsMet = sipsNum >= condition.sips;
    const clicksMet = clicksNum >= condition.clicks;
    if (sipsMet && clicksMet) {
      this.unlockFeature(featureName);
      return true;
    }
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
    if (this.unlockConditions[feature]) {
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
      notification.textContent = `New feature unlocked: ${feature}!`;
      document.body.appendChild(notification);
      const config: any = (window as any).GAME_CONFIG || {};
      const duration = config.TIMING?.UNLOCK_NOTIFICATION_DURATION || 2000;
      setTimeout(() => {
        try {
          notification.remove();
        } catch (error) {
          console.warn('Failed to remove unlock notification:', error);
        }
      }, duration);
    } catch (error) {
      console.warn('Failed to show unlock notification:', error);
    }
  },
  updateFeatureVisibility() {
    try {
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach((btn: Element) => {
        const dataAction = (btn as HTMLElement).getAttribute('data-action') || '';
        const isSwitch = dataAction.startsWith('switchTab:');
        const tabName = isSwitch ? dataAction.split(':')[1] : null;
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
        (btn as HTMLElement).style.display = isUnlocked ? 'inline-block' : 'none';
        try {
          (btn as HTMLElement).classList.toggle('locked', !isUnlocked);
        } catch (error) {
          console.warn('Failed to toggle locked class on button:', error);
        }
      });
      this.updateUpgradeVisibility();
    } catch (error) {
      console.warn('Failed to update feature visibility:', error);
    }
  },
  updateUpgradeVisibility() {
    const qs = (sel: string) => document.querySelector(sel) as HTMLElement | null;
    const suction = qs('.clicking-upgrade-item:first-child');
    if (suction) suction.style.display = this.unlockedFeatures.has('suction') ? 'block' : 'none';
    const critical = qs('.clicking-upgrade-item:last-child');
    if (critical)
      critical.style.display = this.unlockedFeatures.has('criticalClick') ? 'block' : 'none';
    const faster = qs('.drink-speed-upgrade-container');
    if (faster) faster.style.display = this.unlockedFeatures.has('fasterDrinks') ? 'block' : 'none';
    const levelUp = document.getElementById('levelUpDiv');
    if (levelUp)
      (levelUp as HTMLElement).style.display = this.unlockedFeatures.has('levelUp')
        ? 'block'
        : 'none';
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach((item, index) => {
      let show = false;
      if (index === 0) show = this.unlockedFeatures.has('straws');
      else if (index === 1) show = this.unlockedFeatures.has('widerStraws');
      else if (index === 2) show = this.unlockedFeatures.has('cups');
      else if (index === 3) show = this.unlockedFeatures.has('betterCups');
      (item as HTMLElement).style.display = show ? 'block' : 'none';
    });
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
      if (saved) this.unlockedFeatures = new Set<string>(saved as string[]);
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
  checkAllUnlocks() {
    const w: any = window as any;
    const st = w.App?.state?.getState?.() || {};
    if (typeof st.sips === 'undefined' || typeof st.totalClicks === 'undefined') return;
    Object.keys(this.unlockConditions).forEach(f => this.checkUnlock(f));
    this.updateUnlocksTab();
  },
  updateUnlocksTab() {
    const unlocksGrid = document.getElementById('unlocksGrid');
    if (!unlocksGrid) return;
    const w: any = window as any;
    const st = w.App?.state?.getState?.() || {};
    if (typeof st.sips === 'undefined' || typeof st.totalClicks === 'undefined') return;
    unlocksGrid.innerHTML = '';
    const featureInfo: Record<
      string,
      { icon: string; name: string; description: string; category: string }
    > = {
      suction: {
        icon: '💨',
        name: 'Suction Upgrade',
        description: 'Increases sips gained per click',
        category: 'Clicking',
      },
      criticalClick: {
        icon: '⚡',
        name: 'Critical Click',
        description: 'Chance to get bonus sips on clicks',
        category: 'Clicking',
      },
      fasterDrinks: {
        icon: '⚡',
        name: 'Faster Drinks',
        description: 'Reduces time between automatic drinks',
        category: 'Drinking',
      },
      straws: {
        icon: '🥤',
        name: 'Straws',
        description: 'Passive sips production per drink',
        category: 'Production',
      },
      cups: {
        icon: '☕',
        name: 'Cups',
        description: 'More passive sips production per drink',
        category: 'Production',
      },
      widerStraws: {
        icon: '🥤',
        name: 'Wider Straws',
        description: 'Upgrade to increase straw production',
        category: 'Production',
      },
      betterCups: {
        icon: '☕',
        name: 'Better Cups',
        description: 'Upgrade to increase cup production',
        category: 'Production',
      },
      levelUp: {
        icon: '⭐',
        name: 'Level Up',
        description: 'Increase your level for bonus sips',
        category: 'Progression',
      },
      shop: {
        icon: '🛒',
        name: 'Shop & Upgrades',
        description: 'Access the shop to buy upgrades',
        category: 'Interface',
      },
      stats: {
        icon: '📊',
        name: 'Statistics',
        description: 'View your game statistics and progress',
        category: 'Interface',
      },
      god: {
        icon: '🙏',
        name: 'Talk to God',
        description: 'Seek divine wisdom and guidance',
        category: 'Special',
      },
      options: {
        icon: '⚙️',
        name: 'Options',
        description: 'Configure game settings and save/load',
        category: 'Interface',
      },
      unlocks: {
        icon: '🔓',
        name: 'Unlocks',
        description: 'Track your feature unlock progress',
        category: 'Interface',
      },
      dev: {
        icon: '🛠️',
        name: 'Developer Tools',
        description: 'Access developer tools and debugging features',
        category: 'Development',
      },
    };
    Object.keys(this.unlockConditions).forEach(feature => {
      const info = featureInfo[feature];
      const condition = this.unlockConditions[feature];
      if (!info || !condition) return;
      const isUnlocked = this.unlockedFeatures.has(feature);
      const sipsMet = Number(st.sips || 0) >= condition.sips;
      const clicksMet = Number(st.totalClicks || 0) >= condition.clicks;
      const el = document.createElement('div');
      el.className = `unlock-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      el.innerHTML = `
        <div class="unlock-status">${isUnlocked ? '🔓' : '🔒'}</div>
        <div class="unlock-header">
          <div class="unlock-icon">${info.icon || '❓'}</div>
          <div class="unlock-info">
            <div class="unlock-name">${info.name || feature}</div>
            <div class="unlock-description">${info.description || 'No description available'}</div>
          </div>
        </div>
        <div class="unlock-requirements">
          <div class="requirement ${sipsMet ? 'met' : ''}">
            <span class="requirement-label">Total Sips:</span>
            <span class="requirement-value">${typeof (window as any).prettify !== 'undefined' ? (window as any).prettify(Number(st.sips || 0)) : String(Number(st.sips || 0))} / ${typeof (window as any).prettify !== 'undefined' ? (window as any).prettify(condition.sips) : String(condition.sips)}</span>
          </div>
          <div class="requirement ${clicksMet ? 'met' : ''}">
            <span class="requirement-label">Total Clicks:</span>
            <span class="requirement-value">${Number(st.totalClicks || 0)} / ${condition.clicks}</span>
          </div>
        </div>`;
      unlocksGrid.appendChild(el);
    });
    this.updateUnlocksProgress();
  },
  updateUnlocksProgress() {
    const w: any = window as any;
    const st = w.App?.state?.getState?.() || {};
    if (typeof st.sips === 'undefined' || typeof st.totalClicks === 'undefined') return;
    const total = Object.keys(this.unlockConditions).length;
    const unlocked = this.unlockedFeatures.size - 1;
    const pct = (unlocked / total) * 100;
    const progressElement = document.getElementById('unlocksProgress');
    const progressFillElement = document.getElementById('unlocksProgressFill');
    if (progressElement) progressElement.textContent = `${unlocked}/${total}`;
    if (progressFillElement) (progressFillElement as HTMLElement).style.width = `${pct}%`;
  },
};

// No global attach; loaded into App.systems.unlocks by ts/index.ts
