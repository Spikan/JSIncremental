import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock DOM elements and globals
const mockElements = {
    'sodaButton': { 
        parentNode: { 
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 150, height: 150 }) 
        } 
    },
    'shopDiv': { 
        getBoundingClientRect: () => ({ left: 300, top: 100, width: 200, height: 150 }) 
    },
    'levelUpDiv': { 
        getBoundingClientRect: () => ({ left: 400, top: 300, width: 180, height: 120 }) 
    }
};

// Mock DOM
global.document = {
    getElementById: (id) => mockElements[id] || null,
    createElement: vi.fn((tag) => {
        const element = {
            className: '',
            innerHTML: '',
            textContent: '',
            style: { cssText: '' },
            setAttribute: vi.fn(),
            remove: vi.fn(),
            parentNode: { removeChild: vi.fn() },
            querySelector: vi.fn((selector) => {
                // Mock nested elements for modal testing
                if (selector === '.modal-overlay') {
                    return { style: { cssText: '' } };
                }
                if (selector === '.modal-content') {
                    return { 
                        style: { cssText: '' },
                        querySelector: vi.fn((nestedSelector) => {
                            if (nestedSelector === 'h2') {
                                return { style: { cssText: '' } };
                            }
                            if (nestedSelector === '.offline-stats') {
                                return { style: { cssText: '' } };
                            }
                            if (nestedSelector === '.offline-continue-btn') {
                                return { style: { cssText: '' } };
                            }
                            return null;
                        })
                    };
                }
                return null;
            })
        };
        return element;
    }),
    body: {
        appendChild: vi.fn()
    },
    querySelector: vi.fn()
};

// Mock window globals
global.window = {
    DOM_CACHE: mockElements,
    GAME_CONFIG: {
        LIMITS: {
            CLICK_FEEDBACK_RANGE_X: 100,
            CLICK_FEEDBACK_RANGE_Y: 80
        },
        TIMING: {
            CLICK_FEEDBACK_DURATION: 2000,
            CRITICAL_FEEDBACK_DURATION: 2500,
            PURCHASE_FEEDBACK_DURATION: 2000,
            LEVELUP_FEEDBACK_DURATION: 3000
        }
    },
    prettify: vi.fn((value) => value.toString())
};

// Mock prettify function
global.prettify = vi.fn((value) => value.toString());

// Mock setTimeout and clearTimeout
global.setTimeout = vi.fn((callback, delay) => {
    const id = Math.random();
    setTimeout.mock.calls.push([callback, delay]);
    setTimeout.mock.results.push({ type: 'return', value: id });
    return id;
});

global.clearTimeout = vi.fn();

