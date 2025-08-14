import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { InjectionToken, PLATFORM_ID } from '@angular/core';

/**
 * Interface for platform utilities to ensure type safety
 */
export interface IPlatformUtils {
  readonly isBrowser: boolean;
  readonly isServer: boolean;
  readonly browserLocalStorage: Storage | null;
  readonly browserSessionStorage: Storage | null;
  readonly browserNavigator: Navigator | null;
  readonly browserLocation: Location | null;
  readonly window: Window | null;
  readonly document: Document | null;
  
  runInBrowser<T, F = undefined>(
    callback: () => T,
    fallback?: () => F
  ): T | F | undefined;
}

/**
 * Injection token for PlatformUtils to support both class and interface injection
 */
export const PLATFORM_UTILS_TOKEN = new InjectionToken<IPlatformUtils>('PlatformUtils');

/**
 * Service to handle platform-specific code in an SSR-compatible way
 */
export class PlatformUtils implements IPlatformUtils {
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
   * Safely access the browser's localStorage
   */
  get browserLocalStorage(): Storage | null {
    return this.runInBrowser<Storage, null>(
      () => (typeof localStorage !== 'undefined' ? localStorage : null) as Storage,
      () => null
    ) ?? null;
  }

  /**
   * Safely access the browser's sessionStorage
   */
  get browserSessionStorage(): Storage | null {
    return this.runInBrowser<Storage, null>(
      () => (typeof sessionStorage !== 'undefined' ? sessionStorage : null) as Storage,
      () => null
    ) ?? null;
  }

  /**
   * Safely access the browser's navigator object
   */
  get browserNavigator(): Navigator | null {
    return this.runInBrowser<Navigator, null>(
      () => (typeof navigator !== 'undefined' ? navigator : null) as Navigator,
      () => null
    ) ?? null;
  }

  /**
   * Safely access the browser's location object
   */
  get browserLocation(): Location | null {
    return this.runInBrowser<Location, null>(
      () => (typeof location !== 'undefined' ? location : null) as Location,
      () => null
    ) ?? null;
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
}

/**
 * Factory function to create PlatformUtils
 */
export function platformUtilsFactory(platformId: Object): IPlatformUtils {
  return new PlatformUtils(platformId);
}

/**
 * Provide PlatformUtils as an injectable service
 */
export const providePlatformUtils = () => ({
  provide: PLATFORM_UTILS_TOKEN,
  useFactory: (platformId: Object) => platformUtilsFactory(platformId),
  deps: [PLATFORM_ID]
});
