import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Booking } from '../../../models/booking.model';

export interface DialogData {
  booking: Booking;
}

@Component({
  selector: 'app-booking-cancel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './booking-cancel-dialog.component.html',
  styleUrls: ['./booking-cancel-dialog.component.scss'],
})
export class BookingCancelDialogComponent {
  cancelForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<BookingCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.cancelForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.cancelForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open(this.translate.instant('BOOKING.CANCELLATION_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
        duration: 3000,
      });
      this.dialogRef.close('confirm');
    }, 1500);
  }

  get reason() {
    return this.cancelForm.get('reason');
  }
}
