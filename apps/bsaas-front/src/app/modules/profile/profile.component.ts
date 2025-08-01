import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrentUserService, User } from '../../core/auth/services/current-user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  currentUser: User | null = null;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private currentUserService: CurrentUserService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.currentUserService.currentUser;
    if (user) {
      this.currentUser = user;
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
      });
      // Disable form initially
      this.profileForm.disable();
    }
  }

  onEdit(): void {
    this.isEditing = true;
    this.profileForm.enable();
    // Keep email disabled as it shouldn't be changed
    this.profileForm.get('email')?.disable();
  }

  onCancel(): void {
    this.isEditing = false;
    this.loadUserProfile();
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    this.isLoading = true;
    const updatedUser = {
      ...this.currentUser,
      ...this.profileForm.value,
    };

    // Simulate API call
    setTimeout(() => {
      this.currentUserService.updateUser(updatedUser);
      this.isLoading = false;
      this.isEditing = false;
      this.profileForm.disable();

      this.snackBar.open(this.translate.instant('PROFILE.UPDATE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
    }, 1000);
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get email() {
    return this.profileForm.get('email');
  }
}
