import { isPlatformServer } from '@angular/common';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Handler for Material components that need special handling during SSR
 */
export class MaterialSsrHandler {
  constructor(private platformId: Object) {}

  /**
   * Handle Material component initialization for SSR
   */
  initialize(): void {
    if (isPlatformServer(this.platformId)) {
      // Add any Material component initialization that needs to happen on the server
      this.initializeMaterialServerSide();
    }
  }

  /**
   * Initialize Material components for server-side rendering
   */
  private initializeMaterialServerSide(): void {
    // Ensure global objects exist
    const globalAny = global as any;
    
    // Mock window
    if (typeof globalAny.window === 'undefined') {
      globalAny.window = {
        matchMedia: () => ({
          matches: false,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        }),
        requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
        cancelAnimationFrame: (id: number) => clearTimeout(id),
        addEventListener: () => {},
        removeEventListener: () => {},
        getComputedStyle: () => ({
          getPropertyValue: () => ''
        })
      };
    }

    // Mock document
    if (typeof globalAny.document === 'undefined') {
      globalAny.document = {
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({
          setAttribute: () => {},
          style: {},
          getBoundingClientRect: () => ({
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0
          }),
          contains: () => false,
          classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {}
          }
        }),
        body: {
          appendChild: () => {},
          removeChild: () => {},
          style: {}
        },
        head: {
          appendChild: () => {},
          querySelector: () => null
        },
        createTextNode: () => ({}),
        createComment: () => ({}),
        documentElement: {
          style: {}
        },
        getElementsByTagName: () => [],
        getElementById: () => null
      };
    }

    // Mock localStorage and sessionStorage
    if (typeof globalAny.localStorage === 'undefined') {
      globalAny.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      };
    }

    if (typeof globalAny.sessionStorage === 'undefined') {
      globalAny.sessionStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      };
    }
  }

  /**
   * Intercept HTTP requests for Material components during SSR
   */
  intercept(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    // Handle any Material-specific request modifications here
    return next(req);
  }
}

/**
 * Factory function to create MaterialSsrHandler
 */
export function materialSsrHandlerFactory(platformId: Object): MaterialSsrHandler {
  return new MaterialSsrHandler(platformId);
}

/**
 * Provide MaterialSsrHandler as an injectable service
 */
export const provideMaterialSsrHandler = () => ({
  provide: MaterialSsrHandler,
  useFactory: materialSsrHandlerFactory,
  deps: [PLATFORM_ID],
});
