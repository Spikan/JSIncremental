// Performance monitoring service using web-vitals
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { errorReporter, ErrorCategory, ErrorSeverity } from './error-overlay';

export interface PerformanceMetrics {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
  gameLoadTime: number | null;
  firstRenderTime: number | null;
  memoryUsage: MemoryInfo | null;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    gameLoadTime: null,
    firstRenderTime: null,
    memoryUsage: null,
  };

  private startTime: number;
  private isMonitoring = false;

  constructor() {
    this.startTime = performance.now();
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor Core Web Vitals
    this.monitorWebVitals();

    // Monitor game-specific performance
    this.monitorGamePerformance();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor frame rate
    this.monitorFrameRate();
  }

  private monitorWebVitals(): void {
    try {
      // Cumulative Layout Shift (CLS)
      onCLS((metric: any) => {
        try {
          this.metrics.CLS = metric.value;
          this.logMetric('CLS', metric.value);
        } catch (error) {
          this.handlePerformanceError('CLS monitoring', error);
        }
      });
    } catch (error) {
      this.handlePerformanceError('CLS setup', error);
    }

    try {
      // First Contentful Paint (FCP)
      onFCP((metric: any) => {
        try {
          this.metrics.FCP = metric.value;
          this.logMetric('FCP', metric.value);
        } catch (error) {
          this.handlePerformanceError('FCP monitoring', error);
        }
      });
    } catch (error) {
      this.handlePerformanceError('FCP setup', error);
    }

    try {
      // Largest Contentful Paint (LCP)
      onLCP((metric: any) => {
        try {
          this.metrics.LCP = metric.value;
          this.logMetric('LCP', metric.value);
        } catch (error) {
          this.handlePerformanceError('LCP monitoring', error);
        }
      });
    } catch (error) {
      this.handlePerformanceError('LCP setup', error);
    }

    try {
      // Time to First Byte (TTFB)
      onTTFB((metric: any) => {
        try {
          this.metrics.TTFB = metric.value;
          this.logMetric('TTFB', metric.value);
        } catch (error) {
          this.handlePerformanceError('TTFB monitoring', error);
        }
      });
    } catch (error) {
      this.handlePerformanceError('TTFB setup', error);
    }
  }

  private monitorGamePerformance(): void {
    // Monitor game load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.metrics.gameLoadTime = loadTime;
      this.logMetric('Game Load Time', loadTime);
    });

    // Monitor first render
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const firstRenderTime = performance.now() - this.startTime;
        this.metrics.firstRenderTime = firstRenderTime;
        this.logMetric('First Render Time', firstRenderTime);
      });
    } else {
      const firstRenderTime = performance.now() - this.startTime;
      this.metrics.firstRenderTime = firstRenderTime;
      this.logMetric('First Render Time', firstRenderTime);
    }
  }

  private monitorMemoryUsage(): void {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };

        // Log memory usage
        this.logMetric('Memory Usage (MB)', memory.usedJSHeapSize / 1024 / 1024);

        // Monitor memory usage periodically
        const memoryCheckInterval = setInterval(() => {
          try {
            const currentMemory = (performance as any).memory;
            this.metrics.memoryUsage = {
              usedJSHeapSize: currentMemory.usedJSHeapSize,
              totalJSHeapSize: currentMemory.totalJSHeapSize,
              jsHeapSizeLimit: currentMemory.jsHeapSizeLimit,
            };

            // Warn if memory usage is high
            const memoryUsageMB = currentMemory.usedJSHeapSize / 1024 / 1024;
            if (memoryUsageMB > 100) {
              // 100MB threshold
              console.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);

              // Report high memory usage as a performance error
              if (memoryUsageMB > 200) {
                this.handlePerformanceError(
                  'high_memory_usage',
                  new Error(`Memory usage exceeded 200MB: ${memoryUsageMB.toFixed(2)}MB`)
                );
              }
            }
          } catch (error) {
            this.handlePerformanceError('memory_check_interval', error);
            clearInterval(memoryCheckInterval);
          }
        }, 30000); // Check every 30 seconds
      }
    } catch (error) {
      this.handlePerformanceError('memory_monitoring_setup', error);
    }
  }

  private monitorFrameRate(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.logMetric('FPS', fps);

        // Warn if FPS is low
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  private handlePerformanceError(operation: string, error: any): void {
    const errorMessage = `Performance monitoring failed: ${operation}`;
    console.warn(errorMessage, error);

    // Report to error handling system
    errorReporter?.reportError({
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      category: ErrorCategory.PERFORMANCE,
      severity: ErrorSeverity.MEDIUM,
      context: {
        component: 'performance-monitor',
        operation: operation,
        timestamp: Date.now(),
        stackTrace: error?.stack,
      },
      originalError: error instanceof Error ? error : new Error(String(error)),
    });
  }

  private logMetric(name: string, value: number): void {
    try {
      console.log(`📊 Performance: ${name} = ${value}`);

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: value,
        });
      }
    } catch (error) {
      this.handlePerformanceError('logMetric', error);
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getGameLoadTime(): number | null {
    return this.metrics.gameLoadTime;
  }

  public getMemoryUsage(): MemoryInfo | null {
    return this.metrics.memoryUsage;
  }

  public getFPS(): number | null {
    // This would need to be implemented with a more sophisticated FPS counter
    return null;
  }

  public isPerformanceGood(): boolean {
    const { CLS, FID, FCP, LCP } = this.metrics;

    // Check if all metrics are within good thresholds
    const isCLSGood = CLS === null || CLS < 0.1;
    const isFIDGood = FID === null || FID < 100;
    const isFCPGood = FCP === null || FCP < 1800;
    const isLCPGood = LCP === null || LCP < 2500;

    return isCLSGood && isFIDGood && isFCPGood && isLCPGood;
  }

  public getPerformanceScore(): number {
    let score = 100;

    // Deduct points for poor performance
    if (this.metrics.CLS && this.metrics.CLS > 0.1) {
      score -= Math.min(20, this.metrics.CLS * 100);
    }

    if (this.metrics.FID && this.metrics.FID > 100) {
      score -= Math.min(20, (this.metrics.FID - 100) / 10);
    }

    if (this.metrics.FCP && this.metrics.FCP > 1800) {
      score -= Math.min(20, (this.metrics.FCP - 1800) / 100);
    }

    if (this.metrics.LCP && this.metrics.LCP > 2500) {
      score -= Math.min(20, (this.metrics.LCP - 2500) / 100);
    }

    return Math.max(0, Math.round(score));
  }

  public generateReport(): string {
    const score = this.getPerformanceScore();
    const { CLS, FID, FCP, LCP, gameLoadTime, memoryUsage } = this.metrics;

    let report = `🚀 Performance Report\n`;
    report += `Overall Score: ${score}/100\n\n`;

    report += `Core Web Vitals:\n`;
    report += `- CLS: ${CLS ? CLS.toFixed(3) : 'N/A'} ${CLS && CLS < 0.1 ? '✅' : CLS ? '❌' : '⏳'}\n`;
    report += `- FID: ${FID ? `${Math.round(FID)}ms` : 'N/A'} ${FID && FID < 100 ? '✅' : FID ? '❌' : '⏳'}\n`;
    report += `- FCP: ${FCP ? `${Math.round(FCP)}ms` : 'N/A'} ${FCP && FCP < 1800 ? '✅' : FCP ? '❌' : '⏳'}\n`;
    report += `- LCP: ${LCP ? `${Math.round(LCP)}ms` : 'N/A'} ${LCP && LCP < 2500 ? '✅' : LCP ? '❌' : '⏳'}\n\n`;

    report += `Game Performance:\n`;
    report += `- Load Time: ${gameLoadTime ? `${Math.round(gameLoadTime)}ms` : 'N/A'}\n`;

    if (memoryUsage) {
      const usedMB = (memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2);
      report += `- Memory Usage: ${usedMB}MB / ${totalMB}MB\n`;
    }

    return report;
  }

  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  public resetMetrics(): void {
    this.metrics = {
      CLS: null,
      FID: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      gameLoadTime: null,
      firstRenderTime: null,
      memoryUsage: null,
    };
    this.startTime = performance.now();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Legacy window access removed - use proper imports
