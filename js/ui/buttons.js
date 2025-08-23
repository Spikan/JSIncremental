// Modern Button System - Unified button event handling and management
// Part of the UI system for coordinated user interaction

// Button configuration for consistent behavior
const BUTTON_CONFIG = {
    // Button types and their configurations
    types: {
        'shop-btn': {
            audio: 'purchase',
            feedback: 'purchase',
            className: 'shop-btn'
        },
        'clicking-upgrade-btn': {
            audio: 'purchase', 
            feedback: 'purchase',
            className: 'clicking-upgrade-btn'
        },
        'drink-speed-upgrade-btn': {
            audio: 'purchase',
            feedback: 'purchase', 
            className: 'drink-speed-upgrade-btn'
        },
        'level-up-btn': {
            audio: 'purchase',
            feedback: 'levelup',
            className: 'level-up-btn'
        },
        'save-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'save-btn'
        },
        'sound-toggle-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'sound-toggle-btn'
        },
        'dev-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'dev-btn'
        },
        'chat-send-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'chat-send-btn'
        },
        'splash-start-btn': {
            audio: 'click',
            feedback: 'info',
            className: 'splash-start-btn'
        }
    },
    
    // Function mappings for button actions - using the actual working global functions
    actions: {
        'buyStraw': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyStraw ? window.App.systems.purchases.execute.buyStraw() : window.buyStraw?.()),
            type: 'shop-btn',
            label: 'Buy Straw'
        },
        'buyCup': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyCup ? window.App.systems.purchases.execute.buyCup() : window.buyCup?.()),
            type: 'shop-btn',
            label: 'Buy Cup'
        },
        'buyWiderStraws': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyWiderStraws ? window.App.systems.purchases.execute.buyWiderStraws() : window.buyWiderStraws?.()),
            type: 'shop-btn',
            label: 'Buy Wider Straws'
        },
        'buyBetterCups': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyBetterCups ? window.App.systems.purchases.execute.buyBetterCups() : window.buyBetterCups?.()),
            type: 'shop-btn',
            label: 'Buy Better Cups'
        },
        'buySuction': { 
            func: () => (window.App?.systems?.purchases?.execute?.buySuction ? window.App.systems.purchases.execute.buySuction() : window.buySuction?.()),
            type: 'clicking-upgrade-btn',
            label: 'Buy Suction'
        },
        'buyCriticalClick': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyCriticalClick ? window.App.systems.purchases.execute.buyCriticalClick() : window.buyCriticalClick?.()),
            type: 'clicking-upgrade-btn',
            label: 'Buy Critical Click'
        },
        'buyFasterDrinks': { 
            func: () => (window.App?.systems?.purchases?.execute?.buyFasterDrinks ? window.App.systems.purchases.execute.buyFasterDrinks() : window.buyFasterDrinks?.()),
            type: 'drink-speed-upgrade-btn',
            label: 'Buy Faster Drinks'
        },
        'upgradeFasterDrinks': { 
            func: () => (window.App?.systems?.purchases?.execute?.upgradeFasterDrinks ? window.App.systems.purchases.execute.upgradeFasterDrinks() : window.upgradeFasterDrinks?.()),
            type: 'drink-speed-upgrade-btn',
            label: 'Upgrade Faster Drinks'
        },
        'levelUp': { 
            func: () => (window.App?.systems?.purchases?.execute?.levelUp ? window.App.systems.purchases.execute.levelUp() : window.levelUp?.()),
            type: 'level-up-btn',
            label: 'Level Up'
        },
        'save': { 
            func: () => window.save?.(),
            type: 'save-btn',
            label: 'Save Game'
        },
        'delete_save': { 
            func: () => window.delete_save?.(),
            type: 'save-btn',
            label: 'Delete Save'
        },
        'toggleButtonSounds': { 
            func: () => window.toggleButtonSounds?.(),
            type: 'sound-toggle-btn',
            label: 'Toggle Button Sounds'
        },
        'sendMessage': { 
            func: () => window.sendMessage?.(),
            type: 'chat-send-btn',
            label: 'Send Message'
        },
        'startGame': { 
            func: () => window.startGame?.(),
            type: 'splash-start-btn',
            label: 'Start Game'
        }
    }
};

