// UI Feedback System (TypeScript)
// Handles visual feedback for user actions like clicks, purchases, level ups

// Import consolidated utilities
import { formatNumber, prettify } from './utils';
import { domQuery } from '../services/dom-query';

// Detect mobile device
function isMobileDevice(): boolean {
  try {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window ||
      (navigator as any).maxTouchPoints > 0
    );
  } catch (error) {
    console.warn('Failed to detect mobile device:', error);
    return false;
  }
}

// Get safe positioning for mobile devices
function getSafePosition(
  container: HTMLElement,
  rangeX: number,
  rangeY: number
): { left: number; top: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Estimate feedback element dimensions
  const estimatedWidth = 150; // Conservative estimate
  const estimatedHeight = 40;

  // Padding from viewport edges
  const padding = 20;
  const minX = padding + estimatedWidth / 2;
  const maxX = viewportWidth - padding - estimatedWidth / 2;
  const minY = padding + estimatedHeight / 2;
  const maxY = viewportHeight - padding - estimatedHeight / 2;

  if (isMobileDevice()) {
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const mobileRangeX = Math.min(rangeX, 80);
    const mobileRangeY = Math.min(rangeY, 60);
    const randomX = (Math.random() - 0.5) * mobileRangeX;
    const randomY = (Math.random() - 0.5) * mobileRangeY;

    let left = centerX + randomX;
    let top = centerY + randomY;

    // Clamp to viewport bounds
    left = Math.max(minX, Math.min(maxX, left));
    top = Math.max(minY, Math.min(maxY, top));

    return { left, top };
  } else {
    const containerRect = container.getBoundingClientRect();
    const randomX = (Math.random() - 0.5) * rangeX;
    const randomY = (Math.random() - 0.5) * rangeY;

    let left = containerRect.left + containerRect.width / 2 + randomX;
    let top = containerRect.top + containerRect.height / 2 + randomY;

    // Clamp to viewport bounds
    left = Math.max(minX, Math.min(maxX, left));
    top = Math.max(minY, Math.min(maxY, top));

    return { left, top };
  }
}

