import { PLATFORM_ID, inject, Provider } from '@angular/core';
import { isPlatformServer } from '@angular/common';

type Immediate = any; // Using any as a workaround for NodeJS.Immediate

// Type-safe global access
declare const global: typeof globalThis & {
  setImmediate?: (callback: () => void) => any;
  process?: {
    env?: Record<string, string | undefined>;
    nextTick?: (callback: () => void) => void;
  };
  [key: string]: any;
};

// Safely get the global object
export const getGlobal = (): typeof global => {
  if (typeof globalThis !== 'undefined') return globalThis as unknown as typeof global;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window as unknown as typeof global;
  if (typeof self !== 'undefined') return self as unknown as typeof global;
  return {} as typeof global;
};

const _global = getGlobal();

// Safe setImmediate implementation
const _setImmediate = (callback: () => void): any => {
  if (typeof _global.setImmediate === 'function') {
    return _global.setImmediate(callback);
  }
  return setTimeout(callback, 0);
};

/**
 * Service to handle Material component initialization for server-side rendering
 */
export class MaterialSsrHandler {
  constructor(private platformId: Object) {}

  /**
   * Initialize Material components for server-side rendering
   */
  private static isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
  }

  initialize(): void {
    if (!isPlatformServer(this.platformId)) {
      return;
    }

    // Safely handle process and global variables
    const globalAny = _global as any;
    
    // Initialize process if it doesn't exist
    if (!globalAny.process) {
      globalAny.process = {
        env: {},
        nextTick: (callback: () => void) => {
          _setImmediate(callback);
        },
      };
    }
    
    if (typeof globalAny.window === 'undefined') {
      // Create a minimal window mock for server-side rendering
      globalAny.window = {
        // Document mock
        document: {
          body: {},
          addEventListener: (): void => {},
          removeEventListener: (): void => {},
          createElement: (): HTMLElement => ({
            setAttribute: (): void => {},
            style: {},
            getContext: () => ({}),
            toDataURL: () => ''
          } as unknown as HTMLElement)
        },
        
        // Basic browser APIs
        addEventListener: (): void => {},
        removeEventListener: (): void => {},
        
        // Performance API
        performance: {
          now: () => Date.now(),
          timeOrigin: Date.now(),
          timing: {
            navigationStart: Date.now(),
            connectStart: 0,
            connectEnd: 0,
            requestStart: 0,
            responseStart: 0,
            responseEnd: 0,
            domLoading: 0,
            domInteractive: 0,
            domContentLoadedEventStart: 0,
            domContentLoadedEventEnd: 0,
            domComplete: 0,
            loadEventStart: 0,
            loadEventEnd: 0
          },
          memory: {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
          },
          navigation: {
            type: 0,
            redirectCount: 0
          }
        },
        
        // MatchMedia mock
        matchMedia: (): any => ({
          matches: false,
          addListener: (): void => {},
          removeListener: (): void => {}
        }),
        
        // Animation frame mocks
        requestAnimationFrame: (callback: FrameRequestCallback): number => {
          const now = performance.now();
          const id = setTimeout(() => callback(now), 0);
          return id as unknown as number;
        },
        
        cancelAnimationFrame: (id: number): void => {
          clearTimeout(id);
        },
        
        // Storage mocks
        localStorage: {
          getItem: (): null => null,
          setItem: (): void => {},
          removeItem: (): void => {},
          clear: (): void => {},
          key: (): null => null,
          length: 0
        },
        
        sessionStorage: {
          getItem: (): null => null,
          setItem: (): void => {},
          removeItem: (): void => {},
          clear: (): void => {},
          key: (): null => null,
          length: 0
        },
        
        // Navigation
        navigator: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        
        // Location
        location: {
          protocol: 'http:',
          host: 'localhost:4200'
        },
        
        // CSS
        CSS: {
          escape: (val: string): string => val
        },
        
        // Basic DOM types
        HTMLElement: class {},
        Element: class {},
        Node: class {}
      };

      // Set global references
      globalAny.document = globalAny.window.document;
      globalAny.navigator = globalAny.window.navigator;
      globalAny.localStorage = globalAny.window.localStorage;
      globalAny.sessionStorage = globalAny.window.sessionStorage;
      globalAny.HTMLElement = globalAny.window.HTMLElement;
      globalAny.Element = globalAny.window.Element;
      globalAny.Node = globalAny.window.Node;
      globalAny.CSS = globalAny.window.CSS;
    }
  }
}

/**
 * Provider for MaterialSsrHandler
 */
export function provideMaterialSsrHandler(): Provider {
  return {
    provide: MaterialSsrHandler,
    useFactory: () => {
      const platformId = inject(PLATFORM_ID);
      const handler = new MaterialSsrHandler(platformId);
      handler.initialize();
      return handler;
    },
  };
}
