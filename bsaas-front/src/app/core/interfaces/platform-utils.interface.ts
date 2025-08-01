import { InjectionToken } from '@angular/core';

/**
 * Interface for platform-agnostic browser APIs
 */
export interface IPlatformUtils {
  /**
   * Get the window object in a server-compatible way
   */
  readonly window: Window | null;
  
  /**
   * Get the document object in a server-compatible way
   */
  readonly document: Document | null;
  
  /**
   * Get the localStorage object in a server-compatible way
   */
  readonly localStorage: Storage | null;
  
  /**
   * Get the sessionStorage object in a server-compatible way
   */
  readonly sessionStorage: Storage | null;
  
  /**
   * Run code only in browser environment
   * @param callback The callback to run in browser environment
   * @returns The result of the callback or null if not in browser
   */
  runInBrowser<T, U = null>(
    callback: () => T,
    serverCallback?: () => U
  ): T | U | null;
}

/**
 * Injection token for PlatformUtils
 */
export const PLATFORM_UTILS_TOKEN = new InjectionToken<IPlatformUtils>('PlatformUtils');
