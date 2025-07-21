import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateBookingParams } from '../../models/booking-params.model';
import { CurrentUserService } from '../../shared/current-user.service';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './booking-create.component.html',
  styleUrls: ['./booking-create.component.scss'],
})
export class BookingCreateComponent implements OnInit {
  bookingForm: FormGroup;
  salons: any[] = [];
  services: any[] = [];
  staffs: any[] = [];
  availableTimes: string[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private currentUserService: CurrentUserService,
  ) {
    this.bookingForm = this.fb.group({
      salonId: ['', Validators.required],
      services: [[], Validators.required],
      staffId: [''],
      date: ['', Validators.required],
      note: [''],
    });
  }

  ngOnInit() {
    this.fetchSalons();
    this.currentUserService.loadCurrentUser();
    const user = this.currentUserService.currentUser;
    this.userId = user ? user.id : null;
  }

  fetchSalons() {
    this.http.get<any[]>('/api/salons').subscribe({
      next: (res) => {
        this.salons = res;
      },
      error: (err) => {
        this.error = err.error?.userMessage || err.error?.error || 'Failed to load salons.';
      },
    });
  }

  onSalonChange() {
    const salonId = this.bookingForm.get('salonId')?.value;
    if (salonId) {
      this.http.get<any[]>(`/api/salons/${salonId}/services`).subscribe({
        next: (res) => {
          this.services = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load services.';
        },
      });
      this.http.get<any[]>(`/api/salons/${salonId}/staffs`).subscribe({
        next: (res) => {
          this.staffs = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load staffs.';
        },
      });
    }
  }

  onServiceChange() {
    const salonId = this.bookingForm.get('salonId')?.value;
    const services = this.bookingForm.get('services')?.value;
    if (salonId && services && services.length > 0) {
      this.http.post<string[]>(`/api/salons/${salonId}/available-times`, { services }).subscribe({
        next: (res) => {
          this.availableTimes = res;
        },
        error: (err) => {
          this.error = err.error?.userMessage || err.error?.error || 'Failed to load available times.';
        },
      });
    }
  }

  submit() {
    if (this.bookingForm.invalid || !this.userId) return;
    this.loading = true;
    this.error = null;
    const { salonId, services, staffId, date, note } = this.bookingForm.value;
    if (!salonId || !services || !date) {
      this.loading = false;
      this.error = 'Salon, services, and date are required.';
      return;
    }
    const booking: CreateBookingParams = {
      userId: this.userId,
      salonId: salonId as string,
      services: Array.isArray(services) ? services : [services],
      staffId: staffId as string,
      date: date as string,
      note: note as string | undefined,
    };
    this.http.post('/api/bookings', booking).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Booking created!';
        this.router.navigate(['/user/bookings']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.userMessage || err.error?.error || 'Failed to create booking.';
      },
    });
  }
}
