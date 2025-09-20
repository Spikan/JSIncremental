/**
 * Enhanced Top Information Bar Component
 * Provides a clean, focused display of key game metrics
 */

import { formatStatNumber } from './utils';
import { toDecimal } from '../core/numbers/simplified';
import { useGameStore } from '../core/state/zustand-store';

export interface TopInfoBarData {
  level: number;
  totalSips: number | any;
  perDrink: number | any;
  title: string;
}

export class TopInfoBar {
  private container: HTMLElement | null = null;
  private statsContainer: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
  }

  public initializeElements(): void {
    // Look for the currency display container in the new layout
    this.container = document.querySelector('.currency-display-section') as HTMLElement;

    // The stats container is the currency display itself
    this.statsContainer = this.container;
  }

  public update(data: TopInfoBarData): void {
    this.initializeElements();

    if (!this.container) {
      console.warn('❌ Currency display container not found');
      return;
    }

    // Update level information using the specific elements
    const levelNumber = document.getElementById('levelNumber');
    const currentLevelName = document.getElementById('currentLevelName');

    if (levelNumber) {
      levelNumber.textContent = data.level.toString();
    }

    if (currentLevelName) {
      currentLevelName.textContent = data.title;
    }

    // Update primary stat (total sips) - using the correct ID from our new layout
    const primarySipsDisplay = document.getElementById('topSipValue');
    if (primarySipsDisplay) {
      const formattedSips = formatStatNumber(toDecimal(data.totalSips));
      primarySipsDisplay.textContent = formattedSips;
    }

    // Update secondary stats - using the correct IDs from our new layout
    const perDrinkDisplay = document.getElementById('topSipsPerDrink');
    if (perDrinkDisplay) {
      const formattedPerDrink = formatStatNumber(toDecimal(data.perDrink));
      perDrinkDisplay.textContent = formattedPerDrink;
    }

    const perSecondDisplay = document.getElementById('topSipsPerSecond');
    if (perSecondDisplay) {
      // Calculate sips per second using Decimal math to preserve precision
      try {
        const state = useGameStore.getState();
        const drinkRate = state?.drinkRate || 1000;
        const perDrinkDecimal = toDecimal(data.perDrink || 0);
        const rateSecondsDecimal = toDecimal(drinkRate / 1000);
        const sipsPerSecondDecimal =
          drinkRate > 0 ? perDrinkDecimal.div(rateSecondsDecimal) : toDecimal(0);
        const formattedPerSecond = formatStatNumber(sipsPerSecondDecimal);
        perSecondDisplay.textContent = formattedPerSecond;
      } catch (error) {
        perSecondDisplay.textContent = '0';
      }
    }
  }

  public show(): void {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  public destroy(): void {
    if (this.statsContainer && this.statsContainer.parentNode) {
      this.statsContainer.parentNode.removeChild(this.statsContainer);
    }
    this.statsContainer = null;
  }
}

// Global instance for easy access
export const topInfoBar = new TopInfoBar();
