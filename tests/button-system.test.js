import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock DOM elements and globals
const createMockButton = (onclick = null, className = '') => ({
    getAttribute: vi.fn(() => onclick),
    removeAttribute: vi.fn(),
    addEventListener: vi.fn(),
    classList: {
        add: vi.fn(),
        remove: vi.fn()
    },
    className
});

const mockDocument = {
    querySelectorAll: vi.fn(),
    getElementById: vi.fn(),
    readyState: 'complete',
    addEventListener: vi.fn()
};

const mockWindow = {
    App: {
        systems: {
            audio: {
                button: {
                    playButtonClickSound: vi.fn(),
                    playButtonPurchaseSound: vi.fn()
                }
            }
        }
    },
    DOM_CACHE: {
        sodaButton: createMockButton()
    },
    // Mock game functions
    buyStraw: vi.fn(),
    buyCup: vi.fn(),
    buySuction: vi.fn(),
    buyCriticalClick: vi.fn(),
    buyFasterDrinks: vi.fn(),
    buyWiderStraws: vi.fn(),
    buyBetterCups: vi.fn(),
    sodaClick: vi.fn(),
    switchTab: vi.fn(),
    sendMessage: vi.fn(),
    startGame: vi.fn(),
    save: vi.fn(),
    delete_save: vi.fn(),
    levelUp: vi.fn(),
    toggleButtonSounds: vi.fn()
};

// Mock global objects
global.document = mockDocument;
global.window = mockWindow;
global.console = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

// Set up mock functions before any imports
mockWindow.buyStraw = vi.fn();
mockWindow.buyCup = vi.fn();
mockWindow.buySuction = vi.fn();
mockWindow.buyCriticalClick = vi.fn();
mockWindow.buyFasterDrinks = vi.fn();
mockWindow.buyWiderStraws = vi.fn();
mockWindow.buyBetterCups = vi.fn();
mockWindow.sodaClick = vi.fn();
mockWindow.switchTab = vi.fn();
mockWindow.sendMessage = vi.fn();
mockWindow.startGame = function() {};
mockWindow.save = vi.fn();
mockWindow.delete_save = vi.fn();
mockWindow.levelUp = vi.fn();
mockWindow.toggleButtonSounds = vi.fn();