// Show milestone feedback
function showMilestoneFeedback(
  message: string,
  x: number,
  y: number,
  type: 'straw' | 'cup' | 'global' = 'global'
): void {
  try {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'milestone-feedback';
    feedbackElement.textContent = message;

    // Style based on milestone type
    const colors = {
      straw: '#4CAF50', // Green for straws
      cup: '#2196F3', // Blue for cups
      global: '#FF9800', // Orange for global milestones
    };

    feedbackElement.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${colors[type]};
      font-size: 18px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 10000;
      pointer-events: none;
      animation: milestoneFloat 3s ease-out forwards;
      text-align: center;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#milestone-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'milestone-animation-styles';
      style.textContent = `
        @keyframes milestoneFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedbackElement);

    // Remove after animation
    setTimeout(() => {
      if (feedbackElement.parentNode) {
        feedbackElement.parentNode.removeChild(feedbackElement);
      }
    }, 3000);
  } catch (error) {
    console.warn('Failed to show milestone feedback:', error);
  }
}

// Show feedback at specific click coordinates
function showFeedbackAtCoordinates(
  sipsGained: number | any, // Accept both numbers and Decimal objects
  isCritical: boolean,
  clickX: number,
  clickY: number
): void {
  const feedback = document.createElement('div');
  feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
  feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute(
    'aria-label',
    isCritical
      ? `Critical hit! Gained ${formatNumber(sipsGained)} sips`
      : `Gained ${formatNumber(sipsGained)} sips`
  );
  const isMobile = isMobileDevice();
  const fontSize = isCritical ? '1.4em' : '1.2em';
  const offsetX = (Math.random() - 0.5) * 15; // Reduced randomness
  const offsetY = (Math.random() - 0.5) * 15;

  // Calculate position with boundary checking
  let finalX = clickX + offsetX;
  let finalY = clickY + offsetY;

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Estimate feedback element dimensions (approximate)
  const estimatedWidth = isCritical ? 200 : 150; // Critical feedback is typically wider
  const estimatedHeight = 40;

  // Ensure feedback stays within viewport bounds with padding
  const padding = 20;
  const minX = padding;
  const maxX = viewportWidth - estimatedWidth - padding;
  const minY = padding;
  const maxY = viewportHeight - estimatedHeight - padding;

  // Clamp position to viewport bounds
  finalX = Math.max(minX, Math.min(maxX, finalX));
  finalY = Math.max(minY, Math.min(maxY, finalY));

  feedback.style.cssText = `
        position: fixed;
        left: ${finalX}px;
        top: ${finalY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: ${isMobile ? '9999' : '1000'};
        font-weight: bold;
        font-size: ${fontSize};
        color: ${isCritical ? '#ff6b35' : '#4CAF50'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        white-space: nowrap;
        max-width: calc(100vw - 40px);
        text-align: center;
        ${isMobile ? 'touch-action: none; -webkit-touch-callout: none;' : ''}
        ${isMobile ? 'will-change: transform, opacity;' : ''}
    `;
  document.body.appendChild(feedback);
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const duration = isCritical ? 2500 : 2000;
    const progress = Math.min(elapsed / duration, 1);
    const opacity = 1 - progress;
    const moveUp = 15 * progress;
    feedback.style.opacity = String(opacity);
    feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
    if (progress < 1) {
      try {
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn('requestAnimationFrame failed, falling back to setTimeout:', error);
        setTimeout(animate, 16);
      }
    }
  };
  try {
    requestAnimationFrame(animate);
  } catch {
    setTimeout(animate, 16);
  }
  setTimeout(
    () => {
      if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    },
    isCritical ? 2500 : 2000
  );
}

// Helper to show feedback with a given container
function showFeedbackWithContainer(
  sipsGained: number | any, // Accept both numbers and Decimal objects
  isCritical: boolean,
  sodaContainer: HTMLElement
): void {
  const feedback = document.createElement('div');
  feedback.className = isCritical ? 'click-feedback critical-feedback' : 'click-feedback';
  feedback.textContent = (isCritical ? '💥 CRITICAL! +' : '+') + prettify(sipsGained);
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute(
    'aria-label',
    isCritical
      ? `Critical hit! Gained ${formatNumber(sipsGained)} sips`
      : `Gained ${formatNumber(sipsGained)} sips`
  );
  const config = (window as any).GAME_CONFIG?.LIMITS || {};
  const rangeX = (config as any).CLICK_FEEDBACK_RANGE_X || 100;
  const rangeY = (config as any).CLICK_FEEDBACK_RANGE_Y || 80;
  const position = getSafePosition(sodaContainer, rangeX, rangeY);
  const isMobile = isMobileDevice();
  const fontSize = isMobile ? (isCritical ? '1.3em' : '1.1em') : isCritical ? '1.5em' : '1.2em';
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
  document.body.appendChild(feedback);
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const duration = isCritical ? 2500 : 2000;
    const progress = Math.min(elapsed / duration, 1);
    const opacity = 1 - progress;
    const moveUp = 15 * progress;
    feedback.style.opacity = String(opacity);
    feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
    if (progress < 1) {
      try {
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn('requestAnimationFrame failed, falling back to setTimeout:', error);
        setTimeout(animate, 16);
      }
    }
  };
  try {
    requestAnimationFrame(animate);
  } catch (error) {
    console.warn('requestAnimationFrame failed, falling back to setTimeout:', error);
    setTimeout(animate, 16);
  }
  setTimeout(
    () => {
      if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    },
    isCritical ? 2500 : 2000
  );
}

// Show click feedback numbers
export function showClickFeedback(
  sipsGained: number | any, // Accept both numbers and Decimal objects
  isCritical: boolean = false,
  clickX: number | null = null,
  clickY: number | null = null
): void {
  if (clickX !== null && clickY !== null) {
    showFeedbackAtCoordinates(sipsGained, isCritical, clickX, clickY);
    return;
  }
  const sodaContainer = (domQuery.getById('sodaButton')?.parentNode ||
    document.getElementById('sodaButton')?.parentNode) as HTMLElement | null;
  if (!sodaContainer) return;
  showFeedbackWithContainer(sipsGained, isCritical, sodaContainer);
}

// Show purchase feedback
export function showPurchaseFeedback(
  itemName: string,
  cost: number,
  clickX: number | null = null,
  clickY: number | null = null
): void {
  const feedback = document.createElement('div');
  feedback.className = 'purchase-feedback';
  feedback.innerHTML = `
        <div class="purchase-item">${itemName}</div>
        <div class="purchase-cost">-${prettify(cost)} sips</div>
    `;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute('aria-label', `Purchased ${itemName} for ${formatNumber(cost)} sips`);
  let left: number, top: number;
  if (clickX !== null && clickY !== null) {
    left = clickX;
    top = clickY;
  } else {
    const shopDiv = domQuery.getById('shopDiv') as HTMLElement | undefined;
    if (shopDiv) {
      const shopRect = shopDiv.getBoundingClientRect();
      left = shopRect.left + shopRect.width / 2;
      top = shopRect.top + shopRect.height / 2;
    } else {
      left = window.innerWidth / 2;
      top = window.innerHeight / 2;
    }
  }
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
        transform-origin: center center;
    `;
  feedback.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(feedback);
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const duration = 2000;
    const progress = Math.min(elapsed / duration, 1);
    const opacity = 1 - progress;
    const moveUp = 20 * progress;
    feedback.style.opacity = String(opacity);
    feedback.style.transform = `translate(-50%, calc(-50% - ${moveUp}px))`;
    if (progress < 1) {
      try {
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn('requestAnimationFrame failed, falling back to setTimeout:', error);
        setTimeout(animate, 16);
      }
    }
  };
  try {
    requestAnimationFrame(animate);
  } catch (error) {
    console.warn('requestAnimationFrame failed, falling back to setTimeout:', error);
    setTimeout(animate, 16);
  }
  const config = (window as any).GAME_CONFIG?.TIMING || {};
  setTimeout(
    () => {
      if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    },
    (config as any).PURCHASE_FEEDBACK_DURATION || 2000
  );
}

// Show level up feedback
export function showLevelUpFeedback(sipsGained: number): void {
  const levelUpDiv = domQuery.getById('levelUpDiv') as HTMLElement | undefined;
  if (!levelUpDiv) return;
  const feedback = document.createElement('div');
  feedback.className = 'levelup-feedback';
  feedback.innerHTML = `
        <div class="levelup-title">🎉 LEVEL UP! 🎉</div>
        <div class="levelup-bonus">+${prettify(sipsGained)} sips bonus!</div>
    `;
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'assertive');
  feedback.setAttribute('aria-label', `Level up! Gained ${prettify(sipsGained)} bonus sips`);
  const levelRect = levelUpDiv.getBoundingClientRect();
  feedback.style.cssText = `
        position: fixed;
        left: ${levelRect.left + levelRect.width / 2}px;
        top: ${levelRect.top + levelRect.height / 2}px;
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
  const config = (window as any).GAME_CONFIG?.TIMING || {};
  setTimeout(
    () => {
      if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    },
    (config as any).LEVELUP_FEEDBACK_DURATION || 3000
  );
}

// Show offline progress modal
export function showOfflineProgress(timeSeconds: number, earnings: number): void {
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
  const overlay = modal.querySelector('.modal-overlay') as HTMLElement | null;
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
  const content = modal.querySelector('.modal-content') as HTMLElement | null;
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
    const h2 = content.querySelector('h2') as HTMLElement | null;
    if (h2) {
      h2.style.cssText = `
                margin: 0 0 12px 0;
                font-size: 20px;
                color: #60A5FA;
            `;
    }
    const stats = content.querySelector('.offline-stats') as HTMLElement | null;
    if (stats) {
      stats.style.cssText = `
                display: grid;
                gap: 8px;
            `;
    }
    const btn = content.querySelector('.offline-continue-btn') as HTMLButtonElement | null;
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
  document.body.appendChild(modal);
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 10000);
}

// Helper function to format time duration
function formatTime(seconds: number): string {
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

// Export milestone feedback function
export { showMilestoneFeedback };
