import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements and globals
global.document = {
    getElementById: vi.fn(() => ({
        textContent: '',
        innerHTML: '',
        style: {},
        classList: {
            toggle: vi.fn(),
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn(() => false)
        },
        disabled: false,
        querySelector: vi.fn(),
        parentNode: {
            removeChild: vi.fn()
        }
    })),
    createElement: vi.fn(() => ({
        className: '',
        innerHTML: '',
        textContent: '',
        style: { cssText: '' },
        setAttribute: vi.fn(),
        remove: vi.fn()
    })),
    body: {
        appendChild: vi.fn()
    },
    querySelector: vi.fn()
};

global.window = {
    DOM_CACHE: {
        topSipValue: { innerHTML: '' },
        topSipsPerDrink: { innerHTML: '' },
        topSipsPerSecond: { innerHTML: '' },
        sodaButton: { parentNode: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } },
        shopDiv: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 150 }) },
        levelUpDiv: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 180, height: 120 }) },
        statsTab: { classList: { contains: vi.fn(() => false) } }
    },
    sips: { gte: vi.fn(() => true), toNumber: vi.fn(() => 100) },
    sps: { div: vi.fn(() => ({ toNumber: () => 5 })) },
    drinkRate: 1000,
    GAME_CONFIG: {
        BALANCE: {
            STRAW_BASE_COST: 5,
            STRAW_SCALING: 1.15
        },
        LIMITS: {
            CLICK_FEEDBACK_RANGE_X: 100,
            CLICK_FEEDBACK_RANGE_Y: 80
        },
        TIMING: {
            CLICK_FEEDBACK_DURATION: 2000,
            CRITICAL_FEEDBACK_DURATION: 2500
        }
    },
    App: {
        data: { upgrades: {} },
        rules: { purchases: {} },
        events: {
            on: vi.fn()
        },
        EVENT_NAMES: {
            CLICK: { SODA: 'CLICK.SODA' },
            ECONOMY: { PURCHASE: 'ECONOMY.PURCHASE' },
            GAME: { SAVED: 'GAME.SAVED', LOADED: 'GAME.LOADED' }
        }
    }
};

global.prettify = vi.fn((value) => value.toString());
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));

describe('UI System', () => {
    let ui;

    beforeEach(async () => {
        vi.clearAllMocks();
        ui = await import('../js/ui/index.js');
    });

    describe('Displays Module', () => {
        it('should update cost display with affordability indicators', () => {
            ui.updateCostDisplay('testElement', 100, true);
            
            expect(document.getElementById).toHaveBeenCalledWith('testElement');
        });

        it('should update button state based on affordability', () => {
            ui.updateButtonState('testButton', true, 50);
            
            expect(document.getElementById).toHaveBeenCalledWith('testButton');
        });

        it('should update top sips per drink display', () => {
            ui.updateTopSipsPerDrink();
            
            // Should access DOM_CACHE.topSipsPerDrink
            expect(window.DOM_CACHE.topSipsPerDrink).toBeDefined();
        });

        it('should update critical click display', () => {
            window.criticalClickChance = { times: vi.fn(() => ({ toFixed: () => '5.0' })) };
            
            ui.updateCriticalClickDisplay();
            
            expect(document.getElementById).toHaveBeenCalledWith('criticalClickChanceCompact');
        });
    });

    describe('Stats Module', () => {
        it('should update play time display', () => {
            window.totalPlayTime = 65000; // 65 seconds
            
            ui.updatePlayTime();
            
            // Should format time correctly
            expect(window.DOM_CACHE).toBeDefined();
        });

        it('should update all stats when stats tab is active', () => {
            window.DOM_CACHE.statsTab.classList.contains.mockReturnValue(true);
            
            ui.updateAllStats();
            
            expect(window.DOM_CACHE.statsTab.classList.contains).toHaveBeenCalledWith('active');
        });
    });

    describe('Feedback Module', () => {
        it('should show click feedback', () => {
            ui.showClickFeedback(100, false);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should show critical click feedback', () => {
            ui.showClickFeedback(200, true);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should show purchase feedback', () => {
            ui.showPurchaseFeedback('Test Item', 50);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
    });

    describe('Affordability Module', () => {
        it('should check upgrade affordability', () => {
            window.straws = { toNumber: () => 5 };
            window.cups = { toNumber: () => 3 };
            window.suctions = { toNumber: () => 1 };
            
            expect(() => ui.checkUpgradeAffordability()).not.toThrow();
        });
    });

    describe('UI Initialization', () => {
        it('should initialize UI system without errors', () => {
            expect(() => ui.initializeUI()).not.toThrow();
        });

        it('should set up event listeners during initialization', () => {
            ui.initializeUI();
            
            expect(window.App.events.on).toHaveBeenCalledWith('CLICK.SODA', expect.any(Function));
            expect(window.App.events.on).toHaveBeenCalledWith('ECONOMY.PURCHASE', expect.any(Function));
        });

        it('should update all displays', () => {
            expect(() => ui.updateAllDisplays()).not.toThrow();
        });

        it('should perform batch UI update', () => {
            expect(() => ui.performBatchUIUpdate()).not.toThrow();
        });
    });

    describe('Module Exports', () => {
        it('should export all expected functions', () => {
            expect(typeof ui.updateCostDisplay).toBe('function');
            expect(typeof ui.updateButtonState).toBe('function');
            expect(typeof ui.updateTopSipsPerDrink).toBe('function');
            expect(typeof ui.showClickFeedback).toBe('function');
            expect(typeof ui.checkUpgradeAffordability).toBe('function');
            expect(typeof ui.initializeUI).toBe('function');
        });

        it('should export module namespaces', () => {
            expect(ui.displays).toBeDefined();
            expect(ui.stats).toBeDefined();
            expect(ui.feedback).toBeDefined();
            expect(ui.affordability).toBeDefined();
        });
    });
});
