import { mergeApplicationConfig, ApplicationConfig, Provider, EnvironmentProviders, PLATFORM_ID, APP_ID } from '@angular/core';
import { provideServerRendering, ɵSERVER_CONTEXT as SERVER_CONTEXT } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideHttpClient, withInterceptors, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ssrInterceptor } from './core/interceptors/ssr-interceptor';

// Mock browser globals for server-side rendering
const mockWindow = {
  document: {
    body: {},
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (callback: FrameRequestCallback) => 0,
  cancelAnimationFrame: () => {},
  setTimeout: (fn: () => void, delay?: number) => 0 as unknown as NodeJS.Timeout,
  clearTimeout: () => {},
  // Add other browser APIs that might be needed
};

// Server-specific providers
const serverProviders: (Provider | EnvironmentProviders)[] = [
  provideServerRendering(),
  provideAnimations(),

  // Provide mock browser globals
  { provide: 'WINDOW', useValue: mockWindow },
  { provide: 'DOCUMENT', useValue: mockWindow.document },
  { provide: 'LOCAL_STORAGE', useValue: {} },
  { provide: 'SESSION_STORAGE', useValue: {} },
  { provide: 'REQUEST', useValue: null },
  { provide: 'RESPONSE', useValue: null },
  { provide: 'Dd', useValue: null }, // Mock for Dd provider

  // Platform and app identification
  { provide: PLATFORM_ID, useValue: 'server' },
  { provide: APP_ID, useValue: 'server-app' },
  { provide: SERVER_CONTEXT, useValue: 'ssr' },

  // Material and other third-party providers
  { provide: MAT_DATE_LOCALE, useValue: 'en-US' },

  // Configure HTTP client for SSR
  provideHttpClient(
    withInterceptors([
      // Server-specific request handling
      (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
        // Add any server-specific request modifications here
        return next(req);
      },
      // Include global interceptors
      ssrInterceptor,
      loadingInterceptor,
    ]),
  ),

  // SSR flag and other server-specific providers
  { provide: 'SSR', useValue: true },
  { provide: 'BROWSER', useValue: false },
];

// Create a minimal configuration for route extraction
const routeExtractionConfig: ApplicationConfig = {
  providers: [
    // Only include the bare minimum providers needed for route extraction
    { provide: 'ROUTE_EXTRACTION', useValue: true },
    { provide: 'BROWSER', useValue: false },
    { provide: 'SSR', useValue: true },

    // Ensure HTTP client is available for route resolvers
    provideHttpClient(
      withInterceptors([
        // Include only essential interceptors for route extraction
        ssrInterceptor,
      ]),
    ),

    // Include any other essential providers needed for route resolution
    ...serverProviders.filter((provider) => {
      // Filter out any providers that might cause injection errors during route extraction
      if (typeof provider !== 'object' || !('provide' in provider)) return true;

      const provideToken = String(provider.provide);
      // Exclude browser-specific providers
      return !['BROWSER', 'SSR', 'PLATFORM_ID', 'APP_ID'].includes(provideToken);
    }),
  ],
};

// For the full server configuration, include all providers
const serverConfig: ApplicationConfig = {
  providers: [...serverProviders, { provide: 'BROWSER', useValue: false }, { provide: 'SSR', useValue: true }],
};

// Export the appropriate config based on the current phase
export const config =
  process.env['NG_APP_PHASE'] === 'route-extraction' ? routeExtractionConfig : mergeApplicationConfig(appConfig, serverConfig);
