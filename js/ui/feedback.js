// UI Feedback System
// Handles visual feedback for user actions like clicks, purchases, level ups

// Fallback prettify function if not available
function safePrettify(value) {
    if (typeof window?.prettify === 'function') {
        return window.prettify(value);
    }
    return value?.toString() || '0';
}

// Show click feedback numbers
export function showClickFeedback(sipsGained, isCritical = false) {
    // Ensure DOM_CACHE is ready and initialized
    if (!window.DOM_CACHE || !window.DOM_CACHE.isReady()) {
        if (window.DOM_CACHE?.init) {
            window.DOM_CACHE.init();
        }
    }
    
    const sodaContainer = window.DOM_CACHE?.sodaButton?.parentNode;
    if (!sodaContainer) {
        // Fallback: try to find soda button directly
        const sodaButton = document.getElementById('sodaButton');
        if (sodaButton?.parentNode) {
            showFeedbackWithContainer(sipsGained, isCritical, sodaButton.parentNode);
            return;
        }
        return;
    }
    
    showFeedbackWithContainer(sipsGained, isCritical, sodaContainer);
}

// Helper function to show feedback with a given container
function showFeedbackWithContainer(sipsGained, isCritical, sodaContainer) {
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
    feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);
    
    // Accessibility improvements
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-label', isCritical ? 
        `Critical hit! Gained ${safePrettify(sipsGained)} sips` : 
        `Gained ${safePrettify(sipsGained)} sips`
    );
    
    // Use more efficient positioning to avoid layout recalculations
    const containerRect = sodaContainer.getBoundingClientRect();
    const config = window.GAME_CONFIG?.LIMITS || {};
    const rangeX = config.CLICK_FEEDBACK_RANGE_X || 100;
    const rangeY = config.CLICK_FEEDBACK_RANGE_Y || 80;
    const randomX = (Math.random() - 0.5) * rangeX; // -rangeX/2px to +rangeX/2px
    const randomY = (Math.random() - 0.5) * rangeY;  // -rangeY/2px to +rangeY/2px
    
    feedback.style.cssText = `
        position: fixed;
        left: ${containerRect.left + containerRect.width/2 + randomX}px;
        top: ${containerRect.top + containerRect.height/2 + randomY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        font-weight: bold;
        font-size: ${isCritical ? '1.5em' : '1.2em'};
        color: ${isCritical ? '#ff6b35' : '#4CAF50'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: clickFeedback 2s ease-out forwards;
    `;
    
    // Add to body for proper positioning
    document.body.appendChild(feedback);
    
    // Remove after animation
    const config2 = window.GAME_CONFIG?.TIMING || {};
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, isCritical ? 
        (config2.CRITICAL_FEEDBACK_DURATION || 2500) : 
        (config2.CLICK_FEEDBACK_DURATION || 2000)
    );
}

// Show purchase feedback
export function showPurchaseFeedback(itemName, cost) {
    const shopDiv = window.DOM_CACHE?.shopDiv;
    if (!shopDiv) return;
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'purchase-feedback';
    feedback.innerHTML = `
        <div class="purchase-item">${itemName}</div>
        <div class="purchase-cost">-${prettify(cost)} sips</div>
    `;
    
    // Accessibility
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-label', `Purchased ${itemName} for ${safePrettify(cost)} sips`);
    
    // Position relative to shop
    const shopRect = shopDiv.getBoundingClientRect();
    feedback.style.cssText = `
        position: fixed;
        left: ${shopRect.left + shopRect.width/2}px;
        top: ${shopRect.top}px;
        transform: translate(-50%, -100%);
        pointer-events: none;
        z-index: 1000;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        animation: clickFeedback 2s ease-out forwards;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    const config = window.GAME_CONFIG?.TIMING || {};
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, config.PURCHASE_FEEDBACK_DURATION || 2000);
}

// Show level up feedback
export function showLevelUpFeedback(sipsGained) {
    const levelUpDiv = window.DOM_CACHE?.levelUpDiv;
    if (!levelUpDiv) return;
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'levelup-feedback';
    feedback.innerHTML = `
        <div class="levelup-title">🎉 LEVEL UP! 🎉</div>
        <div class="levelup-bonus">+${prettify(sipsGained)} sips bonus!</div>
    `;
    
    // Accessibility
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'assertive');
    feedback.setAttribute('aria-label', `Level up! Gained ${prettify(sipsGained)} bonus sips`);
    
    // Position relative to level up section
    const levelRect = levelUpDiv.getBoundingClientRect();
    feedback.style.cssText = `
        position: fixed;
        left: ${levelRect.left + levelRect.width/2}px;
        top: ${levelRect.top + levelRect.height/2}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: bold;
        text-align: center;
        animation: levelUpPulse 3s ease-out forwards;
        box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    const config = window.GAME_CONFIG?.TIMING || {};
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, config.LEVELUP_FEEDBACK_DURATION || 3000);
}

// Show offline progress modal
export function showOfflineProgress(timeSeconds, earnings) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'offline-progress-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h2>Welcome Back!</h2>
            <div class="offline-stats">
                <div class="offline-time">
                    <span class="label">Time Away:</span>
                    <span class="value">${formatTime(timeSeconds)}</span>
                </div>
                <div class="offline-earnings">
                    <span class="label">Sips Earned:</span>
                    <span class="value">+${prettify(earnings)}</span>
                </div>
            </div>
            <button class="offline-continue-btn" onclick="this.closest('.offline-progress-modal').remove()">
                Continue Playing
            </button>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds if user doesn't interact
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

// Helper function to format time duration
function formatTime(seconds) {
    if (seconds < 60) {
        return `${Math.floor(seconds)} seconds`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
}
