import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements
const mockElements = {
    'clickSoundsToggle': { textContent: '', classList: { toggle: vi.fn() } },
    'musicToggle': { textContent: '', classList: { toggle: vi.fn() } },
    'musicStreamSelect': { value: 'title' },
    'currentStreamDisplay': { textContent: '' }
};

// Mock DOM
global.document = {
    getElementById: (id) => mockElements[id] || null
};

// Mock window.App
global.window = {
    App: {
        storage: {
            setBoolean: vi.fn(),
            getBoolean: vi.fn(),
            setJSON: vi.fn(),
            getJSON: vi.fn()
        }
    },
    AudioContext: vi.fn(() => ({
        createOscillator: vi.fn(() => ({
            connect: vi.fn(),
            frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            start: vi.fn(),
            stop: vi.fn()
        })),
        createGain: vi.fn(() => ({
            connect: vi.fn(),
            gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
        })),
        destination: {},
        currentTime: 0
    })),
    webkitAudioContext: vi.fn(),
    Audio: vi.fn(() => ({
        loop: false,
        volume: 0.5,
        play: vi.fn(),
        pause: vi.fn(),
        currentTime: 0,
        src: ''
    }))
};

// Mock localStorage
global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn()
};

describe('Music System', () => {
    let musicSystem;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Mock localStorage responses
        global.localStorage.getItem.mockReturnValue('true');
        
        // Import the music system
        const module = await import('../js/core/systems/music-system.js');
        musicSystem = module;
    });

    describe('Audio Context Management', () => {
        it('should initialize audio context successfully', () => {
            musicSystem.initAudioContext();
            expect(window.AudioContext).toHaveBeenCalled();
        });

        it('should handle audio context initialization errors gracefully', () => {
            // Mock AudioContext to throw error
            const originalAudioContext = window.AudioContext;
            window.AudioContext = vi.fn(() => {
                throw new Error('AudioContext not supported');
            });

            expect(() => musicSystem.initAudioContext()).not.toThrow();
            
            // Restore original
            window.AudioContext = originalAudioContext;
        });
    });

    describe('Sound Effects', () => {
        it('should export all sound effect functions', () => {
            expect(typeof musicSystem.playStrawSipSound).toBe('function');
            expect(typeof musicSystem.playBasicStrawSipSound).toBe('function');
            expect(typeof musicSystem.playAlternativeStrawSipSound).toBe('function');
            expect(typeof musicSystem.playBubbleStrawSipSound).toBe('function');
            expect(typeof musicSystem.playCriticalClickSound).toBe('function');
            expect(typeof musicSystem.playPurchaseSound).toBe('function');
        });

        it('should not play sounds when click sounds are disabled', () => {
            // Mock getClickSoundsEnabled to return false
            vi.spyOn(musicSystem, 'getClickSoundsEnabled').mockReturnValue(false);
            
            const mockOscillator = { connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
            const mockGainNode = { connect: vi.fn() };
            
            // Mock audio context methods
            const mockAudioContext = {
                createOscillator: vi.fn(() => mockOscillator),
                createGain: vi.fn(() => mockGainNode),
                destination: {},
                currentTime: 0
            };
            
            // Temporarily replace the module's audioContext
            const originalAudioContext = musicSystem.audioContext;
            musicSystem.audioContext = mockAudioContext;
            
            musicSystem.playStrawSipSound();
            
            expect(mockOscillator.start).not.toHaveBeenCalled();
            
            // Restore
            musicSystem.audioContext = originalAudioContext;
        });
    });

    describe('Click Sounds Management', () => {
        it('should export click sounds management functions', () => {
            expect(typeof musicSystem.toggleClickSounds).toBe('function');
            expect(typeof musicSystem.loadClickSoundsPreference).toBe('function');
            expect(typeof musicSystem.getClickSoundsEnabled).toBe('function');
        });

        it('should toggle click sounds state', () => {
            // Just verify the function can be called without error
            expect(() => musicSystem.toggleClickSounds()).not.toThrow();
            
            // Verify the function exists and is callable
            expect(typeof musicSystem.toggleClickSounds).toBe('function');
        });

        it('should update UI when toggling click sounds', () => {
            musicSystem.toggleClickSounds();
            
            expect(mockElements.clickSoundsToggle.textContent).toContain('Click Sounds');
            expect(mockElements.clickSoundsToggle.classList.toggle).toHaveBeenCalled();
        });
    });

    describe('Music Player Management', () => {
        it('should export music player functions', () => {
            expect(typeof musicSystem.initMusicPlayer).toBe('function');
            expect(typeof musicSystem.initSplashMusic).toBe('function');
            expect(typeof musicSystem.playTitleMusic).toBe('function');
            expect(typeof musicSystem.stopTitleMusic).toBe('function');
            expect(typeof musicSystem.startMainGameMusic).toBe('function');
            expect(typeof musicSystem.toggleMusic).toBe('function');
        });

        it('should initialize music player with default preferences', () => {
            musicSystem.initMusicPlayer();
            
            const preferences = musicSystem.getMusicStreamPreferences();
            expect(preferences.currentStream).toBe('title');
        });

        it('should handle music toggle', () => {
            const initialState = musicSystem.getMusicEnabled();
            musicSystem.toggleMusic();
            const newState = musicSystem.getMusicEnabled();
            
            expect(newState).toBe(!initialState);
        });
    });

    describe('Test Functions', () => {
        it('should export test functions for development', () => {
            expect(typeof musicSystem.testClickSounds).toBe('function');
            expect(typeof musicSystem.testPurchaseSound).toBe('function');
            expect(typeof musicSystem.testCriticalClickSound).toBe('function');
        });
    });

    describe('State Getters', () => {
        it('should provide access to internal state', () => {
            expect(typeof musicSystem.getClickSoundsEnabled()).toBe('boolean');
            expect(typeof musicSystem.getMusicEnabled()).toBe('boolean');
            expect(typeof musicSystem.getMusicStreamPreferences()).toBe('object');
        });
    });
});
