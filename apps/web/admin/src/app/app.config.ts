import {
  HttpClient,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withXsrfConfiguration
} from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  PLATFORM_ID,
  TransferState
} from '@angular/core';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateStore } from '@ngx-translate/core';
import { TranslateBrowserLoader } from '@frontend-shared/core/translate/translate-ssr-loader';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// App imports
import { AUTH_ROUTES } from './core/auth/auth.routes';
import { ErrorHandlerService } from '@frontend-shared/core/services/error/error-handler.service';
import { ErrorInterceptor } from '@frontend-shared/core/interceptors/error.interceptor';
import { PLATFORM_UTILS_TOKEN, PlatformUtils } from '@frontend-shared/core/utils/platform-utils';

// AoT requires an exported function for factories
export function httpLoaderFactory(http: HttpClient, transferState: TransferState) {
  return new TranslateBrowserLoader(http, transferState);
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide PlatformUtils as a singleton
    { 
      provide: PLATFORM_UTILS_TOKEN, 
      useFactory: (platformId: object) => new PlatformUtils(platformId), 
      deps: [PLATFORM_ID] 
    },
    
    // Provide PLATFORM_UTILS_TOKEN for client-side
    {
      provide: PLATFORM_UTILS_TOKEN,
      useFactory: (platformId: object) => new PlatformUtils(platformId),
      deps: [PLATFORM_ID]
    },
    
    // Configure TranslateModule for client-side with SSR support
    {
      provide: TranslateLoader,
      useFactory: httpLoaderFactory,
      deps: [HttpClient, TransferState]
    },
    TranslateStore,
    
    provideRouter(AUTH_ROUTES),
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([
        // Add any HTTP interceptors here
      ]),
      withFetch()
    ),
    // Register global HTTP interceptors
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    importProvidersFrom([
      BrowserAnimationsModule,
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
      MatMenuModule,
      MatPaginatorModule,
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
      MatNativeDateModule,
      // Setup the TranslateModule for the application
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient, TransferState]
        }
      })
    ]),
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
  ],
};
