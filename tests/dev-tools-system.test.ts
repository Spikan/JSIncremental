// Dev Tools System Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevToolsManager } from '../ts/ui/dev-tools-manager';

// Mock DOM elements
const mockDevTabButton = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
  },
  style: { display: '' },
};

const mockDevTabContent = {
  classList: {
    contains: vi.fn().mockReturnValue(false),
  },
};

const mockToggleButton = {
  textContent: '',
};

const mockWindow = {
  App: {
    state: {
      getState: vi.fn(),
      setState: vi.fn(),
    },
    systems: {
      options: {
        saveOptions: vi.fn(),
      },
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup DOM mocks
  global.document = {
    querySelector: vi.fn((selector: string) => {
      if (selector === '.dev-tab') return mockDevTabButton;
      if (selector === '#devToolsToggle, .dev-toggle-btn') return mockToggleButton;
      return null;
    }),
    getElementById: vi.fn((id: string) => {
      if (id === 'dev-tab') return mockDevTabContent;
      return null;
    }),
    querySelectorAll: vi.fn(() => []),
  } as any;

  // Setup window mock
  (global as any).window = mockWindow;

  // Setup console mock
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  };
});

describe('Dev Tools System', () => {
  let devToolsManager: DevToolsManager;

  beforeEach(() => {
    devToolsManager = DevToolsManager.getInstance();
  });

  describe('DevToolsManager', () => {
    it('should be a singleton', () => {
      const instance1 = DevToolsManager.getInstance();
      const instance2 = DevToolsManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize dev tools visibility correctly', () => {
      mockWindow.App.state.getState.mockReturnValue({
        options: { devToolsEnabled: true },
      });

      devToolsManager.initializeDevToolsVisibility();

      expect(mockDevTabButton.classList.add).toHaveBeenCalledWith('visible');
      expect(mockDevTabButton.style.display).toBe('flex');
      expect(mockToggleButton.textContent).toBe('🔧 Dev Tools ON');
    });

    it('should hide dev tools when disabled', () => {
      mockWindow.App.state.getState.mockReturnValue({
        options: { devToolsEnabled: false },
      });

      devToolsManager.initializeDevToolsVisibility();

      expect(mockDevTabButton.classList.remove).toHaveBeenCalledWith('visible');
      expect(mockDevTabButton.style.display).toBe('none');
      expect(mockToggleButton.textContent).toBe('🔧 Dev Tools OFF');
    });

    it('should toggle dev tools correctly', () => {
      // Start with dev tools disabled
      mockWindow.App.state.getState.mockReturnValue({
        options: { devToolsEnabled: false },
      });

      devToolsManager.toggleDevTools();

      expect(mockWindow.App.state.setState).toHaveBeenCalledWith({
        options: { devToolsEnabled: true },
      });

      expect(mockWindow.App.systems.options.saveOptions).toHaveBeenCalledWith({
        devToolsEnabled: true,
      });
    });

    it('should check dev tools status correctly', () => {
      mockWindow.App.state.getState.mockReturnValue({
        options: { devToolsEnabled: true },
      });

      const isEnabled = devToolsManager.isDevToolsEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should handle missing state gracefully', () => {
      mockWindow.App.state.getState.mockReturnValue(null);

      const isEnabled = devToolsManager.isDevToolsEnabled();
      expect(isEnabled).toBe(false);
    });

    it('should update toggle button text correctly', () => {
      devToolsManager.updateDevToolsToggleButton(true);
      expect(mockToggleButton.textContent).toBe('🔧 Dev Tools ON');

      devToolsManager.updateDevToolsToggleButton(false);
      expect(mockToggleButton.textContent).toBe('🔧 Dev Tools OFF');
    });

    it('should handle DOM query errors gracefully', () => {
      global.document.querySelector = vi.fn().mockImplementation(() => {
        throw new Error('DOM error');
      });

      expect(() => {
        devToolsManager.updateDevToolsVisibility(true);
      }).not.toThrow();
    });

    it('should handle state errors gracefully', () => {
      mockWindow.App.state.getState.mockImplementation(() => {
        throw new Error('State error');
      });

      expect(() => {
        devToolsManager.toggleDevTools();
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Tab Switching Logic', () => {
    it('should switch to settings tab when dev tools are disabled while active', () => {
      const mockSettingsButton = { classList: { add: vi.fn() } };
      const mockSettingsContent = { classList: { add: vi.fn() } };

      // Mock dev tab as active
      mockDevTabContent.classList.contains.mockReturnValue(true);

      global.document.querySelector = vi.fn((selector: string) => {
        if (selector === '.dev-tab') return mockDevTabButton;
        if (selector === '.settings-tab-btn[data-tab="settings"]') return mockSettingsButton;
        return null;
      });

      global.document.getElementById = vi.fn((id: string) => {
        if (id === 'dev-tab') return mockDevTabContent;
        if (id === 'settings-tab') return mockSettingsContent;
        return null;
      });

      devToolsManager.updateDevToolsVisibility(false);

      expect(mockSettingsButton.classList.add).toHaveBeenCalledWith('active');
      expect(mockSettingsContent.classList.add).toHaveBeenCalledWith('active');
    });
  });
});
