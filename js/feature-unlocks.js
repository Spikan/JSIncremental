// ============================================================================
// FEATURE UNLOCKS SYSTEM
// ============================================================================
// Manages progressive feature unlocking based on player progress

console.log('=== FEATURE-UNLOCKS.JS LOADING ===');

// Feature unlock conditions and configuration
const FEATURE_UNLOCKS = {
    // Track unlocked features
    unlockedFeatures: new Set(['soda', 'options']), // Start with soda clicking and options always available
    
    // Define unlock conditions for each feature - prefer data/unlocks.json via App.data
    get unlockConditions() {
        // Prefer loaded JSON data if available
        const data = window.App?.data?.unlocks;
        if (data) return data;
        // Fallback to config
        const config = window.GAME_CONFIG || {};
        return {
            'suction': config.UNLOCKS?.SUCTION || { sips: 25, clicks: 8 },
            'criticalClick': config.UNLOCKS?.CRITICAL_CLICK || { sips: 100, clicks: 20 },
            'fasterDrinks': config.UNLOCKS?.FASTER_DRINKS || { sips: 200, clicks: 30 },
            'straws': config.UNLOCKS?.STRAWS || { sips: 500, clicks: 50 },
            'cups': config.UNLOCKS?.CUPS || { sips: 1000, clicks: 80 },
            'widerStraws': config.UNLOCKS?.WIDER_STRAWS || { sips: 2000, clicks: 120 },
            'betterCups': config.UNLOCKS?.BETTER_CUPS || { sips: 5000, clicks: 200 },
            'levelUp': config.UNLOCKS?.LEVEL_UP || { sips: 3000, clicks: 150 },
            'shop': config.UNLOCKS?.SHOP || { sips: 500, clicks: 30 },
            'stats': config.UNLOCKS?.STATS || { sips: 1000, clicks: 60 },
            'god': config.UNLOCKS?.GOD || { sips: 5000, clicks: 300 },
            'unlocks': config.UNLOCKS?.UNLOCKS_TAB || { sips: 25, clicks: 8 }
        };
    },
    
    // Initialize the feature unlock system
    init() {
        console.log('Initializing FEATURE_UNLOCKS system...');
        console.log('Initial unlocked features:', Array.from(this.unlockedFeatures));
        
        // Load previously unlocked features from localStorage
        this.loadUnlockedFeatures();
        console.log('After loading from localStorage:', Array.from(this.unlockedFeatures));
        
        // Set up initial feature visibility
        this.updateFeatureVisibility();
        
        // Update the unlocks tab
        this.updateUnlocksTab();
        
        console.log('FEATURE_UNLOCKS system initialized');
    },
    
    // Check if a feature should be unlocked based on current progress
    checkUnlocks(sips, clicks) {
        let newUnlocks = [];
        
        for (const [feature, conditions] of Object.entries(this.unlockConditions)) {
            if (!this.unlockedFeatures.has(feature) && 
                sips.gte(conditions.sips) && 
                clicks >= conditions.clicks) {
                newUnlocks.push(feature);
            }
        }
        
        return newUnlocks;
    },
    
    // Check if a specific feature should be unlocked
    checkUnlock(featureName) {
        console.log(`Checking unlock for feature: ${featureName}`);
        
        if (this.unlockedFeatures.has(featureName)) {
            console.log(`Feature ${featureName} already unlocked`);
            return true; // Already unlocked
        }
        
        const condition = this.unlockConditions[featureName];
        if (!condition) {
            console.log(`No unlock condition defined for ${featureName}`);
            return false; // No unlock condition defined
        }
        
        // Safely check if global variables exist before using them
        if (typeof window.sips === 'undefined' || typeof window.totalClicks === 'undefined') {
            console.log(`Global variables not ready for ${featureName}`);
            return false; // Global variables not ready yet
        }
        
        console.log(`Checking conditions for ${featureName}: sips >= ${condition.sips}, clicks >= ${condition.clicks}`);
        console.log(`Current sips: ${window.sips}, current clicks: ${window.totalClicks}`);
        
        // Check if conditions are met
        const sipsMet = window.sips && window.sips.gte ? window.sips.gte(condition.sips) : false;
        const clicksMet = window.totalClicks >= condition.clicks;
        
        console.log(`Conditions met - sips: ${sipsMet}, clicks: ${clicksMet}`);
        
        if (sipsMet && clicksMet) {
            console.log(`Unlocking feature: ${featureName}`);
            this.unlockFeature(featureName);
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.FEATURE?.UNLOCKED, { feature: featureName }); } catch {}
            return true;
        }
        
        return false;
    },
    
    // Unlock a specific feature
    unlockFeature(feature) {
        if (this.unlockConditions[feature]) {
            this.unlockedFeatures.add(feature);
            this.showUnlockNotification(feature);
            this.updateFeatureVisibility();
            this.saveUnlockedFeatures();
            try { window.App?.events?.emit?.(window.App?.EVENT_NAMES?.FEATURE?.UNLOCKED, { feature }); } catch {}
            return true;
        }
        return false;
    },
    
    // Show unlock notification
    showUnlockNotification(feature) {
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.textContent = `New feature unlocked: ${feature}!`;
        
        document.body.appendChild(notification);
        
        // Remove notification after configured duration
        const config = window.GAME_CONFIG || {};
        const duration = config.TIMING?.UNLOCK_NOTIFICATION_DURATION;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    },
    
    // Update UI visibility based on unlocked features
    updateFeatureVisibility() {
        console.log('Updating feature visibility...');
        console.log('Unlocked features:', Array.from(this.unlockedFeatures));
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            console.log('Button onclick:', onclick);
            
            if (onclick) {
                const match = onclick.match(/switchTab\('([^']+)'/);
                const tabName = match ? match[1] : null;
                console.log('Extracted tab name:', tabName);
                
                if (tabName && tabName !== 'soda') {
                    const isUnlocked = this.unlockedFeatures.has(tabName);
                    console.log(`Tab ${tabName} unlocked:`, isUnlocked);
                    
                    if (isUnlocked) {
                        btn.style.display = 'inline-block';
                        btn.classList.remove('locked');
                    } else {
                        btn.style.display = 'none';
                        btn.classList.add('locked');
                    }
                }
            }
        });
        
        // Update upgrade buttons and sections
        this.updateUpgradeVisibility();
    },
    
    // Update visibility of upgrade buttons
    updateUpgradeVisibility() {
        // Suction upgrade
        const suctionBtn = document.querySelector('.clicking-upgrade-item:first-child');
        if (suctionBtn) {
            suctionBtn.style.display = this.unlockedFeatures.has('suction') ? 'block' : 'none';
        }
        
        // Critical Click upgrade
        const criticalBtn = document.querySelector('.clicking-upgrade-item:last-child');
        if (criticalBtn) {
            criticalBtn.style.display = this.unlockedFeatures.has('criticalClick') ? 'block' : 'none';
        }
        
        // Faster Drinks upgrade
        const fasterDrinksContainer = document.querySelector('.drink-speed-upgrade-container');
        if (fasterDrinksContainer) {
            fasterDrinksContainer.style.display = this.unlockedFeatures.has('fasterDrinks') ? 'block' : 'none';
        }
        
        // Level Up button
        const levelUpDiv = document.getElementById('levelUpDiv');
        if (levelUpDiv) {
            levelUpDiv.style.display = this.unlockedFeatures.has('levelUp') ? 'block' : 'none';
        }
        
        // Shop items
        const shopItems = document.querySelectorAll('.shop-item');
        shopItems.forEach((item, index) => {
            let shouldShow = false;
            if (index === 0) shouldShow = this.unlockedFeatures.has('straws');
            else if (index === 1) shouldShow = this.unlockedFeatures.has('widerStraws');
            else if (index === 2) shouldShow = this.unlockedFeatures.has('cups');
            else if (index === 3) shouldShow = this.unlockedFeatures.has('betterCups');
            
            item.style.display = shouldShow ? 'block' : 'none';
        });
    },
    
    // Save unlocked features to storage (namespaced), with legacy fallback
    saveUnlockedFeatures() {
        try {
            if (window.App?.storage?.setJSON) {
                window.App.storage.setJSON('unlockedFeatures', Array.from(this.unlockedFeatures));
            } else {
                localStorage.setItem('unlockedFeatures', JSON.stringify(Array.from(this.unlockedFeatures)));
            }
        } catch (e) {
            console.warn('saveUnlockedFeatures failed', e);
        }
    },
    
    // Load unlocked features from storage
    loadUnlockedFeatures() {
        try {
            let saved = null;
            if (window.App?.storage?.getJSON) {
                saved = window.App.storage.getJSON('unlockedFeatures', null);
            } else {
                const raw = localStorage.getItem('unlockedFeatures');
                if (raw) saved = JSON.parse(raw);
            }
            if (saved) {
                this.unlockedFeatures = new Set(saved);
            }
        } catch (e) {
            console.error('Error loading unlocked features:', e);
            this.unlockedFeatures = new Set(['soda', 'options']);
        }
    },
    
    // Reset all unlocked features (for save deletion)
    reset() {
        this.unlockedFeatures = new Set(['soda', 'options']);
        try {
            if (window.App?.storage?.remove) {
                window.App.storage.remove('unlockedFeatures');
            } else {
                localStorage.removeItem('unlockedFeatures');
            }
        } catch {}
        this.updateFeatureVisibility();
    },
    
    // Check all unlock conditions (called periodically)
    checkAllUnlocks() {
        // Safely check if global variables exist before proceeding
        if (typeof window.sips === 'undefined' || typeof window.totalClicks === 'undefined') {
            return; // Global variables not ready yet
        }
        
        Object.keys(this.unlockConditions).forEach(feature => {
            this.checkUnlock(feature);
        });
        
        // Update unlocks tab if it's visible
        this.updateUnlocksTab();
    },
    
    // Update the unlocks tab display
    updateUnlocksTab() {
        const unlocksGrid = document.getElementById('unlocksGrid');
        if (!unlocksGrid) return;
        
        // Safely check if global variables exist before proceeding
        if (typeof window.sips === 'undefined' || typeof window.totalClicks === 'undefined') {
            return; // Global variables not ready yet
        }
        
        // Clear existing content
        unlocksGrid.innerHTML = '';
        
        // Define feature information
        const featureInfo = {
            'suction': {
                icon: '💨',
                name: 'Suction Upgrade',
                description: 'Increases sips gained per click',
                category: 'Clicking'
            },
            'criticalClick': {
                icon: '⚡',
                name: 'Critical Click',
                description: 'Chance to get bonus sips on clicks',
                category: 'Clicking'
            },
            'fasterDrinks': {
                icon: '⚡',
                name: 'Faster Drinks',
                description: 'Reduces time between automatic drinks',
                category: 'Drinking'
            },
            'straws': {
                icon: '🥤',
                name: 'Straws',
                description: 'Passive sips production per drink',
                category: 'Production'
            },
            'cups': {
                icon: '☕',
                name: 'Cups',
                description: 'More passive sips production per drink',
                category: 'Production'
            },
            'widerStraws': {
                icon: '🥤',
                name: 'Wider Straws',
                description: 'Upgrade to increase straw production',
                category: 'Production'
            },
            'betterCups': {
                icon: '☕',
                name: 'Better Cups',
                description: 'Upgrade to increase cup production',
                category: 'Production'
            },
            'levelUp': {
                icon: '⭐',
                name: 'Level Up',
                description: 'Increase your level for bonus sips',
                category: 'Progression'
            },
            'shop': {
                icon: '🛒',
                name: 'Shop & Upgrades',
                description: 'Access the shop to buy upgrades',
                category: 'Interface'
            },
            'stats': {
                icon: '📊',
                name: 'Statistics',
                description: 'View your game statistics and progress',
                category: 'Interface'
            },
            'god': {
                icon: '🙏',
                name: 'Talk to God',
                description: 'Seek divine wisdom and guidance',
                category: 'Special'
            },
            'options': {
                icon: '⚙️',
                name: 'Options',
                description: 'Configure game settings and save/load',
                category: 'Interface'
            },
            'unlocks': {
                icon: '🔓',
                name: 'Unlocks',
                description: 'Track your feature unlock progress',
                category: 'Interface'
            }
        };
        
        // Create unlock items
        Object.keys(this.unlockConditions).forEach(feature => {
            const info = featureInfo[feature];
            const condition = this.unlockConditions[feature];
            const isUnlocked = this.unlockedFeatures.has(feature);
            
            const unlockItem = document.createElement('div');
            unlockItem.className = `unlock-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            const sipsMet = typeof window.sips !== 'undefined' && window.sips.gte ? window.sips.gte(condition.sips) : false;
            const clicksMet = typeof window.totalClicks !== 'undefined' && window.totalClicks >= condition.clicks;
            
            unlockItem.innerHTML = `
                <div class="unlock-status">${isUnlocked ? '🔓' : '🔒'}</div>
                <div class="unlock-header">
                    <div class="unlock-icon">${info.icon}</div>
                    <div class="unlock-info">
                        <div class="unlock-name">${info.name}</div>
                        <div class="unlock-description">${info.description}</div>
                    </div>
                </div>
                <div class="unlock-requirements">
                    <div class="requirement ${sipsMet ? 'met' : ''}">
                        <span class="requirement-label">Total Sips:</span>
                        <span class="requirement-value">${typeof window.prettify !== 'undefined' ? window.prettify(window.sips) : '0'} / ${typeof window.prettify !== 'undefined' ? window.prettify(condition.sips) : '0'}</span>
                    </div>
                    <div class="requirement ${clicksMet ? 'met' : ''}">
                        <span class="requirement-label">Total Clicks:</span>
                        <span class="requirement-value">${typeof window.totalClicks !== 'undefined' ? window.totalClicks : 0} / ${condition.clicks}</span>
                    </div>
                </div>
            `;
            
            unlocksGrid.appendChild(unlockItem);
        });
        
        // Update progress
        this.updateUnlocksProgress();
    },
    
    // Update the unlocks progress display
    updateUnlocksProgress() {
        // Safely check if global variables exist before proceeding
        if (typeof window.sips === 'undefined' || typeof window.totalClicks === 'undefined') {
            return; // Global variables not ready yet
        }
        
        const totalFeatures = Object.keys(this.unlockConditions).length;
        const unlockedCount = this.unlockedFeatures.size - 1; // Subtract 'soda' which starts unlocked
        const progressPercent = (unlockedCount / totalFeatures) * 100;
        
        const progressElement = document.getElementById('unlocksProgress');
        const progressFillElement = document.getElementById('unlocksProgressFill');
        
        if (progressElement) {
            progressElement.textContent = `${unlockedCount}/${totalFeatures}`;
        }
        
        if (progressFillElement) {
            progressFillElement.style.width = `${progressPercent}%`;
        }
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FEATURE_UNLOCKS;
} else {
    // Browser environment - make it globally available
    window.FEATURE_UNLOCKS = FEATURE_UNLOCKS;
    console.log('=== FEATURE-UNLOCKS.JS FULLY LOADED ===');
    console.log('FEATURE_UNLOCKS object available at:', window.FEATURE_UNLOCKS);
}
