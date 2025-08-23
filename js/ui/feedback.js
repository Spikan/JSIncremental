// UI Feedback System
// Handles visual feedback for user actions like clicks, purchases, level ups

// Import consolidated utilities
import { formatNumber, prettify } from './utils';

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

// Get safe positioning for mobile devices
function getSafePosition(container, rangeX, rangeY) {
    if (isMobileDevice()) {
        // On mobile, use viewport-relative positioning for better reliability
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Center the feedback in the viewport with some randomness
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;
        
        // Reduce range on mobile to prevent feedback from going off-screen
        const mobileRangeX = Math.min(rangeX, 80);
        const mobileRangeY = Math.min(rangeY, 60);
        
        const randomX = (Math.random() - 0.5) * mobileRangeX;
        const randomY = (Math.random() - 0.5) * mobileRangeY;
        
        return {
            left: centerX + randomX,
            top: centerY + randomY
        };
    } else {
        // Desktop positioning using container bounds
        const containerRect = container.getBoundingClientRect();
        const randomX = (Math.random() - 0.5) * rangeX;
        const randomY = (Math.random() - 0.5) * rangeY;
        
        return {
            left: containerRect.left + containerRect.width/2 + randomX,
            top: containerRect.top + containerRect.height/2 + randomY
        };
    }
}

// Show feedback at specific click coordinates
function showFeedbackAtCoordinates(sipsGained, isCritical, clickX, clickY) {
    console.log('🔧 showFeedbackAtCoordinates called with:', { sipsGained, isCritical, clickX, clickY });
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
    feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);
    
    // Accessibility improvements
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-label', isCritical ? 
        `Critical hit! Gained ${formatNumber(sipsGained)} sips` :
        `Gained ${formatNumber(sipsGained)} sips`
    );
    
    // Mobile-optimized styling
    const isMobile = isMobileDevice();
    const fontSize = isMobile ? 
        (isCritical ? '1.3em' : '1.1em') : 
        (isCritical ? '1.5em' : '1.2em');
    
    // Position feedback directly at click coordinates with slight offset
    const offsetX = (Math.random() - 0.5) * 20; // ±10px horizontal offset
    const offsetY = (Math.random() - 0.5) * 20; // ±10px vertical offset
    
    feedback.style.cssText = `
        position: fixed;
        left: ${clickX + offsetX}px;
        top: ${clickY + offsetY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: ${isMobile ? '9999' : '1000'};
        font-weight: bold;
        font-size: ${fontSize};
        color: ${isCritical ? '#ff6b35' : '#4CAF50'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ${isMobile ? 'touch-action: none; -webkit-touch-callout: none;' : ''}
        ${isMobile ? 'will-change: transform, opacity;' : ''}
    `;
    
    // Add to body for proper positioning
    document.body.appendChild(feedback);
    
    // Simple fade out and slight upward animation
    let startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const duration = isCritical ? 2500 : 2000; // Longer for critical hits
        const progress = Math.min(elapsed / duration, 1);
        
        // Simple fade out and slight upward movement
        const opacity = 1 - progress;
        const moveUp = 15 * progress; // Only move up 15px total
        
        feedback.style.opacity = opacity;
        feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
        
        if (progress < 1) {
            try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
        }
    };
    
    try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
    
    // Remove after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, isCritical ? 2500 : 2000);
}

// Show click feedback numbers
export function showClickFeedback(sipsGained, isCritical = false, clickX = null, clickY = null) {
    console.log('🔧 showClickFeedback called with:', { sipsGained, isCritical, clickX, clickY });
    
    // If we have click coordinates, use them directly
    if (clickX !== null && clickY !== null) {
        showFeedbackAtCoordinates(sipsGained, isCritical, clickX, clickY);
        return;
    }
    
    // Fallback to container-based positioning
    const sodaContainer =
        window.DOM_CACHE?.sodaButton?.parentNode ||
        document.getElementById('sodaButton')?.parentNode;
    if (!sodaContainer) return;
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
        `Critical hit! Gained ${formatNumber(sipsGained)} sips` :
        `Gained ${formatNumber(sipsGained)} sips`
    );
    
    // Get safe positioning for mobile/desktop
    const config = window.GAME_CONFIG?.LIMITS || {};
    const rangeX = config.CLICK_FEEDBACK_RANGE_X || 100;
    const rangeY = config.CLICK_FEEDBACK_RANGE_Y || 80;
    const position = getSafePosition(sodaContainer, rangeX, rangeY);
    
    // Mobile-optimized styling
    const isMobile = isMobileDevice();
    const fontSize = isMobile ? 
        (isCritical ? '1.3em' : '1.1em') : 
        (isCritical ? '1.5em' : '1.2em');
    
    feedback.style.cssText = `
        position: fixed;
        left: ${position.left}px;
        top: ${position.top}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: ${isMobile ? '9999' : '1000'};
        font-weight: bold;
        font-size: ${fontSize};
        color: ${isCritical ? '#ff6b35' : '#4CAF50'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ${isMobile ? 'touch-action: none; -webkit-touch-callout: none;' : ''}
        ${isMobile ? 'will-change: transform, opacity;' : ''}
    `;
    
    // Add to body for proper positioning
    document.body.appendChild(feedback);
    
    // Simple fade out and slight upward animation (replacing CSS animation)
    let startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const duration = isCritical ? 2500 : 2000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Simple fade out and slight upward movement
        const opacity = 1 - progress;
        const moveUp = 15 * progress; // Only move up 15px total
        
        feedback.style.opacity = opacity;
        feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
        
        if (progress < 1) {
            try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
        }
    };
    
    try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
    
    // Remove after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, isCritical ? 2500 : 2000);
}

