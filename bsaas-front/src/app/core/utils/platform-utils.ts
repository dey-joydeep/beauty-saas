import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

/**
 * Service to handle platform-specific code
 */
export class PlatformUtils {
  constructor(private platformId: Object) {}

  /**
   * Check if the current platform is a browser
   */
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Check if the current platform is a server
   */
  get isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  /**
   * Run code only in the browser
   * @param callback Code to run in the browser
   * @param fallback Optional fallback to run on the server
   */
  runInBrowser<T, F = undefined>(
    callback: () => T,
    fallback?: () => F
  ): T | F | undefined {
    if (this.isBrowser) {
      return callback();
    }
    return fallback ? fallback() : undefined;
  }

  /**
   * Get the window object in a server-compatible way
   */
  get window(): Window | null {
    return this.runInBrowser<Window, null>(
      () => (typeof window !== 'undefined' ? window : null) as Window,
      () => null
    ) ?? null;
  }

  /**
   * Get the document object in a server-compatible way
   */
  get document(): Document | null {
    return this.runInBrowser<Document, null>(
      () => (typeof document !== 'undefined' ? document : null) as Document,
      () => null
    ) ?? null;
  }

  /**
   * Get the localStorage object in a server-compatible way
   */
  get localStorage(): Storage | null {
    return this.runInBrowser<Storage, null>(
      () => (typeof window !== 'undefined' ? window.localStorage : null) as Storage,
      () => null
    ) ?? null;
  }

  /**
   * Get the sessionStorage object in a server-compatible way
   */
  get sessionStorage(): Storage | null {
    return this.runInBrowser<Storage, null>(
      () => (typeof window !== 'undefined' ? window.sessionStorage : null) as Storage,
      () => null
    ) ?? null;
  }
}

/**
 * Factory function to create PlatformUtils
 */
export function platformUtilsFactory(platformId: Object): PlatformUtils {
  return new PlatformUtils(platformId);
}

/**
 * Provide PlatformUtils as an injectable service
 */
export const providePlatformUtils = () => ({
  provide: PlatformUtils,
  useFactory: platformUtilsFactory,
  deps: [PLATFORM_ID]
});
