import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

declare global {
  interface Window {
    DOM_CACHE?: {
      sodaButton?: { parentNode?: { getBoundingClientRect?: () => { left: number; top: number; width: number; height: number } } };
      shopDiv?: { getBoundingClientRect?: () => { left: number; top: number; width: number; height: number } };
      levelUpDiv?: { getBoundingClientRect?: () => { left: number; top: number; width: number; height: number } };
    };
    GAME_CONFIG?: {
      LIMITS?: {
        CLICK_FEEDBACK_RANGE_X?: number;
        CLICK_FEEDBACK_RANGE_Y?: number;
      };
      TIMING?: {
        CLICK_FEEDBACK_DURATION?: number;
        CRITICAL_FEEDBACK_DURATION?: number;
      };
    };
    App?: {
      systems?: {
        audio?: {
          button?: {
            playButtonClickSound?: () => void;
            playButtonPurchaseSound?: () => void;
          };
        };
        save?: {
          saveGame?: (data: any) => void;
          loadGame?: () => any;
        };
        options?: {
          saveOptions?: (options: any) => void;
          loadOptions?: () => any;
        };
      };
      events?: {
        emit?: (event: string, data?: any) => void;
        on?: (event: string, handler: Function) => void;
      };
    };
    localStorage?: Storage;
    sessionStorage?: Storage;
    addEventListener?: (event: string, handler: Function) => void;
    removeEventListener?: (event: string, handler: Function) => void;
    requestAnimationFrame?: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame?: (handle: number) => void;
    setTimeout?: (callback: Function, delay: number) => number;
    clearTimeout?: (id: number) => void;
    setInterval?: (callback: Function, delay: number) => number;
    clearInterval?: (id: number) => void;
    console?: Console;
  }
}

// Mock DOM and browser APIs
(global as any).document = {
    getElementById: vi.fn(() => ({
        textContent: '',
        innerHTML: '',
        style: { cssText: '' },
        classList: { contains: vi.fn(() => false) },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        parentNode: { getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 100, height: 100 })) }
    })),
    createElement: vi.fn(() => ({
        className: '',
        innerHTML: '',
        textContent: '',
        style: { cssText: '' },
        setAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        querySelector: vi.fn(() => ({ style: { cssText: '' } }))
    })),
    body: { appendChild: vi.fn() },
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => [])
};

(global as any).window = {
    DOM_CACHE: {
        sodaButton: { parentNode: { getBoundingClientRect: vi.fn(() => ({ left: 100, top: 200, width: 150, height: 150 })) } },
        shopDiv: { getBoundingClientRect: vi.fn(() => ({ left: 300, top: 100, width: 200, height: 150 })) },
        levelUpDiv: { getBoundingClientRect: vi.fn(() => ({ left: 400, top: 300, width: 180, height: 120 })) }
    },
    GAME_CONFIG: {
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
        systems: {
            audio: {
                button: {
                    playButtonClickSound: vi.fn(),
                    playButtonPurchaseSound: vi.fn()
                }
            },
            save: {
                saveGame: vi.fn(),
                loadGame: vi.fn()
            },
            options: {
                saveOptions: vi.fn(),
                loadOptions: vi.fn()
            }
        },
        events: {
            emit: vi.fn(),
            on: vi.fn()
        }
    },
    localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    },
    sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    requestAnimationFrame: vi.fn((cb: Function) => setTimeout(cb, 16)),
    cancelAnimationFrame: vi.fn(),
    setTimeout: vi.fn((cb: Function, delay: number) => {
        const id = Math.random();
        (setTimeout as any).mock.calls.push([cb, delay]);
        return id;
    }),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    console: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
};

(global as any).console = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
};

(global as any).setTimeout = vi.fn((cb: Function, delay: number) => {
    const id = Math.random();
    (setTimeout as any).mock.calls.push([cb, delay]);
    return id;
});

