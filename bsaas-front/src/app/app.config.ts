import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ssrInterceptor } from './core/interceptors/ssr-interceptor';
import { ErrorHandlerService } from './core/services/error-handler.service';
import { providePlatformUtils, PLATFORM_UTILS_TOKEN } from './core/utils/platform-utils';

// Centralized Material modules provider
function provideMaterial() {
  return [
    // Core modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    // Add other Material modules here
  ];
}

// Simple error handler for minimal setup
// class SimpleErrorHandler implements ErrorHandler {
//   handleError(error: any) {
//     console.error('An error occurred:', error);
//   }
// }

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Common providers for both client and server
export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideRouter(routes),
    
    // Client hydration with optimized caching
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
        // Exclude API endpoints from hydration cache
        filter: (req) => !req.url.includes('/api/'),
      })
    ),
    
    // Animations with noop support for SSR
    provideAnimations(),
    
    // HTTP client configuration
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([
        loadingInterceptor,
        ssrInterceptor
      ]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withFetch() // Enable fetch API for better SSR support
    ),
    
    // Error handling
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: ErrorHandlerService, 
      multi: true 
    },
    { 
      provide: ErrorHandler, 
      useClass: ErrorHandlerService 
    },
    
    // Material and third-party providers
    { 
      provide: MAT_DATE_LOCALE, 
      useValue: 'en-US' 
    },
    { 
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
      useValue: { 
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      } 
    },
    
    // Material modules
    importProvidersFrom(
      ...provideMaterial(),
      MatIconRegistry
    ),
    
    // Platform utilities - must be after provideHttpClient()
    providePlatformUtils(),
    
    // Add a provider for the document for server-side rendering
    {
      provide: 'DOCUMENT',
      useFactory: (platformId: Object) => 
        isPlatformBrowser(platformId) ? document : null,
      deps: [PLATFORM_ID]
    },
    
    // Add a provider for the window for server-side rendering
    {
      provide: 'WINDOW',
      useFactory: (platformId: Object) => 
        isPlatformBrowser(platformId) ? window : null,
      deps: [PLATFORM_ID]
    }
  ],
};
