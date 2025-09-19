// Performance tuning and integration for break_eternity.js operations
// Provides intelligent performance monitoring and automatic tuning

import { DecimalType } from './decimal-utils';
import { memoryOptimizer, performanceOptimizer } from './memory-optimization';
import { errorHandler } from '../error-handling/error-handler';
import {
  predictiveCache,
  decimalOperationCache,
  batchOptimizer,
  cacheManager,
} from './advanced-caching';
import { ExtremeValueMonitor } from './error-recovery';

/**
 * Performance tuning manager that coordinates all optimization features
 */
export class PerformanceTuner {
  private static instance: PerformanceTuner;
  private tuningEnabled = true;
  private lastTuningTime = Date.now();
  private tuningInterval = 5 * 60 * 1000; // 5 minutes
  private performanceThresholds = {
    operationTime: 50, // 50ms
    memoryUsage: 50 * 1024 * 1024, // 50MB
    cacheHitRate: 0.7, // 70%
    extremeValueFrequency: 0.1, // 10%
  };

  static getInstance(): PerformanceTuner {
    if (!PerformanceTuner.instance) {
      PerformanceTuner.instance = new PerformanceTuner();
    }
    return PerformanceTuner.instance;
  }

  /**
   * Initialize performance tuning
   */
  initialize(): void {
    if (!this.tuningEnabled) return;

    // Register caches with the manager
    cacheManager.registerCache('predictive', predictiveCache);
    cacheManager.registerCache('decimalOperations', decimalOperationCache);
    cacheManager.registerCache('batch', batchOptimizer);

    // Set up periodic tuning
    this.scheduleTuning();

    console.log('⚡ Performance tuning initialized');
  }

  /**
   * Schedule periodic performance tuning
   */
  private scheduleTuning(): void {
    setInterval(() => {
      this.performTuning();
    }, this.tuningInterval);
  }

  /**
   * Perform comprehensive performance tuning
   */
  performTuning(): void {
    if (!this.tuningEnabled) return;

    const now = Date.now();
    if (now - this.lastTuningTime < this.tuningInterval) return;

    console.log('🔧 Performing performance tuning...');

    // Collect performance metrics
    const metrics = this.collectMetrics();

    // Analyze performance
    const analysis = this.analyzePerformance(metrics);

    // Apply optimizations
    this.applyOptimizations(analysis);

    this.lastTuningTime = now;
  }

  /**
   * Collect comprehensive performance metrics
   */
  private collectMetrics() {
    const memoryStats = memoryOptimizer.getStats();
    const performanceStats = performanceOptimizer.getStats();
    const extremeValueStats = ExtremeValueMonitor.getInstance().getStats();
    const cacheStats = cacheManager.getAllStats();

    return {
      memory: memoryStats,
      performance: performanceStats,
      extremeValues: extremeValueStats,
      caches: cacheStats,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze performance metrics and identify optimization opportunities
   */
  private analyzePerformance(metrics: any) {
    const analysis = {
      needsMemoryOptimization: false,
      needsCacheOptimization: false,
      needsPerformanceOptimization: false,
      recommendations: [] as string[],
    };

    // Check memory usage
    if (metrics.memory.pool.totalPooled > 100) {
      analysis.needsMemoryOptimization = true;
      analysis.recommendations.push('High memory pool usage detected');
    }

    // Check cache performance
    for (const [cacheName, cacheStats] of Object.entries(metrics.caches)) {
      const stats = cacheStats as any;
      if (
        stats.hitRate &&
        parseFloat(stats.hitRate) < this.performanceThresholds.cacheHitRate * 100
      ) {
        analysis.needsCacheOptimization = true;
        analysis.recommendations.push(`Low cache hit rate for ${cacheName}: ${stats.hitRate}`);
      }
    }

    // Check operation performance
    for (const [operation, opStats] of Object.entries(metrics.performance)) {
      const stats = opStats as any;
      if (stats.average && parseFloat(stats.average) > this.performanceThresholds.operationTime) {
        analysis.needsPerformanceOptimization = true;
        analysis.recommendations.push(
          `Slow operation detected: ${operation} (${stats.average}ms avg)`
        );
      }
    }

    // Check extreme value frequency
    const totalOperations = Object.values(metrics.performance).reduce((sum: number, op: any) => {
      return sum + (op.count || 0);
    }, 0);

    if (
      totalOperations > 0 &&
      metrics.extremeValues.extremeValueCount / totalOperations >
        this.performanceThresholds.extremeValueFrequency
    ) {
      analysis.needsPerformanceOptimization = true;
      analysis.recommendations.push('High frequency of extreme value operations detected');
    }

    return analysis;
  }

  /**
   * Apply optimizations based on performance analysis
   */
  private applyOptimizations(analysis: any): void {
    if (analysis.needsMemoryOptimization) {
      this.optimizeMemory();
    }

    if (analysis.needsCacheOptimization) {
      this.optimizeCache();
    }

    if (analysis.needsPerformanceOptimization) {
      this.optimizePerformance();
    }

    // Log recommendations
    if (analysis.recommendations.length > 0) {
      console.log('📊 Performance recommendations:', analysis.recommendations);
    }
  }

  /**
   * Optimize memory usage
   */
  private optimizeMemory(): void {
    console.log('🧠 Optimizing memory usage...');

    // Clear memory pools
    memoryOptimizer.getStats().pool.totalPooled = 0;

    // Suggest garbage collection
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
        console.log('🧹 Memory optimization: Garbage collection triggered');
      } catch (error) {
        errorHandler.handleError(error, 'triggerGarbageCollection', {
          context: 'memory optimization',
        });
      }
    }
  }

