import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateStore } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { of } from 'rxjs';

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
import { routes } from './app.routes';
import { LOGIN_API, AUTH_STATE_SETTER } from '@cthub-bsaas/web-customer-auth';
import { LoginApiService } from '@cthub-bsaas/web-customer-auth';
import {
  FORGOT_PASSWORD_API,
  REGISTER_API,
  type ForgotPasswordApiPort,
  type RegisterApiPort,
} from '@cthub-bsaas/web-customer-auth';
import {
  ErrorHandlerService,
  ERROR_INTERCEPTOR_PROVIDER,
  loadingInterceptor,
  ssrInterceptor,
  ssrTranslateInterceptor,
} from '@cthub-bsaas/web-core/http';
import { AUTH_STATE_PORT } from '@cthub-bsaas/web-core/auth';
import { AuthService } from './core/auth/services/auth.service';

// AoT requires an exported function for factories
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Configure TranslateModule for client-side
    {
      provide: TranslateLoader,
      useFactory: httpLoaderFactory,
      deps: [HttpClient],
    },
    TranslateStore,

    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([loadingInterceptor, ssrInterceptor, ssrTranslateInterceptor]),
      withFetch(),
    ),
    // Register global HTTP interceptors
    ERROR_INTERCEPTOR_PROVIDER,
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
          deps: [HttpClient],
        },
      }),
    ]),
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: AUTH_STATE_PORT, useExisting: AuthService },
    { provide: LOGIN_API, useClass: LoginApiService },
    { provide: AUTH_STATE_SETTER, useExisting: AuthService },
    // Token-based auth APIs (temporary placeholder implementations)
    {
      provide: FORGOT_PASSWORD_API,
      useFactory: (http: HttpClient): ForgotPasswordApiPort => {
        // TODO: Replace with real API integration using a dedicated AuthApiService
        return {
          requestPasswordReset: () => {
            // return http.post<ApiResponse<any>>('/api/auth/password/forgot', { email }).pipe(map(r => !!r.success));
            return of(true);
          },
          resetPassword: () => {
            // return http.post<ApiResponse<any>>('/api/auth/password/reset', { token, newPassword }).pipe(map(r => !!r.success));
            return of(true);
          },
        } as ForgotPasswordApiPort;
      },
      deps: [HttpClient],
    },
    {
      provide: REGISTER_API,
      useFactory: (): RegisterApiPort => {
        // TODO: Replace with real registration API integration
        return {
          register: async () => Promise.resolve(),
        } as RegisterApiPort;
      },
    },
  ],
};
