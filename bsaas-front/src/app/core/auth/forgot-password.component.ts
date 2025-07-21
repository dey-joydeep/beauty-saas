import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotForm;
  otpForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  step: 'request' | 'verify' | 'done' = 'request';
  email = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRequest() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.error = null;
    const email = this.forgotForm.value.email || '';
    this.auth.requestPasswordReset({ email }).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.email = email;
          this.step = 'verify';
        } else {
          this.error = 'Failed to send reset instructions.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Email not registered';
      },
    });
  }

  onVerify() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.error = null;
    const otp = this.otpForm.value.otp || '';
    const newPassword = this.otpForm.value.newPassword || '';
    this.auth.verifyPasswordReset({ email: this.email, otp: String(otp), newPassword: String(newPassword) }).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.step = 'done';
          this.success = 'Password reset successful! Redirecting to login...';
          setTimeout(() => (window.location.href = '/login'), 2000);
        } else {
          this.error = 'Failed to reset password.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Invalid OTP or password.';
      },
    });
  }
}
