// Enhanced test utilities for better testing experience
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// MSW setup (only if available)
let server: any = null;

try {
  // Dynamic import for MSW
  const msw = await import('msw/node');
  server = msw.setupServer();
} catch (_e) {
  // MSW not available, create mock server
  server = {
    listen: () => {},
    resetHandlers: () => {},
    close: () => {},
  };
}

// MSW server for API mocking
export { server };

// Enhanced render function with common setup
export function renderGame(ui: string | Element, options = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  if (typeof ui === 'string') {
    container.innerHTML = ui;
  } else {
    container.appendChild(ui);
  }

  return {
    container,
    ...screen,
    user: userEvent.setup(),
    // Helper to find elements by test ID
    findByTestId: (testId: string) => screen.findByTestId(testId),
    // Helper to find elements by role
    findByRole: (role: string, options?: any) => screen.findByRole(role, options),
    // Helper to get all elements by role
    getAllByRole: (role: string, options?: any) => screen.getAllByRole(role, options),
    // Helper to wait for element to appear
    waitForElement: (selector: string) => waitFor(() => screen.getByText(selector)),
    // Helper to wait for element to disappear
    waitForElementToDisappear: (selector: string) =>
      waitFor(() => {
        if (screen.queryByText(selector)) {
          throw new Error(`Element ${selector} still present`);
        }
      }),
    // Helper to click element
    click: (element: Element) => fireEvent.click(element),
    // Helper to type text
    type: (element: Element, text: string) => fireEvent.input(element, { target: { value: text } }),
    // Helper to submit form
    submit: (form: Element) => fireEvent.submit(form as HTMLFormElement),
    // Helper to change select value
    selectOption: (select: HTMLSelectElement, value: string) => {
      fireEvent.change(select, { target: { value } });
    },
    // Helper to check checkbox
    check: (checkbox: HTMLInputElement) => fireEvent.click(checkbox),
    // Helper to uncheck checkbox
    uncheck: (checkbox: HTMLInputElement) => fireEvent.click(checkbox),
    // Helper to focus element
    focus: (element: Element) => fireEvent.focus(element),
    // Helper to blur element
    blur: (element: Element) => fireEvent.blur(element),
    // Helper to key down
    keyDown: (element: Element, key: string) => fireEvent.keyDown(element, { key }),
    // Helper to key up
    keyUp: (element: Element, key: string) => fireEvent.keyUp(element, { key }),
    // Helper to key press
    keyPress: (element: Element, key: string) => fireEvent.keyPress(element, { key }),
    // Helper to mouse down
    mouseDown: (element: Element) => fireEvent.mouseDown(element),
    // Helper to mouse up
    mouseUp: (element: Element) => fireEvent.mouseUp(element),
    // Helper to mouse move
    mouseMove: (element: Element) => fireEvent.mouseMove(element),
    // Helper to mouse enter
    mouseEnter: (element: Element) => fireEvent.mouseEnter(element),
    // Helper to mouse leave
    mouseLeave: (element: Element) => fireEvent.mouseLeave(element),
    // Helper to drag and drop
    dragAndDrop: (source: Element, target: Element) => {
      fireEvent.dragStart(source);
      fireEvent.drop(target);
    },
  };
}

// Mock game state for testing
export const mockGameState = {
  sips: 1000,
  straws: 5,
  cups: 2,
  suctions: 3,
  widerStraws: 1,
  betterCups: 1,
  fasterDrinks: 0,
  criticalClicks: 0,
  level: 2,
  sps: 15.5,
  strawSPD: 0.9,
  cupSPD: 2.4,
  drinkRate: 1000,
  drinkProgress: 0,
  lastDrinkTime: Date.now() - 5000,
  lastSaveTime: Date.now() - 30000,
  sessionStartTime: Date.now() - 3600000,
  totalPlayTime: 3600000,
  totalSipsEarned: 5000,
  totalClicks: 150,
  highestSipsPerSecond: 20,
  currentClickStreak: 5,
  bestClickStreak: 12,
  criticalClickChance: 0.05,
  criticalClickMultiplier: 2.0,
  suctionClickBonus: 0.3,
  fasterDrinksUpCounter: 0,
  criticalClickUpCounter: 0,
  options: {
    autosaveEnabled: true,
    autosaveInterval: 30,
    clickSoundsEnabled: true,
    musicEnabled: true,
    musicStreamPreferences: {
      preferred: 'local',
      fallbacks: ['local'],
    },
  },
};

