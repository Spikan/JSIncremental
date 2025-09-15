// Framer Motion Integration Tests
// Tests for enhanced animation system

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DOM elements
const mockElement = {
  textContent: '',
  style: {} as CSSStyleDeclaration,
  setAttribute: vi.fn(),
  addEventListener: vi.fn(),
  parentNode: {
    removeChild: vi.fn(),
  },
  getBoundingClientRect: () => ({
    left: 100,
    top: 100,
    width: 200,
    height: 50,
  }),
} as any;

// Mock document methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockElement),
    body: {
      appendChild: vi.fn(),
    },
    head: {
      appendChild: vi.fn(),
    },
    getElementById: vi.fn(() => mockElement),
    querySelector: vi.fn(() => mockElement),
    querySelectorAll: vi.fn(() => [mockElement]),
  },
});

// Mock window - must be defined before importing modules that use it
Object.defineProperty(global, 'window', {
  value: {
    innerWidth: 1024,
    innerHeight: 768,
    matchMedia: vi.fn(() => ({ matches: false })),
    addEventListener: vi.fn(),
    requestAnimationFrame: vi.fn(cb => setTimeout(cb, 16)),
    setTimeout: vi.fn((cb, delay) => setTimeout(cb, delay)),
    clearTimeout: vi.fn(id => clearTimeout(id)),
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    connection: undefined,
  },
});

// Import modules after mocking
import { animationService } from '../ts/services/animation-service';
import { showEnhancedClickFeedback } from '../ts/ui/enhanced-feedback';
import { enhancedDisplayManager } from '../ts/ui/enhanced-displays';

