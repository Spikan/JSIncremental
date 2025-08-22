// Test Setup File - Comprehensive browser API mocking and test environment setup

import { vi, beforeEach, afterEach } from 'vitest';

// Mock Decimal library (break_infinity.js)
global.Decimal = class Decimal {
  constructor(value) {
    this._value = Number(value) || 0;
  }
  
  // Basic arithmetic methods
  plus(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return new Decimal(this._value + otherValue);
  }
  
  minus(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return new Decimal(this._value - otherValue);
  }
  
  times(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return new Decimal(this._value * otherValue);
  }
  
  div(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return new Decimal(this._value / otherValue);
  }
  
  // Comparison methods
  gte(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return this._value >= otherValue;
  }
  
  lte(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return this._value <= otherValue;
  }
  
  gt(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return this._value > otherValue;
  }
  
  lt(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return this._value < otherValue;
  }
  
  eq(other) {
    const otherValue = other instanceof Decimal ? other._value : Number(other);
    return this._value === otherValue;
  }
  
  // Utility methods
  toNumber() {
    return this._value;
  }
  
  toString() {
    return String(this._value);
  }
  
  toFixed(decimals = 0) {
    return this._value.toFixed(decimals);
  }
  
  // Static methods
  static fromString(str) {
    return new Decimal(Number(str));
  }
  
  static fromNumber(num) {
    return new Decimal(num);
  }
};

// Make Decimal available on window for tests
global.window = global.window || {};
global.window.Decimal = global.Decimal;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock requestAnimationFrame
const requestAnimationFrameMock = vi.fn((callback) => {
  return setTimeout(callback, 16); // 60fps simulation
});

const cancelAnimationFrameMock = vi.fn((id) => {
  clearTimeout(id);
});

// Mock performance API
const performanceMock = {
  now: vi.fn(() => Date.now()),
  timeOrigin: Date.now(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  getEntries: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

// Mock AudioContext
class AudioContextMock {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
  }
  
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 }
    };
  }
  
  createGain() {
    return {
      connect: vi.fn(),
      gain: { value: 1 }
    };
  }
  
  resume() {
    return Promise.resolve();
  }
  
  suspend() {
    return Promise.resolve();
  }
}

// Mock WebGL context
const getContextMock = vi.fn(() => ({
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getAttribLocation: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  viewport: vi.fn()
}));

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: getContextMock,
  writable: true
});

// Mock Image
class ImageMock {
  constructor() {
    this.src = '';
    this.onload = null;
    this.onerror = null;
    this.width = 0;
    this.height = 0;
  }
}

// Mock fetch
const fetchMock = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK'
  })
);

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

// Mock ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

// Mock MutationObserver
class MutationObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  }
}

// Mock service worker
const serviceWorkerMock = {
  register: vi.fn(() => Promise.resolve({})),
  getRegistration: vi.fn(() => Promise.resolve(null)),
  getRegistrations: vi.fn(() => Promise.resolve([])),
  ready: Promise.resolve({})
};

// Setup global mocks
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: requestAnimationFrameMock,
  writable: true
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: cancelAnimationFrameMock,
  writable: true
});

Object.defineProperty(global, 'performance', {
  value: performanceMock,
  writable: true
});

Object.defineProperty(global, 'AudioContext', {
  value: AudioContextMock,
  writable: true
});

Object.defineProperty(global, 'WebGLRenderingContext', {
  value: {},
  writable: true
});

Object.defineProperty(global, 'Image', {
  value: ImageMock,
  writable: true
});

Object.defineProperty(global, 'fetch', {
  value: fetchMock,
  writable: true
});

Object.defineProperty(global, 'IntersectionObserver', {
  value: IntersectionObserverMock,
  writable: true
});

Object.defineProperty(global, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true
});

Object.defineProperty(global, 'MutationObserver', {
  value: MutationObserverMock,
  writable: true
});

Object.defineProperty(global, 'serviceWorker', {
  value: serviceWorkerMock,
  writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock window methods
Object.defineProperty(global, 'addEventListener', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(global, 'removeEventListener', {
  value: vi.fn(),
  writable: true
});

// Mock URL and location
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn()
  },
  writable: true
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    maxTouchPoints: 0,
    onLine: true,
    language: 'en-US',
    languages: ['en-US', 'en'],
    cookieEnabled: true,
    doNotTrack: null,
    hardwareConcurrency: 4,
    deviceMemory: 8,
    platform: 'Win32'
  },
  writable: true
});

// Mock screen
Object.defineProperty(global, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  },
  writable: true
});

// Mock matchMedia
Object.defineProperty(global, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  writable: true
});

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  },
  writable: true
});

// Mock indexedDB
const indexedDBMock = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn()
        }))
      }))
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null
  })),
  deleteDatabase: vi.fn(),
  databases: vi.fn(() => Promise.resolve([]))
};

Object.defineProperty(global, 'indexedDB', {
  value: indexedDBMock,
  writable: true
});

