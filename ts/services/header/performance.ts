import { performanceMonitor } from '../performance';

export type PerformanceMode = 'high' | 'medium' | 'low';

interface HeaderPerformanceOptions {
  onModeChange: (mode: PerformanceMode) => void;
}

export class HeaderPerformanceController {
  private onModeChange: (mode: PerformanceMode) => void;
  private frameCount = 0;
  private lastFrameTime = 0;
  private currentFPS = 60;
  private animationId: number | null = null;
  private performanceIntervalId: number | null = null;

  constructor(options: HeaderPerformanceOptions) {
    this.onModeChange = options.onModeChange;
  }

  public start(): void {
    // Monitor performance every 5 seconds
    this.performanceIntervalId = window.setInterval(() => {
      this.checkPerformanceAndAdjust();
    }, 5000);

    // Monitor frame rate
    if (typeof requestAnimationFrame === 'function') {
      this.startFrameRateMonitoring();
    }
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.performanceIntervalId) {
      clearInterval(this.performanceIntervalId);
      this.performanceIntervalId = null;
    }
  }

  public getMetrics(): { fps: number; memoryUsage: number | null } {
    const memoryUsage = performanceMonitor?.getMemoryUsage();
    return {
      fps: this.currentFPS,
      memoryUsage: memoryUsage ? memoryUsage.usedJSHeapSize / 1024 / 1024 : null,
    };
  }

  public shouldEnableForPerformance(): boolean {
    if (!performanceMonitor) return true;
    const score = performanceMonitor.getPerformanceScore();
    // Disable entirely for extremely low score environments
    return score >= 40;
  }

  private startFrameRateMonitoring(): void {
    const measureFrameRate = (currentTime: number) => {
      this.frameCount++;

      if (currentTime - this.lastFrameTime >= 1000) {
        const timeDiff = currentTime - this.lastFrameTime;
        this.currentFPS = timeDiff > 0 ? Math.round((this.frameCount * 1000) / timeDiff) : 60;

        // Adjust performance mode based on FPS
        if (this.currentFPS < 30) {
          this.onModeChange('low');
        } else if (this.currentFPS < 45) {
          this.onModeChange('medium');
        } else if (this.currentFPS >= 55) {
          this.onModeChange('high');
        }

        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      this.animationId = requestAnimationFrame(measureFrameRate);
    };

    this.animationId = requestAnimationFrame(measureFrameRate);
  }

  private checkPerformanceAndAdjust(): void {
    if (!performanceMonitor) return;

    const score = performanceMonitor.getPerformanceScore();
    const memoryUsage = performanceMonitor.getMemoryUsage();

    if (score < 60) {
      this.onModeChange('low');
    } else if (score < 80) {
      this.onModeChange('medium');
    } else {
      this.onModeChange('high');
    }

    if (memoryUsage) {
      const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      if (usedMB > 150) {
        this.onModeChange('low');
      } else if (usedMB > 100) {
        this.onModeChange('medium');
      }
    }
  }
}


