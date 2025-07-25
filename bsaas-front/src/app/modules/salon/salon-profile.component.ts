import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { SafeUrlPipe } from './safe-url.pipe';
import { Salon } from '../../models/salon.model';
import { Staff } from '../../models/staff.model';
import { SalonServiceItem } from '../../models/salon-service-item.model';
import { Review } from '../../models/review.model';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { FormsModule } from '@angular/forms';
import { StaffRequestService } from './staff-request.service';
import { StaffRequestFormComponent } from './staff-request-form.component';
import { StaffRequestListComponent } from './staff-request-list.component';
import { CurrentUserService } from '../../shared/current-user.service';
import { BaseComponent } from '../../core/base.component';
import { ErrorService } from '../../core/error.service';

@Component({
  selector: 'app-salon-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, SafeUrlPipe, FormsModule, StaffRequestFormComponent, StaffRequestListComponent],
  templateUrl: './salon-profile.component.html',
  styleUrls: ['./salon-profile.component.scss'],
  providers: [StaffRequestService],
})
export class SalonProfileComponent extends BaseComponent implements OnInit {
  salon: Salon | null = null;
  reviews: Review[] = [];
  eligibleToReview: boolean | null = null;
  submitting = false;
  reviewError: string | null = null;
  appointment: Partial<Appointment> = {};
  selectedDate: string = '';
  selectedTime: string = '';
  staffList: Staff[] = [];
  serviceList: SalonServiceItem[] = [];
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private staffRequestService: StaffRequestService,
    public currentUserService: CurrentUserService,
    protected override errorService: ErrorService,
  ) {
    super(errorService);
  }

  public override ngOnInit(): void {
    this.currentUserService.loadCurrentUser();
    const user = this.currentUserService.currentUser;
    this.userId = user ? user.id : null;
    const salonId = this.route.snapshot.paramMap.get('id');
    if (salonId) {
      this.http.get<Salon>(`/api/salons/${salonId}`).subscribe({
        next: (salon) => {
          this.salon = salon;
          this.staffList = salon.staff || [];
          this.serviceList = salon.services || [];
          this.fetchReviews(salonId);
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load salon';
          this.loading = false;
        },
      });
      if (this.userId) {
        this.http
          .get<{ eligible: boolean }>(`/api/user/${this.userId}/salon/${salonId}/eligible-to-review`, { withCredentials: true })
          .subscribe({
            next: (res) => (this.eligibleToReview = res.eligible),
            error: (err) => {
              this.eligibleToReview = null;
              // Optionally show user-friendly error if needed
            },
          });
      }
    }
  }

  fetchReviews(salonId: string) {
    this.http.get<Review[]>(`/api/salon/${salonId}/reviews`).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.userMessage || err.error?.error || 'Failed to load reviews';
        this.loading = false;
      },
    });
  }

  openMap() {
    if (!this.salon) return;
    const { latitude, longitude, name } = this.salon;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}(${encodeURIComponent(name)})`;
    window.open(url, '_blank');
  }

  submitReview(rating: string, reviewText: string) {
    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      this.reviewError = 'Invalid rating';
      return;
    }
    this.submitting = true;
    this.reviewError = null;
    const salonId = this.route.snapshot.paramMap.get('id');
    if (!salonId || !this.userId) {
      this.reviewError = 'You must be logged in.';
      this.submitting = false;
      return;
    }
    this.http.post(`/api/salon/${salonId}/review`, { userId: this.userId, rating: parsedRating, review: reviewText }).subscribe({
      next: () => {
        this.fetchReviews(salonId);
        this.submitting = false;
        this.eligibleToReview = false;
      },
      error: (err) => {
        this.reviewError = err.error?.userMessage || err.error?.error || 'Failed to submit review';
        this.submitting = false;
      },
    });
  }

  onImageError(salon: Salon) {
    salon.imagePath = undefined;
  }

  submitAppointment() {
    const salonId = this.route.snapshot.paramMap.get('id');
    if (!salonId || !this.userId || !this.appointment.serviceId || !this.selectedDate || !this.selectedTime) {
      alert('Please fill in all appointment details.');
      return;
    }
    
    // Combine date and time into a single Date object for startTime
    const startTime = new Date(`${this.selectedDate}T${this.selectedTime}`);
    // Assuming a default duration of 1 hour for the appointment
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    
    const appointmentData: Partial<Appointment> = {
      salonId,
      customerId: this.userId,
      staffId: this.appointment.staffId,
      serviceId: this.appointment.serviceId,
      startTime,
      endTime,
      status: AppointmentStatus.PENDING,
      notes: this.appointment.notes || '',
    };
    this.http.post('/api/appointments', appointmentData).subscribe({
      next: () => {
        alert('Appointment scheduled successfully!');
      },
      error: (err) => {
        alert(err.error?.userMessage || err.error?.error || 'Failed to schedule appointment.');
      },
    });
  }

  onRequestCreated() {
    // Optionally refresh the request list or staff data
  }
}
