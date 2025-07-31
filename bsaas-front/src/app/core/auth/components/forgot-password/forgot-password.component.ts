import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  FormControl, 
  Validators, 
  ReactiveFormsModule, 
  AbstractControl, 
  ValidationErrors,
  ValidatorFn,
  FormGroupDirective
} from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Services
import { AuthService } from '../../services/auth.service';

// Interfaces
interface ForgotPasswordForm {
  email: FormControl<string | null>;
}

interface OtpForm {
  otp: FormControl<string | null>;
  newPassword: FormControl<string | null>;
}

interface ResetPasswordForm {
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatProgressBarModule, 
    TranslateModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup<ForgotPasswordForm>;
  otpForm: FormGroup<OtpForm>;
  resetForm: FormGroup<ResetPasswordForm>;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  step: 'email' | 'otp' | 'reset' | 'success' = 'email';
  email = '';

  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private authService: AuthService,
  ) {
    // Initialize Forgot Password Form
    this.forgotForm = this.fb.group<ForgotPasswordForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    // Initialize OTP Form
    this.otpForm = this.fb.group<OtpForm>({
      otp: new FormControl('', [Validators.required, Validators.minLength(4)]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    // Initialize Reset Password Form
    this.resetForm = this.fb.group<ResetPasswordForm>(
      {
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', Validators.required),
      },
      { validators: this.passwordMatchValidator },
    );
  }

  // Custom validator to check that password and confirm password match
  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  onRequest() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.error = null;
    const email = this.forgotForm.get('email')?.value;
    
    if (!email) {
      this.error = 'Email is required';
      this.loading = false;
      return;
    }
    
    this.authService.requestPasswordReset(email).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          this.email = email;
          this.step = 'otp';
        } else {
          this.error = 'Failed to send reset instructions.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'An error occurred. Please try again.';
      },
    });
  }

  onVerify() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.error = null;
    const otp = this.otpForm.get('otp')?.value;
    const newPassword = this.otpForm.get('newPassword')?.value;
    
    if (!otp || !newPassword) {
      this.error = 'OTP and new password are required';
      this.loading = false;
      return;
    }
    
    // Use the OTP as the token for password reset
    this.authService.resetPassword(otp, newPassword).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          this.step = 'success';
          this.success = 'Password reset successful! Redirecting to login...';
          setTimeout(() => (window.location.href = '/login'), 2000);
        } else {
          this.error = 'Failed to reset password. The OTP may be invalid or expired.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Invalid OTP or password.';
      },
    });
  }
}
