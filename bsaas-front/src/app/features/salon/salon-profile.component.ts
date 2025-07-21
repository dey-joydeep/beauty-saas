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
import { Booking } from '../../models/booking.model';
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
  booking: Partial<Booking> = {};
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

  submitBooking() {
    const salonId = this.route.snapshot.paramMap.get('id');
    if (!salonId || !this.userId || !this.booking.serviceId || !this.booking.date || !this.booking.time) {
      alert('Please fill in all booking details.');
      return;
    }
    const bookingData: Partial<Booking> = {
      salonId,
      userId: this.userId,
      staffId: this.booking.staffId,
      serviceId: this.booking.serviceId,
      date: this.booking.date,
      time: this.booking.time,
      notes: this.booking.notes || '',
    };
    this.http.post('/api/bookings', bookingData).subscribe({
      next: () => {
        alert('Booking successful!');
      },
      error: (err) => {
        alert(err.error?.userMessage || err.error?.error || 'Booking failed.');
      },
    });
  }

  onRequestCreated() {
    // Optionally refresh the request list or staff data
  }
}
