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
    // Core Angular providers
    { provide: PLATFORM_ID, useValue: 'server' },
    { provide: APP_ID, useValue: 'server-app' },
    { provide: SERVER_CONTEXT, useValue: 'ssr' },
    
    // Route extraction flag
    { provide: 'ROUTE_EXTRACTION', useValue: true },
    { provide: 'BROWSER', useValue: false },
    { provide: 'SSR', useValue: true },

    // Mock browser globals that might be accessed during route resolution
    { provide: 'WINDOW', useValue: globalThis },
    { provide: 'DOCUMENT', useValue: { body: {}, addEventListener: () => {}, removeEventListener: () => {} } },
    { provide: 'LOCAL_STORAGE', useValue: {} },
    { provide: 'SESSION_STORAGE', useValue: {} },

    // HTTP client with minimal interceptors
    provideHttpClient(
      withInterceptors([
        ssrInterceptor, // Only include essential interceptors
      ]),
    ),

    // Include other essential providers from serverProviders
    ...serverProviders.filter((provider) => {
      if (typeof provider !== 'object' || !('provide' in provider)) return true;
      
      const provideToken = String(provider.provide);
      // Keep only essential providers for route extraction
      const essentialProviders = [
        'APP_INITIALIZER',
        'HTTP_INTERCEPTORS',
        'ENVIRONMENT_INITIALIZER',
        'APP_BOOTSTRAP_LISTENER',
        'APP_ID',
        'PLATFORM_ID',
        'DOCUMENT',
        'WINDOW',
        'LOCAL_STORAGE',
        'SESSION_STORAGE',
        'REQUEST',
        'RESPONSE',
        'ROUTE_EXTRACTION',
        'SSR',
        'BROWSER',
      ];
      
      return essentialProviders.includes(provideToken);
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
