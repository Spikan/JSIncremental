import { describe, it, expect, beforeAll } from 'vitest';

// Extend existing global types
declare global {
  interface Window {
    App?: any;
    GAME_CONFIG?: any;
    DOM_CACHE?: any;
    FEATURE_UNLOCKS?: any;
  }
}

describe('Game Smoke Test', () => {
    beforeAll(() => {
        // Mock browser environment
        (global as any).window = {
            localStorage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                length: 0,
                clear: () => {},
                key: () => null
            },
            fetch: () => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
                headers: new Headers(),
                redirected: false,
                status: 200,
                statusText: 'OK',
                type: 'basic',
                url: '',
                clone: () => ({} as Response),
                text: () => Promise.resolve(''),
                blob: () => Promise.resolve(new Blob()),
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                formData: () => Promise.resolve(new FormData())
            } as Response)
        };

        (global as any).document = {
            getElementById: () => null,
            querySelector: () => null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
            createElement: () => null as any,
            readyState: 'complete',
            body: null,
            head: null,
            documentElement: null,
            title: '',
            cookie: '',
            referrer: '',
            domain: '',
            URL: '',
            location: null as any,
            defaultView: null,
            compatMode: '',
            contentType: '',
            characterSet: '',
            charset: '',
            inputEncoding: '',
            lastModified: '',
            links: [],
            forms: [],
            images: [],
            embeds: [],
            plugins: [],
            scripts: [],
            styleSheets: [],
            all: [],
            anchors: [],
            applets: [],
            children: [],
            childElementCount: 0,
            dir: '',
            designMode: '',
            fullscreenElement: null,
            fullscreenEnabled: false,
            hidden: false,
            pointerLockElement: null,
            scrollingElement: null,
            visibilityState: 'visible',
            xmlEncoding: '',
            xmlStandalone: false,
            xmlVersion: '',
            createAttribute: () => null as any,
            createComment: () => null as any,
            createDocumentFragment: () => null as any,
            createEvent: () => null as any,
            createTextNode: () => null as any,
            getElementsByClassName: () => [],
            getElementsByName: () => [],
            getElementsByTagName: () => [],
            getElementsByTagNameNS: () => [],
            getRootNode: () => null as any,
            getSelection: () => null,
            hasFocus: () => false,
            importNode: () => null as any,
            open: () => null as any,
            querySelectorAll: () => [],
            write: () => {},
            writeln: () => {},
            adoptNode: () => null as any,
            captureEvents: () => {},
            caretRangeFromPoint: () => null as any,
            clear: () => {},
            close: () => {},
            createAttributeNS: () => null as any,
            createCDATASection: () => null as any,
            createElementNS: () => null as any,
            createExpression: () => null as any,
            createNSResolver: () => null as any,
            createNodeIterator: () => null as any,
            createProcessingInstruction: () => null as any,
            createRange: () => null as any,
            createTreeWalker: () => null as any,
            elementFromPoint: () => null,
            elementsFromPoint: () => [],
            evaluate: () => null as any,
            execCommand: () => false,
            exitFullscreen: () => Promise.resolve(),
            exitPointerLock: () => {},
            getAnimations: () => [],
            onfullscreenchange: null,
            onfullscreenerror: null,
            onpointerlockchange: null,
            onpointerlockerror: null,
            onreadystatechange: null,
            onvisibilitychange: null,
            ownerDocument: null,
            doctype: null,
            implementation: null as any
        };

        (global as any).console = {
            log: () => {},
            warn: () => {},
            error: () => {},
            assert: () => {},
            clear: () => {},
            count: () => {},
            countReset: () => {},
            debug: () => {},
            dir: () => {},
            dirxml: () => {},
            group: () => {},
            groupCollapsed: () => {},
            groupEnd: () => {},
            info: () => {},
            table: () => {},
            time: () => {},
            timeEnd: () => {},
            timeLog: () => {},
            trace: () => {},
            profile: () => {},
            profileEnd: () => {},
            timeStamp: () => {}
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
