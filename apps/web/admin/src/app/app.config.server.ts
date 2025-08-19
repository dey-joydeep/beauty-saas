import {
  HttpClient,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  APP_ID,
  ApplicationConfig,
  EnvironmentProviders,
  inject,
  isDevMode,
  mergeApplicationConfig,
  PLATFORM_ID,
  Provider,
  TransferState,
} from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideServerRendering, ɵSERVER_CONTEXT as SERVER_CONTEXT } from '@angular/platform-server';
import { ErrorService } from '@frontend-shared/core/services/error/error.service';
import { PLATFORM_UTILS_TOKEN, PlatformUtils } from '@frontend-shared/core/utils/platform-utils';
import { StorageService } from '@frontend-shared/core/services/storage/storage.service';
import { TranslateServerLoader } from '@frontend-shared/core/translate/translate-server.loader';
import { TranslateLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { appConfig } from './app.config';

// Import interceptors
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ssrInterceptor } from './core/interceptors/ssr-interceptor';
import { ssrTranslateInterceptor } from './core/interceptors/ssr-translate.interceptor';

// Server-side interceptors
const serverInterceptors: HttpInterceptorFn[] = [ssrInterceptor, ssrTranslateInterceptor, loadingInterceptor];

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
    languages: ['en-US'],
  },
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
    },
  },

  // Storage service with SSR support
  {
    provide: StorageService,
    useFactory: () => {
      console.log('🔧 Initializing StorageService for SSR');
      const platformId = inject(PLATFORM_ID);
      const platformUtils = inject(PLATFORM_UTILS_TOKEN);
      return new StorageService(platformId, platformUtils);
    },
  },

  // Error handling with SSR support
  {
    provide: ErrorService,
    useFactory: () => {
      console.log('🔧 Initializing ErrorService for SSR');
      return new ErrorService();
    },
  },

  // Translation with SSR support
  {
    provide: TranslateLoader,
    useFactory: () => {
      console.log('🔧 Initializing TranslateServerLoader');
      const transferState = inject(TransferState);
      const http = inject(HttpClient);
      return new TranslateServerLoader(transferState, http, './assets/i18n/', '.json');
    },
  },

  // Core services with SSR support
  {
    provide: TranslateStore,
    useFactory: () => {
      console.log('🔧 Initializing TranslateStore for SSR');
      return new TranslateStore();
    },
  },
  TranslateStore,

  // Server-specific configurations
  { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  { provide: 'SSR', useValue: true },
  { provide: 'BROWSER', useValue: false },

  // HTTP client configuration with server interceptors
  provideHttpClient(
    withInterceptors([
      ...serverInterceptors,
      // Add any additional interceptors here
    ]),
    withFetch(),
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

  provideHttpClient(withInterceptors([ssrInterceptor, loadingInterceptor, (req: HttpRequest<unknown>, next: HttpHandlerFn) => next(req)])),

  { provide: 'SSR', useValue: true },
  { provide: 'BROWSER', useValue: false },
];

// Combine with base app config
export const config: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: serverProviders,
});
