import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { ErrorService } from '../../../error.service';
import { StorageService } from '../../../services/storage.service';
import { PLATFORM_UTILS_TOKEN } from '../../../tokens/platform-utils.token';
import { IPlatformUtils } from '../../../utils/platform-utils';
import { AuthService, AuthUser } from '../../services/auth.service';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Base Component
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../base.component';

@Component({
  standalone: true,
  imports: [
    // Angular Modules
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // Angular Material Modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,

    // Third-party Modules
    TranslateModule,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
  // Debug logging helper methods
  private logDebug(message: string, data?: any) {
    if (this.ssrDebug?.log) {
      this.ssrDebug.log(`[LoginComponent] ${message}`, data);
    } else if (this.isBrowser) {
      console.log(`[LoginComponent] ${message}`, data || '');
    }
  }
  
  private logError(message: string, error: any) {
    if (this.ssrDebug?.error) {
      this.ssrDebug.error(`[LoginComponent] ${message}`, error);
    } else if (this.isBrowser) {
      console.error(`[LoginComponent] ${message}`, error);
    }
    
    // Also log to error service if available
    try {
      if (this.errorService) {
        this.errorService.handleError(error);
      }
    } catch (e) {
      console.error('Error logging to error service:', e);
    }
  }
  loginForm: FormGroup;
  otpForm: FormGroup;
  step: 'credentials' | 'otp' = 'credentials';
  resendCountdown = 0;
  resendDisabled = false;
  private resendTimer: any;
  userType: 'owner' | 'staff' | 'customer' | null; // Component state
  isSubmitting = false;
  showOtpForm = false;
  countdown = 30;
  private returnUrl: string = '';
  private countdownInterval: any;
  hidePassword = true;
  // These properties are inherited from BaseComponent

  // Email property for OTP resend functionality
  email: string = '';
  
  // User type for multi-role support

  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    protected override errorService: ErrorService,
    private router: Router,
    private translate: TranslateService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(PLATFORM_UTILS_TOKEN) private platformUtils: IPlatformUtils,
    @Optional() @Inject('SSR_DEBUG') private ssrDebug: any
  ) {
    super(errorService);
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Log constructor execution for debugging
    this.logDebug('LoginComponent constructor called', {
      isBrowser: this.isBrowser,
      platformId: platformId.toString()
    });
    
    // Initialize userType to null
    this.userType = null;

    // Initialize forms with default values
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  /**
   * Initialize forms
   */
  private initForms(): void {
    // Forms are already initialized in the constructor
  }

  /**
   * Start OTP resend countdown
   */
  private startCountdown(): void {
    this.resendDisabled = true;
    this.countdown = 30;
    
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  public override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    // Check for redirect URL
    const navigation = this.router.getCurrentNavigation();
    this.returnUrl = navigation?.extras?.state?.['returnUrl'] || '/dashboard';

    // Load saved email if in browser environment
    if (this.isBrowser) {
      try {
        const savedEmail = await firstValueFrom(this.storageService.getItem<string>('savedEmail'));
        if (savedEmail) {
          this.loginForm.patchValue({
            email: savedEmail,
            rememberMe: true
          });
        }
      } catch (error) {
        console.warn('Failed to load saved email:', error);
      }
    }

    this.initForms();
    this.startCountdown();
  }

  override ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password, rememberMe } = this.loginForm.value;

    // Save email to storage if rememberMe is checked (browser only)
    if (this.isBrowser) {
      try {
        if (rememberMe) {
          await firstValueFrom(this.storageService.setItem('savedEmail', email));
        } else {
          await firstValueFrom(this.storageService.removeItem('savedEmail'));
        }
      } catch (error) {
        console.warn('Failed to update saved email:', error);
      }
    }

    this.authService.initLogin(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.userType = res.userType;

        if (res.userType === 'owner' || res.userType === 'staff') {
          // OTP required, move to OTP step
          this.step = 'otp';
          this.loading = false;
        } else if (res.userType === 'customer') {
          // No OTP required, login complete
          this.loading = false;
          this.router.navigate(['/dashboard']);
        } else {
          this.loading = false;
          this.error = 'Unknown user type';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.error?.error || 'Login failed';
        this.errorService.handleError(error);
      },
    });
  }

  async onOtpSubmit(): Promise<void> {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const otp: string = this.otpForm.value.otp || '';

    this.authService.verifyOtp({ email: this.loginForm.value.email, otp, type: 'login' }).pipe(takeUntil(this.destroy$)).subscribe({
      next: async (user: AuthUser) => {
        if (!user) {
          this.error = 'Login failed: No response from server.';
          this.loading = false;
          return;
        }

        // Store token if available (browser only)
        if (this.isBrowser && user.accessToken) {
          try {
            await firstValueFrom(this.storageService.setItem('authToken', user.accessToken));
          } catch (error) {
            console.warn('Failed to store auth token:', error);
          }
        }

        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.message || 'Invalid OTP';
        this.errorService.handleError(error);
      },
    });
  }

  /**
   * Start the resend OTP countdown
   * @param seconds Number of seconds for the countdown
   */
  private startResendCountdown(seconds: number): void {
    this.resendCountdown = seconds;
    this.resendDisabled = true;
    
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    
    this.resendTimer = setInterval(() => {
      this.resendCountdown--;
      
      if (this.resendCountdown <= 0) {
        clearInterval(this.resendTimer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  resendOtp() {
    if (this.resendDisabled || this.loading) return;
    
    // Reset cooldown
    this.startResendCountdown(60);
    
    // Call your OTP resend API here
    this.authService.resendOtp(this.loginForm.value.email).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // OTP resent successfully
        this.error = null;
      },
      error: (err) => {
        this.error = this.errorService.getErrorMessage(err);
      }
    });
  }

  /**
   * Resend OTP code to the user's email
   */
  resendCode(event: Event): void {
    event.preventDefault();
    
    const email = this.loginForm.get('email')?.value || this.email;
    if (!email) {
      this.error = 'No email address found. Please try logging in again.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.resendOtp(email).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.error = null;
        this.startResendCountdown(60);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'An error occurred while resending OTP. Please try again.';
        this.errorService.handleError(err);
      }
    });
  }

  /**
   * Handle social login button clicks
   * @param provider The social provider to use for login
   */
  loginWithSocial(provider: 'google' | 'facebook'): void {
    this.loading = true;
    this.error = null;

    // In a real implementation, this would open a popup or redirect to the provider's OAuth page
    // and return an OAuth token. For now, we'll simulate the OAuth flow with a delay
    // In a real app, you would get the token from the OAuth provider's response
    const oauthToken = 'simulated-oauth-token';

    this.authService.socialLogin(provider, oauthToken).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (res: any) => {
        try {
          if (res.token) {
            if (this.isBrowser) {
              localStorage.setItem('authToken', res.token);

              // Store user data if available
              if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
              }
            }

            // Redirect to dashboard or intended URL
            const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/dashboard';
            this.logDebug('Redirecting to:', returnUrl);
            this.router.navigateByUrl(returnUrl);
          } else {
            this.error = 'Authentication failed. Please try again.';
            this.logError('Authentication failed:', this.error);
          }
        } catch (error) {
          this.logError('Error in social login:', error);
          this.error = 'An error occurred during login';
        } finally {
          this.loading = false;
        }
      },
      (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Social login failed';
        this.logError('Social login error:', this.error);
        if (this.errorService) {
          this.errorService.handleError(err);
        }
      }
    );
  }


}