describe('Button System', () => {
    let buttonSystem;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Reset document readyState
        mockDocument.readyState = 'complete';
        
        // Import the button system
        buttonSystem = await import('../js/ui/buttons.js');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('BUTTON_CONFIG', () => {
        it('should have all required button types defined', () => {
            const { BUTTON_CONFIG } = buttonSystem;
            
            expect(BUTTON_CONFIG.types).toBeDefined();
            expect(BUTTON_CONFIG.types['shop-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['clicking-upgrade-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['drink-speed-upgrade-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['level-up-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['save-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['sound-toggle-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['dev-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['chat-send-btn']).toBeDefined();
            expect(BUTTON_CONFIG.types['splash-start-btn']).toBeDefined();
        });

        it('should have all required actions mapped', () => {
            const { BUTTON_CONFIG } = buttonSystem;
            
            expect(BUTTON_CONFIG.actions).toBeDefined();
            expect(BUTTON_CONFIG.actions['buyStraw']).toBeDefined();
            expect(BUTTON_CONFIG.actions['buySuction']).toBeDefined();
            expect(BUTTON_CONFIG.actions['buyCriticalClick']).toBeDefined();
            expect(BUTTON_CONFIG.actions['buyFasterDrinks']).toBeDefined();
            expect(BUTTON_CONFIG.actions['levelUp']).toBeDefined();
            expect(BUTTON_CONFIG.actions['save']).toBeDefined();
            expect(BUTTON_CONFIG.actions['sendMessage']).toBeDefined();
            expect(BUTTON_CONFIG.actions['startGame']).toBeDefined();
        });

        it('should have correct button type mappings', () => {
            const { BUTTON_CONFIG } = buttonSystem;
            
            expect(BUTTON_CONFIG.actions['buyStraw'].type).toBe('shop-btn');
            expect(BUTTON_CONFIG.actions['buySuction'].type).toBe('clicking-upgrade-btn');
            expect(BUTTON_CONFIG.actions['buyCriticalClick'].type).toBe('clicking-upgrade-btn');
            expect(BUTTON_CONFIG.actions['buyFasterDrinks'].type).toBe('drink-speed-upgrade-btn');
            expect(BUTTON_CONFIG.actions['levelUp'].type).toBe('level-up-btn');
            expect(BUTTON_CONFIG.actions['save'].type).toBe('save-btn');
        });
    });

    describe('handleButtonClick', () => {
            it('should handle button click with correct audio and feedback', () => {
        const { handleButtonClick } = buttonSystem;
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 200
        };
        const mockButtonElement = createMockButton();
        const actionName = 'buyStraw';

        handleButtonClick(mockEvent, mockButtonElement, actionName);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(mockButtonElement.classList.add).toHaveBeenCalledWith('button-clicked');
        expect(mockWindow.buyStraw).toHaveBeenCalledWith(100, 200);
    });

            it('should play purchase sound for shop buttons', () => {
        const { handleButtonClick } = buttonSystem;
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 200
        };
        const mockButtonElement = createMockButton();
        const actionName = 'buyStraw';

        handleButtonClick(mockEvent, mockButtonElement, actionName);

        expect(mockWindow.App.systems.audio.button.playButtonPurchaseSound).toHaveBeenCalled();
    });

            it('should handle unknown button actions gracefully', () => {
        const { handleButtonClick } = buttonSystem;
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            clientX: 100,
            clientY: 200
        };
        const mockButtonElement = createMockButton();
        const actionName = 'unknownAction';

        expect(() => {
            handleButtonClick(mockEvent, mockButtonElement, actionName);
        }).not.toThrow();
    });
    });

    describe('setupUnifiedButtonSystem', () => {
        it('should process buttons with onclick attributes', () => {
            const { setupUnifiedButtonSystem } = buttonSystem;
            
            // Mock buttons with onclick attributes
            const mockButtons = [
                createMockButton('buyStraw()', 'shop-btn'),
                createMockButton('buySuction()', 'clicking-upgrade-btn'),
                createMockButton('buyCriticalClick()', 'clicking-upgrade-btn')
            ];
            
            mockDocument.querySelectorAll.mockReturnValue(mockButtons);

            setupUnifiedButtonSystem();

            expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('button');
            expect(mockButtons[0].removeAttribute).toHaveBeenCalledWith('onclick');
            expect(mockButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons[0].classList.add).toHaveBeenCalledWith('shop-btn');
        });

        it('should skip buttons without onclick attributes', () => {
            const { setupUnifiedButtonSystem } = buttonSystem;
            
            // Mock buttons without onclick attributes
            const mockButtons = [
                createMockButton(null, 'tab-btn'),
                createMockButton('', 'some-btn')
            ];
            
            mockDocument.querySelectorAll.mockReturnValue(mockButtons);

            setupUnifiedButtonSystem();

            // Buttons without onclick should not have onclick removed
            expect(mockButtons[0].removeAttribute).not.toHaveBeenCalled();
            
            // Note: setupSpecialButtonHandlers will still be called and may add listeners
            // to special buttons like tab buttons, which is expected behavior
            // We're only testing that the onclick-specific logic is skipped
        });

        it('should handle malformed onclick attributes gracefully', () => {
            const { setupUnifiedButtonSystem } = buttonSystem;
            
            // Mock button with malformed onclick
            const mockButtons = [
                createMockButton('invalid onclick', 'some-btn')
            ];
            
            mockDocument.querySelectorAll.mockReturnValue(mockButtons);

            expect(() => {
                setupUnifiedButtonSystem();
            }).not.toThrow();
        });
    });

    describe('setupSpecialButtonHandlers', () => {
        it('should set up tab button handlers', () => {
            const { setupSpecialButtonHandlers } = buttonSystem;
            
            const mockTabButtons = [
                createMockButton(null, 'tab-btn'),
                createMockButton(null, 'tab-btn')
            ];
            
            mockDocument.querySelectorAll.mockReturnValue(mockTabButtons);

            setupSpecialButtonHandlers();

            expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.tab-btn');
            expect(mockTabButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should set up soda button handler', () => {
            const { setupSpecialButtonHandlers } = buttonSystem;
            
            const mockSodaButton = createMockButton();
            mockWindow.DOM_CACHE.sodaButton = mockSodaButton;

            setupSpecialButtonHandlers();

            expect(mockSodaButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should set up chat input handler', () => {
            const { setupSpecialButtonHandlers } = buttonSystem;
            
            const mockChatInput = {
                addEventListener: vi.fn()
            };
            
            mockDocument.getElementById.mockReturnValue(mockChatInput);

            setupSpecialButtonHandlers();

            expect(mockDocument.getElementById).toHaveBeenCalledWith('chatInput');
            expect(mockChatInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function));
        });
    });

    describe('initButtonSystem', () => {
        it('should initialize immediately when DOM and functions are ready', () => {
            const { initButtonSystem } = buttonSystem;
            const setupSpy = vi.spyOn(buttonSystem, 'setupUnifiedButtonSystem');

            // Debug: Check what functions are available
            console.log('Available functions:', {
                buyStraw: typeof mockWindow.buyStraw,
                buyCup: typeof mockWindow.buyCup,
                buySuction: typeof mockWindow.buySuction,
                buyCriticalClick: typeof mockWindow.buyCriticalClick,
                buyFasterDrinks: typeof mockWindow.buyFasterDrinks,
                buyWiderStraws: typeof mockWindow.buyWiderStraws,
                buyBetterCups: typeof mockWindow.buyBetterCups,
                sodaClick: typeof mockWindow.sodaClick,
                switchTab: typeof mockWindow.switchTab
            });

            initButtonSystem();

            expect(setupSpy).toHaveBeenCalled();
        });

        it('should wait for DOM if not ready', () => {
            const { initButtonSystem } = buttonSystem;
            mockDocument.readyState = 'loading';
            const setupSpy = vi.spyOn(buttonSystem, 'setupUnifiedButtonSystem');

            initButtonSystem();

            expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
            expect(setupSpy).not.toHaveBeenCalled();
        });

        it('should retry initialization if functions are not ready', () => {
            const { initButtonSystem } = buttonSystem;
            
            // Mock that functions are not ready initially
            mockWindow.buyStraw = undefined;
            const setupSpy = vi.spyOn(buttonSystem, 'setupUnifiedButtonSystem');

            // Mock setTimeout to execute once and then stop
            let setTimeoutCallCount = 0;
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = (fn) => {
                if (setTimeoutCallCount === 0) {
                    setTimeoutCallCount++;
                    // Don't call fn() to avoid infinite recursion
                }
            };

            initButtonSystem();

            expect(setupSpy).not.toHaveBeenCalled();

            // Restore setTimeout
            global.setTimeout = originalSetTimeout;
        });
    });

    describe('Integration', () => {
        it('should handle complete button setup flow', () => {
            const { initButtonSystem } = buttonSystem;
            const setupSpy = vi.spyOn(buttonSystem, 'setupUnifiedButtonSystem');
            const specialHandlersSpy = vi.spyOn(buttonSystem, 'setupSpecialButtonHandlers');

            // Mock buttons
            const mockButtons = [
                createMockButton('buyStraw()', 'shop-btn'),
                createMockButton('buySuction()', 'clicking-upgrade-btn')
            ];
            mockDocument.querySelectorAll.mockReturnValue(mockButtons);

            initButtonSystem();

            expect(setupSpy).toHaveBeenCalled();
            expect(specialHandlersSpy).toHaveBeenCalled();
        });
    });
});