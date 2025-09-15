// Enhanced Audio System Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedAudioManager } from '../ts/services/enhanced-audio-manager';

// Mock Howler
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    playing: vi.fn().mockReturnValue(false),
    volume: vi.fn(),
    unload: vi.fn(),
  })),
  Howler: {
    volume: vi.fn(),
  },
}));

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock AudioContext
  global.window = {
    ...global.window,
    AudioContext: vi.fn().mockImplementation(() => mockAudioContext),
    webkitAudioContext: vi.fn().mockImplementation(() => mockAudioContext),
  } as any;

  // Mock console
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  };
});

describe('Enhanced Audio System', () => {
  let audioManager: EnhancedAudioManager;

  beforeEach(() => {
    audioManager = EnhancedAudioManager.getInstance();
  });

  describe('EnhancedAudioManager', () => {
    it('should be a singleton', () => {
      const instance1 = EnhancedAudioManager.getInstance();
      const instance2 = EnhancedAudioManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should play click sounds', () => {
      expect(() => {
        audioManager.playSound('click');
      }).not.toThrow();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should play critical click sounds', () => {
      expect(() => {
        audioManager.playSound('click-critical');
      }).not.toThrow();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should play purchase success sounds', () => {
      expect(() => {
        audioManager.playSound('purchase-success');
      }).not.toThrow();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should play purchase error sounds', () => {
      expect(() => {
        audioManager.playSound('purchase-error');
      }).not.toThrow();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should play level up sounds', () => {
      expect(() => {
        audioManager.playSound('level-up');
      }).not.toThrow();

      // Should create multiple oscillators for chord
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should play achievement sounds', () => {
      expect(() => {
        audioManager.playSound('achievement');
      }).not.toThrow();

      // Should create multiple oscillators for melody
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    });

    it('should handle unknown sound IDs gracefully', () => {
      expect(() => {
        audioManager.playSound('unknown-sound');
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith('Unknown sound ID: unknown-sound');
    });

    it('should set master volume', () => {
      audioManager.setMasterVolume(0.5);
      const state = audioManager.getAudioState();
      expect(state.masterVolume).toBe(0.5);
    });

    it('should set SFX volume', () => {
      audioManager.setSFXVolume(0.3);
      const state = audioManager.getAudioState();
      expect(state.sfxVolume).toBe(0.3);
    });

    it('should set music volume', () => {
      audioManager.setMusicVolume(0.7);
      const state = audioManager.getAudioState();
      expect(state.musicVolume).toBe(0.7);
    });

    it('should toggle mute state', () => {
      const initialState = audioManager.getAudioState();
      audioManager.toggleMute();
      const newState = audioManager.getAudioState();
      expect(newState.muted).toBe(!initialState.muted);
    });

    it('should toggle music', () => {
      const initialState = audioManager.getAudioState();
      audioManager.toggleMusic();
      const newState = audioManager.getAudioState();
      expect(newState.musicEnabled).toBe(!initialState.musicEnabled);
    });

    it('should toggle SFX', () => {
      const initialState = audioManager.getAudioState();
      audioManager.toggleSFX();
      const newState = audioManager.getAudioState();
      expect(newState.sfxEnabled).toBe(!initialState.sfxEnabled);
    });

    it('should not play sounds when muted', () => {
      audioManager.toggleMute(); // Mute
      audioManager.playSound('click');

      // Should not create audio context when muted
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should not play sounds when SFX disabled', () => {
      audioManager.toggleSFX(); // Disable SFX
      audioManager.playSound('click');

      // Should not create audio context when SFX disabled
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle audio context creation errors gracefully', () => {
      global.window.AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('Audio context creation failed');
      });

      expect(() => {
        audioManager.playSound('click');
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith('Failed to play tone:', expect.any(Error));
    });

    it('should get current audio state', () => {
      const state = audioManager.getAudioState();

      expect(state).toHaveProperty('masterVolume');
      expect(state).toHaveProperty('sfxVolume');
      expect(state).toHaveProperty('musicVolume');
      expect(state).toHaveProperty('muted');
      expect(state).toHaveProperty('musicEnabled');
      expect(state).toHaveProperty('sfxEnabled');
      expect(state).toHaveProperty('musicPlaying');

      expect(typeof state.masterVolume).toBe('number');
      expect(typeof state.muted).toBe('boolean');
    });

    it('should handle cleanup gracefully', () => {
      expect(() => {
        audioManager.cleanup();
      }).not.toThrow();
    });
  });
});
