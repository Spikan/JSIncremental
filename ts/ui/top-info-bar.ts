/**
 * Enhanced Top Information Bar Component
 * Provides a clean, focused display of key game metrics
 */

import { formatStatNumber } from './utils';
import { useGameStore } from '../core/state/zustand-store';

export interface TopInfoBarData {
  level: number;
  totalSips: number | any;
  perDrink: number | any;
  title: string;
}

export class TopInfoBar {
  private container: HTMLElement | null = null;
  private levelDiv: HTMLElement | null = null;
  private statsContainer: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
  }

  public initializeElements(): void {
    // Look for the currency display container in the new layout
    this.container = document.querySelector('.currency-display-compact') as HTMLElement;
    this.levelDiv = document.querySelector('.level-display') as HTMLElement;

    // The stats container is the currency display itself
    this.statsContainer = this.container;
  }

  public update(data: TopInfoBarData): void {
    this.initializeElements();

    if (!this.container) {
      console.warn('❌ Currency display container not found');
      return;
    }

    // Update level information (if level display exists)
    if (this.levelDiv) {
      this.levelDiv.innerHTML = `
        <h2>Level ${data.level}</h2>
        <h3>${data.title}</h3>
      `;
    }

    // Update primary stat (total sips) - using the correct ID from our new layout
    const primarySipsDisplay = document.getElementById('topSipValue');
    if (primarySipsDisplay) {
      const formattedSips = formatStatNumber(data.totalSips);
      primarySipsDisplay.textContent = formattedSips;
    }

    // Update secondary stats - using the correct IDs from our new layout
    const perDrinkDisplay = document.getElementById('topSipsPerDrink');
    if (perDrinkDisplay) {
      const formattedPerDrink = formatStatNumber(data.perDrink);
      perDrinkDisplay.textContent = formattedPerDrink;
    }

    const perSecondDisplay = document.getElementById('topSipsPerSecond');
    if (perSecondDisplay) {
      // Calculate sips per second from current state
      try {
        const state = useGameStore.getState();
        const drinkRate = state?.drinkRate || 1000;
        const sipsPerSecond = data.perDrink / (drinkRate / 1000) || 0;
        const formattedPerSecond = formatStatNumber(sipsPerSecond);
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
