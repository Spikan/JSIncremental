// Audio Controls Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioControlsManager } from '../ts/ui/audio-controls';

// Mock the enhanced audio manager
vi.mock('../ts/services/enhanced-audio-manager', () => ({
  enhancedAudioManager: {
    setMasterVolume: vi.fn(),
    setMusicVolume: vi.fn(),
    setSFXVolume: vi.fn(),
    startBackgroundMusic: vi.fn(),
    playSound: vi.fn(),
    getAudioState: vi.fn().mockReturnValue({
      masterVolume: 0.7,
      musicVolume: 0.25,
      sfxVolume: 0.6,
      muted: false,
      musicEnabled: true,
      sfxEnabled: true,
      musicPlaying: false,
      currentTrack: 'title',
      titleMusicPlayed: false,
    }),
  },
}));

// Mock logger
vi.mock('../ts/services/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock DOM elements
const createMockSlider = (id: string, value: string) => {
  const slider = document.createElement('input');
  slider.id = id;
  slider.type = 'range';
  slider.value = value;
  slider.style.setProperty = vi.fn();
  return slider;
};

const createMockSpan = (id: string, textContent: string) => {
  const span = document.createElement('span');
  span.id = id;
  span.textContent = textContent;
  return span;
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock DOM
  document.getElementById = vi.fn((id: string) => {
    switch (id) {
      case 'masterVolumeSlider':
        return createMockSlider(id, '70');
      case 'musicVolumeSlider':
        return createMockSlider(id, '25');
      case 'sfxVolumeSlider':
        return createMockSlider(id, '60');
      case 'masterVolumeValue':
        return createMockSpan(id, '70%');
      case 'musicVolumeValue':
        return createMockSpan(id, '25%');
      case 'sfxVolumeValue':
        return createMockSpan(id, '60%');
      default:
        return null;
    }
  });
});

describe('Audio Controls Manager', () => {
  let audioControlsManager: AudioControlsManager;

  beforeEach(() => {
    audioControlsManager = AudioControlsManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = AudioControlsManager.getInstance();
    const instance2 = AudioControlsManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize without errors', () => {
    expect(() => {
      audioControlsManager.initialize();
    }).not.toThrow();
  });

  it('should find DOM elements during initialization', () => {
    audioControlsManager.initialize();

    expect(document.getElementById).toHaveBeenCalledWith('masterVolumeSlider');
    expect(document.getElementById).toHaveBeenCalledWith('musicVolumeSlider');
    expect(document.getElementById).toHaveBeenCalledWith('sfxVolumeSlider');
    expect(document.getElementById).toHaveBeenCalledWith('masterVolumeValue');
    expect(document.getElementById).toHaveBeenCalledWith('musicVolumeValue');
    expect(document.getElementById).toHaveBeenCalledWith('sfxVolumeValue');
  });

  it('should handle refresh without errors', () => {
    expect(() => {
      audioControlsManager.refresh();
    }).not.toThrow();
  });

  it('should handle missing DOM elements gracefully', () => {
    document.getElementById = vi.fn().mockReturnValue(null);

    expect(() => {
      audioControlsManager.initialize();
      audioControlsManager.refresh();
    }).not.toThrow();
  });

  it('should set up event listeners for sliders', () => {
    const mockSlider = createMockSlider('masterVolumeSlider', '50');
    const addEventListener = vi.fn();
    mockSlider.addEventListener = addEventListener;

    document.getElementById = vi.fn((id: string) => {
      if (id === 'masterVolumeSlider') return mockSlider;
      return null;
    });

    audioControlsManager.initialize();

    expect(addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
  });

  it('should update slider progress with CSS custom properties', () => {
    const mockSlider = createMockSlider('masterVolumeSlider', '75');
    document.getElementById = vi.fn((id: string) => {
      if (id === 'masterVolumeSlider') return mockSlider;
      return null;
    });

    audioControlsManager.initialize();

    // Simulate slider change
    const inputEvent = new Event('input');
    Object.defineProperty(inputEvent, 'target', {
      value: { value: '75' },
      writable: false,
    });

    if (mockSlider.addEventListener) {
      const handler = (mockSlider.addEventListener as any).mock.calls[0][1];
      handler(inputEvent);
    }

    expect(mockSlider.style.setProperty).toHaveBeenCalledWith('--slider-progress', '75%');
  });
});