// Mock game configuration
export const mockGameConfig = {
  STRAW_BASE_SPD: 0.6,
  CUP_BASE_SPD: 1.2,
  BASE_SIPS_PER_DRINK: 1,
  WIDER_STRAWS_MULTIPLIER: 0.5,
  BETTER_CUPS_MULTIPLIER: 0.4,
  BASE_DRINK_RATE: 1000,
  CRITICAL_CLICK_BASE_CHANCE: 0.05,
  CRITICAL_CLICK_BASE_MULTIPLIER: 2.0,
  SUCTION_CLICK_BASE_BONUS: 0.3,
};

// Mock upgrades data
export const mockUpgrades = {
  straws: { baseCost: 5, scaling: 1.15, baseSPD: 0.6, multiplierPerLevel: 0.5 },
  widerStraws: { baseCost: 25, scaling: 1.2, upgradeBaseCost: 25 },
  cups: { baseCost: 50, scaling: 1.18, baseSPD: 1.2, multiplierPerLevel: 0.4 },
  betterCups: { baseCost: 200, scaling: 1.25, upgradeBaseCost: 200 },
  suction: { baseCost: 15, scaling: 1.1, upgradeBaseCost: 15 },
  fasterDrinks: { baseCost: 100, scaling: 1.3, upgradeBaseCost: 100 },
  criticalClick: { baseCost: 75, scaling: 1.2, upgradeBaseCost: 75 },
};

// Mock unlocks data
export const mockUnlocks = {
  suction: { sips: 10, clicks: 5 },
  criticalClick: { sips: 25, clicks: 10 },
  fasterDrinks: { sips: 50, clicks: 20 },
  straws: { sips: 0, clicks: 0 },
  cups: { sips: 15, clicks: 8 },
  widerStraws: { sips: 30, clicks: 15 },
  betterCups: { sips: 100, clicks: 40 },
  levelUp: { sips: 200, clicks: 50 },
  shop: { sips: 0, clicks: 0 },
  stats: { sips: 0, clicks: 0 },
  god: { sips: 1000, clicks: 100 },
  unlocks: { sips: 0, clicks: 0 },
};

// Helper to create mock DOM elements
export function createMockElement(
  tag: string,
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

// Helper to create mock button
export function createMockButton(text: string, action?: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  if (action) {
    button.setAttribute('data-action', action);
  }
  return button;
}

// Helper to create mock input
export function createMockInput(type: string, value: string = ''): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  return input;
}

// Helper to create mock select
export function createMockSelect(options: string[]): HTMLSelectElement {
  const select = document.createElement('select');
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
  return select;
}

// Helper to wait for async operations
export function waitForAsync(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to mock timers
export function mockTimers() {
  vi.useFakeTimers();
  return {
    advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
    runOnlyPendingTimers: () => vi.runOnlyPendingTimers(),
    runAllTimers: () => vi.runAllTimers(),
    restore: () => vi.useRealTimers(),
  };
}

// Helper to mock localStorage
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() {
        return Object.keys(store).length;
      },
    },
    writable: true,
  });

  return store;
}

// Helper to mock sessionStorage
export function mockSessionStorage() {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() {
        return Object.keys(store).length;
      },
    },
    writable: true,
  });

  return store;
}

// Helper to mock fetch
export function mockFetch(response: any, status: number = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
}

// Helper to mock console methods
export function mockConsole() {
  const originalConsole = { ...console };
  const mockConsole = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  Object.assign(console, mockConsole);

  return {
    ...mockConsole,
    restore: () => Object.assign(console, originalConsole),
  };
}

// Helper to create test environment
export function setupTestEnvironment() {
  // Mock DOM environment
  document.body.innerHTML = '';

  // Mock localStorage
  const localStorageMock = mockLocalStorage();

  // Mock sessionStorage
  const sessionStorageMock = mockSessionStorage();

  // Mock console
  const consoleMock = mockConsole();

  // Mock timers
  const timersMock = mockTimers();

  return {
    localStorageMock,
    sessionStorageMock,
    consoleMock,
    timersMock,
    cleanup: () => {
      document.body.innerHTML = '';
      consoleMock.restore();
      timersMock.restore();
    },
  };
}

// Export everything for easy importing
export * from '@testing-library/dom';
export { userEvent } from '@testing-library/user-event';
