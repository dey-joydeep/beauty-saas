import { PLATFORM_ID, inject, Provider } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export class MaterialSsrHandler {
  constructor(private platformId: Object) {}

/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Initialize Material components for server-side rendering
   *
   * This function is called after the component tree has been constructed,
   * and can be used to perform any server-specific setup or initialization
   * of Material components.
   *
   * For example, you can configure server-side rendering for Material overlays,
   * dialogs, etc. here.
   */
/*******  4ecc351f-cef9-4dbc-ba14-461716599068  *******/
  initialize(): void {
    if (isPlatformServer(this.platformId)) {
      // Ensure global mocks for window, document, localStorage, and sessionStorage for SSR safety
      // Use a type-safe global object
      const globalAny: Record<string, unknown> = globalThis as Record<string, unknown>;

      // Mock window
      if (typeof globalAny['window'] === 'undefined') {
        globalAny['window'] = {
          document: {
            body: {},
            addEventListener: (): void => {},
            removeEventListener: (): void => {},
            createElement: (): object => ({}),
            querySelector: (): null => null,
            createTextNode: (): object => ({}),
            createComment: (): object => ({}),
            documentElement: { style: {} },
            getElementsByTagName: (): unknown[] => [],
            getElementById: (): null => null
          },
          addEventListener: (): void => {},
          removeEventListener: (): void => {},
          requestAnimationFrame: (_cb: FrameRequestCallback): number => 0,
          cancelAnimationFrame: (): void => {},
          setTimeout: (_fn: () => void, _delay?: number): NodeJS.Timeout => 0 as unknown as NodeJS.Timeout,
          clearTimeout: (): void => {},
        };
      }

      // Mock document
      if (typeof globalAny['document'] === 'undefined') {
        globalAny['document'] = (globalAny['window'] as { document: object }).document;
      }

      // Mock localStorage
      if (typeof globalAny['localStorage'] === 'undefined') {
        globalAny['localStorage'] = {
          getItem: (_key: string): null => null,
          setItem: (_key: string, _value: string): void => {},
          removeItem: (_key: string): void => {},
          clear: (): void => {}
        };
      }

      // Mock sessionStorage
      if (typeof globalAny['sessionStorage'] === 'undefined') {
        globalAny['sessionStorage'] = {
          getItem: (_key: string): null => null,
          setItem: (_key: string, _value: string): void => {},
          removeItem: (_key: string): void => {},
          clear: (): void => {}
        };
      }
    }
  }
}

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
