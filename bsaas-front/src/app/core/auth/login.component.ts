import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthUser } from './auth.service';

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

// Application Modules
import { AuthBaseComponent } from './base/auth.base.component';
import { AuthService } from './auth.service';
import { ErrorService } from '../error.service';
import { TranslateModule } from '@ngx-translate/core';

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
export class LoginComponent extends AuthBaseComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step: 'credentials' | 'otp' = 'credentials';
  userType: 'owner' | 'staff' | 'customer' | null = null;
  email: string = '';
  password: string = '';
  resendDisabled = false;
  resendCountdown = 0;
  private authSub: Subscription | null = null;
  private countdownInterval: any;
  hidePassword = true;

  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    super(errorService);

    // Check for saved email
    const savedEmail = localStorage.getItem('savedEmail');

    // Initialize login form
    this.loginForm = this.fb.group({
      email: [savedEmail || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [!!savedEmail],
    });

    // Initialize OTP form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  public override ngOnInit(): void {
    // Initialize component state
    this.loading = false;
    this.error = null;

    // Check for existing auth state
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Initialize resend countdown if needed
    const lastOtpTime = localStorage.getItem('lastOtpTime');
    if (lastOtpTime) {
      const timeDiff = Date.now() - parseInt(lastOtpTime, 10);
      const cooldown = 30000; // 30 seconds cooldown
      if (timeDiff < cooldown) {
        this.startResendCountdown(Math.ceil((cooldown - timeDiff) / 1000));
      }
    }
  }

  public override ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.authSub) {
      this.authSub.unsubscribe();
    }

    // Clear countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    super.ngOnDestroy();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password, rememberMe } = this.loginForm.value;
    this.email = email;
    this.password = password;

    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    // Clear any existing subscription
    if (this.authSub) {
      this.authSub.unsubscribe();
    }

    // Initiate login process
    this.authSub = this.authService.initLogin({ email, password }).subscribe({
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
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Invalid credentials';
        this.errorService.handleError(err);
      },
    });
  }

  onOtpSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const otp: string = this.otpForm.value.otp || '';

    // Clear any existing subscription
    if (this.authSub) {
      this.authSub.unsubscribe();
    }

    // Verify OTP
    this.authSub = this.authService
      .verifyOtp({
        email: this.email,
        otp,
        type: 'login' // Specify the type of OTP verification
      })
      .subscribe({
        next: (user: AuthUser) => {
          if (!user) {
            this.error = 'Login failed: No response from server.';
            this.loading = false;
            return;
          }

          // Store token if available
          if (user.accessToken) {
            localStorage.setItem('authToken', user.accessToken);
          }

          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.error || 'Invalid OTP';
          this.errorService.handleError(err);
        },
      });
  }

  /**
   * Start the resend OTP countdown
   * @param seconds Number of seconds for the countdown
   */
  private startResendCountdown(seconds: number): void {
    this.resendDisabled = true;
    this.resendCountdown = seconds;

    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;

      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  /**
   * Resend OTP to the user's email
   */
  resendOtp(): void {
    if (this.resendDisabled) return;

    this.loading = true;
    this.error = null;

    this.authSub = this.authService.resendOtp(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          // Start countdown (30 seconds)
          this.startResendCountdown(30);
          localStorage.setItem('lastOtpTime', Date.now().toString());
        } else {
          this.error = res.message || 'Failed to resend OTP. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'An error occurred while resending OTP. Please try again.';
        this.errorService.handleError(err);
      },
    });
  }

  /**
   * Handle social login button clicks
   * @param provider The social provider to use for login
   */
  loginWithSocial(provider: 'google' | 'facebook'): void {
    this.loading = true;
    this.error = null;

    if (this.authSub) {
      this.authSub.unsubscribe();
    }

    // In a real implementation, this would open a popup or redirect to the provider's OAuth page
    // and return an OAuth token. For now, we'll simulate the OAuth flow with a delay
    // In a real app, you would get the token from the OAuth provider's response
    const oauthToken = 'simulated-oauth-token';
    
    this.authSub = this.authService.socialLogin(provider, oauthToken).subscribe({
      next: (res: any) => {
        if (res.token) {
          localStorage.setItem('authToken', res.token);

          // Store user data if available
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          // Redirect to dashboard or intended URL
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.error = 'Authentication failed. Please try again.';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Social login failed';
        this.errorService.handleError(err);
      },
    });
  }

  /**
   * Resend OTP code to the user's email
   */
  resendCode(event: Event): void {
    event.preventDefault();

    if (!this.email) {
      this.error = 'No email address found. Please try logging in again.';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.authSub) {
      this.authSub.unsubscribe();
    }

    // Call the auth service to resend OTP
    this.authSub = this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.loading = false;
        // Show success message
        this.error = 'A new verification code has been sent to your email.';
        // Clear the error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to resend verification code';
        this.errorService.handleError(err);
      },
    });
  }
}
