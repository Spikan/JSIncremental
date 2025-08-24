// UI Feedback System (TypeScript)
// Handles visual feedback for user actions like clicks, purchases, level ups

// Import consolidated utilities
import { formatNumber, prettify } from './utils';

// Detect mobile device
function isMobileDevice(): boolean {
  try {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window ||
      (navigator as any).maxTouchPoints > 0
    );
  } catch {
    return false;
  }
}

// Get safe positioning for mobile devices
function getSafePosition(
  container: HTMLElement,
  rangeX: number,
  rangeY: number
): { left: number; top: number } {
  if (isMobileDevice()) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const mobileRangeX = Math.min(rangeX, 80);
    const mobileRangeY = Math.min(rangeY, 60);
    const randomX = (Math.random() - 0.5) * mobileRangeX;
    const randomY = (Math.random() - 0.5) * mobileRangeY;
    return { left: centerX + randomX, top: centerY + randomY };
  } else {
    const containerRect = container.getBoundingClientRect();
    const randomX = (Math.random() - 0.5) * rangeX;
    const randomY = (Math.random() - 0.5) * rangeY;
    return {
      left: containerRect.left + containerRect.width / 2 + randomX,
      top: containerRect.top + containerRect.height / 2 + randomY,
    };
  }
}

// Show feedback at specific click coordinates
function showFeedbackAtCoordinates(
  sipsGained: number,
  isCritical: boolean,
  clickX: number,
  clickY: number
): void {
  console.log('🔧 showFeedbackAtCoordinates called with:', {
    sipsGained,
    isCritical,
    clickX,
    clickY,
  });
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
  const fontSize = isMobile ? (isCritical ? '1.3em' : '1.1em') : isCritical ? '1.5em' : '1.2em';
  const offsetX = (Math.random() - 0.5) * 20;
  const offsetY = (Math.random() - 0.5) * 20;
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
      } catch {
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
  sipsGained: number,
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
      } catch {
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

// Show click feedback numbers
export function showClickFeedback(
  sipsGained: number,
  isCritical: boolean = false,
  clickX: number | null = null,
  clickY: number | null = null
): void {
  console.log('🔧 showClickFeedback called with:', { sipsGained, isCritical, clickX, clickY });
  if (clickX !== null && clickY !== null) {
    showFeedbackAtCoordinates(sipsGained, isCritical, clickX, clickY);
    return;
  }
  const sodaContainer = ((window as any).DOM_CACHE?.sodaButton?.parentNode ||
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
  console.log('🔧 showPurchaseFeedback called with:', { itemName, cost, clickX, clickY });
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
    console.log('🔧 Using click coordinates directly - left:', left, 'top:', top);
  } else {
    const shopDiv = (window as any).DOM_CACHE?.shopDiv as HTMLElement | undefined;
    if (shopDiv) {
      const shopRect = shopDiv.getBoundingClientRect();
      left = shopRect.left + shopRect.width / 2;
      top = shopRect.top + shopRect.height / 2;
      console.log('🔧 Using fallback positioning - left:', left, 'top:', top);
    } else {
      left = window.innerWidth / 2;
      top = window.innerHeight / 2;
      console.log('🔧 Using viewport center - left:', left, 'top:', top);
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
  console.log('🔧 Final feedback positioning - left:', left, 'top:', top);
  console.log('🔧 Feedback element style:', (feedback as any).style?.cssText);
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
      } catch {
        setTimeout(animate, 16);
      }
    }
  };
  try {
    requestAnimationFrame(animate);
  } catch {
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
  const levelUpDiv = (window as any).DOM_CACHE?.levelUpDiv as HTMLElement | undefined;
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