// Modern button click handler
function handleButtonClick(event, button, actionName) {
    // Prevent default to ensure our system handles everything
    event.preventDefault();
    event.stopPropagation();
    
    // Get button configuration
    const action = BUTTON_CONFIG.actions[actionName];
    if (!action) {
        console.warn('Unknown button action:', actionName);
        return;
    }
    
    const buttonType = BUTTON_CONFIG.types[action.type];
    if (!buttonType) {
        console.warn('Unknown button type:', action.type);
        return;
    }
    
    // Capture click coordinates for feedback
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // Play appropriate audio and show feedback where relevant
    try {
        if (window.App?.systems?.audio?.button) {
            if (buttonType.audio === 'purchase') {
                try { window.App.systems.audio.button.playButtonPurchaseSound(); } catch {}
            } else {
                try { window.App.systems.audio.button.playButtonClickSound(); } catch {}
            }
        } else if (window.playButtonPurchaseSound && window.playButtonClickSound) {
            // Fallback to global audio functions
            if (buttonType.audio === 'purchase') {
                window.playButtonPurchaseSound();
            } else {
                window.playButtonClickSound();
            }
        }
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
    
    // Add click animation using existing CSS classes
    button.classList.add('button-clicked');
    setTimeout(() => {
        button.classList.remove('button-clicked');
    }, 150);
    
    // Execute the modern function reference
    try {
        if (action.func && typeof action.func === 'function') {
            const result = action.func();
            // Level up feedback (purchase feedback handled globally)
            if (buttonType.feedback === 'levelup') {
                try { window.App?.ui?.showLevelUpFeedback?.(0); } catch {}
            }
        } else {
            console.warn(`Action function for ${actionName} is not available`);
        }
    } catch (error) {
        console.error(`Button action ${actionName} failed:`, error);
    }
}

// Setup modern button event listeners
function setupUnifiedButtonSystem() {
    console.log('🔧 Setting up modern button event handler system...');
    
    // Find all buttons (tests expect generic query followed by onclick filtering)
    const allButtons = document.querySelectorAll('button');
    console.log(`🔧 Found ${allButtons.length} buttons with inline onclick to process`);
    
    allButtons.forEach(button => {
        // Check if button has onclick attribute
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            console.log(`🔧 Processing button with onclick: ${onclick}`);
            
            // Parse onclick to determine action
            const actionMatch = onclick.match(/(\w+)\(/);
            if (actionMatch) {
                const actionName = actionMatch[1];
                console.log(`🔧 Parsed action name: ${actionName}`);
                const action = BUTTON_CONFIG.actions[actionName];
                
                if (action) {
                    // Remove the old onclick attribute
                    button.removeAttribute('onclick');
                    
                    // Add modern event listener
                    button.addEventListener('click', (e) => handleButtonClick(e, button, actionName));
                    
                    // Add appropriate CSS classes for styling
                    if (action.type) {
                        button.classList.add(action.type);
                    }
                    
                    // Leave original button text intact to preserve UI copy
                    
                    console.log(`🔧 Successfully configured button: ${actionName} (${action.type})`);
                } else {
                    console.log(`Button action ${actionName} not yet configured, skipping`);
                }
            }
        }
    });
    
    // Special handling for buttons without onclick attributes
    setupSpecialButtonHandlers();
    
    console.log('🔧 Modern button event handler system setup complete');
}

// Setup special button handlers that don't use onclick
function setupSpecialButtonHandlers() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        if (!button || !button.addEventListener) return;
        button.addEventListener('click', (e) => {
            const action = button.getAttribute('data-action');
            if (action && action.startsWith('switchTab:') && window.switchTab) {
                const tabName = action.split(':')[1];
                window.switchTab(tabName, e);
            }
        });
    });
    
    // Soda button handler (tests expect explicit listener)
    const sodaDomCacheBtn = window.DOM_CACHE?.sodaButton;
    const sodaButton = sodaDomCacheBtn || document.getElementById('sodaButton');
    if (sodaButton && sodaButton.addEventListener) {
        sodaButton.addEventListener('click', (e) => {
            try {
                if (window.App?.systems?.clicks?.handleSodaClick) {
                    window.App.systems.clicks.handleSodaClick(1, e);
                } else {
                    window.sodaClick?.(1, e);
                }
            } catch {}
        });
    }
    
    // Chat input keyboard support
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && window.sendMessage) {
                window.sendMessage();
            }
        });
    }

    // Splash start button (explicit handler to ensure start works)
    const splashStartBtn = (typeof document !== 'undefined' && document.querySelector)
        ? document.querySelector('.splash-start-btn')
        : null;
    if (splashStartBtn && splashStartBtn.addEventListener) {
        splashStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try { window.startGame?.(); } catch {}
        });
    }

    // Generic data-action dispatcher for buttons (guard for test env)
    if (document && document.body && document.body.addEventListener) {
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const el = target.closest('[data-action]');
        if (!el) return;
        const action = el.getAttribute('data-action');
        if (!action) return;
        const [fnName, argStr] = action.includes(':') ? action.split(':') : [action, ''];
        const argsAttr = el.getAttribute('data-args') || argStr;
        let args = [];
        if (argsAttr) {
            const maybeNum = Number(argsAttr);
            args = Number.isNaN(maybeNum) ? [argsAttr] : [maybeNum];
        }
        // Define purchase actions set up-front
        const purchaseActions = new Set([
            'buyStraw','buyCup','buyWiderStraws','buyBetterCups',
            'buySuction','buyFasterDrinks','upgradeFasterDrinks','buyCriticalClick'
        ]);
        const isPurchase = purchaseActions.has(fnName);
        // Block unaffordable/disabled purchases before any side effects
        if (isPurchase) {
            const buttonEl = (el.closest && el.closest('button')) ? el.closest('button') : el;
            const disabled = !!(buttonEl && (buttonEl.disabled || buttonEl.classList?.contains('disabled') || buttonEl.classList?.contains('unaffordable')));
            if (disabled) return; // silently ignore
        }
        if (typeof window[fnName] === 'function' || (isPurchase && window.App?.systems?.purchases?.execute?.[fnName])) {
            e.preventDefault();
            e.stopPropagation();
            try {
                let success = true;
                if (fnName === 'switchTab') {
                    try { window.App?.systems?.audio?.button?.playTabSwitchSound?.(); } catch {}
                    window[fnName](args[0], e);
                } else {
                    if (isPurchase && window.App?.systems?.purchases?.execute?.[fnName]) {
                        success = !!window.App.systems.purchases.execute[fnName]();
                    } else {
                        const ret = window[fnName](...args);
                        success = (typeof ret === 'undefined') ? true : !!ret;
                    }
                    // Play audio only after successful action
                    try {
                        const meta = BUTTON_CONFIG.actions[fnName];
                        const btnType = meta && meta.type;
                        if (window.App?.systems?.audio?.button && fnName !== 'sodaClick') {
                            if ((btnType === 'shop-btn' || btnType === 'clicking-upgrade-btn' || btnType === 'drink-speed-upgrade-btn' || btnType === 'level-up-btn')) {
                                if (success) window.App.systems.audio.button.playButtonPurchaseSound?.();
                            } else {
                                window.App.systems.audio.button.playButtonClickSound?.();
                            }
                        }
                    } catch {}
                }
                // Show purchase feedback for shop/upgrade actions at click point
                if (isPurchase && typeof window.App?.ui?.showPurchaseFeedback === 'function' && success) {
                    let costValue;
                    try {
                        // Prefer an explicit cost-number span inside the button element
                        const costSpan = el.querySelector('.cost-number');
                        if (costSpan) {
                            costValue = Number(costSpan.textContent);
                        } else {
                            // Fallback: try to parse any number in the button text
                            const match = (el.textContent || '').replace(/[,]/g,'').match(/\d+(?:\.\d+)?/);
                            costValue = match ? Number(match[0]) : undefined;
                        }
                    } catch {}
                    const cx = (typeof e.clientX === 'number') ? e.clientX : (el.getBoundingClientRect().left + el.getBoundingClientRect().width/2);
                    const cy = (typeof e.clientY === 'number') ? e.clientY : (el.getBoundingClientRect().top + el.getBoundingClientRect().height/2);
                    if (typeof costValue === 'number' && !Number.isNaN(costValue)) {
                        window.App.ui.showPurchaseFeedback(fnName, costValue, cx, cy);
                    }
                }
            } catch (err) { console.warn('action failed', fnName, err); }
        }
    }, { capture: true });
    }

    // Redundant safety: capture clicks on START button by class as well
    if (document && document.body && document.body.addEventListener) {
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const startEl = target.closest('.splash-start-btn');
        if (!startEl) return;
        e.preventDefault();
        e.stopPropagation();
        try { window.startGame?.(); } catch (err) { console.warn('startGame failed', err); }
    }, { capture: true });
    }

    // Generic data-action dispatcher for inputs/selects (change events)
    if (document && document.body && document.body.addEventListener) {
    document.body.addEventListener('change', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        const [fnName] = action.split(':');
        if (typeof window[fnName] === 'function') {
            try { window[fnName](); } catch (err) { console.warn('change action failed', fnName, err); }
        }
    }, { capture: true });
    }
}