  /**
   * Optimize cache performance
   */
  private optimizeCache(): void {
    console.log('📦 Optimizing cache performance...');

    // Clear underperforming caches
    cacheManager.optimize();

    // Reset cache statistics
    predictiveCache.clear();
    decimalOperationCache.clear();
    batchOptimizer.clear();
  }

  /**
   * Optimize general performance
   */
  private optimizePerformance(): void {
    console.log('⚡ Optimizing general performance...');

    // Clear performance tracking
    performanceOptimizer.clear();

    // Reset extreme value monitoring
    ExtremeValueMonitor.getInstance().reset();
  }

  /**
   * Enable or disable performance tuning
   */
  setTuningEnabled(enabled: boolean): void {
    this.tuningEnabled = enabled;
    console.log(`Performance tuning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current performance tuning status
   */
  getStatus() {
    return {
      enabled: this.tuningEnabled,
      lastTuning: this.lastTuningTime,
      nextTuning: this.lastTuningTime + this.tuningInterval,
      thresholds: this.performanceThresholds,
    };
  }
}

/**
 * Intelligent operation wrapper that automatically applies optimizations
 */
export class OptimizedOperations {
  private static instance: OptimizedOperations;

  static getInstance(): OptimizedOperations {
    if (!OptimizedOperations.instance) {
      OptimizedOperations.instance = new OptimizedOperations();
    }
    return OptimizedOperations.instance;
  }

  /**
   * Optimized power operation with caching and performance tracking
   */
  pow(base: DecimalType, exponent: number): DecimalType {
    return performanceOptimizer.timeOperation('optimized_pow', () => {
      // Use cached operation if available
      return decimalOperationCache.pow(base, exponent);
    });
  }

  /**
   * Optimized exponential operation
   */
  exp(value: DecimalType): DecimalType {
    return performanceOptimizer.timeOperation('optimized_exp', () => {
      return decimalOperationCache.exp(value);
    });
  }

  /**
   * Optimized logarithm operation
   */
  log(value: DecimalType): DecimalType {
    return performanceOptimizer.timeOperation('optimized_log', () => {
      return decimalOperationCache.log(value);
    });
  }

  /**
   * Optimized square root operation
   */
  sqrt(value: DecimalType): DecimalType {
    return performanceOptimizer.timeOperation('optimized_sqrt', () => {
      return decimalOperationCache.sqrt(value);
    });
  }

  /**
   * Optimized batch operations
   */
  batchPow(bases: DecimalType[], exponent: number): DecimalType[] {
    return performanceOptimizer.timeOperation('optimized_batch_pow', () => {
      return batchOptimizer.optimizeBatch(bases, base => this.pow(base, exponent));
    });
  }

  /**
   * Optimized batch exponential operations
   */
  batchExp(values: DecimalType[]): DecimalType[] {
    return performanceOptimizer.timeOperation('optimized_batch_exp', () => {
      return batchOptimizer.optimizeBatch(values, value => this.exp(value));
    });
  }
}

/**
 * Performance monitoring dashboard
 */
export class PerformanceDashboard {
  private static instance: PerformanceDashboard;
  private updateInterval = 10 * 1000; // 10 seconds
  private isRunning = false;

  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard();
    }
    return PerformanceDashboard.instance;
  }

  /**
   * Start the performance dashboard
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateDashboard();

    console.log('📊 Performance dashboard started');
  }

  /**
   * Stop the performance dashboard
   */
  stop(): void {
    this.isRunning = false;
    console.log('📊 Performance dashboard stopped');
  }

  /**
   * Update the performance dashboard
   */
  private updateDashboard(): void {
    if (!this.isRunning) return;

    const stats = this.collectAllStats();
    this.displayStats(stats);

    // Schedule next update
    setTimeout(() => this.updateDashboard(), this.updateInterval);
  }

  /**
   * Collect all performance statistics
   */
  private collectAllStats() {
    return {
      memory: memoryOptimizer.getStats(),
      performance: performanceOptimizer.getStats(),
      extremeValues: ExtremeValueMonitor.getInstance().getStats(),
      caches: cacheManager.getAllStats(),
      tuning: PerformanceTuner.getInstance().getStatus(),
    };
  }

  /**
   * Display performance statistics
   */
  private displayStats(stats: any): void {
    if (typeof window === 'undefined') return;

    // Create or update dashboard element
    let dashboard = document.getElementById('performance-dashboard');
    if (!dashboard) {
      dashboard = document.createElement('div');
      dashboard.id = 'performance-dashboard';
      dashboard.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
      `;
      document.body.appendChild(dashboard);
    }

    // Format and display stats
    dashboard.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">⚡ Performance Dashboard</div>
      <div>Memory Pool: ${stats.memory.pool.totalPooled}</div>
      <div>Cache Hit Rate: ${this.getAverageHitRate(stats.caches)}%</div>
      <div>Extreme Values: ${stats.extremeValues.extremeValueCount}</div>
      <div>Slow Operations: ${this.getSlowOperationCount(stats.performance)}</div>
      <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
        Last updated: ${new Date().toLocaleTimeString()}
      </div>
    `;
  }

  /**
   * Get average cache hit rate
   */
  private getAverageHitRate(cacheStats: any): string {
    const hitRates = Object.values(cacheStats)
      .map((cache: any) => parseFloat(cache.hitRate || '0'))
      .filter(rate => !isNaN(rate));

    if (hitRates.length === 0) return '0';

    const average = hitRates.reduce((sum, rate) => sum + rate, 0) / hitRates.length;
    return average.toFixed(1);
  }

  /**
   * Get count of slow operations
   */
  private getSlowOperationCount(performanceStats: any): number {
    return Object.values(performanceStats).reduce(
      (sum: number, op: any) => sum + (op.slowOperations || 0),
      0
    );
  }
}

/**
 * Global performance optimization setup
 */
export function setupPerformanceOptimization(): void {
  if (typeof window === 'undefined') return;

  // Initialize performance tuning
  const tuner = PerformanceTuner.getInstance();
  tuner.initialize();

  // Set up memory optimization
  // setupMemoryOptimization(); // Commented out to avoid circular dependency

  // Start performance dashboard in development mode
  if (process.env['NODE_ENV'] === 'development') {
    const dashboard = PerformanceDashboard.getInstance();
    dashboard.start();
  }

  console.log('🚀 Performance optimization system initialized');
}

// Export singleton instances
export const performanceTuner = PerformanceTuner.getInstance();
export const optimizedOperations = OptimizedOperations.getInstance();
export const performanceDashboard = PerformanceDashboard.getInstance();
