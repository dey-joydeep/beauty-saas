import { InjectionToken } from '@angular/core';
import { PlatformUtils } from '../utils/platform-utils';

export interface IPlatformUtils extends Pick<PlatformUtils, 'browserNavigator' | 'browserLocalStorage' | 'browserSessionStorage' | 'browserLocation' | 'isBrowser' | 'isServer' | 'document' | 'window'> {
  /**
   * Runs code only in browser environment, with optional fallback for server-side
   * @param callback Code to run in browser
   * @param fallback Optional fallback function to run on server
   */
  runInBrowser<T, F = undefined>(
    callback: () => T,
    fallback?: () => F
  ): T | F | undefined;
}

/**
 * Token for injecting the platform-utils service
 * This is used to provide a way to mock browser APIs in tests
 */
export const PLATFORM_UTILS_TOKEN = new InjectionToken<IPlatformUtils>('PlatformUtils', {
  providedIn: 'root',
  factory: () => {
    // This will be overridden by the actual provider in app.config.ts
    return new PlatformUtils('browser');
  }
});
