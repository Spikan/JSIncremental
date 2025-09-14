// Enhanced Affordability System
// Provides intelligent visual feedback and tooltips for upgrade affordability

import { useGameStore } from '../core/state/zustand-store';

export interface AffordabilityState {
  affordable: boolean;
  nearAffordable: boolean;
  unaffordable: boolean;
  percentageToAfford: number;
  timeToAfford: string | undefined;
}

/**
 * Calculate affordability state for a given cost
 */
export function calculateAffordabilityState(cost: number | any): AffordabilityState {
  const state = useGameStore.getState();
  const currentSips = state.sips;

  // Convert to numbers for calculation - use safe conversion for Decimal types
  const costNum = typeof cost === 'number' ? cost : (cost?.toSafeNumber?.() ?? Number(cost));
  const sipsNum =
    typeof currentSips === 'number'
      ? currentSips
      : (currentSips?.toSafeNumber?.() ?? Number(currentSips));

  const affordable = sipsNum >= costNum;
  const percentageToAfford = Math.min((sipsNum / costNum) * 100, 100);
  const nearAffordable = !affordable && percentageToAfford >= 75; // 75% or more towards affordability
  const unaffordable = !affordable && !nearAffordable;

  let timeToAfford: string | undefined;
  if (!affordable && state.spd) {
    const sipsPerSecond =
      typeof state.spd === 'number'
        ? (state.spd / (state.drinkRate || 5000)) * 1000
        : ((state.spd?.toSafeNumber?.() ?? Number(state.spd) ?? 0) / (state.drinkRate || 5000)) *
          1000;

    if (sipsPerSecond > 0) {
      const remainingSips = costNum - sipsNum;
      const secondsToAfford = remainingSips / sipsPerSecond;

      if (secondsToAfford < 60) {
        timeToAfford = `${Math.ceil(secondsToAfford)}s`;
      } else if (secondsToAfford < 3600) {
        timeToAfford = `${Math.ceil(secondsToAfford / 60)}m`;
      } else {
        timeToAfford = `${Math.ceil(secondsToAfford / 3600)}h`;
      }
    }
  }

  return {
    affordable,
    nearAffordable,
    unaffordable,
    percentageToAfford,
    timeToAfford,
  };
}

/**
 * Apply enhanced affordability classes to upgrade cards and buttons
 */
export function applyEnhancedAffordabilityClasses(): void {
  // Find all upgrade buttons and cards
  const upgradeElements = document.querySelectorAll('.upgrade-btn, .upgrade-card, .level-up-btn');

  upgradeElements.forEach(element => {
    const costElement = element.querySelector('[id$="Cost"], .cost-number, .upgrade-cost');
    if (!costElement) return;

    const costText = costElement.textContent?.replace(/[^\d.]/g, '') || '0';
    const cost = parseFloat(costText);
    if (isNaN(cost)) return;

    const affordabilityState = calculateAffordabilityState(cost);

    // Remove existing affordability classes
    element.classList.remove('affordable', 'near-affordable', 'unaffordable');

    // Apply new classes
    if (affordabilityState.affordable) {
      element.classList.add('affordable');
    } else if (affordabilityState.nearAffordable) {
      element.classList.add('near-affordable');
    } else {
      element.classList.add('unaffordable');
    }

    // Add data attributes for tooltip system
    element.setAttribute(
      'data-affordability-percentage',
      affordabilityState.percentageToAfford.toFixed(1)
    );
    if (affordabilityState.timeToAfford) {
      element.setAttribute('data-time-to-afford', affordabilityState.timeToAfford);
    }
  });
}

/**
 * Enhanced tooltip system for upgrade affordability
 */