// Show purchase feedback
export function showPurchaseFeedback(itemName, cost, clickX = null, clickY = null) {
    console.log('🔧 showPurchaseFeedback called with:', { itemName, cost, clickX, clickY });
    
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
    feedback.setAttribute('aria-label', `Purchased ${itemName} for ${formatNumber(cost)} sips`);
    
    // Position feedback - prefer click coordinates if available, otherwise center on shop
    let left, top;
    
    if (clickX !== null && clickY !== null) {
        // Use click coordinates directly - no offset, no transform
        left = clickX;
        top = clickY;
        console.log('🔧 Using click coordinates directly - left:', left, 'top:', top);
    } else {
        // Fallback to shop center positioning
        const shopDiv = window.DOM_CACHE?.shopDiv;
        if (shopDiv) {
            const shopRect = shopDiv.getBoundingClientRect();
            left = shopRect.left + shopRect.width/2;
            top = shopRect.top + shopRect.height/2;
            console.log('🔧 Using fallback positioning - left:', left, 'top:', top);
        } else {
            // Last resort - center of viewport
            left = window.innerWidth / 2;
            top = window.innerHeight / 2;
            console.log('🔧 Using viewport center - left:', left, 'top:', top);
        }
    }
    
    // Set initial position - NO transform, NO offset
    feedback.style.cssText = `
        position: fixed;
        left: ${left}px;
        top: ${top}px;
        transform: none;
        pointer-events: none;
        z-index: 1000;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        /* Center the feedback on the click point */
        transform-origin: center center;
    `;
    
    // Center the feedback on the click point
    feedback.style.transform = 'translate(-50%, -50%)';
    
    console.log('🔧 Final feedback positioning - left:', left, 'top:', top);
    console.log('🔧 Feedback element style:', feedback.style.cssText);
    
    document.body.appendChild(feedback);
    
    // Simple fade out animation
    let startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const duration = 2000; // 2 seconds
        const progress = Math.min(elapsed / duration, 1);
        
        // Simple fade out and slight upward movement
        const opacity = 1 - progress;
        const moveUp = 20 * progress; // Only move up 20px total
        
        feedback.style.opacity = opacity;
        feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
        
        if (progress < 1) {
            try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
        }
    };
    
    try { requestAnimationFrame(animate); } catch { setTimeout(animate, 16); }
    
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
                    <span class="value">+${formatNumber(earnings)}</span>
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

    // Style the background overlay
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
        `;
    }

    // Style the content panel
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.cssText = `
            position: relative;
            background: #111827;
            color: #E5E7EB;
            border: 2px solid #374151;
            border-radius: 12px;
            padding: 20px 24px;
            width: min(90%, 420px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            z-index: 1;
            text-align: left;
        `;
        const h2 = content.querySelector('h2');
        if (h2) {
            h2.style.cssText = `
                margin: 0 0 12px 0;
                font-size: 20px;
                color: #60A5FA;
            `;
        }
        const stats = content.querySelector('.offline-stats');
        if (stats) {
            stats.style.cssText = `
                display: grid;
                gap: 8px;
            `;
        }
        const btn = content.querySelector('.offline-continue-btn');
        if (btn) {
            btn.style.cssText = `
                margin-top: 16px;
                background: #10B981;
                color: #06281e;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                font-weight: 600;
                cursor: pointer;
            `;
        }
    }
    
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
