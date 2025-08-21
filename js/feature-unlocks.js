// ============================================================================
// FEATURE UNLOCKS SYSTEM
// ============================================================================
// Manages progressive feature unlocking based on player progress

// Feature unlock conditions and configuration
const FEATURE_UNLOCKS = {
    // Track unlocked features
    unlockedFeatures: new Set(['soda', 'options']), // Start with soda clicking and options always available
    
    // Define unlock conditions for each feature
    unlockConditions: {
        'suction': { sips: 25, clicks: 8 },
        'criticalClick': { sips: 100, clicks: 20 },
        'fasterDrinks': { sips: 200, clicks: 30 },
        'straws': { sips: 500, clicks: 50 },
        'cups': { sips: 1000, clicks: 80 },
        'widerStraws': { sips: 2000, clicks: 120 },
        'betterCups': { sips: 5000, clicks: 200 },
        'levelUp': { sips: 3000, clicks: 150 },
        'shop': { sips: 500, clicks: 30 },
        'stats': { sips: 1000, clicks: 60 },
        'god': { sips: 5000, clicks: 300 },
        'unlocks': { sips: 25, clicks: 8 }
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
        if (this.unlockedFeatures.has(featureName)) {
            return true; // Already unlocked
        }
        
        const condition = this.unlockConditions[featureName];
        if (!condition) {
            return false; // No unlock condition defined
        }
        
        // Check if conditions are met
        const sipsMet = window.sips && window.sips.gte ? window.sips.gte(condition.sips) : false;
        const clicksMet = window.totalClicks >= condition.clicks;
        
        if (sipsMet && clicksMet) {
            this.unlockFeature(featureName);
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
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    },
    
    // Update UI visibility based on unlocked features
    updateFeatureVisibility() {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const tabName = btn.getAttribute('onclick').match(/switchTab\('([^']+)'/)?.[1];
            if (tabName && tabName !== 'soda') {
                if (this.unlockedFeatures.has(tabName)) {
                    btn.style.display = 'inline-block';
                    btn.classList.remove('locked');
                } else {
                    btn.style.display = 'none';
                    btn.classList.add('locked');
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
    
    // Save unlocked features to localStorage
    saveUnlockedFeatures() {
        localStorage.setItem('unlockedFeatures', JSON.stringify(Array.from(this.unlockedFeatures)));
    },
    
    // Load unlocked features from localStorage
    loadUnlockedFeatures() {
        const saved = localStorage.getItem('unlockedFeatures');
        if (saved) {
            try {
                this.unlockedFeatures = new Set(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading unlocked features:', e);
                this.unlockedFeatures = new Set(['soda', 'options']);
            }
        }
    },
    
    // Reset all unlocked features (for save deletion)
    reset() {
        this.unlockedFeatures = new Set(['soda', 'options']);
        localStorage.removeItem('unlockedFeatures');
        this.updateFeatureVisibility();
    },
    
    // Initialize unlock system
    init() {
        // Load unlocked features from save
        this.loadUnlockedFeatures();
        
        // Apply initial visibility
        this.updateFeatureVisibility();
    },
    
    // Check all unlock conditions (called periodically)
    checkAllUnlocks() {
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
            
            const sipsMet = window.sips && window.sips.gte ? window.sips.gte(condition.sips) : false;
            const clicksMet = window.totalClicks >= condition.clicks;
            
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
                        <span class="requirement-value">${window.prettify ? window.prettify(window.sips) : '0'} / ${window.prettify ? window.prettify(condition.sips) : '0'}</span>
                    </div>
                    <div class="requirement ${clicksMet ? 'met' : ''}">
                        <span class="requirement-label">Total Clicks:</span>
                        <span class="requirement-value">${window.totalClicks || 0} / ${condition.clicks}</span>
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
}
