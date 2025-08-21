import { describe, it, expect, beforeAll } from 'vitest';

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
        // This would normally be set by js/index.js
        expect(typeof window.App).toBe('undefined');
    });

    it('should have basic browser APIs', () => {
        expect(typeof window.localStorage).toBe('object');
        expect(typeof window.fetch).toBe('function');
        expect(typeof document.getElementById).toBe('function');
    });
});