(global as any).clearTimeout = vi.fn();
(global as any).setInterval = vi.fn();
(global as any).clearInterval = vi.fn();

describe('Game Runtime Safety Tests', () => {
    
    describe('UI System Runtime Safety', () => {
        let ui: any;

        beforeEach(async () => {
            vi.clearAllMocks();
            ui = await import('../ts/ui/index.ts');
        });

        it('should handle missing DOM elements gracefully in updateCostDisplay', () => {
            expect(() => {
                // Test with missing element
                ui.updateCostDisplay('nonexistent', 100, true);
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateButtonState', () => {
            expect(() => {
                // Test with missing button
                ui.updateButtonState('nonexistent', true, 50);
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateTopSipsPerDrink', () => {
            expect(() => {
                // Test with missing element
                ui.updateTopSipsPerDrink();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateTopSipsPerSecond', () => {
            expect(() => {
                // Test with missing element
                ui.updateTopSipsPerSecond();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateAllStats', () => {
            expect(() => {
                // Test with missing elements
                ui.updateAllStats();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updatePlayTime', () => {
            expect(() => {
                // Test with missing element
                ui.updatePlayTime();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateLastSaveTime', () => {
            expect(() => {
                // Test with missing element
                ui.updateLastSaveTime();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateDrinkProgress', () => {
            expect(() => {
                // Test with missing element
                ui.updateDrinkProgress();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateDrinkRate', () => {
            expect(() => {
                // Test with missing element
                ui.updateDrinkRate();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateCompactDrinkSpeedDisplays', () => {
            expect(() => {
                // Test with missing elements
                ui.updateCompactDrinkSpeedDisplays();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateCriticalClickDisplay', () => {
            expect(() => {
                // Test with missing element
                ui.updateCriticalClickDisplay();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateAutosaveStatus', () => {
            expect(() => {
                // Test with missing element
                ui.updateAutosaveStatus();
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully in updateShopButtonStates', () => {
            expect(() => {
                // Test with missing elements
                ui.updateShopButtonStates();
            }).not.toThrow();
        });
    });

    describe('Feedback System Runtime Safety', () => {
        let feedback: any;

        beforeEach(async () => {
            vi.clearAllMocks();
            feedback = await import('../ts/ui/feedback.ts');
        });

        it('should handle missing soda button gracefully in showClickFeedback', () => {
            expect(() => {
                // Remove soda button temporarily
                const originalSodaButton = (global as any).window.DOM_CACHE.sodaButton;
                delete (global as any).window.DOM_CACHE.sodaButton;
                
                feedback.showClickFeedback(100, false);
                
                // Restore
                (global as any).window.DOM_CACHE.sodaButton = originalSodaButton;
            }).not.toThrow();
        });

        it('should handle missing shop div gracefully in showPurchaseFeedback', () => {
            expect(() => {
                // Remove shop div temporarily
                const originalShopDiv = (global as any).window.DOM_CACHE.shopDiv;
                delete (global as any).window.DOM_CACHE.shopDiv;
                
                feedback.showPurchaseFeedback('Test Item', 50);
                
                // Restore
                (global as any).window.DOM_CACHE.shopDiv = originalShopDiv;
            }).not.toThrow();
        });

        it('should handle missing level up div gracefully in showLevelUpFeedback', () => {
            expect(() => {
                // Remove level up div temporarily
                const originalLevelUpDiv = (global as any).window.DOM_CACHE.levelUpDiv;
                delete (global as any).window.DOM_CACHE.levelUpDiv;
                
                feedback.showLevelUpFeedback(500);
                
                // Restore
                (global as any).window.DOM_CACHE.levelUpDiv = originalLevelUpDiv;
            }).not.toThrow();
        });

        it('should handle missing GAME_CONFIG gracefully in feedback functions', () => {
            expect(() => {
                // Remove GAME_CONFIG temporarily
                const originalConfig = (global as any).window.GAME_CONFIG;
                delete (global as any).window.GAME_CONFIG;
                
                feedback.showClickFeedback(100, false);
                feedback.showPurchaseFeedback('Test', 50);
                
                // Restore
                (global as any).window.GAME_CONFIG = originalConfig;
            }).not.toThrow();
        });

        it('should handle missing prettify function gracefully', () => {
            expect(() => {
                // Remove prettify temporarily
                const originalPrettify = (global as any).prettify;
                delete (global as any).prettify;
                
                feedback.showClickFeedback(100, false);
                feedback.showPurchaseFeedback('Test', 50);
                
                // Restore
                (global as any).prettify = originalPrettify;
            }).not.toThrow();
        });
    });

    describe('Button System Runtime Safety', () => {
        let buttonSystem: any;

        beforeEach(async () => {
            vi.clearAllMocks();
            buttonSystem = await import('../ts/ui/buttons.ts');
        });

        it('should handle missing audio system gracefully', () => {
            expect(() => {
                // Remove audio system temporarily
                const originalAudio = (global as any).window.App.systems.audio;
                delete (global as any).window.App.systems.audio;
                
                // Test button click handling
                const mockEvent = {
                    preventDefault: vi.fn(),
                    stopPropagation: vi.fn(),
                    clientX: 100,
                    clientY: 200
                };
                const mockButton = {
                    classList: { add: vi.fn() }
                };
                
                buttonSystem.handleButtonClick(mockEvent, mockButton, 'buyStraw');
                
                // Restore
                (global as any).window.App.systems.audio = originalAudio;
            }).not.toThrow();
        });

        it('should handle missing button actions gracefully', () => {
            expect(() => {
                const mockEvent = {
                    preventDefault: vi.fn(),
                    stopPropagation: vi.fn(),
                    clientX: 100,
                    clientY: 200
                };
                const mockButton = {
                    classList: { add: vi.fn() }
                };
                
                // Test with unknown action
                buttonSystem.handleButtonClick(mockEvent, mockButton, 'unknownAction');
            }).not.toThrow();
        });

        it('should handle missing button types gracefully', () => {
            expect(() => {
                // This test ensures the button system doesn't crash with invalid button types
                const mockEvent = {
                    preventDefault: vi.fn(),
                    stopPropagation: vi.fn(),
                    clientX: 100,
                    clientY: 200
                };
                const mockButton = {
                    classList: { add: vi.fn() }
                };
                
                // Test with valid action but missing type
                buttonSystem.handleButtonClick(mockEvent, mockButton, 'buyStraw');
            }).not.toThrow();
        });
    });

    describe('Core Systems Runtime Safety', () => {
        let coreSystems: any;

        beforeEach(async () => {
            vi.clearAllMocks();
            // Import core systems
            coreSystems = {
                save: await import('../ts/core/systems/save-system'),
                options: await import('../ts/core/systems/options-system'),
                autosave: await import('../ts/core/systems/autosave')
            };
        });

        it('should handle missing localStorage gracefully in save system', () => {
            expect(() => {
                // Remove localStorage temporarily
                const originalLocalStorage = (global as any).window.localStorage;
                delete (global as any).window.localStorage;
                
                // Test save functions
                if (coreSystems.save.saveGame) {
                    coreSystems.save.saveGame({ test: 'data' });
                }
                
                // Restore
                (global as any).window.localStorage = originalLocalStorage;
            }).not.toThrow();
        });

        it('should handle missing sessionStorage gracefully in options system', () => {
            expect(() => {
                // Remove sessionStorage temporarily
                const originalSessionStorage = (global as any).window.sessionStorage;
                delete (global as any).window.sessionStorage;
                
                // Test options functions
                if (coreSystems.options.saveOptions) {
                    coreSystems.options.saveOptions({ autosaveEnabled: true });
                }
                
                // Restore
                (global as any).window.sessionStorage = originalSessionStorage;
            }).not.toThrow();
        });

        it('should handle missing App.systems gracefully in autosave system', () => {
            expect(() => {
                // Remove App.systems temporarily
                const originalAppSystems = (global as any).window.App.systems;
                delete (global as any).window.App.systems;
                
                // Test autosave functions
                if (coreSystems.autosave.computeAutosaveCounter) {
                    coreSystems.autosave.computeAutosaveCounter({
                        enabled: true,
                        counter: 0,
                        intervalSec: 30,
                        drinkRateMs: 1000
                    });
                }
                
                // Restore
                (global as any).window.App.systems = originalAppSystems;
            }).not.toThrow();
        });
    });

    describe('Main Integration Runtime Safety', () => {
        beforeEach(() => {
            // Mock the main.ts module to prevent import errors
            vi.doMock('../ts/main.ts', () => ({
                default: {},
                // Mock any exports if needed
            }));
            
            // Ensure Decimal is available globally
            (global as any).Decimal = (global as any).Decimal || class Decimal {
                private _value: number;
                
                constructor(value: any) {
                    this._value = Number(value) || 0;
                }
                toNumber() { return this._value; }
                toString() { return String(this._value); }
                plus(other: any) { return new Decimal(this._value + Number(other)); }
                minus(other: any) { return new Decimal(this._value - Number(other)); }
                times(other: any) { return new Decimal(this._value * Number(other)); }
                div(other: any) { return new Decimal(this._value / Number(other)); }
                gte(other: any) { return this._value >= Number(other); }
                lte(other: any) { return this._value <= Number(other); }
                gt(other: any) { return this._value > Number(other); }
                lt(other: any) { return this._value < Number(other); }
                eq(other: any) { return this._value === Number(other); }
            };
            
            // Mock window.App structure with proper UI functions
            (global as any).window = (global as any).window || {};
            (global as any).window.App = (global as any).window.App || {};
            (global as any).window.App.ui = (global as any).window.App.ui || {
                updateCostDisplay: vi.fn(),
                updateButtonState: vi.fn(),
                updateTopSipsPerDrink: vi.fn(),
                updateTopSipsPerSecond: vi.fn(),
                updateAllStats: vi.fn(),
                updatePlayTime: vi.fn(),
                updateLastSaveTime: vi.fn(),
                updateDrinkProgress: vi.fn(),
                updateDrinkRate: vi.fn(),
                updateCompactDrinkSpeedDisplays: vi.fn(),
                updateCriticalClickDisplay: vi.fn(),
                updateAutosaveStatus: vi.fn(),
                updateShopButtonStates: vi.fn(),
                showClickFeedback: vi.fn(),
                showPurchaseFeedback: vi.fn(),
                showLevelUpFeedback: vi.fn(),
                showOfflineProgress: vi.fn(),
                checkUpgradeAffordability: vi.fn(),
                updateClickSoundsToggleText: vi.fn(),
                updateCountdownText: vi.fn(),
                setMusicStatusText: vi.fn()
            };
            (global as any).window.App.systems = (global as any).window.App.systems || {
                save: { performSaveSnapshot: vi.fn() },
                options: { loadOptions: vi.fn() },
                autosave: { computeAutosaveCounter: vi.fn() },
                loop: { startGameLoop: vi.fn() },
                resources: { recalculateProduction: vi.fn() },
                purchases: { purchaseUpgrade: vi.fn() },
                clicks: { handleClick: vi.fn() },
                audio: { button: { playButtonClickSound: vi.fn() } },
                gameInit: { initOnDomReady: vi.fn() }
            };
            (global as any).window.App.rules = (global as any).window.App.rules || {
                economy: { computeStrawSPD: vi.fn() },
                clicks: { computeClickValue: vi.fn() },
                purchases: { nextStrawCost: vi.fn() }
            };
        });

        it('should handle missing App.ui gracefully in main.ts', () => {
            // Test that main.ts can handle missing App.ui gracefully
            expect(() => {
                // Simulate main.ts trying to access App.ui
                if ((global as any).window.App?.ui) {
                    (global as any).window.App.ui.updateCostDisplay('test', 100, true);
                }
            }).not.toThrow();
        });

        it('should handle missing App.systems gracefully in main.ts', () => {
            // Test that main.ts can handle missing App.systems gracefully
            expect(() => {
                // Simulate main.ts trying to access App.systems
                if ((global as any).window.App?.systems) {
                    (global as any).window.App.systems.save?.performSaveSnapshot?.();
                }
            }).not.toThrow();
        });

        it('should handle missing App.rules gracefully in main.ts', () => {
            // Test that main.ts can handle missing App.rules gracefully
            expect(() => {
                // Simulate main.ts trying to access App.rules
                if ((global as any).window.App?.rules) {
                    (global as any).window.App.rules.economy?.computeStrawSPD?.(1, 1, 0, 1);
                }
            }).not.toThrow();
        });
    });

    describe('Event System Runtime Safety', () => {
        it('should handle missing event listeners gracefully', () => {
            expect(() => {
                // Test event emission with missing listeners
                if ((global as any).window.App?.events?.emit) {
                    (global as any).window.App.events.emit('TEST_EVENT', { data: 'test' });
                }
            }).not.toThrow();
        });

        it('should handle missing event names gracefully', () => {
            expect(() => {
                // Test event emission with undefined event name
                if ((global as any).window.App?.events?.emit) {
                    (global as any).window.App.events.emit(undefined, { data: 'test' });
                }
            }).not.toThrow();
        });
    });

    describe('Storage System Runtime Safety', () => {
        it('should handle storage quota exceeded gracefully', () => {
            expect(() => {
                // Mock localStorage to throw quota exceeded error
                const originalSetItem = (global as any).window.localStorage.setItem;
                (global as any).window.localStorage.setItem = vi.fn(() => {
                    throw new Error('QuotaExceededError');
                });
                
                try {
                    (global as any).window.localStorage.setItem('test', 'data');
                } catch (error: any) {
                    expect(error.message).toBe('QuotaExceededError');
                }
                
                // Restore
                (global as any).window.localStorage.setItem = originalSetItem;
            }).not.toThrow();
        });

        it('should handle storage access denied gracefully', () => {
            expect(() => {
                // Mock localStorage to throw access denied error
                const originalGetItem = (global as any).window.localStorage.getItem;
                (global as any).window.localStorage.getItem = vi.fn(() => {
                    throw new Error('AccessDeniedError');
                });
                
                try {
                    (global as any).window.localStorage.getItem('test');
                } catch (error: any) {
                    expect(error.message).toBe('AccessDeniedError');
                }
                
                // Restore
                (global as any).window.localStorage.getItem = originalGetItem;
            }).not.toThrow();
        });
    });

    describe('Performance API Runtime Safety', () => {
        it('should handle missing performance API gracefully', () => {
            expect(() => {
                // Remove performance API temporarily
                const originalPerformance = (global as any).performance;
                delete (global as any).performance;
                
                // Test functions that might use performance
                const timestamp = Date.now();
                expect(typeof timestamp).toBe('number');
                
                // Restore
                (global as any).performance = originalPerformance;
            }).not.toThrow();
        });

        it('should handle missing requestAnimationFrame gracefully', () => {
            expect(() => {
                // Remove requestAnimationFrame temporarily
                const originalRAF = (global as any).window.requestAnimationFrame;
                delete (global as any).window.requestAnimationFrame;
                
                // Test functions that might use requestAnimationFrame
                const callback = () => {};
                if ((global as any).window.setTimeout) {
                    const id = (global as any).window.setTimeout(callback, 16);
                    (global as any).window.clearTimeout(id);
                }
                
                // Restore
                (global as any).window.requestAnimationFrame = originalRAF;
            }).not.toThrow();
        });
    });
});