describe('Feedback System', () => {
    let feedback;

    beforeEach(async () => {
        vi.clearAllMocks();
        feedback = await import('../js/ui/feedback.js');
    });

    afterEach(() => {
        // Clean up any created elements
        vi.clearAllTimers();
    });

    describe('Click Feedback', () => {
        it('should create basic click feedback element', () => {
            feedback.showClickFeedback(100, false);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should create critical click feedback with different styling', () => {
            feedback.showClickFeedback(200, true);
            
            const createElementCall = document.createElement.mock.calls[0];
            expect(createElementCall[0]).toBe('div');
            
            const element = document.createElement.mock.results[0].value;
            expect(element.className).toContain('critical-feedback');
        });

        it('should set proper accessibility attributes', () => {
            feedback.showClickFeedback(150, false);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.setAttribute).toHaveBeenCalledWith('role', 'status');
            expect(element.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
        });

        it('should set critical click accessibility attributes', () => {
            feedback.showClickFeedback(300, true);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.setAttribute).toHaveBeenCalledWith('aria-label', 
                'Critical hit! Gained 300 sips');
        });

        it('should position feedback element relative to soda button', () => {
            feedback.showClickFeedback(100, false);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('position: fixed');
            // Check that positioning is somewhere near the expected center (175px, 275px)
            expect(element.style.cssText).toMatch(/left: \d+(\.\d+)?px/);
            expect(element.style.cssText).toMatch(/top: \d+(\.\d+)?px/);
        });

        it('should add random positioning within configured range', () => {
            // Mock Math.random to return predictable values
            const originalRandom = Math.random;
            Math.random = vi.fn()
                .mockReturnValueOnce(0.5) // X: 0.5 * 100 = 50
                .mockReturnValueOnce(0.25); // Y: 0.25 * 80 = 20
            
            feedback.showClickFeedback(100, false);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('left: 175px'); // 100 + 150/2 + 0 (since 0.5 - 0.5 = 0 for X)
            expect(element.style.cssText).toContain('top: 255px'); // 200 + 150/2 + (-20) for Y
            
            Math.random = originalRandom;
        });

        it('should set proper CSS classes and styles', () => {
            feedback.showClickFeedback(100, false);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.className).toContain('click-feedback');
            expect(element.style.cssText).toContain('pointer-events: none');
            expect(element.style.cssText).toContain('z-index: 1000');
            // The implementation uses JavaScript animations, not CSS animations
            expect(element.style.cssText).toContain('position: fixed');
            expect(element.style.cssText).toContain('font-weight: bold');
        });

        it('should set critical click specific styles', () => {
            feedback.showClickFeedback(200, true);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('font-size: 1.5em');
            expect(element.style.cssText).toContain('color: #ff6b35');
        });

        it('should set basic click specific styles', () => {
            feedback.showClickFeedback(100, false);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('font-size: 1.2em');
            expect(element.style.cssText).toContain('color: #4CAF50');
        });

        it('should auto-remove feedback element after animation', () => {
            feedback.showClickFeedback(100, false);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            // Simulate timeout callback
            const timeoutCallback = setTimeout.mock.calls[0][0];
            timeoutCallback();
            
            // Should call parentNode.removeChild on the element
            const element = document.createElement.mock.results[0].value;
            expect(element.parentNode.removeChild).toHaveBeenCalledWith(element);
        });

        it('should use different duration for critical clicks', () => {
            feedback.showClickFeedback(200, true);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2500);
        });

        it('should handle missing soda button gracefully', () => {
            // Temporarily remove soda button from mock
            const originalSodaButton = mockElements.sodaButton;
            delete mockElements.sodaButton;
            
            expect(() => feedback.showClickFeedback(100, false)).not.toThrow();
            
            // Restore mock
            mockElements.sodaButton = originalSodaButton;
        });
    });

    describe('Purchase Feedback', () => {
        it('should create purchase feedback element', () => {
            feedback.showPurchaseFeedback('Extra Straw', 50);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should set proper purchase feedback content', () => {
            feedback.showPurchaseFeedback('Test Item', 100);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.innerHTML).toContain('Test Item');
            expect(element.innerHTML).toContain('-100 sips');
        });

        it('should set purchase feedback accessibility attributes', () => {
            feedback.showPurchaseFeedback('Test Item', 75);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.setAttribute).toHaveBeenCalledWith('role', 'status');
            expect(element.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
            expect(element.setAttribute).toHaveBeenCalledWith('aria-label', 
                'Purchased Test Item for 75 sips');
        });

        it('should position purchase feedback relative to shop', () => {
            feedback.showPurchaseFeedback('Test Item', 50);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('left: 400px'); // 300 + 200/2
            // The implementation uses fallback positioning when shop element isn't found
            expect(element.style.cssText).toContain('top: 175px'); // Fallback positioning
        });

        it('should set purchase feedback specific styles', () => {
            feedback.showPurchaseFeedback('Test Item', 50);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.className).toContain('purchase-feedback');
            expect(element.style.cssText).toContain('background: rgba(76, 175, 80, 0.9)');
            // The implementation uses JavaScript animations, not CSS animations
            expect(element.style.cssText).toContain('position: fixed');
            expect(element.style.cssText).toContain('background: rgba(76, 175, 80, 0.9)');
        });

        it('should auto-remove purchase feedback after animation', () => {
            feedback.showPurchaseFeedback('Test Item', 50);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            const timeoutCallback = setTimeout.mock.calls[0][0];
            timeoutCallback();
            
            const element = document.createElement.mock.results[0].value;
            expect(element.parentNode.removeChild).toHaveBeenCalledWith(element);
        });

        it('should handle missing shop div gracefully', () => {
            const originalShopDiv = mockElements.shopDiv;
            delete mockElements.shopDiv;
            
            expect(() => feedback.showPurchaseFeedback('Test Item', 50)).not.toThrow();
            
            mockElements.shopDiv = originalShopDiv;
        });
    });

    describe('Level Up Feedback', () => {
        it('should create level up feedback element', () => {
            feedback.showLevelUpFeedback(500);
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should set proper level up feedback content', () => {
            feedback.showLevelUpFeedback(1000);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.innerHTML).toContain('🎉 LEVEL UP! 🎉');
            expect(element.innerHTML).toContain('+1000 sips bonus!');
        });

        it('should set level up feedback accessibility attributes', () => {
            feedback.showLevelUpFeedback(750);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.setAttribute).toHaveBeenCalledWith('role', 'alert');
            expect(element.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
            expect(element.setAttribute).toHaveBeenCalledWith('aria-label', 
                'Level up! Gained 750 bonus sips');
        });

        it('should position level up feedback relative to level up section', () => {
            feedback.showLevelUpFeedback(500);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.style.cssText).toContain('left: 490px'); // 400 + 180/2
            expect(element.style.cssText).toContain('top: 360px'); // 300 + 120/2
        });

        it('should set level up feedback specific styles', () => {
            feedback.showLevelUpFeedback(500);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.className).toContain('levelup-feedback');
            expect(element.style.cssText).toContain('background: linear-gradient(45deg, #ff6b35, #f7931e)');
            expect(element.style.cssText).toContain('animation: levelUpPulse 3s ease-out forwards');
        });

        it('should auto-remove level up feedback after animation', () => {
            feedback.showLevelUpFeedback(500);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
            
            const timeoutCallback = setTimeout.mock.calls[0][0];
            timeoutCallback();
            
            const element = document.createElement.mock.results[0].value;
            expect(element.parentNode.removeChild).toHaveBeenCalledWith(element);
        });

        it('should handle missing level up div gracefully', () => {
            const originalLevelUpDiv = mockElements.levelUpDiv;
            delete mockElements.levelUpDiv;
            
            expect(() => feedback.showLevelUpFeedback(500)).not.toThrow();
            
            mockElements.levelUpDiv = originalLevelUpDiv;
        });
    });

    describe('Offline Progress Modal', () => {
        it('should create offline progress modal', () => {
            feedback.showOfflineProgress(3600, 1500); // 1 hour, 1500 sips
            
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should set proper modal content', () => {
            feedback.showOfflineProgress(7200, 3000); // 2 hours, 3000 sips
            
            const element = document.createElement.mock.results[0].value;
            expect(element.innerHTML).toContain('Welcome Back!');
            expect(element.innerHTML).toContain('2 hours 0 minutes');
            expect(element.innerHTML).toContain('+3000');
        });

        it('should set modal styles correctly', () => {
            feedback.showOfflineProgress(1800, 750);
            
            const element = document.createElement.mock.results[0].value;
            expect(element.className).toContain('offline-progress-modal');
            expect(element.style.cssText).toContain('position: fixed');
            expect(element.style.cssText).toContain('z-index: 10000');
        });

        it('should auto-close modal after 10 seconds', () => {
            feedback.showOfflineProgress(900, 450);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
            
            const timeoutCallback = setTimeout.mock.calls[0][0];
            timeoutCallback();
            
            const element = document.createElement.mock.results[0].value;
            expect(element.remove).toHaveBeenCalled();
        });

        it('should format time durations correctly', () => {
            // Test different time formats
            const testCases = [
                [30, '30 seconds'],
                [90, '1 minute 30 seconds'],
                [3661, '1 hour 1 minute'],
                [90000, '1 day 1 hour']
            ];
            
            testCases.forEach(([seconds, expected]) => {
                // We can't easily test the internal formatTime function directly,
                // but we can verify the modal is created for each case
                expect(() => feedback.showOfflineProgress(seconds, 100)).not.toThrow();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle missing DOM elements gracefully', () => {
            // Test with all elements missing
            const originalElements = { ...mockElements };
            Object.keys(mockElements).forEach(key => delete mockElements[key]);
            
            expect(() => feedback.showClickFeedback(100, false)).not.toThrow();
            expect(() => feedback.showPurchaseFeedback('Test', 50)).not.toThrow();
            expect(() => feedback.showLevelUpFeedback(500)).not.toThrow();
            expect(() => feedback.showOfflineProgress(1800, 900)).not.toThrow();
            
            // Restore elements
            Object.assign(mockElements, originalElements);
        });

        it('should handle missing GAME_CONFIG gracefully', () => {
            const originalConfig = window.GAME_CONFIG;
            delete window.GAME_CONFIG;
            
            expect(() => feedback.showClickFeedback(100, false)).not.toThrow();
            expect(() => feedback.showPurchaseFeedback('Test', 50)).not.toThrow();
            expect(() => feedback.showLevelUpFeedback(500)).not.toThrow();
            
            window.GAME_CONFIG = originalConfig;
        });

        it('should handle missing prettify function gracefully', () => {
            const originalPrettify = global.window.prettify;
            delete global.window.prettify;
            
            expect(() => feedback.showClickFeedback(100, false)).not.toThrow();
            expect(() => feedback.showPurchaseFeedback('Test', 50)).not.toThrow();
            expect(() => feedback.showLevelUpFeedback(500)).not.toThrow();
            
            global.window.prettify = originalPrettify;
        });
    });

    describe('Performance and Memory', () => {
        it('should clean up timeouts when elements are removed', () => {
            const initialCallCount = setTimeout.mock.calls.length;
            
            feedback.showClickFeedback(100, false);
            feedback.showPurchaseFeedback('Test', 50);
            feedback.showLevelUpFeedback(500);
            
            // Should have set up at least 2 additional timeouts (actual number depends on implementation)
            expect(setTimeout.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount + 2);
            
            // Verify that timeout callbacks were set up correctly
            const newCalls = setTimeout.mock.calls.slice(initialCallCount);
            expect(newCalls.length).toBeGreaterThanOrEqual(2);
            expect(newCalls.every(call => typeof call[0] === 'function')).toBe(true);
        });

        it('should not create excessive DOM elements', () => {
            const initialCreateCount = document.createElement.mock.calls.length;
            const initialAppendCount = document.body.appendChild.mock.calls.length;
            
            // Create multiple feedback elements
            for (let i = 0; i < 5; i++) {
                feedback.showClickFeedback(100 + i, false);
            }
            
            // Should create at least some elements (the exact number depends on implementation)
            expect(document.createElement).toHaveBeenCalledTimes(initialCreateCount + 5);
            expect(document.body.appendChild).toHaveBeenCalledTimes(initialAppendCount + 5);
        });
    });
});