export function initializeEnhancedTooltips(): void {
  let currentTooltip: HTMLElement | null = null;

  const showTooltip = (element: Element, event: MouseEvent) => {
    hideTooltip();

    const affordabilityPercentage = element.getAttribute('data-affordability-percentage');
    const timeToAfford = element.getAttribute('data-time-to-afford');

    if (!affordabilityPercentage) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'enhanced-affordability-tooltip';

    const percentage = parseFloat(affordabilityPercentage);
    let tooltipContent = '';

    if (percentage >= 100) {
      tooltipContent = '✅ Can afford this upgrade!';
    } else if (percentage >= 75) {
      tooltipContent = `⏳ ${percentage.toFixed(1)}% towards affordability`;
      if (timeToAfford) {
        tooltipContent += `<br>Available in: ${timeToAfford}`;
      }
    } else {
      tooltipContent = `🔒 Need ${(100 - percentage).toFixed(1)}% more sips`;
      if (timeToAfford) {
        tooltipContent += `<br>Available in: ${timeToAfford}`;
      }
    }

    tooltip.innerHTML = tooltipContent;
    tooltip.style.cssText = `
      position: fixed;
      left: ${event.clientX + 10}px;
      top: ${event.clientY - 40}px;
      background: rgba(0, 23, 137, 0.95);
      border: 2px solid #00b36b;
      border-radius: 8px;
      padding: 0.75rem;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 500;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      max-width: 200px;
      text-align: center;
      animation: tooltipFadeIn 0.2s ease;
    `;

    document.body.appendChild(tooltip);
    currentTooltip = tooltip;

    // Auto-hide after 3 seconds
    setTimeout(hideTooltip, 3000);
  };

  const hideTooltip = () => {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
  };

  // Add tooltip CSS if not already present
  if (!document.querySelector('#enhanced-tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'enhanced-tooltip-styles';
    style.textContent = `
      @keyframes tooltipFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .enhanced-affordability-tooltip {
        line-height: 1.4;
      }
    `;
    document.head.appendChild(style);
  }

  // Add event listeners
  document.addEventListener('mouseover', event => {
    const target = event.target as Element;
    if (target.matches('.upgrade-btn, .upgrade-card, .level-up-btn')) {
      showTooltip(target, event as MouseEvent);
    }
  });

  document.addEventListener('mouseout', event => {
    const target = event.target as Element;
    if (target.matches('.upgrade-btn, .upgrade-card, .level-up-btn')) {
      hideTooltip();
    }
  });

  // Hide tooltip on scroll
  document.addEventListener('scroll', hideTooltip);
}

/**
 * Add purchase success animation to an element
 */
export function addPurchaseSuccessAnimation(element: HTMLElement): void {
  // Remove any existing animation classes
  element.classList.remove('purchase-success', 'purchase-glow');

  // Add success animation
  element.classList.add('purchase-success');

  // Add glow effect
  setTimeout(() => {
    element.classList.add('purchase-glow');
  }, 50);

  // Remove animations after completion
  setTimeout(() => {
    element.classList.remove('purchase-success', 'purchase-glow');
  }, 1000);
}

/**
 * Initialize purchase success animations
 */
function initializePurchaseSuccessAnimations(): void {
  // Add CSS for purchase success animations if not already present
  if (!document.querySelector('#purchase-success-styles')) {
    const style = document.createElement('style');
    style.id = 'purchase-success-styles';
    style.textContent = `
      .purchase-success {
        animation: purchaseSuccess 0.6s ease-out;
      }
      
      .purchase-glow {
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.8) !important;
        border-color: #00ff88 !important;
      }
      
      @keyframes purchaseSuccess {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 217, 127, 0.2));
        }
        100% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Initialize the enhanced affordability system
 */
export function initializeEnhancedAffordabilitySystem(): void {
  console.log('🎯 Initializing enhanced affordability system...');

  // Apply initial classes
  applyEnhancedAffordabilityClasses();

  // Initialize tooltips
  initializeEnhancedTooltips();

  // Initialize purchase success animations
  initializePurchaseSuccessAnimations();

  // Update affordability classes periodically
  setInterval(applyEnhancedAffordabilityClasses, 1000);

  // Update on state changes
  useGameStore.subscribe(
    state => ({ sips: state.sips, spd: state.spd }),
    () => {
      // Debounce the updates
      setTimeout(applyEnhancedAffordabilityClasses, 100);
    },
    { fireImmediately: false }
  );

  console.log('✅ Enhanced affordability system initialized');
}