// Enhanced DOM element mock with all necessary methods
function createMockElement(tagName = 'div') {
  const element = {
    tagName: tagName.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    innerHTML: '',
    style: {
      cssText: '',
      position: '',
      top: '',
      left: '',
      width: '',
      height: '',
      background: '',
      color: '',
      fontSize: '',
      fontWeight: '',
      animation: '',
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
      cssText: ''
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(() => false),
      replace: vi.fn()
    },
    dataset: {},
    attributes: {},
    children: [],
    parentNode: null,
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    insertBefore: vi.fn(),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    getAttribute: vi.fn(() => null),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    click: vi.fn(),
    scrollIntoView: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100
    })),
    offsetWidth: 100,
    offsetHeight: 100,
    clientWidth: 100,
    clientHeight: 100,
    scrollTop: 0,
    scrollLeft: 0,
    scrollWidth: 100,
    scrollHeight: 100
  };
  
  // Add getter/setter for style properties
  Object.defineProperty(element.style, 'position', {
    get: () => element.style._position || '',
    set: (value) => { element.style._position = value; }
  });
  
  Object.defineProperty(element.style, 'top', {
    get: () => element.style._top || '',
    set: (value) => { element.style._top = value; }
  });
  
  Object.defineProperty(element.style, 'left', {
    get: () => element.style._left || '',
    set: (value) => { element.style._left = value; }
  });
  
  Object.defineProperty(element.style, 'width', {
    get: () => element.style._width || '',
    set: (value) => { element.style._width = value; }
  });
  
  Object.defineProperty(element.style, 'height', {
    get: () => element.style._height || '',
    set: (value) => { element.style._height = value; }
  });
  
  Object.defineProperty(element.style, 'background', {
    get: () => element.style._background || '',
    set: (value) => { element.style._background = value; }
  });
  
  Object.defineProperty(element.style, 'color', {
    get: () => element.style._color || '',
    set: (value) => { element.style._color = value; }
  });
  
  Object.defineProperty(element.style, 'fontSize', {
    get: () => element.style._fontSize || '',
    set: (value) => { element.style._fontSize = value; }
  });
  
  Object.defineProperty(element.style, 'fontWeight', {
    get: () => element.style._fontWeight || '',
    set: (value) => { element.style._fontWeight = value; }
  });
  
  Object.defineProperty(element.style, 'animation', {
    get: () => element.style._animation || '',
    set: (value) => { element.style._animation = value; }
  });
  
  return element;
}

// Mock document
global.document = {
  createElement: vi.fn((tagName) => createMockElement(tagName)),
  createTextNode: vi.fn((text) => ({ textContent: text, nodeType: 3 })),
  getElementById: vi.fn((id) => {
    // Return null for missing elements to test graceful degradation
    if (id === 'nonexistent' || id === 'missing') {
      return null;
    }
    const element = createMockElement();
    element.id = id;
    return element;
  }),
  querySelector: vi.fn((selector) => {
    // Return null for missing elements to test graceful degradation
    if (selector === '#nonexistent' || selector === '.missing') {
      return null;
    }
    const element = createMockElement();
    element.id = selector.replace(/[.#]/, '');
    return element;
  }),
  querySelectorAll: vi.fn((selector) => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    insertBefore: vi.fn(),
    children: [],
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    style: {},
    className: '',
    id: 'body'
  },
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    insertBefore: vi.fn(),
    children: [],
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    style: {},
    className: '',
    id: 'head'
  },
  documentElement: {
    style: {},
    className: '',
    id: 'html'
  },
  readyState: 'complete',
  hidden: false,
  visibilityState: 'visible',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
};

// Setup test utilities
global.testUtils = {
  // Mock DOM element creation
  createMockElement: (tagName = 'div', className = '') => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    return element;
  },
  
  // Mock event creation
  createMockEvent: (type, options = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true, ...options });
    Object.assign(event, options);
    return event;
  },
  
  // Mock click event
  createMockClickEvent: (x = 100, y = 100) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: 0
    });
    return event;
  },
  
  // Mock touch event
  createMockTouchEvent: (x = 100, y = 100) => {
    const touch = new Touch({
      identifier: 1,
      target: document.body,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1
    });
    
    const event = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [touch],
      changedTouches: [touch],
      targetTouches: [touch]
    });
    
    return event;
  },
  
  // Reset all mocks
  resetMocks: () => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
    requestAnimationFrameMock.mockClear();
    cancelAnimationFrameMock.mockClear();
    fetchMock.mockClear();
  },
  
  // Mock time
  mockTime: (timestamp = Date.now()) => {
    vi.setSystemTime(timestamp);
  },
  
  // Restore time
  restoreTime: () => {
    vi.useRealTimers();
  }
};

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  global.testUtils.resetMocks();
  
  // Clear DOM
  document.body.innerHTML = '';
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset fetch
  fetchMock.mockClear();
  
  // Reset console
  console.warn.mockClear();
  console.error.mockClear();
  console.log.mockClear();
});

// Setup after each test
afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
  
  // Restore real timers
  vi.useRealTimers();
});

// Global test timeout
global.testTimeout = 10000;

console.log('🧪 Test environment setup complete!');
console.log('✅ DOM APIs mocked');
console.log('✅ Browser APIs mocked');
console.log('✅ Test utilities available');
console.log('✅ Ready for comprehensive testing');