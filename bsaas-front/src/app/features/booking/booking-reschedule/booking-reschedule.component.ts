import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Booking, BookingStatus } from '../../../models/booking.model';
import { LoadingService } from '../../../core/services/loading.service';
import { BookingService } from '../services/booking.service';

// Using the base Booking model which already has startTime and endTime

@Component({
  selector: 'app-booking-reschedule',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './booking-reschedule.component.html',
  styleUrls: ['./booking-reschedule.component.scss'],
  providers: [{ provide: DatePipe, useClass: DatePipe }],
})
export class BookingRescheduleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLinear = true;
  isLoading = true;
  isSubmitting = false;
  booking: Booking | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  // Form groups for the stepper
  dateTimeFormGroup: FormGroup;
  reviewFormGroup: FormGroup;

  // Available time slots
  availableTimeSlots: string[] = [];

  // Get minimum date for date picker (today)
  get minDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Get maximum date for date picker (3 months from now)
  get maxDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  }

  // Getter for date form control
  get dateControl(): FormControl {
    return this.dateTimeFormGroup.get('date') as FormControl;
  }

  // Convert minDate to string for template binding
  get minDateString(): string {
    return this.minDate.toISOString();
  }

  // Translation keys
  private services: { [key: string]: string } = {
    '1': 'SERVICE.HAIR_CUT',
    '2': 'SERVICE.COLORING',
    '3': 'SERVICE.STYLING',
  };

  private staffMembers: { [key: string]: string } = {
    '1': 'STAFF.JOHN_DOE',
    '2': 'STAFF.JANE_SMITH',
    '3': 'STAFF.BOB_JOHNSON',
  };

  private salons: { [key: string]: string } = {
    '1': 'SALON.MAIN',
    '2': 'SALON.DOWNTOWN',
    '3': 'SALON.UPTON',
  };

  constructor(
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) private snackBarConfig: any,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private bookingService: BookingService,
    private datePipe: DatePipe,
    private loadingService: LoadingService,
  ) {
    // Initialize form groups
    this.dateTimeFormGroup = this.fb.group({
      date: ['', [Validators.required, this.futureDateValidator.bind(this)]],
      time: ['', Validators.required],
    });

    this.reviewFormGroup = this.fb.group({
      notes: [''],
      confirm: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.loadBookingDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Date validator function
  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today ? null : { pastDate: true };
  }

  // Format date for display
  formatDate(date: Date | string): string {
    return this.datePipe.transform(date, 'mediumDate') || '';
  }

  // Format time for display
  formatTime(date: Date | string): string {
    return this.datePipe.transform(date, 'shortTime') || '';
  }

  getServiceName(serviceId: string): string {
    // TODO: Implement service lookup from service
    return 'Service';
  }

  getStaffName(staffId: string): string {
    // TODO: Implement staff lookup from service
    return 'Staff Member';
  }

  private handleError(error: Error): void {
    console.error('Booking error:', error);
    this.snackBar.open(this.translate.instant('ERRORS.GENERAL'), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.isSubmitting || !this.booking) {
      return;
    }

    this.isSubmitting = true;
    this.loadingService.show();

    const { date, time } = this.dateTimeFormGroup.value;
    const notes = this.reviewFormGroup.get('notes')?.value || '';

    if (!this.booking.id) {
      this.handleError(new Error('Invalid booking ID'));
      return;
    }

    this.bookingService
      .rescheduleBooking(this.booking.id, date, time, notes)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.loadingService.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('BOOKING.RESCHEDULE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), {
            duration: 5000,
          });
          this.router.navigate(['/bookings']);
        },
        error: (error: Error) => this.handleError(error),
      });
  }

  // Load available time slots for selected date and staff
  private loadAvailableTimeSlots(): void {
    if (!this.booking) {
      return;
    }

    const selectedDate = this.dateTimeFormGroup.get('date')?.value;
    if (!selectedDate) {
      return;
    }

    this.loadingService.show();
    this.bookingService
      .getAvailableTimeSlots(this.booking.staffId, new Date(selectedDate))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingService.hide()),
      )
      .subscribe({
        next: (timeSlots: string[]) => {
          this.availableTimeSlots = timeSlots;
          // Auto-select first available time slot if none selected
          if (!this.dateTimeFormGroup.get('time')?.value && timeSlots.length > 0) {
            this.dateTimeFormGroup.get('time')?.setValue(timeSlots[0]);
          }
        },
        error: (error: Error) => this.handleError(error),
      });
  }

  // Load booking details
  private loadBookingDetails(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (!bookingId) {
      this.handleError(new Error('No booking ID provided'));
      this.router.navigate(['/bookings']);
      return;
    }

    this.isLoading = true;
    this.loadingService.show();

    this.bookingService
      .getBooking(bookingId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.hide();
        }),
      )
      .subscribe({
        next: (booking: Booking) => {
          this.booking = booking;
          this.initializeForm(booking);
          this.loadAvailableTimeSlots();
        },
        error: (error: Error) => {
          this.handleError(error);
        },
      });
  }

  // Initialize form with booking data
  private initializeForm(booking: Booking): void {
    const bookingDate = new Date(booking.startTime);
    const bookingTime = this.formatTime(booking.startTime);

    this.dateTimeFormGroup = this.fb.group({
      date: [bookingDate, [Validators.required]],
      time: [bookingTime, [Validators.required]],
    });

    this.reviewFormGroup = this.fb.group({
      notes: [booking.notes || ''],
    });
  }

  getStatusBadgeClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'badge-pending';
      case BookingStatus.CONFIRMED:
        return 'badge-confirmed';
      case BookingStatus.COMPLETED:
        return 'badge-completed';
      case BookingStatus.CANCELLED:
        return 'badge-cancelled';
      case BookingStatus.NOSHOW:
        return 'badge-noshow';
      default:
        return 'badge-pending';
    }
  }

  getStatusTranslation(status: BookingStatus): string {
    return `BOOKING.STATUS.${status.toUpperCase()}`;
  }
}
