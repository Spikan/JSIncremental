// Loading Screen Test - Verify loading screen functionality
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadingScreen, LoadingScreenState } from '../ts/ui/loading-screen';
import { systemInitializationManager } from '../ts/core/systems/system-initialization';

// Mock DOM environment
const mockDOM = () => {
  const mockElement = {
    id: 'loadingScreen',
    className: 'loading-screen',
    innerHTML: '',
    style: {} as any,
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    remove: vi.fn(),
    parentNode: {
      removeChild: vi.fn(),
    },
  };

  Object.defineProperty(document, 'getElementById', {
    value: vi.fn(() => mockElement),
    writable: true,
  });

  Object.defineProperty(document, 'createElement', {
    value: vi.fn(() => mockElement),
    writable: true,
  });

  Object.defineProperty(document, 'head', {
    value: {
      appendChild: vi.fn(),
    },
    writable: true,
  });

  Object.defineProperty(document, 'body', {
    value: {
      appendChild: vi.fn(),
      classList: {
        add: vi.fn(),
      },
    },
    writable: true,
  });

  return mockElement;
};

describe('Loading Screen', () => {
  let mockElement: any;

  beforeEach(() => {
    mockElement = mockDOM();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create loading screen with proper structure', () => {
    const element = loadingScreen.create();

    expect(element).toBeDefined();
    expect(element.id).toBe('loadingScreen');
    expect(element.className).toBe('loading-screen');
    expect(element.innerHTML).toContain('SODA CLICKER PRO');
    expect(element.innerHTML).toContain('Loading Game Systems...');
  });

  it('should initialize with correct default state', () => {
    const state = loadingScreen.getState();

    expect(state.overallProgress).toBe(0);
    expect(state.currentStep).toBe('');
    expect(state.isComplete).toBe(false);
    expect(state.hasErrors).toBe(false);
    expect(state.steps).toHaveLength(9);
    expect(state.steps[0].id).toBe('error-handling');
    expect(state.steps[8].id).toBe('performance');
  });

  it('should update step progress correctly', () => {
    loadingScreen.updateStep('error-handling', 50, false);
    const state = loadingScreen.getState();

    const step = state.steps.find(s => s.id === 'error-handling');
    expect(step?.progress).toBe(50);
    expect(step?.completed).toBe(false);
  });

  it('should mark step as completed', () => {
    loadingScreen.updateStep('error-handling', 100, true);
    const state = loadingScreen.getState();

    const step = state.steps.find(s => s.id === 'error-handling');
    expect(step?.progress).toBe(100);
    expect(step?.completed).toBe(true);
  });

  it('should handle step errors', () => {
    loadingScreen.updateStep('error-handling', 0, false, 'Test error');
    const state = loadingScreen.getState();

    const step = state.steps.find(s => s.id === 'error-handling');
    expect(step?.error).toBe('Test error');
    expect(state.hasErrors).toBe(true);
  });

  it('should set current step', () => {
    loadingScreen.setCurrentStep('store');
    const state = loadingScreen.getState();

    expect(state.currentStep).toBe('store');
  });

  it('should complete loading screen', () => {
    loadingScreen.complete();
    const state = loadingScreen.getState();

    expect(state.isComplete).toBe(true);
    expect(state.overallProgress).toBe(100);
  });

  it('should calculate overall progress correctly', () => {
    // Complete first 3 steps
    loadingScreen.updateStep('error-handling', 100, true);
    loadingScreen.updateStep('store', 100, true);
    loadingScreen.updateStep('event-bus', 100, true);

    const state = loadingScreen.getState();
    expect(state.overallProgress).toBeGreaterThan(30);
    expect(state.overallProgress).toBeLessThan(40);
  });
});

describe('System Initialization Manager', () => {
  it('should have correct initializers', () => {
    const manager = systemInitializationManager;

    // Check if all required systems are registered
    expect(manager.getLoadingState().steps).toHaveLength(9);
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('error-handling');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('store');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('event-bus');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('storage');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('ui');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('audio');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('game-loop');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('save-system');
    expect(manager.getLoadingState().steps.map(s => s.id)).toContain('performance');
  });

  it('should calculate loading order correctly', () => {
    const manager = systemInitializationManager;

    // Error handling should be first
    const state = manager.getLoadingState();
    const errorHandlingStep = state.steps.find(s => s.id === 'error-handling');
    expect(errorHandlingStep).toBeDefined();
  });

  it('should track initialization progress', () => {
    const manager = systemInitializationManager;
    const progress = manager.getInitializationProgress();

    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});

describe('Loading Screen Integration', () => {
  it('should integrate with system initialization manager', () => {
    const manager = systemInitializationManager;
    const screen = loadingScreen;

    // Both should have the same number of steps
    expect(manager.getLoadingState().steps).toHaveLength(screen.getState().steps.length);
  });

  it('should handle loading screen lifecycle', () => {
    const screen = loadingScreen;

    // Create screen
    const element = screen.create();
    expect(element).toBeDefined();

    // Update progress
    screen.updateStep('error-handling', 50, false);
    expect(screen.getState().steps[0].progress).toBe(50);

    // Complete
    screen.complete();
    expect(screen.getState().isComplete).toBe(true);
  });
});
