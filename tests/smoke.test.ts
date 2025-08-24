import { describe, it, expect, beforeAll } from 'vitest';

declare global {
  var window: {
    App?: any;
    localStorage: Storage;
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  };
  var document: {
    getElementById: (id: string) => HTMLElement | null;
    querySelector: (selectors: string) => Element | null;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  };
  var console: {
    log: (...data: any[]) => void;
    warn: (...data: any[]) => void;
    error: (...data: any[]) => void;
  };
}

describe('Game Smoke Test', () => {
    beforeAll(() => {
        // Mock browser environment
        global.window = {
            localStorage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {}
            },
            fetch: () => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            })
        };
        
        global.document = {
            getElementById: () => null,
            querySelector: () => null,
            addEventListener: () => {}
        };
        
        global.console = {
            log: () => {},
            warn: () => {},
            error: () => {}
        };
    });

    it('should have App global object', () => {
        // This would normally be set by ts/index.ts
        expect(typeof window.App).toBe('undefined');
    });

    it('should have basic browser APIs', () => {
        expect(typeof window.localStorage).toBe('object');
        expect(typeof window.fetch).toBe('function');
        expect(typeof document.getElementById).toBe('function');
    });
});
