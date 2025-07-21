import { ApplicationConfig, ErrorHandler, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withInterceptors,
  withFetch,
  withXsrfConfiguration,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { routes } from './app.routes';
import { ErrorHandlerService } from './core/services/error-handler.service';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ssrInterceptor } from './core/interceptors/ssr-interceptor';
import { providePlatformUtils } from './core/utils/platform-utils';
import { provideMaterialSsrHandler } from './core/ssr';

// Simple error handler for minimal setup
// class SimpleErrorHandler implements ErrorHandler {
//   handleError(error: any) {
//     console.error('An error occurred:', error);
//   }
// }

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// Configure Material modules and providers
// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Common providers for both client and server
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
        // Only enable hydration in the browser
        includeHeaders: isBrowser ? ['Accept', 'Authorization'] : [],
      }),
    ),
    // Only provide animations in the browser
    ...(isBrowser ? [provideAnimations()] : []),
    // Provide HTTP client with interceptors
    provideHttpClient(
      withInterceptors([
        // Add global interceptors here
        ssrInterceptor,
        loadingInterceptor,
      ]),
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withFetch(),
    ),
    // Environment flags - these will be overridden in server config
    { provide: 'BROWSER', useValue: isBrowser },
    { provide: 'SSR', useValue: !isBrowser },
    { provide: 'ROUTE_EXTRACTION', useValue: false },
    importProvidersFrom(
      // Material modules
      MatNativeDateModule,
      MatMenuModule,
      MatSidenavModule,
      MatListModule,
      MatToolbarModule,
      MatButtonModule,
      MatCardModule,
      MatIconModule,
      MatInputModule,
      MatProgressSpinnerModule,
      MatSnackBarModule,
      MatChipsModule,
      MatDividerModule,
    ),
    // Global providers
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      },
    },
    // Initialize icon registry
    MatIconRegistry,

    // Platform utilities
    providePlatformUtils(),

    // Material SSR handler
    provideMaterialSsrHandler(),
  ],
};
