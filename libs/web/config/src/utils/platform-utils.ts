import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

export interface PlatformUtils {
  readonly isBrowser: boolean;
  readonly isServer: boolean;
  readonly windowRef: Window | null;
  readonly documentRef: Document | null;
}

export const PLATFORM_UTILS_TOKEN = new InjectionToken<PlatformUtils>('PLATFORM_UTILS_TOKEN', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    const isServer = isPlatformServer(platformId);

    let windowRef: Window | null = null;
    let documentRef: Document | null = null;
    if (isBrowser) {
      windowRef = window;
      documentRef = window.document;
    }

    return {
      isBrowser,
      isServer,
      windowRef,
      documentRef,
    } as const;
  },
});
