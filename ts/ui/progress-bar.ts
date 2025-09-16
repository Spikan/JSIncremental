/**
 * Enhanced Progress Bar Component
 * Provides better visual design and information display for progress indicators
 */

import { formatProgressNumber, formatStatNumber } from './utils';

export interface ProgressBarData {
  progress: number;
  total: number;
  rate: number;
  label: string;
  showTimeRemaining?: boolean;
  showPercentage?: boolean;
  showRate?: boolean;
}

export class ProgressBar {
  private container: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private progressLabel: HTMLElement | null = null;
  // private progressInfo: HTMLElement | null = null; // Currently unused
  private progressPercentage: HTMLElement | null = null;
  private progressRate: HTMLElement | null = null;
  private progressTime: HTMLElement | null = null;

  constructor(containerId: string) {
    this.initializeElements(containerId);
  }

  public initializeElements(containerId: string): void {
    console.log(`🔧 Initializing progress bar for container: ${containerId}`);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Progress bar container not found: ${containerId}`);
      return;
    }

    // Create enhanced progress bar structure
    this.createProgressBarStructure();
    console.log(`✅ Progress bar initialized for: ${containerId}`);
  }

  private createProgressBarStructure(): void {
    if (!this.container) return;

    // Add enhanced styling to existing progress bar instead of replacing it
    this.container.classList.add('enhanced-progress-container');

    // Find existing progress elements - look for the actual classes in the HTML
    const existingFill = this.container.querySelector('.progress-fill-minimal, .progress-fill-main') as HTMLElement;
    const existingLabel = this.container.querySelector('.level-name-minimal, .countdown-minimal') as HTMLElement;
    const existingCountdown = this.container.querySelector('.countdown-minimal') as HTMLElement;

    if (existingFill) {
      // Add enhanced classes to existing fill
      existingFill.classList.add('enhanced-progress-fill');
      this.progressFill = existingFill;
    }

    if (existingLabel) {
      this.progressLabel = existingLabel;
    }

    if (existingCountdown) {
      this.progressTime = existingCountdown;
    }

    // Add enhanced info display
    const infoContainer = document.createElement('div');
    infoContainer.className = 'enhanced-progress-info';
    infoContainer.innerHTML = `
      <span class="progress-percentage" id="progressPercentage">0%</span>
      <span class="progress-separator">•</span>
      <span class="progress-rate" id="progressRate">0/s</span>
    `;

    // Insert info container after the existing progress bar
    const progressBar = this.container.querySelector('.progress-bar-minimal, .progress-bar-main');
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.insertBefore(infoContainer, progressBar.nextSibling);
    }

    // Cache enhanced elements
    this.progressPercentage = document.getElementById('progressPercentage');
    this.progressRate = document.getElementById('progressRate');

    console.log('✅ Enhanced progress bar structure created');
  }

  public update(data: ProgressBarData): void {
    if (!this.container) return;

    const percentage = Math.min(Math.max((data.progress / data.total) * 100, 0), 100);
    const timeRemaining = data.rate > 0 ? (data.total - data.progress) / data.rate : 0;

    // Update progress bar fill
    if (this.progressFill) {
      this.progressFill.style.width = `${percentage}%`;

      // Update visual state based on progress
      this.progressFill.classList.remove('nearly-complete', 'complete', 'critical');
      if (percentage >= 100) {
        this.progressFill.classList.add('complete');
      } else if (percentage >= 90) {
        this.progressFill.classList.add('nearly-complete');
      } else if (percentage >= 75) {
        this.progressFill.classList.add('critical');
      }
    }

    // Update label
    if (this.progressLabel) {
      this.progressLabel.textContent = data.label;
    }

    // Update percentage
    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${Math.round(percentage)}%`;
    }

    // Update rate
    if (this.progressRate) {
      this.progressRate.textContent = `${formatStatNumber(data.rate)}/s`;
    }

    // Update time remaining
    if (this.progressTime) {
      if (data.showTimeRemaining && timeRemaining > 0) {
        this.progressTime.textContent = `${formatProgressNumber(timeRemaining)}s`;
        this.progressTime.style.display = 'inline';
      } else {
        this.progressTime.style.display = 'none';
      }
    }

    // Update milestones
    this.updateMilestones(percentage);
  }

  private updateMilestones(percentage: number): void {
    const milestones = this.container?.querySelectorAll('.milestone');
    milestones?.forEach(milestone => {
      const milestonePercent = parseInt(milestone.getAttribute('data-percent') || '0');
      if (percentage >= milestonePercent) {
        milestone.classList.add('reached');
      } else {
        milestone.classList.remove('reached');
      }
    });
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
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}

// Global instances for different progress bars
export const drinkProgressBar = new ProgressBar('drinkProgressBar');
export const levelProgressBar = new ProgressBar('levelProgressBar');
