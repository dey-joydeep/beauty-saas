import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { PlatformUtils } from '../utils/platform-utils';

/**
 * Interceptor to handle server-side rendering of HTTP requests
 */
export const ssrInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformUtils = inject(PlatformUtils);

  // Skip for non-browser environments
  if (platformUtils.isServer) {
    // Clone the request and modify it for server-side rendering
    const serverReq = req.clone({
      // Add any server-specific headers here
      headers: req.headers.set('X-Requested-With', 'XMLHttpRequest').set('ngsw-bypass', 'true'), // Bypass service worker if used
    });

    return next(serverReq);
  }

  // For browser environment, pass through the request
  return next(req);
};
