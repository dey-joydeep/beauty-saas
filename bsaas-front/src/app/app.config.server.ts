import { mergeApplicationConfig, ApplicationConfig, PLATFORM_ID, APP_ID, makeStateKey, TransferState, Provider, isDevMode, EnvironmentProviders, inject } from '@angular/core';
import { provideServerRendering, ɵSERVER_CONTEXT as SERVER_CONTEXT } from '@angular/platform-server';
import { appConfig } from './app.config';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideHttpClient, withInterceptors, withFetch, HttpClient, HttpRequest, HttpHandlerFn, HttpHandler, HttpInterceptorFn } from '@angular/common/http';
import { TranslateLoader, TranslateStore, TranslateService } from '@ngx-translate/core';
import { TranslateServerLoader } from './core/translate/translate-server.loader';
import { StorageService } from './core/services/storage.service';
import { IPlatformUtils, PLATFORM_UTILS_TOKEN } from './core/utils/platform-utils';
import { PlatformUtils } from './core/utils/platform-utils';
import { ErrorService } from './core/error.service';

// Import interceptors
import { ssrInterceptor } from './core/interceptors/ssr-interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ssrTranslateInterceptor } from './core/interceptors/ssr-translate.interceptor';

// Server-side interceptors
const serverInterceptors: HttpInterceptorFn[] = [
  ssrInterceptor,
  ssrTranslateInterceptor,
  loadingInterceptor
];

// Mock browser APIs for SSR
const mockWindow = {
  document: {
    body: {},
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  },
  navigator: {
    language: 'en-US',
    languages: ['en-US']
  }
};

// Create a server-side translate loader
function serverTranslateLoader() {
  const http = inject(HttpClient);
  const transferState = inject(TransferState);
  return new TranslateServerLoader(transferState, http, './assets/i18n/', '.json');
}

// Server-side providers
const serverProviders: (Provider | EnvironmentProviders)[] = [
  // Core server providers
  provideServerRendering(),
  {
    provide: 'ENABLE_DETAILED_ERRORS',
    useValue: isDevMode(),
  },
  
  // Platform utilities with SSR support
  {
    provide: PLATFORM_UTILS_TOKEN,
    useFactory: () => {
      console.log('🔧 Initializing PlatformUtils for SSR');
      const platformId = inject(PLATFORM_ID);
      return new PlatformUtils(platformId);
    }
  },
  
  // Storage service with SSR support
  {
    provide: StorageService,
    useFactory: () => {
      console.log('🔧 Initializing StorageService for SSR');
      const platformId = inject(PLATFORM_ID);
      const platformUtils = inject(PLATFORM_UTILS_TOKEN);
      return new StorageService(platformId, platformUtils);
    }
  },
  
  // Error handling with SSR support
  {
    provide: ErrorService,
    useFactory: () => {
      console.log('🔧 Initializing ErrorService for SSR');
      const translate = inject(TranslateService);
      return new ErrorService(translate);
    }
  },
  
  // Translation with SSR support
  {
    provide: TranslateLoader,
    useFactory: () => {
      console.log('🔧 Initializing TranslateServerLoader');
      const transferState = inject(TransferState);
      const http = inject(HttpClient);
      return new TranslateServerLoader(transferState, http, './assets/i18n/', '.json');
    }
  },
  
  // Core services with SSR support
  {
    provide: TranslateStore,
    useFactory: () => {
      console.log('🔧 Initializing TranslateStore for SSR');
      return new TranslateStore();
    }
  },
  TranslateStore,
  
  // Server-specific configurations
  { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  { provide: 'SSR', useValue: true },
  { provide: 'BROWSER', useValue: false },
  
  // HTTP client configuration with server interceptors
  provideHttpClient(
    withInterceptors([
      ...serverInterceptors
      // Add any additional interceptors here
    ]),
    withFetch()
  ),
  { provide: 'WINDOW', useValue: mockWindow },
  { provide: 'DOCUMENT', useValue: mockWindow.document },
  { provide: 'LOCAL_STORAGE', useValue: mockWindow.localStorage },
  { provide: 'SESSION_STORAGE', useValue: mockWindow.sessionStorage },
  { provide: 'REQUEST', useValue: null },
  { provide: 'RESPONSE', useValue: null },
  { provide: 'Dd', useValue: null },
  { provide: PLATFORM_ID, useValue: 'server' },
  { provide: APP_ID, useValue: 'server-app' },
  { provide: SERVER_CONTEXT, useValue: 'ssr' },
  { provide: MAT_DATE_LOCALE, useValue: 'en-US' },

  provideHttpClient(
    withInterceptors([
      ssrInterceptor,
      loadingInterceptor,
      (req: HttpRequest<unknown>, next: HttpHandlerFn) => next(req),
    ])
  ),

  { provide: 'SSR', useValue: true },
  { provide: 'BROWSER', useValue: false },
];

// Combine with base app config
export const config: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: serverProviders,
});