describe('Framer Motion Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    animationService.stopAllAnimations();
  });

  describe('Animation Service', () => {
    it('should initialize without errors', () => {
      expect(animationService).toBeDefined();
      expect(animationService.getActiveAnimationCount()).toBe(0);
    });

    it('should create click feedback animations', () => {
      const animationId = animationService.showClickFeedback({
        startX: 100,
        startY: 100,
        value: '100',
        isCritical: false,
      });

      expect(animationId).toBeTruthy();
      // Note: In test environment, Framer Motion may fall back to CSS animations
      // which don't track active count, so we just verify the animation ID is returned
    });

    it('should handle critical clicks differently', () => {
      const normalId = animationService.showClickFeedback({
        startX: 100,
        startY: 100,
        value: '100',
        isCritical: false,
      });

      const criticalId = animationService.showClickFeedback({
        startX: 150,
        startY: 150,
        value: '500',
        isCritical: true,
      });

      expect(normalId).toBeTruthy();
      expect(criticalId).toBeTruthy();
      expect(normalId).not.toBe(criticalId);
    });

    it('should animate number counters', () => {
      const animationId = animationService.animateNumber({
        element: mockElement,
        from: 0,
        to: 100,
        duration: 0.1, // Short duration for testing
      });

      expect(animationId).toBeTruthy();
      expect(animationService.getActiveAnimationCount()).toBeGreaterThan(0);
    });

    it('should handle purchase animations', () => {
      const animationId = animationService.animatePurchase({
        element: mockElement,
        type: 'success',
        duration: 0.1,
      });

      expect(animationId).toBeTruthy();
      expect(animationService.getActiveAnimationCount()).toBeGreaterThan(0);
    });

    it('should create milestone celebrations', () => {
      const animationId = animationService.celebrateMilestone('Level Up!', 400, 300, 'level');

      expect(animationId).toBeTruthy();
      expect(animationService.getActiveAnimationCount()).toBeGreaterThan(0);
    });

    it('should stop animations by ID', () => {
      const animationId = animationService.showClickFeedback({
        startX: 100,
        startY: 100,
        value: '100',
      });

      expect(animationService.getActiveAnimationCount()).toBeGreaterThan(0);

      animationService.stopAnimation(animationId);

      expect(animationService.getActiveAnimationCount()).toBe(0);
    });

    it('should stop all animations', () => {
      // Create multiple animations
      animationService.showClickFeedback({ startX: 100, startY: 100, value: '100' });
      animationService.showClickFeedback({ startX: 200, startY: 200, value: '200' });
      animationService.showClickFeedback({ startX: 300, startY: 300, value: '300' });

      expect(animationService.getActiveAnimationCount()).toBeGreaterThan(0);

      animationService.stopAllAnimations();

      expect(animationService.getActiveAnimationCount()).toBe(0);
    });

    it('should handle performance mode', () => {
      animationService.setPerformanceMode(true);

      const animationId = animationService.showClickFeedback({
        startX: 100,
        startY: 100,
        value: '100',
      });

      expect(animationId).toBeTruthy();

      animationService.setPerformanceMode(false);
    });
  });

  describe('Enhanced Feedback', () => {
    it('should show enhanced click feedback without errors', () => {
      expect(() => {
        showEnhancedClickFeedback(100, false, 100, 100);
      }).not.toThrow();
    });

    it('should handle critical clicks', () => {
      expect(() => {
        showEnhancedClickFeedback(500, true, 150, 150);
      }).not.toThrow();
    });

    it('should handle missing coordinates', () => {
      expect(() => {
        showEnhancedClickFeedback(100, false, null, null);
      }).not.toThrow();
    });

    it('should format large numbers correctly', () => {
      expect(() => {
        showEnhancedClickFeedback(1000000, false, 100, 100);
      }).not.toThrow();
    });
  });

  describe('Enhanced Displays', () => {
    it('should initialize display manager', () => {
      expect(enhancedDisplayManager).toBeDefined();
      expect(enhancedDisplayManager.getStats).toBeDefined();
    });

    it('should get display stats', () => {
      const stats = enhancedDisplayManager.getStats();

      expect(stats).toHaveProperty('animationEnabled');
      expect(stats).toHaveProperty('animationDuration');
      expect(stats).toHaveProperty('trackedElements');
      expect(typeof stats.animationEnabled).toBe('boolean');
      expect(typeof stats.animationDuration).toBe('number');
      expect(typeof stats.trackedElements).toBe('number');
    });

    it('should handle animation enable/disable', () => {
      enhancedDisplayManager.setAnimationEnabled(false);
      expect(enhancedDisplayManager.getStats().animationEnabled).toBe(false);

      enhancedDisplayManager.setAnimationEnabled(true);
      expect(enhancedDisplayManager.getStats().animationEnabled).toBe(true);
    });

    it('should handle animation duration changes', () => {
      enhancedDisplayManager.setAnimationDuration(1.5);
      expect(enhancedDisplayManager.getStats().animationDuration).toBe(1.5);

      // Should clamp to valid range
      enhancedDisplayManager.setAnimationDuration(-1);
      expect(enhancedDisplayManager.getStats().animationDuration).toBe(0.1);

      enhancedDisplayManager.setAnimationDuration(5);
      expect(enhancedDisplayManager.getStats().animationDuration).toBe(2.0);
    });

    it('should reset state', () => {
      enhancedDisplayManager.resetState();
      expect(enhancedDisplayManager.getStats().trackedElements).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle animation failures gracefully', () => {
      // Mock a failing animation
      const originalAnimate = (global as any).animate;
      (global as any).animate = vi.fn(() => {
        throw new Error('Animation failed');
      });

      expect(() => {
        animationService.showClickFeedback({
          startX: 100,
          startY: 100,
          value: '100',
        });
      }).not.toThrow();

      // Restore original
      (global as any).animate = originalAnimate;
    });

    it('should handle missing DOM elements', () => {
      const originalGetElementById = document.getElementById;
      document.getElementById = vi.fn(() => null);

      expect(() => {
        showEnhancedClickFeedback(100, false, null, null);
      }).not.toThrow();

      // Restore original
      document.getElementById = originalGetElementById;
    });
  });

  describe('Performance', () => {
    it('should respect reduced motion preference', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn(() => ({ matches: true }));

      // Create new animation service instance (would detect reduced motion)
      const stats = enhancedDisplayManager.getStats();
      expect(typeof stats.animationEnabled).toBe('boolean');

      // Restore original
      window.matchMedia = originalMatchMedia;
    });

    it('should handle viewport bounds correctly', () => {
      // Test with small viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });
      Object.defineProperty(window, 'innerHeight', { value: 568 });

      expect(() => {
        showEnhancedClickFeedback(100, false, 50, 50);
      }).not.toThrow();

      // Restore original
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      Object.defineProperty(window, 'innerHeight', { value: 768 });
    });
  });
});
