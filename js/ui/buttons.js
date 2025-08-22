// Button System - Unified button event handling and management
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
    
    // Function mappings for button actions
    actions: {
        'buyStraw': { func: 'buyStraw', type: 'shop-btn' },
        'buyCup': { func: 'buyCup', type: 'shop-btn' },
        'buyWiderStraws': { func: 'buyWiderStraws', type: 'shop-btn' },
        'buyBetterCups': { func: 'buyBetterCups', type: 'shop-btn' },
        'buySuction': { func: 'buySuction', type: 'clicking-upgrade-btn' },
        'buyCriticalClick': { func: 'buyCriticalClick', type: 'clicking-upgrade-btn' },
        'buyFasterDrinks': { func: 'buyFasterDrinks', type: 'drink-speed-upgrade-btn' },
        'upgradeFasterDrinks': { func: 'upgradeFasterDrinks', type: 'drink-speed-upgrade-btn' },
        'levelUp': { func: 'levelUp', type: 'level-up-btn' },
        'save': { func: 'save', type: 'save-btn' },
        'delete_save': { func: 'delete_save', type: 'save-btn' },
        'toggleButtonSounds': { func: 'toggleButtonSounds', type: 'sound-toggle-btn' },
        'sendMessage': { func: 'sendMessage', type: 'chat-send-btn' },
        'startGame': { func: 'startGame', type: 'splash-start-btn' }
    }
};

// Unified button click handler
function handleButtonClick(event, button, actionName) {
    // Don't prevent default - let the original onclick work
    // event.preventDefault();
    // event.stopPropagation();
    
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
    
    // Note: We don't execute the action here since the original onclick will handle it
    // This prevents double-execution of button actions
}

// Setup unified button event listeners
function setupUnifiedButtonSystem() {
    console.log('🔧 Setting up unified button event handler system...');
    
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
                    // Add unified event listener WITHOUT removing onclick
                    // This ensures the original functionality still works
                    button.addEventListener('click', (e) => handleButtonClick(e, button, actionName));
                    
                    // Add appropriate CSS classes for styling
                    if (action.type) {
                        button.classList.add(action.type);
                    }
                    
                    console.log(`🔧 Successfully configured button: ${actionName} (${action.type})`);
                } else {
                    // Don't warn about unknown actions - they might be added later
                    console.log(`Button action ${actionName} not yet configured, skipping`);
                }
            }
        }
    });
    
    // Special handling for buttons without onclick attributes
    setupSpecialButtonHandlers();
    
    console.log('🔧 Unified button event handler system setup complete');
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

// Initialize button system when DOM is ready and game functions are available
function initButtonSystem() {
    // Wait for both DOM and game functions to be ready
    function tryInitialize() {
        // Check if essential game functions are available
        const essentialFunctions = ['buyStraw', 'buyCup', 'buySuction', 'buyCriticalClick', 'buyFasterDrinks', 'buyWiderStraws', 'buyBetterCups', 'sodaClick', 'switchTab'];
        const functionsAvailable = essentialFunctions.every(func => typeof window[func] === 'function');
        
        if (functionsAvailable) {
            console.log('🔧 All game functions available, setting up button system');
            setupUnifiedButtonSystem();
        } else {
            // Log which functions are missing for debugging
            const missingFunctions = essentialFunctions.filter(func => typeof window[func] !== 'function');
            console.log('🔧 Waiting for game functions:', missingFunctions.join(', '));
            // Try again in a bit
            setTimeout(tryInitialize, 200);
        }
    }
    
    // Wait for both DOM and main.js to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a bit more for main.js to finish loading
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