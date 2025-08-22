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
    
    // Function mappings for button actions - using proper function references
    actions: {
        'buyStraw': { 
            func: () => window.App?.systems?.purchases?.buyStraw?.(), 
            type: 'shop-btn',
            label: 'Buy Straw'
        },
        'buyCup': { 
            func: () => window.App?.systems?.purchases?.buyCup?.(), 
            type: 'shop-btn',
            label: 'Buy Cup'
        },
        'buyWiderStraws': { 
            func: () => window.App?.systems?.purchases?.buyWiderStraws?.(), 
            type: 'shop-btn',
            label: 'Buy Wider Straws'
        },
        'buyBetterCups': { 
            func: () => window.App?.systems?.purchases?.buyBetterCups?.(), 
            type: 'shop-btn',
            label: 'Buy Better Cups'
        },
        'buySuction': { 
            func: () => window.App?.systems?.purchases?.buySuction?.(), 
            type: 'clicking-upgrade-btn',
            label: 'Buy Suction'
        },
        'buyCriticalClick': { 
            func: () => window.App?.systems?.purchases?.buyCriticalClick?.(), 
            type: 'clicking-upgrade-btn',
            label: 'Buy Critical Click'
        },
        'buyFasterDrinks': { 
            func: () => window.App?.systems?.purchases?.buyFasterDrinks?.(), 
            type: 'drink-speed-upgrade-btn',
            label: 'Buy Faster Drinks'
        },
        'upgradeFasterDrinks': { 
            func: () => window.App?.systems?.purchases?.upgradeFasterDrinks?.(), 
            type: 'drink-speed-upgrade-btn',
            label: 'Upgrade Faster Drinks'
        },
        'levelUp': { 
            func: () => window.App?.systems?.gameInit?.levelUp?.(), 
            type: 'level-up-btn',
            label: 'Level Up'
        },
        'save': { 
            func: () => window.App?.systems?.save?.queueSave?.(), 
            type: 'save-btn',
            label: 'Save Game'
        },
        'delete_save': { 
            func: () => window.App?.storage?.deleteSave?.(), 
            type: 'save-btn',
            label: 'Delete Save'
        },
        'toggleButtonSounds': { 
            func: () => window.App?.systems?.audio?.button?.toggleButtonSounds?.(), 
            type: 'sound-toggle-btn',
            label: 'Toggle Button Sounds'
        },
        'sendMessage': { 
            func: () => window.App?.systems?.god?.sendMessage?.(), 
            type: 'chat-send-btn',
            label: 'Send Message'
        },
        'startGame': { 
            func: () => window.App?.systems?.gameInit?.startGame?.(), 
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
    
    // Play appropriate audio
    try {
        if (window.App?.systems?.audio?.button) {
            if (buttonType.audio === 'purchase') {
                window.App.systems.audio.button.playButtonPurchaseSound();
            } else {
                window.App.systems.audio.button.playButtonClickSound();
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
            action.func();
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
    
    // Find all buttons with onclick attributes
    const allButtons = document.querySelectorAll('button');
    console.log(`🔧 Found ${allButtons.length} buttons to process`);
    
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
                    
                    // Update button text if label is available
                    if (action.label) {
                        button.textContent = action.label;
                    }
                    
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
        button.addEventListener('click', (e) => {
            const tabName = button.textContent.toLowerCase().match(/\b\w+/)?.[0];
            if (tabName && window.switchTab) {
                window.switchTab(tabName, e);
            }
        });
    });
    
    // Soda button (special case - not using onclick)
    const sodaButton = window.DOM_CACHE?.sodaButton;
    if (sodaButton) {
        sodaButton.addEventListener('click', (e) => {
            const clickX = e.clientX;
            const clickY = e.clientY;
            
            // Play audio
            try {
                if (window.App?.systems?.audio?.button) {
                    window.App.systems.audio.button.playButtonClickSound();
                }
            } catch (error) {
                console.warn('Audio playback failed:', error);
            }
            
            // Add click animation using existing CSS classes
            sodaButton.classList.add('soda-clicked');
            setTimeout(() => {
                sodaButton.classList.remove('soda-clicked');
            }, 150);
            
            // Call sodaClick with coordinates
            if (window.sodaClick) {
                window.sodaClick(1, clickX, clickY);
            }
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
}

// Initialize button system when App systems are ready
function initButtonSystem() {
    // Wait for App systems to be available
    function tryInitialize() {
        // Check if essential App systems are available
        const essentialSystems = [
            'App.systems.purchases',
            'App.systems.gameInit', 
            'App.systems.save',
            'App.systems.audio.button',
            'App.storage'
        ];
        
        const systemsAvailable = essentialSystems.every(path => {
            const parts = path.split('.');
            let current = window;
            for (const part of parts) {
                if (current && current[part]) {
                    current = current[part];
                } else {
                    return false;
                }
            }
            return true;
        });
        
        if (systemsAvailable) {
            console.log('🔧 All App systems available, setting up modern button system');
            setupUnifiedButtonSystem();
        } else {
            // Log which systems are missing for debugging
            const missingSystems = essentialSystems.filter(path => {
                const parts = path.split('.');
                let current = window;
                for (const part of parts) {
                    if (current && current[part]) {
                        current = current[part];
                    } else {
                        return false;
                    }
                }
                return false;
            });
            console.log('🔧 Waiting for App systems:', missingSystems.join(', '));
            // Try again in a bit
            setTimeout(tryInitialize, 200);
        }
    }
    
    // Wait for both DOM and App to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for App to be fully initialized
            setTimeout(tryInitialize, 100);
        });
    } else {
        // DOM already loaded, wait for App
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