/**
 * Enhanced Top Information Bar Component
 * Provides a clean, focused display of key game metrics
 */

import { formatStatNumber } from './utils';

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
    this.container = document.getElementById('topDiv');
    this.levelDiv = document.getElementById('levelDiv');

    if (this.container && !this.statsContainer) {
      this.createStatsContainer();
    }
  }

  private createStatsContainer(): void {
    if (!this.container) return;

    // Create the new stats container
    this.statsContainer = document.createElement('div');
    this.statsContainer.className = 'top-stats-container';
    this.statsContainer.innerHTML = `
      <div class="primary-stat">
        <div class="primary-stat-label">Total Sips</div>
        <div class="primary-stat-value" id="primarySipsDisplay">0</div>
      </div>
      <div class="secondary-stat">
        <div class="secondary-stat-item">
          <div class="secondary-stat-label">Per Drink</div>
          <div class="secondary-stat-value" id="perDrinkDisplay">0</div>
        </div>
      </div>
    `;

    // Insert the stats container after the level div
    if (this.levelDiv && this.levelDiv.nextSibling) {
      this.container.insertBefore(this.statsContainer, this.levelDiv.nextSibling);
    } else {
      this.container.appendChild(this.statsContainer);
    }
  }

  public update(data: TopInfoBarData): void {
    this.initializeElements();

    if (!this.container || !this.statsContainer) return;

    // Update level information
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
        const state = (window as any).App?.state?.getState?.();
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
