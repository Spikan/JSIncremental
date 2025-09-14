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

    // Update primary stat (total sips)
    const primarySipsDisplay = document.getElementById('primarySipsDisplay');
    if (primarySipsDisplay) {
      primarySipsDisplay.textContent = formatStatNumber(data.totalSips);
    }

    // Update secondary stats
    const perDrinkDisplay = document.getElementById('perDrinkDisplay');
    if (perDrinkDisplay) {
      perDrinkDisplay.textContent = formatStatNumber(data.perDrink);
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