// Initialize button system when global functions are ready
function initButtonSystem() {
    // Wait for global functions to be available
    function tryInitialize() {
        // Check if essential global functions are available
        const essentialFunctions = [
            'buyStraw',
            'buyCup', 
            'buySuction',
            'buyCriticalClick',
            'buyFasterDrinks',
            'buyWiderStraws',
            'buyBetterCups',
            'levelUp',
            'save',
            'delete_save',
            'toggleButtonSounds',
            'sendMessage',
            'startGame'
        ];
        
        const functionsAvailable = (typeof window !== 'undefined') && essentialFunctions.every(func => 
            typeof window[func] === 'function'
        );
        
        if (functionsAvailable) {
            console.log('🔧 All global functions available, setting up modern button system');
            setupUnifiedButtonSystem();
        } else {
            // Log which functions are missing for debugging
            const missingFunctions = essentialFunctions.filter(func => 
                typeof window[func] !== 'function'
            );
            console.log('🔧 Waiting for global functions:', missingFunctions.join(', '));
            // Try again in a bit
            setTimeout(tryInitialize, 200);
        }
    }
    
    // Wait for both DOM and main.js to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for main.js to be fully loaded
            setTimeout(tryInitialize, 100);
        });
    } else {
        // DOM already loaded, wait for main.js
        setTimeout(tryInitialize, 100);
    }
}

// Export functions for use in other modules
export {
    BUTTON_CONFIG,
    handleButtonClick,
    setupUnifiedButtonSystem,
    setupSpecialButtonHandlers,
    initButtonSystem
};