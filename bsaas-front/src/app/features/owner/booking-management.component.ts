import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.scss'],
})
export class BookingManagementComponent {
  bookingForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
  ) {
    this.bookingForm = this.fb.group({
      customer: ['', Validators.required],
      service: ['', Validators.required],
      staff: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      note: [''],
    });
  }

  onSubmit() {
    if (this.bookingForm.invalid) return;
    this.loading = true;
    this.error = null;
    // Ensure all required fields are present and not null
    const { customer, service, staff, date, time, note } = this.bookingForm.value;
    if (!customer || !service || !staff || !date || !time) {
      this.loading = false;
      this.error = 'All fields except note are required.';
      return;
    }
    // Map form values to CreateBookingParams (adjust mapping as needed)
    const booking = {
      userId: customer as string,
      salonId: service as string, // Adjust if service is not salonId
      services: Array.isArray(service) ? service : [service], // Adjust if needed
      staffId: staff as string,
      date: date as string,
      time: time as string,
      note: note as string | undefined,
    };
    this.bookingService.saveBooking(booking).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Booking saved!';
        } else {
          this.error = 'Failed to save booking.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.userMessage || 'Error saving booking.';
      },
    });
  }
}
